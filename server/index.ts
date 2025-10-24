import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Correction ESM (__dirname n’existe pas dans Node 22+)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware global
app.set("trust proxy", 1);

// Stripe webhook avant parsing JSON
app.post("/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  (_req, _res, next) => next()
);

// JSON + URLencoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Sécurité : Helmet (CSP autorisant Google Fonts)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"]
      }
    }
  })
);

// ======================
// ROUTES API
// ======================
(async () => {
  const { initializeStripe } = await import("./stripe");
  initializeStripe();

  const server = await registerRoutes(app);

  // 🔥 Route santé pour test
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Gestion d’erreurs API
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    console.error("❌ Server error:", err);
    res.status(status).json({ error: err.message || "Internal Server Error" });
  });

  // ======================
  // SERVEUR STATIC / FRONT
  // ======================

  // Sert manifest.json AVANT le fallback
  const pubDir = path.join(__dirname, "public");
  app.get("/manifest.json", (_req, res) => {
    res.sendFile(path.join(pubDir, "manifest.json"));
  });

  // Sert les fichiers frontend (vite build)
  serveStatic(app);

  // ⚠️ Important : le fallback index.html ne s’applique PAS sur /api/*
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(pubDir, "index.html"));
  });

  // ======================
  // LANCEMENT SERVEUR
  // ======================
  const PORT = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port: PORT, host: "0.0.0.0" }, () =>
    log(`✅ Server running on port ${PORT}`)
  );
})();
