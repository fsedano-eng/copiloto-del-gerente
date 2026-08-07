import { Fragment, type ReactNode } from "react";

/**
 * Render del markdown ligero que devuelve el modelo (encabezados, negritas,
 * listas, citas). Construye elementos de React, nunca inyecta HTML: así el
 * texto del modelo no puede introducir marcado en la página.
 *
 * Cada apartado numerado (de un "## Título" al siguiente) se agrupa en su
 * propia <section class="seccion-punto">. En pantalla no se nota — es una
 * sección normal sin estilo propio — pero en el PDF (ver globals.css) se
 * convierte en tarjeta con fondo, y de paso evita que el apartado se corte
 * a mitad entre dos páginas.
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

  const nivelSuperior: ReactNode[] = [];
  let seccionActual: ReactNode[] | null = null;
  let contador = 0;
  const clave = () => contador++;
  const destino = () => seccionActual ?? nivelSuperior;

  let parrafo: string[] = [];
  let lista: { tipo: "ul" | "ol"; items: string[] } | null = null;

  const cerrarParrafo = () => {
    if (parrafo.length === 0) return;
    const contenido = parrafo.join(" ");
    const k = clave();
    destino().push(<p key={`p${k}`}>{negritas(contenido, `p${k}`)}</p>);
    parrafo = [];
  };

  const cerrarLista = () => {
    if (!lista) return;
    const Etiqueta = lista.tipo;
    const items = lista.items;
    const k = clave();
    destino().push(
      <Etiqueta key={`l${k}`}>
        {items.map((item, i) => (
          <li key={i}>{negritas(item, `l${k}-${i}`)}</li>
        ))}
      </Etiqueta>,
    );
    lista = null;
  };

  const cerrarTodo = () => {
    cerrarParrafo();
    cerrarLista();
  };

  const cerrarSeccion = () => {
    if (!seccionActual) return;
    const k = clave();
    nivelSuperior.push(
      <section key={`s${k}`} className="seccion-punto">
        {seccionActual}
      </section>,
    );
    seccionActual = null;
  };

  for (const linea of lineas) {
    const l = linea.trimEnd();

    if (l.trim() === "") {
      cerrarTodo();
      continue;
    }

    // Encabezados. Los de nivel título de apartado (# o ##) abren una
    // sección nueva; el resto (###+) son subtítulos dentro de la actual.
    const h = l.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      cerrarTodo();
      const nivel = h[1].length;
      const k = clave();
      if (nivel <= 2) {
        cerrarSeccion();
        seccionActual = [<h2 key={`h${k}`}>{negritas(h[2], `h${k}`)}</h2>];
      } else {
        destino().push(<h3 key={`h${k}`}>{negritas(h[2], `h${k}`)}</h3>);
      }
      continue;
    }

    // Cita
    if (l.startsWith("> ")) {
      cerrarTodo();
      const k = clave();
      destino().push(
        <blockquote key={`q${k}`}>{negritas(l.slice(2), `q${k}`)}</blockquote>,
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
  cerrarSeccion();

  return <div className="respuesta">{nivelSuperior}</div>;
}
