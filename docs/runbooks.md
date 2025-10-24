# Runbooks CalcuNotaire Pro

## Introduction

Guides opérationnels pour incidents courants et maintenances.

---

## 1. API Down / Indisponible

### Symptômes
- Health endpoint ne répond pas : `https://api.calcu-notaire.fr/health`
- Erreurs 502/503/504
- Timeout sur requêtes API

### Diagnostic

```bash
# Check health endpoint
curl https://api.calcu-notaire.fr/health
# Expected: {"status":"ok","database":"connected"}

# Check Render/Fly.io logs
render logs -t api-service
# ou
fly logs -a calcu-notaire-api

# Check database connection
psql $DATABASE_URL -c "SELECT 1"
```

### Causes Communes

1. **Database déconnectée**
   ```bash
   # Restart service
   render restart api-service
   
   # Verify DB
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM users"
   ```

2. **Memory leak / OOM**
   ```bash
   # Check memory usage (Render dashboard)
   # Restart service
   render restart api-service
   ```

3. **Rate limiting trop strict**
   ```bash
   # Temporarily increase limits in server/middleware.ts
   # Deploy hotfix
   ```

### Résolution

1. **Immédiate** : Redéployer dernière version stable
   ```bash
   git checkout <last-stable-commit>
   vercel deploy --prod
   render deploy
   ```

2. **Rollback Database** (si migration cassée)
   ```bash
   pg_restore -d $DATABASE_URL backup_<date>.dump
   ```

3. **Notification utilisateurs** : Page de status

---

## 2. Stripe Webhook Échoue

### Symptômes
- Paiements réussis mais simulation.isPaid = false
- Erreurs 400/401 sur `/api/webhooks/stripe`
- Stripe Dashboard → Webhooks → Événements échoués

### Diagnostic

```bash
# Test webhook locally
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Trigger test event
stripe trigger payment_intent.succeeded

# Check logs
grep "Webhook error" /tmp/logs/Start_application_*.log
```

### Causes Communes

1. **STRIPE_WEBHOOK_SECRET incorrect**
   ```bash
   # Get current secret from Stripe Dashboard
   # Update env var
   render env set STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

2. **Signature verification échoue**
   - Body parsé en JSON avant webhook
   - **Fix** : Vérifier que `express.raw()` est appliqué AVANT `express.json()`

3. **Endpoint pas en HTTPS**
   - Stripe requiert HTTPS en production
   - **Fix** : Vérifier SSL/TLS actif

### Résolution

1. **Webhook configuration Stripe**
   ```
   URL: https://api.calcu-notaire.fr/api/webhooks/stripe
   Events: payment_intent.succeeded, payment_intent.payment_failed, 
           customer.subscription.created, customer.subscription.updated
   ```

2. **Test manuel**
   ```bash
   curl -X POST https://api.calcu-notaire.fr/api/webhooks/stripe \
     -H "stripe-signature: <test-signature>" \
     -d @test_webhook_payload.json
   ```

3. **Replay événements échoués**
   - Stripe Dashboard → Webhooks → Événements
   - Bouton "Resend" sur événements failed

---

## 3. Calculs Incorrects

### Symptômes
- Résultats différents de la calculette DGFiP
- Erreur 500 sur `/api/simulations/:id/compute`
- Surcharge PS incorrect

### Diagnostic

```bash
# Test calc-core avec données connues
npm run test:calc

# Vérifier input validation
curl -X POST https://api.calcu-notaire.fr/api/simulations \
  -H "Authorization: Bearer <token>" \
  -d @test_simulation_input.json
```

### Causes Communes

1. **Formule BOFiP obsolète**
   - Vérifier version BOFiP dans shared/calc-core.ts
   - Comparer avec https://bofip.impots.gouv.fr/bofip/3358-PGP.html

2. **Edge case non géré**
   - Holding years = 0
   - Sale price = 0
   - Dates invalides

3. **Surcharge decay formula**
   ```typescript
   // Vérifier formule Annexe A
   const decayedRate = fullRate * Math.max(0, 1 - (years - startYear) * decayRate);
   ```

### Résolution

1. **Golden tests**
   ```bash
   # Ajouter cas de test avec résultat DGFiP vérifié
   # tests/calc-core.test.ts
   
   it('should match DGFiP example (>30 ans, 100k€)', () => {
     const result = calculateCapitalGain({...});
     expect(result.totalTax).toBe(19000); // Vérifié manuellement
   });
   ```

2. **Hotfix**
   ```bash
   # Corriger formule dans shared/calc-core.ts
   git commit -m "fix: surcharge decay formula for years > 30"
   npm run test
   git push
   vercel deploy --prod
   render deploy
   ```

3. **Notification clients affectés**
   - Identifier simulations impactées via audit_logs
   - Email avec recalcul correct

---

## 4. Database Corruption / Perte de Données

### Symptômes
- Erreurs SQL (constraint violations)
- Données manquantes
- Impossible de créer simulations

### Diagnostic

```bash
# Check database integrity
psql $DATABASE_URL

