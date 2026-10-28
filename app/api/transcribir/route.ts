import { getGerente } from "@/lib/supabase/server";
import { CONFIG } from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Transcribe el audio que dicta el gerente.
 *
 * Va por el servidor a propósito, no con el micrófono del navegador: la API
 * de voz de Chrome manda el audio a Google sin contrato de por medio, y aquí
 * se dictan datos de empleados concretos. Así el transcriptor es un
 * subencargado con nombre, igual que Anthropic, y figura en el contrato.
 *
 * El audio no se guarda en ningún sitio: entra, se transcribe y se descarta.
 */
export async function POST(request: Request) {
  const gerente = await getGerente();
  if (!gerente) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const clave = process.env.GROQ_API_KEY;
  if (!clave) {
    console.error("[transcribir] falta GROQ_API_KEY");
    return Response.json(
      { error: "La transcripción no está configurada." },
      { status: 503 },
    );
  }

  let audio: File | null = null;
  try {
    const formulario = await request.formData();
    const entrada = formulario.get("audio");
    if (entrada instanceof File) audio = entrada;
  } catch {
    return Response.json({ error: "Petición no válida" }, { status: 400 });
  }

  if (!audio || audio.size === 0) {
    return Response.json({ error: "No ha llegado audio" }, { status: 400 });
  }

  if (audio.size > CONFIG.voz.maxBytes) {
    return Response.json(
      { error: "La grabación es demasiado larga. Prueba en trozos más cortos." },
      { status: 413 },
    );
  }

  try {
    const cuerpo = new FormData();
    // El nombre importa: Groq deduce el formato por la extensión. Safari
    // graba en mp4 y Chrome en webm, así que mandarlo siempre como .webm
    // haría que el audio de Safari llegara mal etiquetado.
    cuerpo.append("file", audio, audio.name || "dictado.webm");
    cuerpo.append("model", CONFIG.voz.modelo);
    // Decirle el idioma mejora bastante la transcripción y evita que se vaya
    // al inglés con nombres propios o frases cortas.
    cuerpo.append("language", "es");
    cuerpo.append("response_format", "json");

    const respuesta = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${clave}` },
        body: cuerpo,
      },
    );

    if (!respuesta.ok) {
      // Nunca registramos el contenido: solo el fallo.
      console.error("[transcribir] Groq respondió", respuesta.status);
      return Response.json(
        { error: "No se ha podido transcribir. Inténtalo de nuevo." },
        { status: 502 },
      );
    }

    const datos = (await respuesta.json()) as { text?: string };
    return Response.json({ texto: (datos.text ?? "").trim() });
  } catch (error) {
    console.error("[transcribir] fallo:", (error as Error).message);
    return Response.json(
      { error: "No se ha podido transcribir. Inténtalo de nuevo." },
      { status: 502 },
    );
  }
}
