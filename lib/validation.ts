import { z } from "zod";
import { CONFIG } from "./config";

export const esquemaMensaje = z.object({
  conversacionId: z.uuid().nullable(),
  mensaje: z
    .string()
    .trim()
    .min(1, "El mensaje está vacío")
    .max(
      CONFIG.limites.caracteresPorMensaje,
      `Máximo ${CONFIG.limites.caracteresPorMensaje} caracteres`,
    ),
});

export type DatosMensaje = z.infer<typeof esquemaMensaje>;