# Vérifier tables
\dt

# Compter records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM simulations;
SELECT COUNT(*) FROM dmto_table;

# Check constraints
SELECT * FROM pg_constraint;
```

### Causes Communes

1. **Migration cassée**
   - Changement de type ID (serial ↔ varchar)
   - Contrainte FK invalide

2. **Backup corrompu**
   - Restauration partielle

3. **Concurrent writes**
   - Race condition sur insert

### Résolution

1. **Restauration depuis backup**
   ```bash
   # List backups (Neon console)
   # Restore to point-in-time
   
   # Ou backup manuel
   pg_restore -d $DATABASE_URL backup_<date>.dump
   ```

2. **Rebuild schema (DANGER)**
   ```bash
   # SEULEMENT si backup valide
   npm run db:push --force
   ```

3. **Données perdues**
   - Vérifier audit_logs pour reconstruire
   - Contact utilisateurs affectés

---

## 5. Rotation des Secrets

### Quand ?
- Tous les 90 jours (JWT, SESSION_SECRET)
- Immédiatement si compromis
- Après départ d'un membre de l'équipe

### Procédure

#### JWT_SECRET

```bash
# Générer nouveau secret
NEW_SECRET=$(openssl rand -base64 32)

# Update env vars (ZERO DOWNTIME)
# 1. Ajouter JWT_SECRET_NEW
render env set JWT_SECRET_NEW=$NEW_SECRET

# 2. Code: accepter les deux secrets (backwards compat)
# auth.ts: verify avec JWT_SECRET || JWT_SECRET_NEW

# 3. Deploy

# 4. Attendre expiration tokens (7 jours)

# 5. Promouvoir NEW → OLD
render env set JWT_SECRET=$NEW_SECRET
render env rm JWT_SECRET_NEW

# 6. Remove backwards compat du code
# 7. Deploy
```

#### STRIPE_SECRET_KEY

```bash
# Stripe Dashboard → Developers → API keys → Roll key

# Update env
render env set STRIPE_SECRET_KEY=sk_live_NEW_XXX

# Deploy immédiatement
render deploy

# Vérifier webhook fonctionne
stripe trigger payment_intent.succeeded
```

#### DATABASE_URL

```bash
# Neon console → Reset password
# Get new DATABASE_URL

# Update env (ZERO DOWNTIME crucial)
render env set DATABASE_URL=<new-url>
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production

# Deploy (new pods use new URL)
render deploy

# Old pods expirent (60s max)
```

---

## 6. Purge DVF Cache

### Quand ?
- DVF cache > 7 jours (automatique)
- Problèmes mémoire DB
- Données DVF obsolètes

### Procédure

```bash
# Manuel
psql $DATABASE_URL

DELETE FROM dvf_cache WHERE created_at < NOW() - INTERVAL '7 days';

# Vérifier
SELECT COUNT(*) FROM dvf_cache;
SELECT pg_size_pretty(pg_total_relation_size('dvf_cache'));
```

### Automatisation (Cron)

```typescript
// server/cron.ts
import cron from 'node-cron';

