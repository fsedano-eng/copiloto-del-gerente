/**
 * Todo el "negocio" en un solo archivo tipado.
 * Cambiar textos, límites o modelo = tocar solo aquí.
 * (Patrón heredado de la arquitectura de forja-consultor.)
 */

export const CONFIG = {
  marca: {
    nombre: "Loke",
    tagline: "Trabajo Social y Talento",
    producto: "Copiloto del Gerente",
    contacto: {
      email: "fsedano@loke.es",
      telefono: "630 78 76 77",
      web: "https://loke.es",
    },
  },

  textos: {
    entrar: {
      titulo: "Copiloto del Gerente",
      subtitulo:
        "Tu apoyo entre sesiones para las decisiones sobre tu equipo. Acceso solo para gerentes dados de alta por Loke.",
      etiquetaEmail: "Tu email",
      boton: "Enviar enlace de acceso",
      enviado:
        "Si ese email está dado de alta, te acaba de llegar un enlace de acceso. Revisa tu bandeja (y el spam).",
      // Deliberadamente igual que el mensaje de éxito: no revelamos qué emails
      // existen. Ver nota en app/entrar/page.tsx.
      noAutorizado:
        "Si ese email está dado de alta, te acaba de llegar un enlace de acceso. Revisa tu bandeja (y el spam).",
    },
    sinAlta: {
      titulo: "Tu cuenta todavía no está configurada",
      cuerpo:
        "Tu email está autenticado, pero aún no tiene una empresa asignada. Escríbele a Fran y lo resuelve en un minuto.",
    },
    chat: {
      bienvenida: "¿Qué situación tienes entre manos?",
      ejemplos: [
        "Mañana tengo que hablar con alguien del equipo y no sé cómo abrirlo",
        "Hay dos personas que llevan semanas sin hablarse",
        "Un empleado lleva un mes raro y no sé si preguntar",
        "Mi encargado organiza bien el trabajo pero no sabe dirigir gente",
      ],
      placeholder: "Cuéntame qué pasa, con el detalle que puedas...",
      nuevaConversacion: "Nueva conversación",
      descargarPdf: "Descargar en PDF",
    },
    aviso:
      "El Copiloto estructura y agiliza. La interpretación y la decisión final son tuyas. Loke guarda estas conversaciones para el seguimiento de tu servicio.",
  },

  /** Límites por gerente. Generosos: el cuello de botella no es el coste. */
  limites: {
    mensajesPorHora: 60,
    caracteresPorMensaje: 8000,
    /** Mensajes de historial que se mandan al modelo en cada turno. */
    turnosDeContexto: 30,
  },

  ia: {
    modelo: process.env.CHAT_MODEL ?? "claude-sonnet-5",
    maxTokens: 2000,
    /** Timeout de la llamada. Por encima de esto, error controlado. */
    timeoutMs: 60_000,
  },
} as const;

export type Config = typeof CONFIG;
