import helmet from "helmet";

/**
 * Content-Security-Policy autorisant Google Fonts
 * - styleSrc : fonts.googleapis.com (+ unsafe-inline)
 * - fontSrc  : fonts.gstatic.com
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      imgSrc: ["'self'", "data:"]
    }
  }
});
