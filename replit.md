# CalcuNotaire Pro

## Overview

CalcuNotaire Pro is a professional French real estate capital gains and tax calculation SaaS platform. It provides notarial simulations for property sales, calculating capital gains, tax liabilities (IR, PS, surcharges), exemptions, and net proceeds. The application targets individuals (Personne Physique), SCI IR, and SCI IS entities, delivering certified PDF reports with official BOFiP and DGFiP formula compliance.

**Core Features:**
- 6-step wizard for property sale simulation
- Real-time capital gains calculation with French tax law compliance
- DMTO (property transfer tax) estimation by department
- DVF (Demande de Valeurs Foncières) comparable property data integration
- PDF generation with QR codes and official source citations
- Payment processing (one-shot purchases and subscriptions via Stripe)
- Admin back-office for DMTO rate management and audit logs
- PWA support for mobile-first experience

**Target Users:** Real estate professionals, notaries, property sellers, SCI managers

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React 18+ with TypeScript, built using Vite

**UI Components:** Shadcn/ui component library (New York style) with Radix UI primitives for accessibility

**Styling:** TailwindCSS with custom design tokens following professional fintech/legaltech aesthetics
- Light/dark mode support with theme toggle
- Custom color palette emphasizing trust (deep blue primary) and authority
- Responsive mobile-first design (PWA-ready)

**State Management:**
- TanStack Query (React Query) for server state and API caching
- React Context for authentication state
- Local component state for wizard form progression

**Routing:** Wouter for lightweight client-side routing

**Form Handling:** React Hook Form with Zod validation schemas for strict input validation

**Key Design Decisions:**
- Progressive disclosure through 6-step wizard (Essentials → Acquisition → Cession → SCI → Surface → Results)
- Live calculation panel (sticky sidebar) maintains context throughout user journey
- Accessibility-first approach (AA compliance target)
- Professional color scheme inspired by French government portals (impots.gouv.fr) and modern fintech (Stripe, Qonto)

### Backend Architecture

**Runtime:** Node.js with Express.js

**Language:** TypeScript with ES modules

**API Design:** RESTful JSON endpoints with cookie-based JWT authentication

**Authentication & Security:**
- JWT tokens stored in HttpOnly cookies (7-day expiration)
- Bcrypt password hashing (cost factor 10)
- Rate limiting at multiple levels:
  - Auth endpoints: 5 requests/15 minutes
  - Calculation endpoints: 10 requests/minute
  - General API: 100 requests/15 minutes
- CORS configuration with trust proxy for deployment behind reverse proxies

**Calculation Engine:** Pure TypeScript functions in `shared/calc-core.ts`
- Implements official BOFiP formulas for capital gains taxation
- Supports PP (Personne Physique), SCI IR, and SCI IS tax regimes
- Handles exemptions (principal residence, first sale + reinvestment)
- Progressive tax rates and surcharges for high capital gains

**PDF Generation:** Puppeteer for server-side HTML-to-PDF rendering with QR code generation (qrcode library)

**Key Design Decisions:**
- Separation of calculation logic (`shared/calc-core.ts`) from API layer for testability
- Input validation at API boundary using Zod schemas before passing to calculation engine
- Stateless API design (JWT in cookies, no server-side sessions)
- Raw body parsing specifically for Stripe webhooks before general JSON middleware

### Data Architecture

**Database:** PostgreSQL 15+ via Neon serverless driver

**ORM:** Drizzle ORM with schema-first approach

**Schema Design:**
- `users`: Authentication, Stripe customer linking, admin flags
- `simulations`: JSONB storage for flexible input/result data, payment tracking
- `dmtoTable`: Versioned DMTO (property transfer tax) rates by department
- `inseeDept`: INSEE commune/department reference data
- `dvfCache`: Cached DVF comparable property data (7-day TTL)
- `auditLogs`: Compliance and security audit trail

**Migrations:** Drizzle Kit for schema migrations (`drizzle.config.ts`)

**Key Design Decisions:**
- JSONB for simulation data allows schema evolution without migrations
- Versioned DMTO rates (`version`, `validFrom`, `validTo`) enable historical accuracy
- Separate audit log table for RGPD compliance and security monitoring
- Database connection pooling via Neon serverless for serverless deployment compatibility

### External Dependencies

**Payment Processing:**
- **Stripe** (stripe, @stripe/stripe-js, @stripe/react-stripe-js)
  - One-shot payments (€39 for single simulation PDF unlock)
  - Subscription management (Standard/Pro/Cabinet tiers)
  - Webhook handling for payment confirmations
  - Customer and subscription ID stored in users table

**Database:**
- **Neon** (preferred) or **Supabase** for managed PostgreSQL
  - Serverless PostgreSQL with WebSocket support (@neondatabase/serverless)
  - Connection pooling for high availability

**External Data Sources:**
- **DGFiP (Direction Générale des Finances Publiques):** DMTO rate tables (imported via CSV)
- **INSEE:** Commune and department reference data
- **Etalab DVF API:** Comparable property sale data (Demande de Valeurs Foncières)
  - Used for market validation
  - 3-5 comparables within radius
  - Links to app.dvf.etalab.gouv.fr

**File Storage:**
- **S3-compatible storage** (Scaleway or Wasabi recommended)
  - PDF exports (`pdfUrl` in simulations table)
  - CSV exports
  - Future: invoice storage

**Frontend Libraries:**
- **Radix UI:** Accessible component primitives (20+ components)
- **Lucide React:** Icon library
- **TailwindCSS:** Utility-first styling
- **React Hook Form + Zod:** Form validation
- **TanStack Query:** API state management

**Development & Deployment:**
- **Vite:** Build tool and dev server
- **GitHub Actions:** CI/CD pipeline (lint, typecheck, test, deploy)
- **Vercel:** Frontend hosting (recommended)
- **Render/Fly.io:** Backend API hosting (recommended)

**Monitoring & Compliance:**
- Health endpoint (`/health`) for uptime monitoring
- Audit logs for RGPD compliance (5-year retention)
- GDPR-compliant data retention policies documented in `/docs/rgpd.md`

**Key Integration Decisions:**
- Stripe webhooks require raw body parsing (handled before JSON middleware)
- DVF data cached for 7 days to reduce external API load
- DMTO rates versioned to support historical simulations and regulatory changes
- PDF generation server-side (Puppeteer) rather than client-side for certification trust