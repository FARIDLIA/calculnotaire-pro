# CalcuNotaire Pro - Guide de Déploiement HostPapa

## 📦 Contenu du Package

Ce ZIP contient l'application **CalcuNotaire Pro** buildée et prête pour le déploiement.

### Structure des fichiers :
```
deploy-hostpapa/
├── dist/
│   ├── public/          # Frontend React buildé (fichiers statiques)
│   │   ├── index.html
│   │   └── assets/      # CSS et JS compilés
│   └── index.js         # Backend Express.js bundlé
├── package.json         # Dépendances de production
├── package-lock.json
└── README-DEPLOYMENT.md # Ce fichier
```

## 🚀 Instructions de Déploiement sur HostPapa

### Prérequis
- Accès cPanel HostPapa avec Node.js activé
- PostgreSQL database (Neon ou autre)
- Variables d'environnement configurées

### Étape 1 : Upload des fichiers
1. Connectez-vous à votre cPanel HostPapa
2. Allez dans **File Manager**
3. Uploadez le contenu du dossier `deploy-hostpapa/` dans votre répertoire web (par ex: `public_html/`)

### Étape 2 : Installation des dépendances
Via SSH ou Terminal dans cPanel :
```bash
cd /home/votre-username/public_html
npm install --production
```

### Étape 3 : Configuration des variables d'environnement
Créez un fichier `.env` avec :

```env
# Base de données (OBLIGATOIRE)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Session (générez une clé aléatoire sécurisée)
SESSION_SECRET=votre-secret-super-long-et-aleatoire-ici

# Stripe (optionnel si paiements activés)
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# Production
NODE_ENV=production
PORT=5000
```

### Étape 4 : Démarrage de l'application

#### Option A - Via PM2 (recommandé)
```bash
npm install -g pm2
pm2 start dist/index.js --name calcunotaire
pm2 save
pm2 startup
```

#### Option B - Via Node directement
```bash
NODE_ENV=production node dist/index.js
```

### Étape 5 : Configuration Apache/Nginx (Reverse Proxy)

Si votre domaine principal doit pointer vers cette app, configurez un reverse proxy :

**Apache (.htaccess ou VirtualHost) :**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:5000/$1 [P,L]
```

**Nginx :**
```nginx
location / {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### Étape 6 : SSL/HTTPS
1. Dans cPanel, allez dans **SSL/TLS**
2. Activez **Let's Encrypt** pour votre domaine
3. Forcez HTTPS via .htaccess :
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## 🗄️ Base de Données

### Option 1 : Neon (recommandé)
1. Créez un compte sur [neon.tech](https://neon.tech)
2. Créez un nouveau projet PostgreSQL
3. Copiez la connection string dans `DATABASE_URL`

### Option 2 : PostgreSQL HostPapa
Si HostPapa propose PostgreSQL :
1. Créez une database via cPanel
2. Notez les identifiants et construisez votre `DATABASE_URL`

### Migration de la base de données
Après avoir configuré `DATABASE_URL` :
```bash
# Si vous avez Drizzle Kit installé
npm install -g drizzle-kit
drizzle-kit push

# OU exécutez les migrations manuellement via pgAdmin
```

## 📊 Tables à créer

Si vous devez créer manuellement les tables, voici le schéma minimum :

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    stripe_customer_id VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE simulations (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id INTEGER REFERENCES users(id),
    input_data JSONB NOT NULL,
    result_data JSONB,
    pdf_url TEXT,
    csv_url TEXT,
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Sécurité

- ✅ Générez un `SESSION_SECRET` fort (32+ caractères aléatoires)
- ✅ Activez HTTPS obligatoirement
- ✅ Ne commitez JAMAIS le fichier `.env`
- ✅ Limitez l'accès SSH
- ✅ Configurez un firewall si disponible

## 🧪 Test de l'application

Une fois déployée, testez :
1. Accédez à votre domaine : `https://votredomaine.com`
2. Créez un compte utilisateur
3. Testez le calculateur de plus-value
4. Vérifiez les exports PDF/CSV

## 📞 Support

En cas de problème :
- Vérifiez les logs Node.js : `pm2 logs calcunotaire`
- Vérifiez la connexion database : `psql $DATABASE_URL`
- Vérifiez les permissions fichiers : `ls -la`

## 🎯 Points importants HostPapa

1. **Node.js version** : Vérifiez que HostPapa supporte Node 18+
2. **Port** : L'app écoute sur le port 5000 par défaut (configurable via `PORT`)
3. **Memory** : L'app nécessite ~512MB RAM minimum
4. **Persistance** : Utilisez PM2 pour garder l'app active 24/7

---

✨ **Votre application CalcuNotaire Pro est maintenant prête à être déployée !**
