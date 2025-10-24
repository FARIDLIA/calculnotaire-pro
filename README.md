# 🏡 CalcuNotaire Pro

> Plateforme SaaS professionnelle de simulation de plus-values immobilières et frais de notaire (DMTO) - Conforme BOFiP et DGFiP

[![CI/CD](https://github.com/your-repo/calcunotaire-pro/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/your-repo/calcunotaire-pro/actions)
[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Made with ❤️ in France](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F-in%20France-blue)](https://fr.wikipedia.org/wiki/France)

---

## 📊 Vue d'ensemble

CalcuNotaire Pro est une application web production-ready qui permet aux particuliers, SCI, et professionnels de l'immobilier de calculer précisément :

✅ **Plus-values immobilières** avec abattements pour durée de détention (BOFiP)  
✅ **Impôt sur le revenu** (IR) à 19% avec exonérations  
✅ **Prélèvements sociaux** (PS) à 17.2% avec abattements spécifiques  
✅ **Surtaxes** sur plus-values > 50k€  
✅ **DMTO** (Droits de Mutation à Titre Onéreux) par département  
✅ **Exports PDF certifiés** avec QR codes, timestamps et disclaimers légaux  
✅ **Exports CSV** pour analyse dans Excel/Sheets  

---

## 🚀 Démarrage rapide

### Prérequis
```bash
Node.js >= 20.0.0
npm >= 10.0.0
PostgreSQL 15+ (Neon/Supabase recommandé)
```

### Installation locale

```bash
# 1. Cloner le repo
git clone https://github.com/your-repo/calcunotaire-pro.git
cd calcunotaire-pro

# 2. Installer les dépendances
npm install

# 3. Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (DATABASE_URL, JWT_SECRET, etc.)

# 4. Initialiser la base de données
npm run db:push

# 5. (Optionnel) Seed data DMTO et INSEE
npm run db:seed

# 6. Lancer en dev
npm run dev
```

L'application sera accessible sur `http://localhost:5000`

---

## 🏗️ Architecture

### Stack Technique

**Frontend**
- ⚛️ React 18 + TypeScript
- 🎨 TailwindCSS + Shadcn/UI (design system)
- 🔄 TanStack Query (server state)
- 🛣️ Wouter (routing)
- 📝 React Hook Form + Zod (validation)
- 🌙 Dark mode natif

**Backend**
- 🟢 Node.js + Express
- 📘 TypeScript strict mode
- 🗄️ Drizzle ORM + PostgreSQL
- 🔐 JWT Authentication (httpOnly cookies)
- 📄 Puppeteer (génération PDF)
- 💳 Stripe (paiements)

**Infrastructure**
- ☁️ Vercel (frontend CDN)
- 🐳 Render/Fly.io (backend containers)
- 🗄️ Neon PostgreSQL (serverless)
- 📦 Scaleway/Wasabi S3 (stockage PDFs)
- 📊 Sentry (monitoring)
- ✅ GitHub Actions (CI/CD)

### Structure du projet
```
calcunotaire-pro/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/          # Pages (Home, Login, Admin, CGU, etc.)
│   │   ├── components/     # Composants réutilisables (Shadcn/UI)
│   │   ├── lib/            # Utils (auth, queryClient, etc.)
│   │   └── hooks/          # Custom React hooks
│   └── public/             # Assets statiques, manifest.json, SW
├── server/                 # Backend Express
│   ├── routes.ts           # API routes
│   ├── auth.ts             # Authentification JWT
│   ├── db.ts               # Drizzle DB connection
│   ├── pdf-generator.ts    # Génération PDF Puppeteer
│   └── middleware/         # Rate limiting, security headers
├── shared/                 # Code partagé frontend/backend
│   ├── schema.ts           # Drizzle schema + Zod types
│   ├── calc-core.ts        # Moteur de calcul BOFiP
│   └── validation.ts       # Schémas Zod validation
├── docs/                   # Documentation technique
│   ├── deployment.md       # Guide déploiement
│   ├── security.md         # Sécurité & OWASP
│   ├── rgpd.md             # Conformité RGPD
│   └── pwa.md              # Progressive Web App
└── .github/workflows/      # CI/CD GitHub Actions
```

---

## 🔐 Sécurité

### Mesures implémentées

✅ **Headers de sécurité** (CSP strict, HSTS, X-Frame-Options, etc.)  
✅ **Authentication** : JWT httpOnly + SameSite cookies  
✅ **Rate limiting** : Auth (5 req/15min), Compute (10 req/min), API (100 req/15min)  
✅ **Validation stricte** : Zod schemas frontend + backend  
✅ **Chiffrement** : Bcrypt (cost 10) pour passwords  
✅ **CSRF protection** : SameSite cookies  
✅ **SQL Injection** : Drizzle ORM (prepared statements)  
✅ **Audit logs** : Traçabilité toutes actions sensibles  

Voir `/docs/security.md` pour le détail complet.

---

## ⚖️ Conformité RGPD

CalcuNotaire Pro est **100% conforme RGPD** :

✅ Hébergement **exclusivement UE** (Neon/Vercel/Render Europe)  
✅ **Droit à l'oubli** : endpoint DELETE `/api/auth/account`  
✅ **Droit d'accès** : export CSV des simulations  
✅ **Droit de rectification** : édition compte utilisateur  
✅ **Consentement cookies** : bannière opt-in analytics  
✅ **Pages légales** : CGU, Confidentialité, Cookies  
✅ **Conservation limitée** : 5 ans max, purge automatique  
✅ **Registre sous-traitants** : documenté dans `/docs/rgpd.md`  

---

## 📱 PWA (Progressive Web App)

L'application est installable sur mobile/desktop :

✅ **Manifest.json** : icônes, couleurs, standalone mode  
✅ **Service Worker** : cache stratégique Network-First  
✅ **Offline fallback** : page `/offline.html`  
✅ **Add to Home Screen** : prompt iOS + Android  
✅ **Lighthouse PWA** : score ≥ 90  

Testez : ouvrez `https://app.calcu-notaire.fr` sur mobile → "Ajouter à l'écran d'accueil"

---

## 💳 Paiements Stripe

### Modèles de revenus

1. **One-shot** : 29-39€ / simulation avec PDF certifié
2. **Abonnements** :
   - Standard : 29€/mois (10 simulations/mois)
   - Pro : 79€/mois (illimité + support prioritaire)
   - Cabinet : 199€/mois (multi-utilisateurs + API)

### Webhooks Stripe
```bash
# URL à configurer dans Stripe Dashboard
https://api.calcu-notaire.fr/api/stripe/webhook

# Events écoutés :
- checkout.session.completed
- invoice.paid
- customer.subscription.updated
- customer.subscription.deleted
```

---

## 📄 Génération PDF

Les PDFs générés incluent :

📋 **Inputs** : prix, dates, type de bien, occupation  
🧮 **Formules BOFiP** : détail calcul abattements IR/PS  
💰 **Résultats** : PV brute, impôts, net vendeur  
🔗 **QR Code** : lien partage sécurisé  
⏰ **Timestamp** : horodatage certifié  
⚖️ **Disclaimers légaux** : sources BOFiP, DGFiP, Service-Public  

Technologie : Puppeteer + Chromium headless

---

## 🧪 Tests

```bash
# Linter
npm run lint

# TypeScript check
npm run typecheck

# Tests unitaires (à implémenter)
npm test

# Tests E2E Playwright
npm run test:e2e

# Lighthouse audit
npm run lighthouse
```

---

## 🚀 Déploiement

### Environnements

| Env | Frontend | Backend | Database |
|-----|----------|---------|----------|
| **Dev** | localhost:5000 | localhost:5000 | local/Neon dev |
| **Staging** | staging.calcu-notaire.fr | api-staging.calcu-notaire.fr | Neon staging |
| **Prod** | app.calcu-notaire.fr | api.calcu-notaire.fr | Neon prod |

### Pipeline CI/CD

```
git push develop → Lint + Build
git push staging → Deploy Staging automatique
git push main    → Deploy Production automatique
```

Voir `/docs/deployment.md` pour le guide complet.

---

## 📊 Monitoring

### Uptime & Alertes
- **UptimeRobot** : ping `/health` toutes les 5 minutes
- **Sentry** : errors frontend + backend
- **Slack** : alertes si uptime < 99.9% ou latence > 800ms

### Metrics
- Disponibilité : > 99.9%
- Latence p95 : < 800ms
- Taux d'erreur : < 0.1%

---

## 📚 Documentation complète

| Doc | Description |
|-----|-------------|
| [Deployment](docs/deployment.md) | CI/CD, DNS, secrets |
| [Security](docs/security.md) | Headers, OWASP, rate-limit |
| [RGPD](docs/rgpd.md) | Conformité, durées, droits |
| [PWA](docs/pwa.md) | Manifest, cache, offline |
| [Runbooks](docs/runbooks.md) | Incidents, rollback |

---

## 🛠️ Scripts NPM

```bash
npm run dev          # Dev server (frontend + backend)
npm run build        # Build production
npm run preview      # Preview build local
npm run db:push      # Push schema to database
npm run db:studio    # Drizzle Studio (GUI)
npm run db:seed      # Seed DMTO et INSEE data
```

---

## 🤝 Contribution

Ce projet est **propriétaire** et n'accepte pas de contributions externes.

Pour rapporter un bug : [GitHub Issues](https://github.com/your-repo/calcunotaire-pro/issues)

---

## 📜 License

Copyright © 2024 CalcuNotaire Pro. Tous droits réservés.

---

## 📞 Support

- **Email** : support@calcu-notaire.fr
- **Documentation** : https://docs.calcu-notaire.fr
- **Status** : https://status.calcu-notaire.fr

---

<div align="center">

**Fait avec ❤️ en France 🇫🇷**

[Website](https://app.calcu-notaire.fr) • [Documentation](https://docs.calcu-notaire.fr) • [Twitter](https://twitter.com/calcunotaire)

</div>
