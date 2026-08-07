import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad mínimas (ver checklist de arquitectura).
 * No hay recursos externos salvo Google Fonts, así que la CSP puede ser estricta.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js inyecta scripts inline en dev y en el runtime de app router
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      // Supabase (auth + base de datos) es el único host externo al que llamamos
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Sin esto, la compresión automática de Next puede bufferear las
  // respuestas en streaming (el chat) y entregarlas de golpe al final
  // en vez de ir soltando el texto en tiempo real.
  compress: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
