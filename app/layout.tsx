import type { Metadata } from "next";
import { CONFIG } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${CONFIG.marca.producto} · ${CONFIG.marca.nombre}`,
  description:
    "Apoyo profesional para gerentes en la gestión de personas. Herramienta privada de Loke.",
  // Herramienta privada: fuera de buscadores.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
