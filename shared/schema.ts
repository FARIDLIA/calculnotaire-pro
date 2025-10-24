import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const simulations = pgTable("simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  // Input data (stored as JSONB for flexibility)
  inputData: jsonb("input_data").notNull(),
  
  // Results (stored as JSONB)
  resultData: jsonb("result_data").notNull(),
  
  // Payment status
  isPaid: boolean("is_paid").default(false).notNull(),
  paymentType: text("payment_type"), // 'oneshot' | 'subscription'
  stripePaymentId: text("stripe_payment_id"),
  
  // Exports
  pdfUrl: text("pdf_url"),
  shareToken: varchar("share_token").unique(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dmtoTable = pgTable("dmto_table", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deptCode: varchar("dept_code", { length: 3 }).notNull(),
  deptName: text("dept_name").notNull(),
  dmtoRate: decimal("dmto_rate", { precision: 5, scale: 2 }).notNull(),
  communeRate: decimal("commune_rate", { precision: 5, scale: 2 }).notNull(),
  stateAddition: decimal("state_addition", { precision: 5, scale: 2 }).notNull(),
  totalTransfer: decimal("total_transfer", { precision: 5, scale: 2 }).notNull(),
  notaryFeesBase: decimal("notary_fees_base", { precision: 5, scale: 2 }).notNull(),
  notaryFixed: decimal("notary_fixed", { precision: 10, scale: 2 }).notNull(),
  version: varchar("version", { length: 20 }).notNull(),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to"),
  sourceUrl: text("source_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inseeDept = pgTable("insee_dept", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  codeCommune: varchar("code_commune", { length: 5 }).notNull(),
  deptCode: varchar("dept_code", { length: 3 }).notNull(),
  communeName: text("commune_name").notNull(),
});

export const dvfCache = pgTable("dvf_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cacheKey: text("cache_key").notNull().unique(),
  inseeCode: varchar("insee_code", { length: 5 }),
  radius: integer("radius"),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  cachedAt: timestamp("cached_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  simulationId: varchar("simulation_id").references(() => simulations.id),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email(),
  password: z.string().min(8),
});

export const insertSimulationSchema = createInsertSchema(simulations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDMTOSchema = createInsertSchema(dmtoTable).omit({
  id: true,
  createdAt: true,
});

export const insertInseeDeptSchema = createInsertSchema(inseeDept).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Simulation = typeof simulations.$inferSelect;
export type InsertSimulation = z.infer<typeof insertSimulationSchema>;
export type DMTORate = typeof dmtoTable.$inferSelect;
export type InsertDMTORate = z.infer<typeof insertDMTOSchema>;
export type InseeDept = typeof inseeDept.$inferSelect;
export type DVFCache = typeof dvfCache.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
