import { notFound, redirect } from "next/navigation";
import { createClient, getGerente } from "@/lib/supabase/server";
import { Marca } from "@/components/Logo";
import { Markdown } from "@/components/Markdown";
import { unoDe } from "@/lib/relaciones";

export const dynamic = "force-dynamic";

export default async function AdminConversacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const gerente = await getGerente();
  if (!gerente) redirect("/entrar");
  if (gerente.rol !== "admin") redirect("/chat");

  const supabase = await createClient();

  const { data: conversacion } = await supabase
    .from("conversaciones")
    .select("id, titulo, created_at, gerentes ( nombre, email, clientes ( nombre ) )")
    .eq("id", id)
    .maybeSingle();

  if (!conversacion) notFound();

  const g = unoDe<{ nombre: string | null; email: string; clientes: unknown }>(
    conversacion.gerentes,
  );
  const empresa = unoDe<{ nombre: string }>(g?.clientes)?.nombre ?? null;

  const { data: mensajes } = await supabase
    .from("mensajes")
    .select("rol, contenido, created_at")
    .eq("conversacion_id", id)
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto min-h-dvh max-w-lectura px-6 py-10">
      <div className="mb-8">
        <Marca subtitulo="Consultas de los gerentes" />
      </div>

      <a
        href="/admin"
        className="mb-6 inline-block text-[14px] font-medium text-orange hover:underline"
      >
        ← Todas las consultas
      </a>

      <h1 className="mb-2 text-[24px] font-extrabold leading-tight text-dark">
        {conversacion.titulo}
      </h1>
      <p className="mb-10 text-[14px] text-gray">
        {g?.nombre ?? g?.email ?? "—"}
        {empresa ? ` · ${empresa}` : ""} ·{" "}
        {new Date(conversacion.created_at).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <div className="space-y-6">
        {(mensajes ?? []).map((m, i) => (
          <div key={i}>
            {m.rol === "user" ? (
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-dark px-4 py-3 text-[15px] leading-relaxed text-white">
                {m.contenido}
              </div>
            ) : (
              <div className="text-[15px] text-ink">
                <Markdown texto={m.contenido} />
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-12 border-t border-gray-line pt-4 text-[12px] leading-relaxed text-gray">
        Solo lectura. Desde aquí no se escribe en la conversación del gerente.
      </p>
    </main>
  );
}
