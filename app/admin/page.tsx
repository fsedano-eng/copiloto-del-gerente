import { redirect } from "next/navigation";
import { createClient, getGerente } from "@/lib/supabase/server";
import { Marca } from "@/components/Logo";
import { unoDe } from "@/lib/relaciones";

export const dynamic = "force-dynamic";

type Fila = {
  id: string;
  titulo: string;
  updated_at: string;
  gerentes: unknown;
};

export default async function AdminPage() {
  const gerente = await getGerente();
  if (!gerente) redirect("/entrar");
  // El RLS ya lo impediría a nivel de datos; esto evita además que a un
  // gerente normal le aparezca una pantalla vacía sin explicación.
  if (gerente.rol !== "admin") redirect("/chat");

  const supabase = await createClient();
  const { data } = await supabase
    .from("conversaciones")
    .select("id, titulo, updated_at, gerentes ( nombre, email, clientes ( nombre ) )")
    .eq("archivada", false)
    .order("updated_at", { ascending: false })
    .limit(300);

  // Agrupadas por empresa: es como Fran piensa la cartera, no por gerente.
  const porEmpresa = new Map<string, { titulo: string; id: string; gerente: string; fecha: string }[]>();

  for (const fila of (data ?? []) as Fila[]) {
    const g = unoDe<{ nombre: string | null; email: string; clientes: unknown }>(fila.gerentes);
    const empresa = unoDe<{ nombre: string }>(g?.clientes)?.nombre ?? "Sin empresa asignada";
    const lista = porEmpresa.get(empresa) ?? [];
    lista.push({
      id: fila.id,
      titulo: fila.titulo,
      gerente: g?.nombre ?? g?.email ?? "—",
      fecha: new Date(fila.updated_at).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    });
    porEmpresa.set(empresa, lista);
  }

  const empresas = [...porEmpresa.entries()];

  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-6 py-10">
      <div className="mb-8">
        <Marca subtitulo="Consultas de los gerentes" />
      </div>

      <div className="mb-8 flex items-baseline justify-between gap-4">
        <h1 className="text-[26px] font-extrabold leading-tight text-dark">
          Consultas
        </h1>
        <a href="/chat" className="text-[14px] font-medium text-orange hover:underline">
          Volver al chat
        </a>
      </div>

      {empresas.length === 0 ? (
        <p className="text-[15px] leading-relaxed text-gray">
          Todavía no hay ninguna consulta. Aquí irán apareciendo según los
          gerentes vayan usando el Copiloto.
        </p>
      ) : (
        <div className="space-y-8">
          {empresas.map(([empresa, conversaciones]) => (
            <section key={empresa}>
              <h2 className="mb-3 border-b border-gray-line pb-2 text-[13px] font-bold uppercase tracking-wide text-gray">
                {empresa}
              </h2>
              <ul className="space-y-1">
                {conversaciones.map((c) => (
                  <li key={c.id}>
                    <a
                      href={`/admin/${c.id}`}
                      className="flex items-baseline justify-between gap-4 rounded-lg px-3 py-2.5 transition hover:bg-orange-soft"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium !text-dark">
                          {c.titulo}
                        </span>
                        <span className="block text-[13px] text-gray">
                          {c.gerente}
                        </span>
                      </span>
                      <span className="shrink-0 text-[13px] text-gray">
                        {c.fecha}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="mt-12 border-t border-gray-line pt-4 text-[12px] leading-relaxed text-gray">
        Estas conversaciones contienen datos de empleados concretos. Se
        consultan para el seguimiento del servicio, no se comparten fuera de
        Loke.
      </p>
    </main>
  );
}
