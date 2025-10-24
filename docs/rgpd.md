# Conformité RGPD - CalcuNotaire Pro

## Vue d'Ensemble

CalcuNotaire Pro est conforme au Règlement Général sur la Protection des Données (RGPD UE 2016/679).

## Responsable du Traitement

**CalcuNotaire Pro**  
Email : dpo@calcu-notaire.fr  
Téléphone : +33 (0)1 XX XX XX XX

## Base Légale du Traitement

- **Exécution du contrat** (Art. 6.1.b) : Fourniture du service de simulation
- **Intérêt légitime** (Art. 6.1.f) : Amélioration du service, support client
- **Consentement** (Art. 6.1.a) : Analytics, cookies non-essentiels

## Données Collectées

### Données Personnelles

| Catégorie | Données | Finalité | Base Légale |
|-----------|---------|----------|-------------|
| **Identification** | Email, nom | Compte utilisateur | Contrat |
| **Authentification** | Mot de passe (haché bcrypt) | Sécurité | Contrat |
| **Simulation** | Données immobilières (prix, dates, localisation) | Calcul fiscal | Contrat |
| **Paiement** | Stripe Customer ID | Facturation | Contrat |
| **Technique** | IP, User-Agent, logs | Sécurité, performance | Intérêt légitime |
| **Analytics** | Événements anonymisés | Amélioration produit | Consentement |

### Données Sensibles

❌ **Aucune donnée sensible** (Art. 9 RGPD) :
- Pas de données biométriques
- Pas d'origine ethnique/raciale
- Pas d'opinions politiques
- Pas de santé

## Durée de Conservation

| Donnée | Durée | Justification |
|--------|-------|---------------|
| **Compte utilisateur** | Actif + 5 ans après suppression | Obligation légale (BOFiP) |
| **Simulations** | 5 ans | Archive légale |
| **Audit logs** | 5 ans | Sécurité, traçabilité |
| **Paiements Stripe** | 10 ans | Obligation comptable |
| **DVF cache** | 7 jours | Performance (données publiques) |
| **Analytics** | 13 mois | Durée cookies CNIL |

### Purge Automatique

```typescript
// Cron job quotidien : purge DVF cache > 7 jours
DELETE FROM dvf_cache WHERE created_at < NOW() - INTERVAL '7 days';

// Archivage simulations > 5 ans
UPDATE simulations SET archived = true WHERE created_at < NOW() - INTERVAL '5 years';
```

## Droits des Utilisateurs

### Article 15 - Droit d'Accès

**Endpoint** : `GET /api/user/data`

```json
{
  "user": {
    "email": "user@example.com",
    "createdAt": "2024-01-15"
  },
  "simulations": [...],
  "payments": [...]
}
```

### Article 17 - Droit à l'Effacement

**Endpoint** : `DELETE /api/user/me`

```typescript
// Pseudonymisation (conservation légale 5 ans)
await db.update(users).set({
  email: `deleted_${userId}@anonymized.local`,
  password: 'DELETED',
  deletedAt: new Date()
});

// Suppression données Stripe
await stripe.customers.delete(user.stripeCustomerId);
```

**Exceptions** :
- Conservation 5 ans pour obligations légales (BOFiP)
- Données pseudonymisées (email, nom supprimés)
- Audit logs conservés (sécurité)

### Article 16 - Droit de Rectification

**Endpoint** : `PATCH /api/user/me`

### Article 18 - Droit à la Limitation

**Endpoint** : `POST /api/user/suspend`

### Article 20 - Droit à la Portabilité

**Endpoint** : `GET /api/user/export`

Format : **JSON** (machine-readable)

```json
{
  "exportDate": "2024-10-19",
  "user": {...},
  "simulations": [...],
  "format": "JSON"
}
```

### Article 21 - Droit d'Opposition

Contact DPO : dpo@calcu-notaire.fr

## Sous-Traitants (Art. 28)

### Registre des Sous-Traitants

| Sous-traitant | Service | Localisation | DPA Signé |
|---------------|---------|--------------|-----------|
| **Neon** | Database PostgreSQL | UE (Irlande) | ✅ |
| **Vercel** | Hébergement Frontend | UE (Frankfurt) | ✅ |
| **Render** / **Fly.io** | Hébergement API | UE (Paris/Frankfurt) | ✅ |
| **Stripe** | Paiement | UE (Irlande) | ✅ |
| **Scaleway** | Stockage S3 | UE (France) | ✅ |
| **Sentry** | Monitoring erreurs | USA (Privacy Shield) | ✅ |

**Garanties** :
- ✅ Tous certifiés ISO 27001
- ✅ DPA (Data Processing Agreement) signés
- ✅ Hébergement UE prioritaire
- ✅ Privacy Shield / Standard Contractual Clauses (USA)

