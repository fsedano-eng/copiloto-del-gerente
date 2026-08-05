/**
 * Base de conocimiento del Copiloto.
 *
 * Origen: carpeta de Drive del GPT "Copiloto del Gerente Loke V1"
 *   · Criterios profesionales Loke
 *   · Casos de Referencia – Copiloto del Gerente Loke
 *   · Guiones de intervención y protocolos básicos – Sistema Loke
 *
 * A diferencia de ChatGPT (que hace recuperación sobre los PDFs subidos),
 * aquí el conocimiento va ENTERO dentro del prompt: son ~20KB, caben de
 * sobra y el modelo lo ve todo siempre en vez de recuperar fragmentos.
 * Con caché de prompt el coste es despreciable a partir del primer mensaje.
 *
 * Para actualizarlo: editar aquí. No hay que resubir nada a ningún sitio.
 */

export const CRITERIOS_PROFESIONALES = `# CRITERIOS PROFESIONALES LOKE

Guía de interpretación y toma de decisiones (no manual teórico). Integra gestión
empresarial, cultura organizacional y trabajo social.

## 1. Criterios generales de intervención

1. No intervenir solo sobre la conducta visible.
2. Analizar siempre causas subyacentes.
3. Priorizar la comprensión antes que la corrección.
4. Evitar la intervención impulsiva.
5. Documentar cuando haya impacto.
6. Actuar antes de que el problema escale.
7. Diferenciar entre problema puntual y patrón.
8. Separar hechos de interpretaciones.
9. No patologizar comportamientos sin contexto.
10. Proteger tanto a la persona como al equipo.

## 2. Liderazgo y gerencia
Tipos problemáticos: reactivo (actúa tarde) · evitativo (evita conflictos) · directivo rígido (impone sin escuchar) · inconsistente (cambia criterios).
Indicadores: problemas que se repiten, falta de claridad en decisiones, conflictos no abordados, equipo desorientado.
**Criterio Loke: la mayoría de problemas de equipo tienen origen en la gestión del liderazgo, no en las personas.**
Intervención: clarificar decisiones, afrontar conversaciones pendientes, ajustar estilo según situación.

## 3. Comunicación interna
Indicadores: mensajes contradictorios, errores repetidos, dependencia excesiva del gerente, falta de canales claros.
**Criterio Loke: los problemas de comunicación no son de actitud, son de sistema.**
Intervención: definir canales, estandarizar mensajes, reducir ambigüedad.

## 4. Clima laboral
Indicadores de deterioro: quejas informales, cinismo, falta de implicación, tensión general.
**Criterio Loke: el clima es un síntoma, no el problema principal.**
Intervención: identificar causas (conflictos, liderazgo, sobrecarga) y actuar sobre el origen, no sobre la percepción.

## 5. Gestión de conflictos
Tipos: funcional (por tareas) · relacional (personal) · jerárquico (con el responsable) · pasivo (no explícito).
Indicadores de escalada: evitación, tensión visible, polarización.
**Criterio Loke: el conflicto no gestionado siempre escala.**
Intervención: no evitar, no tomar partido, mediar con estructura.

## 6. Retención del talento
Indicadores de riesgo: desmotivación, desconexión, baja implicación.
**Criterio Loke: las personas no se van solo por dinero.**
Causas habituales: falta de reconocimiento, falta de desarrollo, problemas de liderazgo.
Intervención: conversación profunda, ajuste de expectativas.

## 7. Absentismo
Tipos: puntual · recurrente · emocional · encubierto.
Indicadores: patrones (lunes, viernes), frecuencia creciente.
**Criterio Loke: el absentismo es un síntoma, no un problema aislado.**
Intervención: analizar patrón, explorar causas personales y laborales.

## 8. Rotación
Indicadores: salidas frecuentes, rotación en perfiles similares.
**Criterio Loke: la rotación recurrente indica fallo estructural.**
Intervención: analizar causas internas, revisar onboarding, liderazgo y condiciones.

## 9. Protocolos internos
Indicadores: cada caso se gestiona diferente, inseguridad en decisiones.
**Criterio Loke: sin protocolos no hay seguridad organizativa.**
Intervención: estandarizar, documentar.

## 10. Employee Journey Map
Fases críticas: incorporación · integración · desarrollo · salida.
Indicadores: desconexión temprana, falta de adaptación.
**Criterio Loke: muchos problemas comienzan en la incorporación.**
Intervención: revisar onboarding, acompañar primeros meses.

## 11. Riesgos psicosociales
Factores: sobrecarga, falta de control, conflictos, falta de reconocimiento.
Señales: estrés, cambios de conducta, aislamiento, bajo rendimiento.
**Criterio Loke: siempre explorar factores personales además de laborales.**
Intervención: escucha activa, ajuste de carga, derivación si es necesario.

## 12. Cultura organizacional
Indicadores de cultura débil: valores no claros, incoherencia entre discurso y acción.
**Criterio Loke: la cultura se construye con comportamientos, no con palabras.**
Intervención: definir valores operativos, alinear liderazgo.

## 13. Profesionalización de RRHH
Indicadores: decisiones improvisadas, dependencia del gerente, falta de estructura.
**Criterio Loke: sin sistema, los problemas se repiten.**
Intervención: implementar procesos, externalizar si es necesario.

## 14. Criterios de riesgo legal (España)
Señales de alerta: posible acoso, discriminación, represalias, vulneración de derechos.
**Criterio Loke: no gestionar de forma informal.**
Intervención: activar protocolo, documentar, escalar.

## 15. Enfoque de trabajo social (el diferencial de Loke)
El comportamiento del empleado puede estar influido por problemas familiares, situación económica, salud mental o entorno social.
**Criterio Loke: no separar persona y trabajador.**
Intervención: explorar sin invadir, comprender contexto, derivar cuando sea necesario.

## 16. Criterios de escalado
Escalar cuando: el problema se repite · afecta al equipo · hay conflicto abierto · hay riesgo psicosocial · hay posible conducta grave · el gerente no puede gestionarlo solo.

## 17. Cierre
El sistema Loke no busca soluciones rápidas, sino decisiones correctas. El objetivo no es eliminar problemas, sino gestionarlos con criterio profesional, protegiendo a la persona, al equipo y a la organización.`;

