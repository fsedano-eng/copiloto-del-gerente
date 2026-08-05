import Anthropic from "@anthropic-ai/sdk";
import { CONFIG } from "./config";

/**
 * Cliente de Anthropic. La clave vive SOLO en el servidor: el navegador
 * nunca la ve (por eso todas las llamadas pasan por /api/chat).
 */
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: CONFIG.ia.timeoutMs,
  maxRetries: 1,
});

export type Turno = { rol: "user" | "assistant"; contenido: string };

/**
 * Instrucción extra que se añade cuando la conversación YA tiene un análisis
 * completo hecho. No la decide el modelo: la decide la app mirando el
 * historial (ver `yaTieneAnalisis`), así que es determinista.
 */
export const INSTRUCCION_SEGUIMIENTO = `
# ESTE MENSAJE ES UN SEGUIMIENTO

En esta conversación ya has entregado un análisis completo. El gerente está volviendo sobre la misma situación, no planteando una nueva.

**No repitas lo que no ha cambiado. Actualiza lo que sí.**

Responde a lo que te pregunta y di explícitamente qué apartados del análisis cambian con esta información nueva (por ejemplo: "esto no cambia el nivel de riesgo, pero sí el guion de conversación"). Lo que sigue siendo válido ya está dicho más arriba en esta misma conversación: no hace falta repetirlo entero.

Si la información nueva cambia el cuadro de forma sustancial — sube el nivel de riesgo, aparece un indicio de conducta grave, o se ve que el problema es otro — entonces sí rehaz el análisis completo y dilo: "esto cambia el diagnóstico".`;

/**
 * ¿Hay ya un análisis completo en el historial?
 * Marcador: el apartado 3 del formato completo ("Nivel de riesgo") siempre
 * aparece, así que su presencia en una respuesta previa es señal fiable.
 */
export function yaTieneAnalisis(historial: Turno[]): boolean {
  return historial.some(
    (t) => t.rol === "assistant" && /nivel de riesgo/i.test(t.contenido),
  );
}

/** Recorta el historial a los últimos N turnos para no inflar el contexto. */
export function recortarHistorial(historial: Turno[]): Turno[] {
  return historial.slice(-CONFIG.limites.turnosDeContexto);
}

/** Título corto para la lista de conversaciones. Una llamada barata y breve. */
export async function generarTitulo(primerMensaje: string): Promise<string> {
  try {
    const respuesta = await anthropic.messages.create({
      model: CONFIG.ia.modelo,
      max_tokens: 30,
      system:
        "Titula la consulta de un gerente sobre gestión de personas. Máximo 6 palabras, sin comillas, sin punto final. Nombra la situación y a quién afecta si se dice. Ejemplos: 'Bajo rendimiento — Juan', 'Conflicto entre dos del turno de tarde', 'Reincorporación tras baja larga'.",
      messages: [{ role: "user", content: primerMensaje.slice(0, 1500) }],
    });
    const bloque = respuesta.content.find((b) => b.type === "text");
    const titulo = bloque?.type === "text" ? bloque.text.trim() : "";
    return titulo.slice(0, 80) || "Nueva conversación";
  } catch {
    // Si falla, no rompemos nada: la conversación se queda con su título por defecto.
    return "Nueva conversación";
  }
}
