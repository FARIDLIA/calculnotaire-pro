import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { users, simulations, dmtoTable, inseeDept, dvfCache, auditLogs } from "@shared/schema";
import { authMiddleware, adminMiddleware, hashPassword, comparePassword, generateToken, type AuthRequest } from "./auth";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { calculateCapitalGain, buildEnrichedResult, type CapitalGainInput, type EnrichedResult } from "@shared/calc-core";
import { z } from "zod";
import { randomBytes } from "crypto";
import { authRateLimiter, computeRateLimiter, apiRateLimiter } from "./rateLimit";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply general API rate limiting
  app.use('/api/', apiRateLimiter);
  
  // Health endpoint (no auth, for monitoring)
  app.get("/health", async (req, res) => {
    try {
      // Check database connection
      await db.select().from(users).limit(1);
      
      res.json({
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "1.0.0"
      });
    } catch (error) {
      res.status(503).json({
        status: "error",
        database: "disconnected",
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Auth routes with rate limiting
  app.post("/api/auth/signup", authRateLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }
      
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }
      
      // Check if user exists
      const existing = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      if (existing.length > 0) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      // Create user
      const hashedPassword = await hashPassword(password);
      const [newUser] = await db.insert(users)
        .values({
          email,
          password: hashedPassword,
        })
        .returning();
      
      // Generate token
      const token = generateToken(newUser.id, newUser.email, newUser.isAdmin);
      
      // Set cookie (must match authMiddleware: 'token')
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.json({
        user: {
          id: newUser.id,
          email: newUser.email,
          isAdmin: newUser.isAdmin
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/auth/login", authRateLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }
      
      // Find user
      const [user] = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Check password
      const valid = await comparePassword(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Generate token
      const token = generateToken(user.id, user.email, user.isAdmin);
      
      // Set cookie (must match authMiddleware: 'token')
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    // Clear cookie with same options as set
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    res.json({ message: "Logged out" });
  });
  
  app.get("/api/auth/me", authMiddleware as any, async (req: AuthRequest, res) => {
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, req.user!.id))
        .limit(1);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // RGPD: Right to be forgotten - Delete user account and all data
  app.delete("/api/auth/account", authMiddleware as any, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // Delete all user simulations first (foreign key constraint)
      await db.delete(simulations).where(eq(simulations.userId, userId));
      
      // Delete audit logs
      await db.delete(auditLogs).where(eq(auditLogs.userId, userId));
      
      // Delete user account
      await db.delete(users).where(eq(users.id, userId));
      
      // Clear auth cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      
      res.json({ message: "Account and all associated data deleted successfully" });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });
  
  // Simulations routes
  app.post("/api/simulations", authMiddleware as any, async (req: AuthRequest, res) => {
    try {
      // Strict validation with Zod
      const { simulationInputSchema } = await import('@shared/validation');
      const validationResult = simulationInputSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid simulation data",
          details: validationResult.error.errors
        });
      }
      
      const inputData = validationResult.data;
      
      // Calculate results (enriched payload)
      const resultData = buildEnrichedResult(inputData);
      
      // Generate share token
      const shareToken = randomBytes(16).toString('hex');
      
      const [simulation] = await db.insert(simulations)
        .values({
          userId: req.user!.id,
          inputData,
          resultData,
          shareToken,
        })
        .returning();
      
      // Audit log
      await db.insert(auditLogs).values({
        simulationId: simulation.id,
        action: 'simulation_created',
        userId: req.user!.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { role: inputData.role }
      });
      
      res.json(simulation);
    } catch (error) {
      console.error('Create simulation error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/simulations", authMiddleware as any, async (req: AuthRequest, res) => {
    try {
      const userSimulations = await db.select()
        .from(simulations)
        .where(eq(simulations.userId, req.user!.id))
        .orderBy(desc(simulations.createdAt));
      
      res.json(userSimulations);
    } catch (error) {
      console.error('Get simulations error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/simulations/:id", authMiddleware as any, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      const [simulation] = await db.select()
        .from(simulations)
        .where(eq(simulations.id, id))
        .limit(1);
      
      if (!simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }
      
      if (simulation.userId !== req.user!.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      res.json(simulation);
    } catch (error) {
      console.error('Get simulation error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/simulations/:id/compute", authMiddleware as any, computeRateLimiter, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      const [simulation] = await db.select()
        .from(simulations)
        .where(eq(simulations.id, id))
        .limit(1);
      
      if (!simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }
      
      if (simulation.userId !== req.user!.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Recompute with current data (enriched payload)
      const resultData = buildEnrichedResult(simulation.inputData as CapitalGainInput);
      
      const [updated] = await db.update(simulations)
        .set({
          resultData,
          updatedAt: new Date()
        })
        .where(eq(simulations.id, id))
        .returning();
      
      // Audit log
      await db.insert(auditLogs).values({
        simulationId: id,
        action: 'simulation_computed',
        userId: req.user!.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(updated);
    } catch (error) {
      console.error('Compute simulation error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // PDF export
  app.get("/api/simulations/:id/pdf", authMiddleware as any, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      const [simulation] = await db.select()
        .from(simulations)
        .where(eq(simulations.id, id))
        .limit(1);
      
      if (!simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }
      
      if (simulation.userId !== req.user!.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Generate PDF
      const { generateSimulationPDF } = await import('./pdf-generator');
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const pdfBuffer = await generateSimulationPDF(simulation, baseUrl);
      
      // Audit log
      await db.insert(auditLogs).values({
        simulationId: id,
        action: 'pdf_downloaded',
        userId: req.user!.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="simulation-${id.substring(0, 8)}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('PDF generation error:', error);
      res.status(500).json({ error: "PDF generation failed" });
    }
  });
  
  // CSV export
  app.get("/api/simulations/:id/csv", authMiddleware as any, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      const [simulation] = await db.select()
        .from(simulations)
        .where(eq(simulations.id, id))
        .limit(1);
      
      if (!simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }
      
      if (simulation.userId !== req.user!.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const inputData = simulation.inputData as any;
      const resultData = simulation.resultData as any;
      
      // Build CSV
      const csv = [
        'Champ,Valeur',
        `ID Simulation,${simulation.id}`,
        `Date de création,${new Date(simulation.createdAt).toLocaleDateString('fr-FR')}`,
        '',
        'INFORMATIONS DU BIEN',
        `Type de vendeur,${inputData.role}`,
        `Occupation,${inputData.occupation}`,
        `Prix d'acquisition,${inputData.purchasePrice}`,
        `Prix de cession,${inputData.salePrice}`,
        `Date d'acquisition,${inputData.purchaseDate}`,
        `Date de cession,${inputData.saleDate}`,
        '',
        'RÉSULTATS',
        `Plus-value brute,${resultData.grossCapitalGain}`,
        `Durée de détention (années),${resultData.holdingYears}`,
        `Abattement IR (%),${resultData.irAllowancePercent}`,
        `Abattement PS (%),${resultData.psAllowancePercent}`,
        `Base taxable IR,${resultData.irTaxableBase}`,
        `Base taxable PS,${resultData.psTaxableBase}`,
        `Impôt sur le revenu,${resultData.irTax}`,
        `Prélèvements sociaux,${resultData.psTax}`,
        `Surtaxe,${resultData.surcharge || 0}`,
        `Total impôts,${resultData.totalTax}`,
        `Net vendeur,${resultData.netProceeds}`,
        `Exonération RP,${resultData.isRpExempt ? 'Oui' : 'Non'}`,
        `Exonération première vente,${resultData.isFirstSaleExempt ? 'Oui' : 'Non'}`
      ].join('\n');
      
      // Audit log
      await db.insert(auditLogs).values({
        simulationId: id,
        action: 'csv_downloaded',
        userId: req.user!.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="simulation-${id.substring(0, 8)}.csv"`);
      res.send('\uFEFF' + csv); // UTF-8 BOM for Excel
    } catch (error) {
      console.error('CSV export error:', error);
      res.status(500).json({ error: "CSV export failed" });
    }
  });
  
  // Generate shareable link
  app.post("/api/simulations/:id/share", authMiddleware as any, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      const [simulation] = await db.select()
        .from(simulations)
        .where(eq(simulations.id, id))
        .limit(1);
      
      if (!simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }
      
      if (simulation.userId !== req.user!.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Generate share token if not exists
      let shareToken = simulation.shareToken;
      if (!shareToken) {
        shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        await db.update(simulations)
          .set({ shareToken })
          .where(eq(simulations.id, id));
      }
      
      const shareUrl = `${req.protocol}://${req.get('host')}/share/${shareToken}`;
      
      // Audit log
      await db.insert(auditLogs).values({
        simulationId: id,
        action: 'share_link_created',
        userId: req.user!.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({ shareUrl, shareToken });
    } catch (error) {
      console.error('Share link error:', error);
      res.status(500).json({ error: "Share link generation failed" });
    }
  });
  
  app.get("/api/simulations/share/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      const [simulation] = await db.select()
        .from(simulations)
        .where(eq(simulations.shareToken, token))
        .limit(1);
      
      if (!simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }
      
      res.json({
        inputData: simulation.inputData,
        resultData: simulation.resultData,
        createdAt: simulation.createdAt
      });
    } catch (error) {
      console.error('Get shared simulation error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // DMTO lookup
  app.get("/api/dmto/:deptCode", async (req, res) => {
    try {
      const { deptCode } = req.params;
      const { date } = req.query;
      
      const effectiveDate = date ? new Date(date as string) : new Date();
      
      const dmtoRates = await db.select()
        .from(dmtoTable)
        .where(
          and(
            eq(dmtoTable.deptCode, deptCode),
            lte(dmtoTable.validFrom, effectiveDate)
          )
        )
        .orderBy(desc(dmtoTable.validFrom))
        .limit(1);
      
      if (dmtoRates.length === 0) {
        return res.status(404).json({ error: "DMTO rates not found for this department" });
      }
      
      res.json(dmtoRates[0]);
    } catch (error) {
      console.error('Get DMTO error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // DVF lookup (with caching)
  app.get("/api/dvf/search", authMiddleware as any, async (req: AuthRequest, res) => {
    try {
      const { lat, lng, radius = 1000 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and longitude required" });
      }
      
      // Check cache first
      const cacheKey = `${lat},${lng},${radius}`;
      const cached = await db.select()
        .from(dvfCache)
        .where(eq(dvfCache.cacheKey, cacheKey))
        .limit(1);
      
      const cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      if (cached.length > 0 && 
          (new Date().getTime() - new Date(cached[0].createdAt).getTime()) < cacheExpiry) {
        return res.json(cached[0].data);
      }
      
      // Fetch from DVF API (mock for now)
      const dvfData = {
        properties: [
          {
            address: "123 Rue Example",
            price: 350000,
            date: "2024-01-15",
            surface: 85,
            type: "Appartement"
          }
        ]
      };
      
      // Cache the result
      await db.insert(dvfCache)
        .values({
          cacheKey,
          data: dvfData
        })
        .onConflictDoUpdate({
          target: [dvfCache.cacheKey],
          set: {
            data: dvfData,
            createdAt: new Date()
          }
        });
      
      res.json(dvfData);
    } catch (error) {
      console.error('DVF search error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Admin routes
  app.get("/api/admin/simulations", authMiddleware as any, adminMiddleware as any, async (req, res) => {
    try {
      const allSimulations = await db.select()
        .from(simulations)
        .orderBy(desc(simulations.createdAt))
        .limit(100);
      
      res.json(allSimulations);
    } catch (error) {
      console.error('Get all simulations error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/admin/dmto", authMiddleware as any, adminMiddleware as any, async (req, res) => {
    try {
      const allDmto = await db.select()
        .from(dmtoTable)
        .orderBy(desc(dmtoTable.validFrom));
      
      res.json(allDmto);
    } catch (error) {
      console.error('Get all DMTO error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/admin/dmto", authMiddleware as any, adminMiddleware as any, async (req: AuthRequest, res) => {
    try {
      const dmtoSchema = z.object({
        deptCode: z.string().length(2),
        deptName: z.string(),
        validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        dmtoRate: z.number().min(0).max(10),
        communeRate: z.number().min(0).max(10),
        stateAddition: z.number().min(0).max(10),
        totalTransfer: z.number().min(0).max(10),
        notaryFeesBase: z.number().min(0).max(10),
        notaryFixed: z.number().min(0),
        version: z.string(),
        sourceUrl: z.string().url()
      });
      
      const validated = dmtoSchema.parse(req.body);
      
      const [newDmto] = await db.insert(dmtoTable)
        .values({
          deptCode: validated.deptCode,
          deptName: validated.deptName,
          dmtoRate: validated.dmtoRate.toString(),
          communeRate: validated.communeRate.toString(),
          stateAddition: validated.stateAddition.toString(),
          totalTransfer: validated.totalTransfer.toString(),
          notaryFeesBase: validated.notaryFeesBase.toString(),
          notaryFixed: validated.notaryFixed.toString(),
          version: validated.version,
          validFrom: new Date(validated.validFrom),
          validTo: null,
          sourceUrl: validated.sourceUrl
        })
        .returning();
      
      // Audit log
      await db.insert(auditLogs).values({
        action: 'dmto_created',
        userId: req.user!.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { deptCode: validated.deptCode }
      });
      
      res.json(newDmto);
    } catch (error) {
      console.error('Create DMTO error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/admin/audit/:simulationId", authMiddleware as any, adminMiddleware as any, async (req, res) => {
    try {
      const { simulationId } = req.params;
      
      const logs = await db.select()
        .from(auditLogs)
        .where(eq(auditLogs.simulationId, simulationId))
        .orderBy(desc(auditLogs.createdAt));
      
      res.json(logs);
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Stripe payment routes
  const { createSimulationPayment, createSubscription, handlePaymentSuccess, constructWebhookEvent } = await import('./stripe');
  
  app.post("/api/payments/create-intent", authMiddleware as any, async (req: AuthRequest, res) => {
    try {
      const { simulationId } = req.body;
      
      if (!simulationId) {
        return res.status(400).json({ error: "Simulation ID required" });
      }
      
      const paymentIntent = await createSimulationPayment(simulationId, req.user!.id);
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error('Create payment intent error:', error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });
  
  app.post("/api/payments/create-subscription", authMiddleware as any, async (req: AuthRequest, res) => {
    try {
      const { priceId } = req.body;
      
      if (!priceId) {
        return res.status(400).json({ error: "Price ID required" });
      }
      
      const subscription = await createSubscription(req.user!.id, priceId);
      
      const latestInvoice = subscription.latest_invoice as any;
      const paymentIntent = latestInvoice?.payment_intent;
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent?.client_secret,
      });
    } catch (error: any) {
      console.error('Create subscription error:', error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });
  
  // Stripe webhook endpoint (BEFORE json middleware, using raw body)
  app.post("/api/webhooks/stripe", async (req, res) => {
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature) {
      return res.status(400).json({ error: 'No signature' });
    }
    
    try {
      const event = constructWebhookEvent(req.body, signature);
      
      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSuccess(event.data.object.id);
          break;
        
        case 'payment_intent.payment_failed':
          console.log('Payment failed:', event.data.object.id);
          break;
        
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          console.log('Subscription event:', event.type, event.data.object.id);
          break;
        
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
