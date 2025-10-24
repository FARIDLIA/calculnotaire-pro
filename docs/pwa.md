# PWA (Progressive Web App) - CalcuNotaire Pro

## Vue d'Ensemble

CalcuNotaire Pro est une Progressive Web App permettant :
- ✅ Installation sur mobile (iOS, Android)
- ✅ Fonctionnement offline (consultation simulations)
- ✅ Splash screen native
- ✅ Expérience app-like

## Manifest.json

```json
{
  "name": "CalcuNotaire Pro",
  "short_name": "CalcuNotaire",
  "description": "Calculateur de plus-value immobilière et frais de notaire (DMTO)",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a1628",
  "theme_color": "#1e3a5f",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/results.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ],
  "categories": ["finance", "utilities"],
  "lang": "fr-FR"
}
```

## Service Worker

### Stratégie de Cache

**Cache-First** : Assets statiques (JS, CSS, fonts)  
**Network-First** : API calls (simulations, auth)  
**Offline Fallback** : Page offline.html

```typescript
// public/sw.js
const CACHE_NAME = 'calcu-notaire-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles.css',
  '/bundle.js',
  '/icons/icon-192x192.png'
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET requests
          if (request.method === 'GET' && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request);
    })
  );
});
```

## Offline Experience

### Page Offline

```html
<!-- public/offline.html -->
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hors ligne - CalcuNotaire Pro</title>
  <style>
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #0a1628;
      color: white;
      font-family: sans-serif;
      text-align: center;
      padding: 20px;
    }
    .offline-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div>
    <div class="offline-icon">📡</div>
    <h1>Vous êtes hors ligne</h1>
    <p>Reconnectez-vous pour accéder aux nouvelles simulations</p>
    <p>Vos simulations récentes restent consultables</p>
  </div>
</body>
</html>
```

### Fonctionnalités Offline

**Disponibles** :
- ✅ Consultation des simulations sauvegardées (24h cache)
- ✅ Interface utilisateur (HTML/CSS/JS)
- ✅ Calculateur local (si données en cache)

**Indisponibles** :
- ❌ Nouvelles simulations (requiert API)
- ❌ Login/signup (requiert DB)
- ❌ Paiements Stripe
- ❌ DVF lookup

## Installation

### Android (Chrome, Edge, Samsung Internet)

1. Ouvrir https://app.calcu-notaire.fr
2. Bannière "Ajouter à l'écran d'accueil" apparaît
3. Ou : Menu → Installer l'application
4. Icône ajoutée à l'écran d'accueil

### iOS (Safari)

1. Ouvrir https://app.calcu-notaire.fr dans Safari
2. Bouton "Partager" → "Sur l'écran d'accueil"
3. Nom: CalcuNotaire Pro
4. Icône ajoutée

**Note** : iOS ne supporte pas pleinement les Service Workers (limitations Safari)

### Desktop (Chrome, Edge)

1. Icône "installer" dans la barre d'adresse
2. Ou : Menu → Installer CalcuNotaire Pro
3. Application standalone dans dock/barre des tâches

## Add-to-Home-Screen Prompt

```typescript
// client/src/lib/pwa.ts
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent default prompt
  e.preventDefault();
  
  // Store event for later
  deferredPrompt = e;
  
  // Show custom install button
  const installButton = document.getElementById('install-pwa');
  if (installButton) {
    installButton.style.display = 'block';
    
    installButton.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      
      // Show install prompt
      deferredPrompt.prompt();
      
      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User ${outcome} the install prompt`);
      
      // Clear prompt
      deferredPrompt = null;
      installButton.style.display = 'none';
    });
  }
});

// Track install
window.addEventListener('appinstalled', () => {
  console.log('PWA installed');
  // Analytics event
  posthog.capture('pwa_installed');
});
```

## iOS Splash Screens

```html
<!-- public/index.html -->
<head>
  <!-- iOS meta tags -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="CalcuNotaire">
  
  <!-- iOS splash screens (différentes résolutions) -->
  <link rel="apple-touch-startup-image" 
        href="/splash/iphone5_splash.png"
        media="(device-width: 320px) and (device-height: 568px)">
  
  <link rel="apple-touch-startup-image" 
        href="/splash/iphone6_splash.png"
        media="(device-width: 375px) and (device-height: 667px)">
  
  <link rel="apple-touch-startup-image" 
        href="/splash/iphoneplus_splash.png"
        media="(device-width: 414px) and (device-height: 736px)">
  
  <link rel="apple-touch-startup-image" 
        href="/splash/iphonex_splash.png"
        media="(device-width: 375px) and (device-height: 812px)">
  
  <link rel="apple-touch-startup-image" 
        href="/splash/iphonexr_splash.png"
        media="(device-width: 414px) and (device-height: 896px)">
  
  <link rel="apple-touch-startup-image" 
        href="/splash/iphonexsmax_splash.png"
        media="(device-width: 414px) and (device-height: 896px)">
  
  <link rel="apple-touch-startup-image" 
        href="/splash/ipad_splash.png"
        media="(device-width: 768px) and (device-height: 1024px)">
  
  <link rel="apple-touch-startup-image" 
        href="/splash/ipadpro1_splash.png"
        media="(device-width: 834px) and (device-height: 1112px)">
  
  <link rel="apple-touch-startup-image" 
        href="/splash/ipadpro2_splash.png"
        media="(device-width: 1024px) and (device-height: 1366px)">
