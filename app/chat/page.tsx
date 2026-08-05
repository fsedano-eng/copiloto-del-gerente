import { redirect } from "next/navigation";
import { createClient, getGerente } from "@/lib/supabase/server";
import { CONFIG } from "@/lib/config";
import { Marca } from "@/components/Logo";
import { Chat } from "@/components/Chat";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const gerente = await getGerente();

  // Autenticado pero sin ficha de gerente: el alta la da Fran a mano.
  if (!gerente) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/entrar");

    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Marca />
          </div>
          <h1 className="mb-3 text-[22px] font-bold text-dark">
            {CONFIG.textos.sinAlta.titulo}
          </h1>
          <p className="text-[15px] leading-relaxed text-gray">
            {CONFIG.textos.sinAlta.cuerpo}{" "}
            <a href={`mailto:${CONFIG.marca.contacto.email}`}>
              {CONFIG.marca.contacto.email}
            </a>
          </p>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const { c: conversacionActiva } = await searchParams;

  // Lista de conversaciones del gerente (RLS: solo las suyas).
  const { data: conversaciones } = await supabase
    .from("conversaciones")
    .select("id, titulo, updated_at")
    .eq("archivada", false)
    .order("updated_at", { ascending: false })
    .limit(100);

  // Mensajes de la conversación abierta, si hay.
  let mensajes: { rol: "user" | "assistant"; contenido: string }[] = [];
  if (conversacionActiva) {
    const { data } = await supabase
      .from("mensajes")
      .select("rol, contenido")
      .eq("conversacion_id", conversacionActiva)
      .order("created_at", { ascending: true });
    mensajes = (data ?? []) as typeof mensajes;
  }

  return (
    <Chat
      gerente={{
        nombre: gerente.nombre,
        email: gerente.email,
        empresa: gerente.cliente?.nombre ?? null,
      }}
      conversaciones={conversaciones ?? []}
      conversacionActiva={conversacionActiva ?? null}
      mensajesIniciales={mensajes}
    />
  );
}
