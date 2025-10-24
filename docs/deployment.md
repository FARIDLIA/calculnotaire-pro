# Déploiement CalcuNotaire Pro

## Architecture de Déploiement

### Environnements

- **Development** : local (localhost:5000)
- **Staging** : validation pré-production
- **Production** : app.calcu-notaire.fr

### Services

| Service | Provider | URL |
|---------|----------|-----|
| Frontend (Web) | Vercel | https://app.calcu-notaire.fr |
| API (Backend) | Render / Fly.io | https://api.calcu-notaire.fr |
| Database | Neon / Supabase | PostgreSQL 15+ |
| Storage S3 | Scaleway / Wasabi | Exports PDF/CSV |
| Admin | Vercel | https://admin.calcu-notaire.fr |

## Configuration DNS

```
app.calcu-notaire.fr       → CNAME → vercel-dns
api.calcu-notaire.fr       → CNAME → render/fly.io
admin.calcu-notaire.fr     → CNAME → vercel-dns
```

## Prérequis

1. **Node.js** : v20+ (LTS)
2. **PostgreSQL** : 15+
3. **Stripe Account** : clés API test & production
4. **Domaine** : calcu-notaire.fr configuré

## Variables d'Environnement

### Production

Créer les secrets dans :
- **Vercel** : Settings → Environment Variables
- **Render** : Environment → Secret Files
- **GitHub** : Settings → Secrets and variables → Actions

```bash
# Database
DATABASE_URL=postgres://user:pass@db.region.neon.tech/prod

# JWT & Session
JWT_SECRET=<générer avec: openssl rand -base64 32>
SESSION_SECRET=<générer avec: openssl rand -base64 32>

# Stripe (Production keys)
STRIPE_SECRET_KEY=sk_live_xxx
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# S3
S3_ENDPOINT=https://s3.fr-par.scw.cloud
S3_BUCKET=calcu-notaire-prod
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx

# Sentry
SENTRY_DSN_API=https://xxx@sentry.io/xxx
SENTRY_DSN_WEB=https://xxx@sentry.io/xxx
```

## CI/CD GitHub Actions

### Workflow `.github/workflows/deploy.yml`

```yaml
name: Deploy CalcuNotaire Pro

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint & Type check
        run: |
          npm run lint
          npm run typecheck
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
  
  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel (Staging)
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
  
  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy Frontend to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy API to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
      
      - name: Run DB Migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: npm run db:push
```

## Déploiement Manuel

### 1. Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Configurer les variables d'environnement
vercel env add VITE_STRIPE_PUBLIC_KEY production
```

### 2. Backend API (Render)

1. Créer un nouveau **Web Service** sur Render
2. Connecter le repo GitHub
3. Configuration :
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
   - **Environment** : Node
4. Ajouter les variables d'environnement
5. Déployer

### 3. Database (Neon)

```bash
# Créer la base de données
# Via console Neon : https://console.neon.tech

# Récupérer DATABASE_URL
# Format: postgres://user:pass@region.neon.tech/dbname

# Exécuter les migrations
DATABASE_URL=<url> npm run db:push
```

### 4. Stripe Webhooks

```bash
# Configuration du webhook en production
# Stripe Dashboard → Developers → Webhooks → Add endpoint

# URL: https://api.calcu-notaire.fr/api/webhooks/stripe
# Events: payment_intent.succeeded, customer.subscription.*

# Copier le webhook secret → STRIPE_WEBHOOK_SECRET
```

## Monitoring Post-Déploiement

### Health Checks

```bash
# API Health
curl https://api.calcu-notaire.fr/health

# Expected: {"status": "ok", "database": "connected"}
```

### Vérifications

- [ ] Frontend accessible (app.calcu-notaire.fr)
- [ ] API health endpoint répond (api.calcu-notaire.fr/health)
- [ ] Database connectée
- [ ] Stripe webhooks configurés
- [ ] SSL/TLS actif (https)
- [ ] Sentry reçoit les erreurs
- [ ] Logs accessibles

## Rollback

### Vercel (Frontend)

```bash
# Lister les déploiements
vercel ls

# Rollback vers un déploiement précédent
vercel rollback <deployment-url>
```

### Render (API)

1. Dashboard → Service → Manual Deploy
2. Sélectionner un commit précédent

### Database

```bash
# Restaurer depuis backup
pg_restore -d $DATABASE_URL backup_file.dump
```

## Backup Strategy

### Database

- **Automatique** : Neon fait des backups quotidiens (30 jours rétention)
- **Manuel** : `npm run backup:db` (script à créer)

### S3

- **Versioning** activé sur le bucket
- **Lifecycle policy** : 90 jours puis archivage

## Sécurité

### SSL/TLS

- **Vercel** : SSL automatique (Let's Encrypt)
- **Render** : SSL automatique

### Headers de Sécurité

Configurés dans `server/index.ts` :
- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Content-Security-Policy`

### Rate Limiting

- Auth endpoints : 5 req/15min
- Compute endpoints : 10 req/min
- Global API : 100 req/15min

## Troubleshooting

### API ne répond pas

```bash
# Vérifier les logs Render
render logs -t web-service-name

# Vérifier la connexion DB
psql $DATABASE_URL -c "SELECT 1"
```

### Webhook Stripe échoue

```bash
# Test local avec Stripe CLI
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Vérifier les logs Stripe Dashboard
```

### Erreurs CORS

- Vérifier que `CORS_ORIGIN` est configuré
- Frontend et API doivent être sur le même domaine (ou subdomain)

## Contact Support

- **Technique** : tech@calcu-notaire.fr
- **Stripe** : support Stripe Dashboard
- **Neon/Render** : support respectif
