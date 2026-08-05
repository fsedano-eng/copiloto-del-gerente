import { Fragment, type ReactNode } from "react";

/**
 * Render del markdown ligero que devuelve el modelo (encabezados, negritas,
 * listas, citas). Construye elementos de React, nunca inyecta HTML: así el
 * texto del modelo no puede introducir marcado en la página.
 */

function negritas(texto: string, clave: string): ReactNode[] {
  // Divide por **negrita** conservando los delimitadores.
  return texto.split(/(\*\*[^*]+\*\*)/g).map((trozo, i) => {
    if (trozo.startsWith("**") && trozo.endsWith("**") && trozo.length > 4) {
      return <strong key={`${clave}-b${i}`}>{trozo.slice(2, -2)}</strong>;
    }
    return <Fragment key={`${clave}-t${i}`}>{trozo}</Fragment>;
  });
}

export function Markdown({ texto }: { texto: string }) {
  const lineas = texto.split("\n");
  const bloques: ReactNode[] = [];

  let parrafo: string[] = [];
  let lista: { tipo: "ul" | "ol"; items: string[] } | null = null;

  const cerrarParrafo = () => {
    if (parrafo.length === 0) return;
    const contenido = parrafo.join(" ");
    bloques.push(
      <p key={`p${bloques.length}`}>{negritas(contenido, `p${bloques.length}`)}</p>,
    );
    parrafo = [];
  };

  const cerrarLista = () => {
    if (!lista) return;
    const Etiqueta = lista.tipo;
    const items = lista.items;
    bloques.push(
      <Etiqueta key={`l${bloques.length}`}>
        {items.map((item, i) => (
          <li key={i}>{negritas(item, `l${bloques.length}-${i}`)}</li>
        ))}
      </Etiqueta>,
    );
    lista = null;
  };

  const cerrarTodo = () => {
    cerrarParrafo();
    cerrarLista();
  };

  for (const linea of lineas) {
    const l = linea.trimEnd();

    if (l.trim() === "") {
      cerrarTodo();
      continue;
    }

    // Encabezados
    const h = l.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      cerrarTodo();
      const nivel = h[1].length;
      const Etiqueta = (nivel <= 2 ? "h2" : "h3") as "h2" | "h3";
      bloques.push(
        <Etiqueta key={`h${bloques.length}`}>
          {negritas(h[2], `h${bloques.length}`)}
        </Etiqueta>,
      );
      continue;
    }

    // Cita
    if (l.startsWith("> ")) {
      cerrarTodo();
      bloques.push(
        <blockquote key={`q${bloques.length}`}>
          {negritas(l.slice(2), `q${bloques.length}`)}
        </blockquote>,
      );
      continue;
    }

    // Lista con viñetas
    const vinieta = l.match(/^\s*[-*·]\s+(.*)$/);
    if (vinieta) {
      cerrarParrafo();
      if (lista?.tipo !== "ul") {
        cerrarLista();
        lista = { tipo: "ul", items: [] };
      }
      lista.items.push(vinieta[1]);
      continue;
    }

    // Lista numerada
    const numerada = l.match(/^\s*\d+[.)]\s+(.*)$/);
    if (numerada) {
      cerrarParrafo();
      if (lista?.tipo !== "ol") {
        cerrarLista();
        lista = { tipo: "ol", items: [] };
      }
      lista.items.push(numerada[1]);
      continue;
    }

    // Texto normal
    cerrarLista();
    parrafo.push(l.trim());
  }

  cerrarTodo();

  return <div className="respuesta">{bloques}</div>;
}
