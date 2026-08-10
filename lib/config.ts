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
      boton: "Enviar código de acceso",
      enviado:
        "Si ese email está dado de alta, te acaba de llegar un código de 6 cifras. Revisa tu bandeja (y el spam).",
      // Deliberadamente igual que el mensaje de éxito: no revelamos qué emails
      // existen. Ver nota en app/entrar/page.tsx.
      noAutorizado:
        "Si ese email está dado de alta, te acaba de llegar un código de 6 cifras. Revisa tu bandeja (y el spam).",
      etiquetaCodigo: "Código de 6 cifras",
      botonVerificar: "Entrar",
      codigoInvalido: "Ese código no es correcto o ha caducado. Pide uno nuevo.",
      reenviar: "Pedir otro código",
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
      // Corto a propósito: en móvil el cuadro es de una línea, y un texto
      // más largo se parte en dos y queda cortado por abajo. Lo de "con el
      // detalle que puedas" ya se dice en la pantalla de bienvenida.
      placeholder: "Cuéntame qué pasa...",
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
    /**
     * Los 10 apartados completos no caben en 2000: la respuesta se cortaba a
     * mitad del apartado 8. Con 8000 hay margen de sobra para el caso largo.
     * El coste de salida sube solo cuando la respuesta de verdad es larga.
     */
    maxTokens: 8000,
    /** Timeout de la llamada. Por encima de esto, error controlado. */
    timeoutMs: 60_000,
  },

  sitio: {
    /** Base para los enlaces de los correos. En local, ponlo en .env.local. */
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://copiloto-del-gerente.vercel.app",
  },

  /**
   * Aviso por email a Loke cuando un gerente abre una consulta nueva.
   * Solo en conversación nueva, no en cada mensaje: si no, un gerente activo
   * llena la bandeja. Si falta RESEND_API_KEY, simplemente no se avisa.
   */
  notificaciones: {
    activo: true,
    // Subdominio propio verificado en Resend. Va aparte de loke.es a
    // propósito: el correo de la casa va por Google y no queremos que los
    // envíos de la app toquen esos registros.
    remitente: "Copiloto del Gerente <copiloto@avisos.loke.es>",
    destinatario: "fsedano@loke.es",
  },
} as const;

export type Config = typeof CONFIG;
