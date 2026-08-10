import { CONFIG } from "./config";

/**
 * Aviso a Loke de que un gerente ha abierto una consulta nueva.
 *
 * DELIBERADAMENTE NO LLEVA CONTENIDO de la conversación — ni el título, que
 * se genera del primer mensaje y suele nombrar al empleado del que se habla.
 * Esos datos se leen entrando en la herramienta, no salen por correo.
 *
 * Nunca lanza: un fallo avisando no puede romper el chat del gerente.
 */
export async function avisarConsultaNueva(datos: {
  gerente: string;
  empresa: string | null;
  conversacionId: string;
}): Promise<void> {
  const clave = process.env.RESEND_API_KEY;
  if (!CONFIG.notificaciones.activo || !clave) return;

  const enlace = `${CONFIG.sitio.url}/admin/${datos.conversacionId}`;
  const cuando = new Date().toLocaleString("es-ES", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  });

  try {
    const respuesta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clave}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: CONFIG.notificaciones.remitente,
        to: CONFIG.notificaciones.destinatario,
        subject: `Consulta nueva en el Copiloto — ${datos.gerente}`,
        html: `
<div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:Arial,Helvetica,sans-serif;color:#2d2a26;">
  <div style="border-bottom:3px solid #ff4713;padding-bottom:16px;margin-bottom:24px;">
    <img src="${CONFIG.sitio.url}/logo-loke.png" width="40" height="40" alt="Loke" style="display:block;border:0;margin-bottom:8px;">
    <div style="font-size:18px;font-weight:700;">Loke</div>
    <div style="font-size:13px;color:#6b6560;">Copiloto del Gerente</div>
  </div>
  <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">
    <strong>${escapar(datos.gerente)}</strong>${
      datos.empresa ? ` (${escapar(datos.empresa)})` : ""
    } acaba de abrir una consulta nueva.
  </p>
  <p style="font-size:14px;color:#6b6560;margin:0 0 24px;">${cuando}</p>
  <p style="margin:0 0 28px;">
    <a href="${enlace}" style="display:inline-block;background:#ff4713;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:8px;">Leer la consulta</a>
  </p>
  <p style="font-size:12px;color:#a39c94;margin:0;line-height:1.5;">
    Este aviso no incluye lo que ha escrito el gerente: hay datos de empleados
    concretos y se consultan dentro de la herramienta, no por correo.
  </p>
</div>`.trim(),
      }),
    });

    if (!respuesta.ok) {
      console.error("[aviso] Resend respondió", respuesta.status);
    }
  } catch (error) {
    console.error("[aviso] no se ha podido enviar:", (error as Error).message);
  }
}

/** Evita que un nombre con < o & rompa (o inyecte) el HTML del correo. */
function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
