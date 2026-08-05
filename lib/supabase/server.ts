import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para server components y route handlers.
 * Respeta RLS: todo lo que lea pasa por las políticas del esquema.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Llamado desde un Server Component: no se pueden escribir cookies.
            // El middleware ya refresca la sesión, así que es seguro ignorarlo.
          }
        },
      },
    },
  );
}

export type GerenteConCliente = {
  id: string;
  email: string;
  nombre: string | null;
  rol: "gerente" | "admin";
  cliente: { id: string; nombre: string } | null;
};

/**
 * Devuelve el gerente autenticado y su empresa, o null si:
 *  · no hay sesión
 *  · el usuario existe en auth pero no está dado de alta como gerente
 *  · está dado de alta pero desactivado
 *
 * Es la única puerta de autorización de la app: todo lo que necesite
 * identidad la usa.
 */
export async function getGerente(): Promise<GerenteConCliente | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("gerentes")
    .select("id, email, nombre, rol, activo, clientes ( id, nombre )")
    .eq("id", user.id)
    .maybeSingle();

  if (!data || !data.activo) return null;

  // Supabase devuelve la relación como objeto o array según la inferencia.
  const clienteRaw = data.clientes as unknown;
  const cliente = Array.isArray(clienteRaw) ? clienteRaw[0] : clienteRaw;

  return {
    id: data.id,
    email: data.email,
    nombre: data.nombre,
    rol: data.rol,
    cliente: (cliente as { id: string; nombre: string } | null) ?? null,
  };
}
