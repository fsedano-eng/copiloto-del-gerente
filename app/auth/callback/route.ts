import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Canjea un enlace de acceso por una sesión y entra al chat.
 *
 * El acceso normal ya NO pasa por aquí: se entra con un código de un solo uso
 * (ver app/entrar/page.tsx), sin redirecciones ni enlaces.
 *
 * Esto se mantiene a propósito, no es código olvidado: en Supabase, el botón
 * "Invite user" está pegado al de "Create new user" en el mismo menú, y si
 * algún día se pulsa por error, el correo de invitación lleva un enlace que
 * necesita aterrizar en algún sitio. Sin esta ruta, ese enlace daría un 404 y
 * habría que ponerse a investigar por qué. Son 20 líneas: sale más barato
 * dejarlas que depurar eso dentro de seis meses.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/entrar?error=enlace_invalido`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Enlace caducado o ya usado: los enlaces mágicos son de un solo uso.
    return NextResponse.redirect(`${origin}/entrar?error=enlace_caducado`);
  }

  return NextResponse.redirect(`${origin}/chat`);
}