## Transferts Hors UE

### Sentry (USA)

- **Mécanisme** : Standard Contractual Clauses (SCC)
- **Garanties** : Privacy Shield successor framework
- **Minimisation** : Uniquement erreurs (pas de données perso)
- **Opt-out** : Possible via SENTRY_DSN vide

## Sécurité (Art. 32)

### Mesures Techniques

- ✅ **Chiffrement at rest** : AES-256 (DB, S3)
- ✅ **Chiffrement in transit** : TLS 1.3
- ✅ **Hashing passwords** : bcrypt (cost 10)
- ✅ **Rate limiting** : Protection brute force
- ✅ **Audit logs** : Traçabilité 5 ans

### Mesures Organisationnelles

- ✅ **Accès contrôlé** : Least privilege
- ✅ **Séparation environnements** : dev/staging/prod
- ✅ **Backups chiffrés** : 30 jours rétention
- ✅ **Incident response plan** : docs/runbooks.md

## Notification de Violation (Art. 33)

### Procédure

1. **Détection** : Sentry, logs, monitoring
2. **Évaluation** : Gravité, données impactées
3. **Containment** : Isolation, patch
4. **Notification CNIL** : 72h si risque pour utilisateurs
5. **Notification utilisateurs** : Si risque élevé

**Contact CNIL** : https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles

### Registre des Violations

Stocké dans : `audit_logs` table, action = `data_breach`

## Analyse d'Impact (AIPD)

### Évaluation

**Traitement à risque élevé ?** ❌ Non

Justification :
- Pas de données sensibles (Art. 9)
- Pas de profilage automatisé
- Pas de surveillance systématique
- Volume limité de données
- Contrôle utilisateur (suppression)

**AIPD non requise** selon Art. 35.

## Consentement Cookies

### Bannière de Consentement

```html
<!-- Cookie banner -->
<div id="cookie-consent">
  <p>Nous utilisons des cookies essentiels et des cookies analytics (avec votre consentement).</p>
  <button onclick="acceptCookies()">Accepter tout</button>
  <button onclick="rejectNonEssential()">Refuser analytics</button>
  <a href="/cookies">En savoir plus</a>
</div>
```

### Catégories

| Catégorie | Cookies | Durée | Consentement |
|-----------|---------|-------|--------------|
| **Essentiels** | auth_token, session | 7 jours | Non requis |
| **Analytics** | posthog_id | 13 mois | ✅ Requis |
| **Stripe** | stripe_mid | Session | Non requis (paiement) |

## Pages Légales

### /cgu - Conditions Générales d'Utilisation

- Objet du service
- Responsabilité (calculs indicatifs)
- Propriété intellectuelle
- Résiliation

### /confidentialite - Politique de Confidentialité

- Données collectées
- Finalités
- Durées de conservation
- Droits RGPD
- Contact DPO

### /cookies - Politique Cookies

- Types de cookies
- Finalités
- Durées
- Gestion du consentement

## Contact DPO

**Email** : dpo@calcu-notaire.fr  
**Réponse** : sous 30 jours (Art. 12.3)

## Obligations Légales

### Registre des Activités de Traitement

| Traitement | Finalité | Base Légale | Durée |
|------------|----------|-------------|-------|
| Gestion comptes | Authentification | Contrat | Actif + 5 ans |
| Simulations fiscales | Calcul plus-value | Contrat | 5 ans |
| Paiements | Facturation | Contrat | 10 ans |
| Audit logs | Sécurité | Intérêt légitime | 5 ans |

### Mentions Légales

Page `/mentions-legales` :
- Éditeur, hébergeur
- Directeur de publication
- Coordonnées DPO
- CNIL déclaration (si applicable)

## Checklist Conformité RGPD

- [x] Base légale identifiée (contrat, consentement)
- [x] Durées de conservation définies
- [x] Sous-traitants conformes (DPA)
- [x] Sécurité (chiffrement, bcrypt, TLS)
- [x] Droits utilisateurs implémentés
- [x] Politique de confidentialité
- [x] CGU publiées
- [x] Bannière cookies (consentement analytics)
- [x] Registre des traitements
- [x] DPO désigné
- [x] Procédure violation de données
- [ ] AIPD (si requis) - Non requis
- [ ] Certification ISO 27001 (optionnel)

## Audits

- **Interne** : Trimestriel (checklist CNIL)
- **Externe** : Annuel (cabinet spécialisé RGPD)
- **Technique** : Pentest annuel

## Mise à Jour

Ce document est révisé :
- À chaque modification majeure du traitement
- Minimum 1x/an
- Après tout incident de sécurité

**Dernière mise à jour** : 19 octobre 2024
