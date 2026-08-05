import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Destino del enlace mágico. Canjea el código por una sesión y entra al chat.
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