cron.schedule('0 3 * * *', async () => {
  // 3AM daily
  await db.delete(dvfCache).where(
    lt(dvfCache.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  );
  console.log('DVF cache purged');
});
```

---

## 7. Haute Latence / Performance Dégradée

### Symptômes
- Requêtes API > 800ms (p95)
- Lighthouse score < 90
- Timeout frontend

### Diagnostic

```bash
# Check API latency (Sentry)
# Performance → Transactions → /api/simulations

# Database slow queries
psql $DATABASE_URL
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

# Check indexes
SELECT * FROM pg_indexes WHERE tablename = 'simulations';
```

### Causes Communes

1. **Missing index**
   ```sql
   CREATE INDEX idx_simulations_user_id ON simulations(user_id);
   CREATE INDEX idx_dmto_dept_date ON dmto_table(dept_code, valid_from);
   ```

2. **N+1 queries**
   ```typescript
   // Bad
   for (const sim of simulations) {
     const user = await db.select().from(users).where(eq(users.id, sim.userId));
   }
   
   // Good
   const sims = await db.select().from(simulations).leftJoin(users, ...);
   ```

3. **DVF API timeout**
   ```typescript
   // Augmenter timeout
   fetch(DVF_URL, { signal: AbortSignal.timeout(10000) })
   ```

### Résolution

1. **Indexes**
   ```bash
   npm run db:push  # Apply indexes
   ```

2. **Caching**
   ```typescript
   // Redis pour simulations récentes
   const cached = await redis.get(`sim:${id}`);
   if (cached) return JSON.parse(cached);
   ```

3. **CDN**
   - Vercel CDN pour assets statiques
   - Cache-Control headers

---

## 8. Déploiement en Échec

### Symptômes
- Build fail sur Vercel/Render
- Tests fail en CI/CD
- Migration database fail

### Diagnostic

```bash
# Check CI logs (GitHub Actions)
gh run list
gh run view <run-id>

# Check build logs (Render)
render logs -t api-service --build

# Local build test
npm run build
```

### Causes Communes

1. **TypeScript errors**
   ```bash
   npm run typecheck
   # Fix errors
   ```

2. **Test failures**
   ```bash
   npm test
   # Fix failing tests
   ```

3. **Environment vars missing**
   ```bash
   # Vérifier .env.example vs production
   render env list
   ```

### Résolution

1. **Rollback**
   ```bash
   git revert <bad-commit>
   git push
   ```

2. **Hotfix**
   ```bash
   git checkout -b hotfix/build-error
   # Fix issue
   git commit -m "hotfix: ..."
   git push
   # Merge to main
   ```

3. **Skip CI (emergency)**
   ```bash
   git commit -m "fix: urgent [skip ci]"
   ```

---

## 9. RGPD - Demande de Suppression

### Procédure

1. **Vérification identité**
   - Email de confirmation à l'utilisateur
   - Vérifier token de réinitialisation

2. **Pseudonymisation (pas suppression totale)**
   ```sql
   -- Conservation 5 ans légale
   UPDATE users SET
     email = 'deleted_' || id || '@anonymized.local',
     password = 'DELETED',
     deleted_at = NOW()
   WHERE id = '<user-id>';
   
   -- Garder simulations (pseudonymisées)
   -- Garder audit_logs (traçabilité)
   ```

3. **Stripe cleanup**
   ```typescript
   await stripe.customers.del(user.stripeCustomerId);
   ```

4. **Confirmation utilisateur**
   - Email de confirmation suppression
   - Rappel : données conservées 5 ans (pseudonymisées)

---

## 10. Monitoring Alerts

### Sentry Alert: Error Rate > 1%

```bash
# Check Sentry dashboard
# Identifier error pattern

# Si 500 errors:
render logs -t api-service | grep "500"

# Si client errors (400):
# Check validation errors
```

### UptimeRobot Alert: Service Down

```bash
# Check health endpoint
curl https://api.calcu-notaire.fr/health

# If down:
render restart api-service

# If database issue:
psql $DATABASE_URL -c "SELECT 1"
```

### Slack Alert: High Latency

```bash
# Check Sentry Performance
# Identify slow endpoint

# Analyze query
EXPLAIN ANALYZE <slow-query>;

# Add index if needed
```

---

## Contacts Urgents

| Service | Contact | SLA |
|---------|---------|-----|
| **On-call** | oncall@calcu-notaire.fr | 15 min |
| **Neon Support** | Neon Dashboard | 1h |
| **Stripe** | support@stripe.com | 24h |
| **Vercel** | support@vercel.com | 4h |
| **Render** | support@render.com | 2h |

## Escalation

1. **P0 (Critical)** : Service down > 15 min
2. **P1 (High)** : Dégradation majeure > 1h
3. **P2 (Medium)** : Bug affectant utilisateurs
4. **P3 (Low)** : Amélioration, doc

**P0/P1** → Notification Slack + Email + SMS on-call
