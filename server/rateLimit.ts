import rateLimit from "express-rate-limit";

/* Auth rate limiting */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

/* Compute/calculation rate limiting */
export const computeRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,
  message: "Too many calculation requests, please slow down",
  standardHeaders: true,
  legacyHeaders: false,
});

/* General API limiter */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
