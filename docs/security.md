# Sécurité CalcuNotaire Pro

## Vue d'Ensemble

CalcuNotaire Pro implémente une stratégie de sécurité multi-couches conforme aux standards OWASP et aux exigences RGPD.

## Authentication & Authorization

### JWT avec Cookies HttpOnly

```typescript
// server/auth.ts
const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

res.cookie('auth_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

**Protections** :
- ✅ HttpOnly : protection XSS
- ✅ Secure : HTTPS uniquement en production
- ✅ SameSite=strict : protection CSRF
- ✅ Expiration : 7 jours max

### Password Hashing

```typescript
// bcrypt avec salt rounds = 10
const hashedPassword = await bcrypt.hash(password, 10);
```

**Exigences mot de passe** :
- Minimum 8 caractères
- Hashing bcrypt (cost factor 10)
- Pas de réutilisation (historique 5 derniers)

### Rate Limiting

```typescript
// server/middleware.ts
authRateLimiter: 5 requests / 15 minutes    // Login/Signup
computeRateLimiter: 10 requests / minute    // Calculs
apiRateLimiter: 100 requests / 15 minutes   // API globale
```

**Protection contre** :
- Brute force login
- DDoS sur endpoints de calcul
- Abus API

## Input Validation

### Zod Schemas Stricts

```typescript
// shared/validation.ts
export const simulationInputSchema = z.object({
  salePrice: z.number().positive().max(100_000_000),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  // ... tous les champs validés
}).refine(...)
```

**Validations** :
- ✅ Types stricts (number, string, enum)
- ✅ Bornes min/max
- ✅ Regex patterns
- ✅ Relations entre champs
- ✅ Rejection 400 si invalide

### SQL Injection Prevention

- ✅ Drizzle ORM (parameterized queries)
- ✅ Aucun SQL raw user-controlled
- ✅ Prepared statements automatiques

## Headers de Sécurité

```typescript
// server/index.ts
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Content-Security-Policy', `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' https://api.stripe.com;
    frame-src https://js.stripe.com;
  `.replace(/\s+/g, ' '));
  next();
});
```

**Protection** :
- HSTS : force HTTPS
- X-Frame-Options : anti-clickjacking
- CSP : limite les sources externes
- Permissions-Policy : désactive APIs dangereuses

## Stripe Payment Security

### Webhook Signature Verification

```typescript
// server/stripe.ts
export function constructWebhookEvent(payload: Buffer, signature: string) {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
```

### Customer Deduplication

```typescript
// Persist Stripe customer ID to prevent duplicates
if (user.stripeCustomerId) {
  customerId = user.stripeCustomerId;
} else {
  const customer = await stripe.customers.create({...});
  await db.update(users).set({ stripeCustomerId: customer.id });
}
```

### Idempotency

- Webhook events logged in audit_logs
- Payment status checks before processing
- Transaction rollback on errors

## Data Encryption

### At Rest

- **Database** : Neon PostgreSQL encrypted at rest (AES-256)
- **S3 Bucket** : Server-side encryption (SSE-S3)
- **Backups** : Encrypted (AES-256)

### In Transit

- **TLS 1.3** : all connections (API, DB, S3)
- **HTTPS** : enforced via HSTS
- **Certificate** : Let's Encrypt (auto-renew)

## OWASP Top 10 Compliance

| Vulnerability | Status | Protection |
|---------------|--------|------------|
| A01: Broken Access Control | ✅ | JWT auth, ownership checks |
| A02: Cryptographic Failures | ✅ | TLS 1.3, bcrypt, AES-256 |
| A03: Injection | ✅ | Drizzle ORM, Zod validation |
| A04: Insecure Design | ✅ | Security by design, least privilege |
| A05: Security Misconfiguration | ✅ | Hardened headers, rate limits |
| A06: Vulnerable Components | ⚠️ | npm audit, Dependabot |
| A07: Auth Failures | ✅ | Rate limiting, bcrypt, JWT |
| A08: Data Integrity Failures | ✅ | Webhook signatures, HMAC |
| A09: Security Logging Failures | ✅ | Audit logs, Sentry |
| A10: SSRF | ✅ | No user-controlled URLs |

## Audit Logging

### Events Logged

```typescript
// server/routes.ts
await db.insert(auditLogs).values({
  simulationId: simulation.id,
  action: 'simulation_created',
  userId: req.user!.id,
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
  metadata: { inputHash: sha256(inputData) }
});
```

**Logged Actions** :
- Simulation créée/mise à jour/supprimée
- Paiement réussi/échoué
- Login/logout
- Admin actions (DMTO updates)
- Erreurs critiques

**Retention** : 5 ans (conformité RGPD)

## Vulnerability Scanning

### Automated

```bash
# Package vulnerabilities
npm audit

# Security scan
npm run security:scan

# OWASP ZAP (CI/CD)
zap-baseline.py -t https://app.calcu-notaire.fr
```

### Manual

- Penetration testing annuel
- Code review sur security-critical paths
- Stripe webhook testing avant prod

## Data Minimization

### Collecte

- ✅ Uniquement données nécessaires
- ✅ Pas de tracking tiers (sauf consentement)
- ✅ Anonymisation DVF cache

### Rétention

| Data | Retention | Reason |
|------|-----------|--------|
| Simulations | 5 ans | Légal (BOFiP) |
| Audit logs | 5 ans | Compliance |
| DVF cache | 7 jours | Performance |
| User accounts | Suppression sur demande | RGPD Art. 17 |

## Incident Response

### Procédure

1. **Détection** : Sentry alerts, monitoring
2. **Containment** : Disable affected endpoints
3. **Investigation** : Check audit logs, Sentry traces
4. **Remediation** : Patch, deploy, verify
5. **Notification** : CNIL (72h si breach RGPD)

### Contacts

- **Security Lead** : security@calcu-notaire.fr
- **CNIL** : Via form on cnil.fr
- **Stripe** : security@stripe.com

## Checklist Pre-Production

- [ ] SSL/TLS configuré (A+ sur SSL Labs)
- [ ] Headers sécurité actifs
- [ ] Rate limiting testé
- [ ] Stripe webhooks vérifiés
- [ ] npm audit clean (0 high/critical)
- [ ] Secrets rotated (JWT, session, Stripe)
- [ ] Backup/restore testé
- [ ] Audit logs fonctionnels
- [ ] Sentry actif
- [ ] RGPD compliance vérifiée

## Updates & Patches

### Schedule

- **Critical security patches** : sous 24h
- **npm packages** : hebdomadaire (dependabot)
- **Node.js LTS** : mise à jour trimestrielle

### Process

```bash
# Check vulnerabilities
npm audit

# Auto-fix non-breaking
npm audit fix

# Review breaking changes
npm audit fix --force  # avec tests
```

## Contact

Pour signaler une vulnérabilité : **security@calcu-notaire.fr**

- Réponse initiale : 24h
- Patch critique : 72h
- Full disclosure : 90 jours post-patch
