"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CONFIG } from "@/lib/config";
import { Marca } from "./Logo";
import { Markdown } from "./Markdown";

type Mensaje = { rol: "user" | "assistant"; contenido: string };
type Conversacion = { id: string; titulo: string; updated_at: string };

export function Chat({
  gerente,
  conversaciones,
  conversacionActiva,
  mensajesIniciales,
}: {
  gerente: { nombre: string | null; email: string; empresa: string | null };
  conversaciones: Conversacion[];
  conversacionActiva: string | null;
  mensajesIniciales: Mensaje[];
}) {
  const router = useRouter();
  const [mensajes, setMensajes] = useState<Mensaje[]>(mensajesIniciales);
  const [entrada, setEntrada] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const idActual = useRef<string | null>(conversacionActiva);
  const finRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  // Al cambiar de conversación desde la lista, recargamos el estado local.
  useEffect(() => {
    setMensajes(mensajesIniciales);
    idActual.current = conversacionActiva;
    setError(null);
  }, [conversacionActiva, mensajesIniciales]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes]);

  async function enviar(texto: string) {
    const limpio = texto.trim();
    if (!limpio || enviando) return;

    setError(null);
    setEnviando(true);
    setEntrada("");
    setMensajes((m) => [
      ...m,
      { rol: "user", contenido: limpio },
      { rol: "assistant", contenido: "" },
    ]);

    try {
      const respuesta = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversacionId: idActual.current,
          mensaje: limpio,
        }),
      });

      if (!respuesta.ok) {
        const cuerpo = await respuesta.json().catch(() => ({}));
        throw new Error(cuerpo.error ?? "No se ha podido enviar el mensaje");
      }

      const nuevaId = respuesta.headers.get("X-Conversacion-Id");
      const esNueva = respuesta.headers.get("X-Conversacion-Nueva") === "1";
      if (nuevaId) idActual.current = nuevaId;

      const lector = respuesta.body?.getReader();
      const decodificador = new TextDecoder();

      if (lector) {
        while (true) {
          const { done, value } = await lector.read();
          if (done) break;
          const trozo = decodificador.decode(value, { stream: true });
          setMensajes((m) => {
            const copia = [...m];
            copia[copia.length - 1] = {
              rol: "assistant",
              contenido: copia[copia.length - 1].contenido + trozo,
            };
            return copia;
          });
        }
      }

      // Conversación nueva: reflejarla en la URL y refrescar la lista lateral.
      if (esNueva && nuevaId) {
        window.history.replaceState(null, "", `/chat?c=${nuevaId}`);
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      // Quitamos la burbuja vacía del asistente para no dejar un hueco.
      setMensajes((m) =>
        m[m.length - 1]?.contenido === "" ? m.slice(0, -1) : m,
      );
    } finally {
      setEnviando(false);
      areaRef.current?.focus();
    }
  }

  async function salir() {
    await createClient().auth.signOut();
    router.push("/entrar");
    router.refresh();
  }

  const hayConversacion = mensajes.length > 0;

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* ── Lista de conversaciones ─────────────────────────────────── */}
      <aside
        className={`no-imprimir fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-gray-line bg-white transition-transform md:static md:translate-x-0 ${
          menuAbierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-gray-line p-4">
          <Marca subtitulo={CONFIG.marca.producto} />
        </div>

        <div className="p-3">
          <a
            href="/chat"
            className="block rounded-lg border border-gray-line px-3 py-2.5 text-center text-[14px] font-semibold !text-dark transition hover:border-orange hover:bg-orange-soft"
          >
            + {CONFIG.textos.chat.nuevaConversacion}
          </a>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          {conversaciones.length === 0 ? (
            <p className="px-2 py-4 text-[13px] leading-relaxed text-gray">
              Aquí se irán guardando tus conversaciones. Podrás volver a
              cualquiera de ellas cuando quieras.
            </p>
          ) : (
            <ul className="space-y-1">
              {conversaciones.map((c) => (
                <li key={c.id}>
                  <a
                    href={`/chat?c=${c.id}`}
                    onClick={() => setMenuAbierto(false)}
                    className={`block truncate rounded-lg px-3 py-2 text-[14px] transition ${
                      c.id === conversacionActiva
                        ? "bg-orange-soft font-semibold !text-dark"
                        : "!text-ink hover:bg-cream"
                    }`}
                    title={c.titulo}
                  >
                    {c.titulo}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </nav>

        <div className="border-t border-gray-line p-4">
          <p className="truncate text-[13px] font-medium text-dark">
            {gerente.nombre ?? gerente.email}
          </p>
          {gerente.empresa && (
            <p className="truncate text-[12px] text-gray">{gerente.empresa}</p>
          )}
          <button
            onClick={salir}
            className="mt-2 text-[13px] font-medium text-orange hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {menuAbierto && (
        <div
          className="no-imprimir fixed inset-0 z-20 bg-dark/30 md:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* ── Conversación ────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="no-imprimir flex items-center justify-between border-b border-gray-line bg-cream px-4 py-3 md:px-8">
          <button
            onClick={() => setMenuAbierto(true)}
            className="text-[14px] font-medium text-dark md:hidden"
            aria-label="Ver conversaciones"
          >
            ☰ Conversaciones
          </button>
          <div className="hidden text-[14px] font-semibold text-dark md:block">
            {CONFIG.marca.producto}
          </div>
          {hayConversacion && (
            <button
              onClick={() => window.print()}
              className="rounded-lg border border-gray-line bg-white px-3 py-1.5 text-[13px] font-medium text-dark transition hover:border-orange"
            >
              {CONFIG.textos.chat.descargarPdf}
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="hoja-impresion mx-auto max-w-lectura">
            {!hayConversacion ? (
              <div className="pt-8">
                <h1 className="mb-6 text-[26px] font-extrabold leading-tight text-dark">
                  {CONFIG.textos.chat.bienvenida}
                </h1>
                <p className="mb-6 text-[15px] leading-relaxed text-gray">
                  Cuéntamelo con el detalle que puedas. Te haré alguna pregunta
                  antes de darte una lectura, porque sin contexto cualquier
                  consejo se queda corto.
                </p>
                <ul className="space-y-2">
                  {CONFIG.textos.chat.ejemplos.map((ej) => (
                    <li key={ej}>
                      <button
                        onClick={() => enviar(ej)}
                        className="w-full rounded-xl border border-gray-line bg-white px-4 py-3 text-left text-[14px] leading-snug text-ink transition hover:border-orange hover:bg-orange-soft"
                      >
                        {ej}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="space-y-6">
                {mensajes.map((m, i) => (
                  <div key={i} className="bloque-mensaje">
                    {m.rol === "user" ? (
                      <div className="burbuja-gerente ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-dark px-4 py-3 text-[15px] leading-relaxed text-white">
                        {m.contenido}
                      </div>
                    ) : (
                      <div className="text-[15px] text-ink">
                        {m.contenido ? (
                          <Markdown texto={m.contenido} />
                        ) : (
                          <Pensando />
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={finRef} />
              </div>
            )}

            {error && (
              <p className="no-imprimir mt-4 rounded-lg bg-estado-critico-soft px-4 py-3 text-[14px] text-estado-critico">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* ── Entrada ──────────────────────────────────────────────── */}
        <div className="no-imprimir border-t border-gray-line bg-cream px-4 py-4 md:px-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar(entrada);
            }}
            className="mx-auto max-w-lectura"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-gray-line bg-white p-2 focus-within:border-orange">
              <textarea
                ref={areaRef}
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    enviar(entrada);
                  }
                }}
                rows={1}
                maxLength={CONFIG.limites.caracteresPorMensaje}
                placeholder={CONFIG.textos.chat.placeholder}
                disabled={enviando}
                className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] leading-relaxed outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={enviando || !entrada.trim()}
                className="shrink-0 rounded-xl bg-dark px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-30"
              >
                {enviando ? "..." : "Enviar"}
              </button>
            </div>
            <p className="mt-2 text-center text-[12px] leading-relaxed text-gray">
              {CONFIG.textos.aviso}
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

function Pensando() {
  return (
    <div className="flex items-center gap-2 text-[14px] text-gray">
      <span className="flex gap-1">
        {[0, 150, 300].map((d) => (
          <span
            key={d}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </span>
      Analizando la situación...
    </div>
  );
}