</head>
```

## Responsive Design

### Breakpoints

```css
/* Mobile-first approach */
:root {
  --mobile: 640px;
  --tablet: 768px;
  --desktop: 1024px;
  --wide: 1280px;
}

/* Base: Mobile (< 640px) */
.wizard-step {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .wizard-step {
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .layout {
    display: grid;
    grid-template-columns: 2fr 1fr; /* Wizard + Results sticky */
  }
}
```

### Touch Targets

- **Min 44x44px** (Apple HIG)
- **Min 48x48px** (Material Design)
- Espacement 8px entre boutons

## Testing

### Lighthouse PWA Audit

```bash
# Chrome DevTools → Lighthouse → PWA
# Target: Score ≥ 90

npx lighthouse https://app.calcu-notaire.fr --view
```

**Critères** :
- ✅ HTTPS
- ✅ manifest.json valide
- ✅ Service Worker enregistré
- ✅ Offline fallback
- ✅ Installable
- ✅ Splash screen (iOS)
- ✅ Responsive (mobile/tablet/desktop)

### Devices de Test

| Device | OS | Browser | Priority |
|--------|----|---------|---------
| iPhone 12/13/14/15 | iOS 16+ | Safari | ⭐⭐⭐ |
| Pixel 7/8/9 | Android 13+ | Chrome | ⭐⭐⭐ |
| iPad Air/Pro | iPadOS 16+ | Safari | ⭐⭐ |
| Samsung Galaxy S21/S22 | Android 12+ | Chrome | ⭐⭐ |
| OnePlus 9/10 | Android 12+ | Chrome | ⭐ |

### Test Checklist

- [ ] Installation depuis navigateur (Android/iOS)
- [ ] Icône sur écran d'accueil
- [ ] Splash screen au lancement
- [ ] Mode standalone (pas de barre navigateur)
- [ ] Offline : page offline.html affichée
- [ ] Offline : simulations cachées consultables
- [ ] Online : nouvelles simulations fonctionnent
- [ ] Rotation portrait/paysage
- [ ] Clavier virtuel ne cache pas inputs

## Performance Budget

| Metric | Target | Max |
|--------|--------|-----|
| **LCP** (Largest Contentful Paint) | < 2.5s | 4.0s |
| **TTI** (Time to Interactive) | < 3.5s | 5.0s |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.25 |
| **FID** (First Input Delay) | < 100ms | 300ms |
| **Bundle size** (JS gzipped) | < 200KB | 300KB |

### Optimisations

1. **Code splitting**
   ```typescript
   // Lazy load pages
   const Admin = lazy(() => import('./pages/Admin'));
   ```

2. **Image optimization**
   ```html
   <!-- Responsive images -->
   <img srcset="logo-320w.png 320w, logo-640w.png 640w"
        sizes="(max-width: 640px) 100vw, 50vw"
        src="logo-640w.png" />
   ```

3. **Preload critical assets**
   ```html
   <link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin>
   ```

4. **Cache headers**
   ```typescript
   // Vercel: vercel.json
   {
     "headers": [
       {
         "source": "/(.*).js",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=31536000, immutable"
           }
         ]
       }
     ]
   }
   ```

## Update Strategy

### Version Update

```typescript
// Service worker version bump
const CACHE_NAME = 'calcu-notaire-v2'; // Increment version

// Force update on new version
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((name) => name !== CACHE_NAME)
             .map((name) => caches.delete(name))
      );
    })
  );
});
```

### User Notification

```typescript
// Notify user of update
navigator.serviceWorker.addEventListener('controllerchange', () => {
  // Show toast: "Nouvelle version disponible. Recharger ?"
  showUpdateToast();
});
```

## Analytics

### PWA Events

```typescript
// Track PWA usage
posthog.capture('pwa_installed', {
  platform: 'android' // or 'ios', 'desktop'
});

posthog.capture('pwa_launched', {
  display_mode: 'standalone', // or 'browser'
  online: navigator.onLine
});

posthog.capture('offline_access', {
  cached_simulations: 3
});
```

## Troubleshooting

### Service Worker ne s'enregistre pas

```bash
# Check console errors
# Chrome DevTools → Application → Service Workers

# Clear cache
# Application → Storage → Clear site data

# Vérifier HTTPS (requis)
curl -I https://app.calcu-notaire.fr | grep -i strict-transport
```

### iOS ne propose pas "Ajouter à l'écran d'accueil"

- ✅ Vérifier manifest.json valide
- ✅ Vérifier apple-touch-icon présent
- ✅ Tester dans Safari (pas Chrome iOS)
- ⚠️ iOS ne montre pas de bannière automatique (manuel uniquement)

### Offline ne fonctionne pas

```bash
# Vérifier Service Worker actif
# DevTools → Application → Service Workers → Status: "activated"

# Tester en mode avion
# Network tab → Offline checkbox

# Vérifier cache
# Application → Cache Storage → calcu-notaire-v1
```

## Ressources

- [PWA Builder](https://www.pwabuilder.com/) : Générer assets
- [Maskable.app](https://maskable.app/editor) : Tester icônes
- [Web.dev PWA](https://web.dev/progressive-web-apps/) : Best practices
- [iOS PWA Guide](https://developer.apple.com/design/human-interface-guidelines/ios/overview/themes/) : Spécificités iOS

## Roadmap PWA

- [x] manifest.json
- [x] Service Worker basique
- [x] Offline fallback
- [x] iOS splash screens
- [ ] Background sync (queue paiements offline)
- [ ] Push notifications (résultats simulation)
- [ ] Share API (partager simulation)
- [ ] Shortcuts API (quick actions)
