/**
 * server/stripe.ts
 * - Si STRIPE_SECRET_KEY est présent → Stripe réel.
 * - Sinon → Stripe désactivé ; les appels renvoient "Stripe disabled".
 */

import Stripe from "stripe";
import { db } from "./db";
import { simulations, users } from "@shared/schema";
import { eq } from "drizzle-orm";

/* ------------------------------------------------------------------ */
/* 1. Initialisation globale                                          */
/* ------------------------------------------------------------------ */

let stripe: Stripe | null | undefined = undefined; // undefined = pas encore tenté

export function initializeStripe(): Stripe | null {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    });
    console.log("✅ Stripe initialized");
  } else {
    stripe = null;
    console.warn("⚠️  STRIPE_SECRET_KEY not set – Stripe disabled");
  }
  return stripe;
}

/** Retourne Stripe OU null (sans déclencher d’erreur) */
export function getStripe(): Stripe | null {
  if (stripe === undefined) {
    stripe = initializeStripe();
  }
  return stripe;
}

/** Lance une erreur claire si Stripe inactif */
function requireStripe(): Stripe {
  const s = getStripe();
  if (!s) {
    throw new Error("Stripe disabled");
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* 2. API : paiement à l’acte (oneshot)                                */
/* ------------------------------------------------------------------ */

export async function createSimulationPayment(
  simulationId: string,
  userId: string
) {
  const stripeClient = requireStripe();

  const [simulation] = await db
    .select()
    .from(simulations)
    .where(eq(simulations.id, simulationId))
    .limit(1);

  if (!simulation) throw new Error("Simulation not found");
  if (simulation.userId !== userId) throw new Error("Unauthorized");
  if (simulation.isPaid) throw new Error("Simulation already paid");

  return stripeClient.paymentIntents.create({
    amount: 3900, // 39€ (cents)
    currency: "eur",
    description: `CalcuNotaire Pro – Simulation ${simulationId}`,
    metadata: { simulationId, userId, type: "oneshot" },
  });
}

/* ------------------------------------------------------------------ */
/* 3. API : souscription                                               */
/* ------------------------------------------------------------------ */

export async function createSubscription(userId: string, priceId: string) {
  const stripeClient = requireStripe();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) throw new Error("User not found");

  /** 3.1 Customer Stripe */
  let customerId = user.stripeCustomerId;
  if (customerId) {
    // Vérifie qu'il existe encore
    try {
      await stripeClient.customers.retrieve(customerId);
    } catch {
      customerId = undefined;
    }
  }
  if (!customerId) {
    const customer = await stripeClient.customers.create({
      email: user.email,
      metadata: { userId },
    });
    customerId = customer.id;
    await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId));
  }

  /** 3.2 Subscription */
  return stripeClient.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
  });
}

/* ------------------------------------------------------------------ */
/* 4. Paiement réussi (webhook)                                       */
/* ------------------------------------------------------------------ */

export async function handlePaymentSuccess(paymentIntentId: string) {
  const stripeClient = requireStripe();
  const paymentIntent = await stripeClient.paymentIntents.retrieve(
    paymentIntentId
  );

  if (
    paymentIntent.metadata.type === "oneshot" &&
    paymentIntent.metadata.simulationId
  ) {
    await db
      .update(simulations)
      .set({
        isPaid: true,
        paymentType: "oneshot",
        stripePaymentId: paymentIntentId,
        updatedAt: new Date(),
      })
      .where(eq(simulations.id, paymentIntent.metadata.simulationId));

    console.log(
      `✅ Simulation ${paymentIntent.metadata.simulationId} marked as paid`
    );
  }
}

/* ------------------------------------------------------------------ */
/* 5. Construction d’événement webhook                                */
/* ------------------------------------------------------------------ */

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  const stripeClient = requireStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET not configured");

  return stripeClient.webhooks.constructEvent(payload, signature, webhookSecret);
}
