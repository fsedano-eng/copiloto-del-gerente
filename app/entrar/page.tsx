"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CONFIG } from "@/lib/config";
import { Marca } from "@/components/Logo";

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [estado, setEstado] = useState<
    "inicial" | "enviando" | "enviado" | "verificando" | "error"
  >("inicial");
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null);

  async function enviarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        // Clave del acceso por invitación: si el email no está dado de alta,
        // Supabase NO crea la cuenta ni manda el código.
        shouldCreateUser: false,
      },
    });

    // Mostramos el mismo mensaje haya error o no: así la pantalla no revela
    // qué emails están dados de alta y cuáles no.
    if (error && error.status && error.status >= 500) {
      setEstado("error");
      return;
    }
    setEstado("enviado");
  }

  async function verificarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setErrorCodigo(null);
    setEstado("verificando");

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: codigo.trim(),
      type: "email",
    });

    if (error) {
      setErrorCodigo(CONFIG.textos.entrar.codigoInvalido);
      setEstado("enviado");
      return;
    }

    router.push("/chat");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <Marca />
        </div>

        <h1 className="mb-3 text-[28px] font-extrabold leading-tight text-dark">
          {CONFIG.textos.entrar.titulo}
        </h1>
        <p className="mb-8 text-[15px] leading-relaxed text-gray">
          {CONFIG.textos.entrar.subtitulo}
        </p>

        {estado === "enviado" || estado === "verificando" ? (
          <div className="rounded-xl border border-gray-line bg-white p-5">
            <p className="mb-4 text-[15px] leading-relaxed text-ink">
              {CONFIG.textos.entrar.enviado}
            </p>

            <form onSubmit={verificarCodigo} className="space-y-4">
              <div>
                <label
                  htmlFor="codigo"
                  className="mb-2 block text-[14px] font-semibold text-dark"
                >
                  {CONFIG.textos.entrar.etiquetaCodigo}
                </label>
                <input
                  id="codigo"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  required
                  maxLength={10}
                  value={codigo}
                  onChange={(e) =>
                    setCodigo(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  placeholder="Código del email"
                  className="w-full rounded-lg border border-gray-line bg-white px-4 py-3 text-center text-[20px] font-semibold tracking-[0.3em] outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/20"
                />
              </div>

              <button
                type="submit"
                disabled={estado === "verificando" || codigo.trim().length < 4}
                className="w-full rounded-lg bg-dark px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                {estado === "verificando"
                  ? "Comprobando..."
                  : CONFIG.textos.entrar.botonVerificar}
              </button>

              {errorCodigo && (
                <p className="text-[14px] text-estado-critico">{errorCodigo}</p>
              )}
            </form>

            <button
              onClick={() => {
                setEstado("inicial");
                setEmail("");
                setCodigo("");
                setErrorCodigo(null);
              }}
              className="mt-4 text-[14px] font-medium text-orange hover:underline"
            >
              Usar otro email
            </button>
          </div>
        ) : (
          <form onSubmit={enviarCodigo} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[14px] font-semibold text-dark"
              >
                {CONFIG.textos.entrar.etiquetaEmail}
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                className="w-full rounded-lg border border-gray-line bg-white px-4 py-3 text-[15px] outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/20"
              />
            </div>

            <button
              type="submit"
              disabled={estado === "enviando" || !email.trim()}
              className="w-full rounded-lg bg-dark px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              {estado === "enviando"
                ? "Enviando..."
                : CONFIG.textos.entrar.boton}
            </button>

            {estado === "error" && (
              <p className="text-[14px] text-estado-critico">
                No se ha podido enviar el código. Inténtalo de nuevo en un
                minuto.
              </p>
            )}
          </form>
        )}

        <p className="mt-8 text-[13px] leading-relaxed text-gray">
          No hay contraseña que recordar: te llega un código al correo y con eso
          entras. Si tu email no está dado de alta, escribe a{" "}
          <a href={`mailto:${CONFIG.marca.contacto.email}`}>
            {CONFIG.marca.contacto.email}
          </a>
          .
        </p>
      </div>
    </main>
  );
}