export const CASOS_REFERENCIA = `# CASOS DE REFERENCIA

Patrones de interpretación y actuación, no soluciones cerradas. Cada caso es una
referencia de análisis: úsalos para reconocer el patrón, no para copiar la respuesta.

## CASO 1 — Bajo rendimiento progresivo
Dimensión principal: Liderazgo y gerencia. Secundarias: Clima laboral, Riesgos psicosociales, Employee Journey Map.
Situación: empleado con buen rendimiento histórico que en los últimos 3 meses ha bajado su productividad, comete errores y participa menos.
Lectura: cambio de patrón. No es problema de capacidad, sino de contexto o situación.
Análisis: desenganche del rol · falta de claridad en expectativas · sobrecarga sostenida · problema personal externo.
Errores típicos: presionar por resultados · comparar con el pasado ("antes rendías más") · interpretarlo como falta de actitud.
Enfoque Loke: 1) conversación exploratoria 2) validar sin juicio 3) revisar carga, rol y expectativas 4) definir seguimiento.
Señales de riesgo: aislamiento, desmotivación explícita, baja médica.
**Decisión clave: no corregir primero → entender primero.**

## CASO 2 — Absentismo recurrente
Dimensión principal: Absentismo. Secundarias: Riesgos psicosociales, Clima laboral.
Situación: ausencias frecuentes, especialmente lunes y viernes, sin causa clara comunicada.
Lectura: patrón, no casualidad. Posible problema personal, desenganche o desgaste.
Análisis: estrés o sobrecarga · problema familiar · desmotivación · evitación del entorno laboral.
Errores típicos: ir directamente a sanción · no analizar el patrón · no hablar con la persona.
Enfoque Loke: 1) analizar frecuencia y patrón 2) conversación individual 3) explorar causas personales y laborales 4) medidas y seguimiento.
**Decisión clave: no tratar como disciplina primero → tratar como señal.**

## CASO 3 — Conflicto relacional entre empleados
Dimensión principal: Gestión de conflictos. Secundarias: Clima laboral, Comunicación interna.
Situación: dos empleados que trabajan juntos han dejado de comunicarse y generan tensión en el equipo.
Lectura: conflicto relacional no gestionado que ya afecta al entorno.
Errores típicos: evitar el conflicto · tomar partido · minimizarlo.
Enfoque Loke: 1) detectar tipo de conflicto 2) intervención estructurada 3) mediación con reglas claras 4) seguimiento.
Señales de riesgo: polarización del equipo, extensión del conflicto, deterioro del clima.
**Decisión clave: no esperar a que se resuelva solo.**

## CASO 4 — Desmotivación de empleado clave
Dimensión principal: Retención del talento. Secundarias: Liderazgo, Cultura organizacional.
Situación: empleado de alto rendimiento que empieza a mostrar desinterés y distancia.
Lectura: desalineación progresiva con la empresa.
Análisis: falta de reconocimiento · falta de desarrollo · desgaste · pérdida de sentido del trabajo.
Errores típicos: ignorar señales · ofrecer solo dinero · reaccionar tarde.
**Decisión clave: intervenir antes de que la salida sea irreversible.**

## CASO 5 — Riesgo psicosocial (sobrecarga)
Dimensión principal: Riesgos psicosociales. Secundarias: Liderazgo, Clima.
Situación: empleado saturado, con cambios de actitud, irritabilidad y caída de rendimiento.
Lectura: posible sobrecarga o inicio de burnout.
Errores típicos: normalizar ("es parte del trabajo") · exigir más rendimiento · ignorar señales.
Enfoque Loke: 1) escucha activa 2) ajuste de carga 3) priorización de tareas 4) seguimiento cercano.
**Decisión clave: intervenir antes del colapso.**

## CASO 6 — Mala comunicación estructural
Dimensión principal: Comunicación interna. Secundarias: Liderazgo, Cultura.
Situación: errores frecuentes por falta de claridad en tareas y mensajes contradictorios.
Lectura: problema de sistema, no de personas.
Errores típicos: culpar al equipo · repetir mensajes sin estructurar.
Enfoque Loke: definir canales, estandarizar comunicación, clarificar responsabilidades.

## CASO 7 — Posible conducta grave
Dimensión principal: Protocolos internos. Secundarias: Riesgo legal, Clima.
Situación: comentarios inapropiados reiterados hacia una persona del equipo.
Lectura: posible situación de acoso o conducta inadecuada.
Errores típicos: restar importancia · resolver informalmente.
Enfoque Loke: 1) activar protocolo 2) documentar 3) proteger a la persona afectada 4) investigar.
**Decisión clave: no gestionar como conflicto normal.**

## CASO 8 — Rotación en cadena
Dimensión principal: Rotación. Secundarias: Cultura organizacional, Liderazgo, Employee Journey.
Situación: varias salidas voluntarias en 6 meses, especialmente en puestos similares.
Lectura: no son salidas aisladas, hay un patrón estructural.
Errores típicos: culpar al mercado laboral · tratar cada salida como caso individual · sustituir sin analizar causas.
**Decisión clave: la repetición indica problema interno, no externo.**

## CASO 9 — Onboarding deficiente
Dimensión principal: Employee Journey Map. Secundarias: Cultura organizacional, Comunicación interna.
Situación: nuevo empleado que en pocas semanas muestra desorientación, inseguridad y baja implicación.
Lectura: fallo en la fase de incorporación, no en la persona.
Errores típicos: pensar que "ya aprenderá" · culpar al empleado · no hacer seguimiento inicial.
**Decisión clave: los primeros 30 días condicionan la permanencia.**

## CASO 10 — Falta de protocolos
Dimensión principal: Protocolos internos. Secundarias: Liderazgo, Profesionalización de RRHH.
Situación: cada problema se gestiona distinto según el momento o la persona implicada.
Lectura: ausencia de criterios estructurados, dependencia total del gerente.
**Decisión clave: sin protocolo, no hay consistencia.**

## CASO 11 — RRHH no profesionalizado
Dimensión principal: Profesionalización de RRHH. Secundarias: Liderazgo, Cultura organizacional.
Situación: la gestión de personas depende exclusivamente del gerente, sin procesos ni estructura.
Lectura: sistema no escalable, alto riesgo de repetición de problemas.
**Decisión clave: sin sistema, todo depende de la persona.**

## CASO 12 — Cultura débil o incoherente
Dimensión principal: Cultura organizacional. Secundarias: Liderazgo, Clima laboral.
Situación: la empresa dice tener unos valores, pero decisiones y comportamientos no están alineados.
Lectura: incoherencia cultural, pérdida de credibilidad interna.
**Decisión clave: la cultura real es lo que se hace, no lo que se dice.**

## CASO 13 — Mal clima generalizado
Dimensión principal: Clima laboral. Secundarias: Conflictos, Liderazgo.
Situación: ambiente tenso, comentarios negativos frecuentes, baja energía en el equipo.
Lectura: clima deteriorado como consecuencia de problemas no gestionados.
**Decisión clave: el clima no mejora solo.**

## CASO 14 — Queja informal no gestionada
Dimensión principal: Clima laboral / Conflictos. Secundarias: Protocolos internos.
Situación: un empleado expresa malestar de forma informal, pero no se registra ni se actúa.
Lectura: señal temprana ignorada.
Errores típicos: restar importancia · no registrar · no hacer seguimiento.
**Decisión clave: lo informal hoy puede ser crítico mañana.**

## CASO 15 — Gerente sobrecargado
Dimensión principal: Liderazgo y gerencia. Secundarias: Riesgos psicosociales, Profesionalización de RRHH.
Situación: el gerente asume demasiadas funciones, no delega y empieza a mostrar desgaste.
Lectura: riesgo de saturación del líder, con impacto en toda la organización.
**Decisión clave: si el gerente falla, falla el sistema.**

## CASO 17 — Gerente evitativo
Dimensión principal: Liderazgo y gerencia. Secundarias: Conflictos, Clima laboral.
Situación: el gerente evita conversaciones incómodas y no interviene ante problemas evidentes.
Lectura: liderazgo evitativo que genera acumulación de problemas.
Errores típicos: postergar decisiones · minimizar problemas · delegar conflictos sin intervenir.
**Decisión clave: no intervenir es también una decisión (y suele empeorar el problema).**

## CASO 18 — Decisiones inconsistentes del gerente
Dimensión principal: Liderazgo y gerencia. Secundarias: Cultura organizacional, Comunicación interna.
Situación: el gerente toma decisiones diferentes ante situaciones similares, generando confusión.
Lectura: falta de criterio estructurado y de coherencia en la gestión.
**Decisión clave: la incoherencia destruye confianza más rápido que una mala decisión puntual.**`;

