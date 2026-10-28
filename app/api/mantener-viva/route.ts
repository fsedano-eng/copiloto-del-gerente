import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Mantiene despierto el proyecto de Supabase.
 *
 * El plan gratuito pausa el proyecto tras unos días sin actividad, y cuando
 * eso pasa la app queda muerta sin avisar: el login sigue diciendo "te acaba
 * de llegar el código" porque oculta los errores a propósito. Ya ocurrió
 * entre el 17 de agosto y el 28 de octubre de 2026 sin que nadie se enterara.
 *
 * Una lectura diaria y trivial basta para reiniciar ese contador. La dispara
 * el cron de Vercel (ver vercel.json), no una persona acordándose.
 */
export async function GET(request: Request) {
  // Vercel manda el secreto en la cabecera. Sin esto, cualquiera podría
  // golpear la base de datos desde fuera.
  const secreto = process.env.CRON_SECRET;
  if (secreto) {
    const autorizacion = request.headers.get("authorization");
    if (autorizacion !== `Bearer ${secreto}`) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  try {
    const supabase = await createClient();
    // Solo cuenta filas: no lee datos de nadie, y con eso Supabase ya
    // considera el proyecto activo.
    const { error } = await supabase
      .from("clientes")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("[mantener-viva] la consulta ha fallado:", error.message);
      return Response.json({ ok: false }, { status: 500 });
    }

    return Response.json({ ok: true, momento: new Date().toISOString() });
  } catch (error) {
    console.error("[mantener-viva] fallo:", (error as Error).message);
    return Response.json({ ok: false }, { status: 500 });
  }
}
