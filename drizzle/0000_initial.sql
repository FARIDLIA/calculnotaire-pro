-- CalcuNotaire Pro Initial Migration

CREATE TABLE IF NOT EXISTS "users" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL UNIQUE,
  "password" text NOT NULL,
  "is_admin" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "simulations" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" varchar,
  "input_data" jsonb NOT NULL,
  "result_data" jsonb NOT NULL,
  "is_paid" boolean DEFAULT false NOT NULL,
  "payment_type" text,
  "stripe_payment_id" text,
  "pdf_url" text,
  "share_token" varchar UNIQUE,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "dmto_table" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "dept_code" varchar(3) NOT NULL,
  "dept_name" text NOT NULL,
  "dmto_rate" decimal(5,2) NOT NULL,
  "commune_rate" decimal(5,2) NOT NULL,
  "state_addition" decimal(5,2) NOT NULL,
  "total_transfer" decimal(5,2) NOT NULL,
  "notary_fees_base" decimal(5,2) NOT NULL,
  "notary_fixed" decimal(10,2) NOT NULL,
  "version" varchar(20) NOT NULL,
  "effective_from" timestamp NOT NULL,
  "effective_to" timestamp,
  "source_url" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "insee_dept" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "code_commune" varchar(5) NOT NULL,
  "dept_code" varchar(3) NOT NULL,
  "commune_name" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "dvf_cache" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "insee_code" varchar(5) NOT NULL,
  "radius" integer NOT NULL,
  "data" jsonb NOT NULL,
  "cached_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "simulation_id" varchar,
  "user_id" varchar,
  "action" text NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  FOREIGN KEY ("simulation_id") REFERENCES "simulations"("id"),
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_simulations_user_id" ON "simulations"("user_id");
CREATE INDEX IF NOT EXISTS "idx_simulations_share_token" ON "simulations"("share_token");
CREATE INDEX IF NOT EXISTS "idx_dmto_dept_code" ON "dmto_table"("dept_code", "effective_from");
CREATE INDEX IF NOT EXISTS "idx_insee_code_commune" ON "insee_dept"("code_commune");
CREATE INDEX IF NOT EXISTS "idx_dvf_cache_insee" ON "dvf_cache"("insee_code", "radius");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_simulation" ON "audit_logs"("simulation_id");