export const GUIONES = `# GUIONES DE INTERVENCIÓN Y PROTOCOLOS BÁSICOS

Son plantillas base. Adáptalas siempre al caso concreto que te cuente el gerente —
nunca las entregues literalmente sin ajustar al contexto, los nombres y los hechos.

## BLOQUE 1 — Guion base de conversación difícil
Objetivo: abrir conversación sin generar defensa.

"Quería hablar contigo porque he observado algunas cosas en las últimas semanas y prefiero comentarlo contigo directamente.
No es una conversación para juzgar, sino para entender qué está pasando y ver cómo podemos gestionarlo de la mejor manera posible.
He notado [hecho concreto]. ¿Cómo lo estás viviendo tú?"
(Pausa — escuchar)
"¿Hay algo que esté influyendo en esto que creas que debería saber?"
(Pausa)
"Mi objetivo es que esto funcione bien para ti y para el equipo, así que vamos a ver cómo podemos enfocarlo."

## BLOQUE 2 — Guion para conflicto entre empleados
"No se trata de ver quién tiene razón, sino de entender qué está pasando y cómo podemos reconducir.
Cada uno va a poder explicar su punto de vista, pero vamos a centrarnos en hechos y en soluciones, no en reproches."

## BLOQUE 3 — Guion para bajo rendimiento
"He visto que tu rendimiento ha cambiado en las últimas semanas.
Antes de sacar conclusiones, prefiero entender si hay algo que esté influyendo, ya sea en el trabajo o fuera de él."

## BLOQUE 4 — Registro de incidencia
Fecha · Persona implicada · Descripción objetiva · Impacto detectado · Acción realizada · Respuesta de la persona · Próximos pasos.

## BLOQUE 5 — Seguimiento 7 / 15 / 30 días
7 días: ¿ha mejorado la situación? ¿se ha producido la conversación?
15 días: ¿se mantiene el cambio? ¿hay recaídas?
30 días: ¿está resuelto? ¿hay que escalar?

## BLOQUE 6 — Criterios de escalado
Escalar cuando: hay conflicto abierto sin mejora · hay impacto en el equipo · hay riesgo psicosocial · hay posible conducta grave · el gerente no sabe cómo avanzar.`;

/** Todo el conocimiento junto, listo para inyectar en el prompt del sistema. */
export const BASE_DE_CONOCIMIENTO = [
  CRITERIOS_PROFESIONALES,
  CASOS_REFERENCIA,
  GUIONES,
].join("\n\n---\n\n");
