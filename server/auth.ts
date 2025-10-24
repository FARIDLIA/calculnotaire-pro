import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key-change-in-production";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

// --- Utilitaires mot de passe ---
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// --- JWT ---
export function generateToken(userId: string, email: string, isAdmin: boolean): string {
  return jwt.sign({ userId, email, isAdmin }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// --- Middleware d'authentification ---
export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  req.user = {
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  next();
}

// --- Middleware admin ---
export async function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

// --- Cookie helpers : compatibilité Render ---
export function setAuthCookie(res: Response, token: string) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,         // Render free-tier => pas HTTPS natif
    sameSite: "lax",       // permet le front → API cross-origin
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
}
