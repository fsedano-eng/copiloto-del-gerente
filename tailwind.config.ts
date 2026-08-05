import type { Config } from "tailwindcss";

/**
 * Paleta real de Loke — extraída de projects/2026-07-10-radar-loke-web/report-template.html.
 * No inventar colores nuevos: si hace falta un tono, sale de aquí.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: { DEFAULT: "#ff4713", soft: "#fff0eb" },
        dark: "#171717",
        ink: "#282828",
        gray: { DEFAULT: "#6b6862", line: "#e8e4df" },
        cream: "#faf8f6",
        estado: {
          funcional: "#2e7d32",
          "funcional-soft": "#eaf5ec",
          inestable: "#d99a17",
          "inestable-soft": "#fdf3e0",
          critico: "#c9462c",
          "critico-soft": "#fbe9e5",
        },
      },
      fontFamily: {
        sans: ["Archivo", "Arial", "Helvetica", "sans-serif"],
      },
      maxWidth: {
        lectura: "72ch",
      },
    },
  },
  plugins: [],
};

export default config;
