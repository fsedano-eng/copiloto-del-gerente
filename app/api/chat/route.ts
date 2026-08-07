import { createClient, getGerente } from "@/lib/supabase/server";
import { SYSTEM_PROMPT, contextoGerente } from "@/lib/prompt";
import {
  anthropic,
  yaTieneAnalisis,
  recortarHistorial,
  generarTitulo,
  type Turno,
} from "@/lib/llm";
import { INSTRUCCION_SEGUIMIENTO } from "@/lib/llm";
import { esquemaMensaje } from "@/lib/validation";
import { superaLimite } from "@/lib/rateLimit";
import { CONFIG } from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  // ── 1. Autorización ──────────────────────────────────────────────────
  const gerente = await getGerente();
  if (!gerente) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  // ── 2. Límite de uso ─────────────────────────────────────────────────
  if (superaLimite(gerente.id)) {
    return Response.json(
      { error: "Has llegado al límite de mensajes por hora. Prueba en un rato." },
      { status: 429 },
    );
  }

  // ── 3. Validación ────────────────────────────────────────────────────
  let datos;
  try {
    const cuerpo = await request.json();
    datos = esquemaMensaje.parse(cuerpo);
  } catch {
    return Response.json({ error: "Petición no válida" }, { status: 400 });
  }

  const supabase = await createClient();

  // ── 4. Conversación (existente o nueva) ──────────────────────────────
  let conversacionId = datos.conversacionId;
  let esNueva = false;

  if (!conversacionId) {
    esNueva = true;
    const titulo = await generarTitulo(datos.mensaje);
    const { data, error } = await supabase
      .from("conversaciones")
      .insert({ gerente_id: gerente.id, titulo })
      .select("id")
      .single();

    if (error || !data) {
      return Response.json(
        { error: "No se ha podido crear la conversación" },
        { status: 500 },
      );
    }
    conversacionId = data.id;
  }

  // ── 5. Historial (RLS garantiza que solo salen las suyas) ────────────
  const { data: previos } = await supabase
    .from("mensajes")
    .select("rol, contenido")
    .eq("conversacion_id", conversacionId)
    .order("created_at", { ascending: true });

  const historial: Turno[] = (previos ?? []).map((m) => ({
    rol: m.rol as "user" | "assistant",
    contenido: m.contenido,
  }));

  // ── 6. Guardar el mensaje del gerente ────────────────────────────────
  const { error: errorGuardado } = await supabase.from("mensajes").insert({
    conversacion_id: conversacionId,
    rol: "user",
    contenido: datos.mensaje,
  });

  if (errorGuardado) {
    return Response.json(
      { error: "No se ha podido guardar el mensaje" },
      { status: 500 },
    );
  }

  // ── 7. Montar la petición al modelo ──────────────────────────────────
  //  El seguimiento NO lo decide el modelo: lo decide la app mirando si en
  //  el historial ya hay un análisis completo.
  const esSeguimiento = yaTieneAnalisis(historial);

  const contexto = contextoGerente({
    nombreGerente: gerente.nombre,
    nombreEmpresa: gerente.cliente?.nombre ?? null,
  });

  const mensajes = [
    ...recortarHistorial(historial).map((t) => ({
      role: t.rol,
      content: t.contenido,
    })),
    { role: "user" as const, content: datos.mensaje },
  ];

  // ── 8. Respuesta en streaming ────────────────────────────────────────
  const codificador = new TextEncoder();
  let respuestaCompleta = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const flujo = anthropic.messages.stream({
          model: CONFIG.ia.modelo,
          max_tokens: CONFIG.ia.maxTokens,
          // Sin esto, el modelo piensa en un bloque invisible antes de
          // responder: se come parte de max_tokens (respuestas más cortas
          // de lo pedido) y el usuario no ve nada en pantalla mientras dura.
          thinking: { type: "disabled" },
          system: [
            {
              type: "text",
              text: SYSTEM_PROMPT,
              // El prompt + conocimiento son ~10K tokens: cachearlos hace que
              // a partir del primer mensaje el coste sea casi cero.
              cache_control: { type: "ephemeral" },
            },
            ...(contexto ? [{ type: "text" as const, text: contexto }] : []),
            ...(esSeguimiento
              ? [{ type: "text" as const, text: INSTRUCCION_SEGUIMIENTO }]
              : []),
          ],
          messages: mensajes,
        });

        for await (const evento of flujo) {
          if (
            evento.type === "content_block_delta" &&
            evento.delta.type === "text_delta"
          ) {
            respuestaCompleta += evento.delta.text;
            controller.enqueue(codificador.encode(evento.delta.text));
          }
        }

        // Guardar la respuesta ya completa.
        if (respuestaCompleta.trim()) {
          await supabase.from("mensajes").insert({
            conversacion_id: conversacionId,
            rol: "assistant",
            contenido: respuestaCompleta,
          });
        }
      } catch (error) {
        // Nunca registramos el contenido de la conversación: solo el fallo.
        // TEMPORAL: traza completa para localizar el origen exacto de un
        // error intermitente en producción (ByteString/header). Quitar
        // cuando esté identificado.
        console.error("[chat] fallo generando la respuesta:", (error as Error).stack ?? error);
        controller.enqueue(
          codificador.encode(
            "\n\n_Se ha cortado la respuesta por un problema técnico. Vuelve a intentarlo._",
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Conversacion-Id": conversacionId!,
      "X-Conversacion-Nueva": esNueva ? "1" : "0",
    },
  });
}
