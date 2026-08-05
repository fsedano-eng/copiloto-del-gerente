# Copiloto del Gerente — Loke

App privada de apoyo a gerentes en la gestión de personas. Sustituye al GPT suelto
"Copiloto del Gerente Loke V1" por una herramienta con marca propia, acceso
controlado y las conversaciones guardadas en base de datos de Loke.

**Para ponerlo en marcha: [PASO-A-PASO.md](./PASO-A-PASO.md).**

---

## Qué es

Chat para gerentes de pymes (7-40 empleados) sin departamento de RRHH, entre sus
sesiones mensuales con Fran. Aplica el Método Loke y las 12 dimensiones del Radar.

Comercialmente ya está incluido en Loke Liderazgo (100 €/mes) y Loke 360
(250-500 €/mes) — ver `projects/briefs/copiloto-del-gerente/brief.md`.

## Cómo funciona

```
Gerente → enlace mágico al email → chat
                                    ↓
                    Claude Sonnet 5 + prompt Loke + base de conocimiento
                                    ↓
                    Conversación guardada en Supabase (RLS por gerente)
```

**Acceso solo por invitación.** No hay registro abierto ni contraseñas: Fran da de
alta el email en Supabase, y solo a ese email le llega el enlace de acceso.

## Decisiones de diseño

**Base de conocimiento dentro del prompt, no búsqueda semántica.** Los tres
documentos de Loke (criterios, 17 casos, guiones) suman ~20KB: caben enteros en
cada consulta. El modelo ve *todos* los criterios siempre, en vez de recuperar
fragmentos como hace ChatGPT. Menos piezas y mejor resultado. Con caché de prompt
el coste real es el primer mensaje de cada sesión.

**El seguimiento lo detecta la app, no el modelo.** Si en el historial ya hay un
análisis completo (marcador: aparece "Nivel de riesgo"), se le añade al prompt la
instrucción de no repetir lo que no ha cambiado. Es determinista: no depende de
que el modelo acierte a juzgarlo.

**Respuesta completa siempre.** Los 10 apartados del formato Loke se entregan
siempre que haya análisis. Única excepción: mientras recoge contexto (Fase 1), la
respuesta es la pregunta que toca. Decisión de Fran: en asuntos de personas,
quedarse corto es peor error que extenderse.

**PDF por impresión del navegador.** El botón abre el diálogo de imprimir sobre una
hoja con estilos propios (`@media print` en `globals.css`). Cero dependencias y
fidelidad exacta con la marca. Si en uso real se ve que hace falta una descarga
directa, se cambia por generación de PDF en servidor.

## Estructura

```
app/
  entrar/           acceso por enlace mágico
  auth/callback/    canje del enlace por sesión
  chat/             la app (server component: carga conversaciones)
  api/chat/         llamada a Claude en streaming + guardado
lib/
  prompt.ts         instrucciones del sistema (base: el GPT real de Fran)
  conocimiento.ts   los 3 documentos de Loke en texto
  config.ts         textos, límites y modelo — todo el "negocio" aquí
  llm.ts            cliente de Anthropic, detección de seguimiento, títulos
  supabase/         clientes de servidor y navegador + autorización
components/
  Chat.tsx          interfaz completa del chat
  Markdown.tsx      render seguro de la respuesta (sin inyección de HTML)
  Logo.tsx          marca real de Loke
supabase/
  schema.sql        tablas + RLS + instrucciones de alta y baja
```

## Seguridad

- Claves de API **solo en servidor**: el navegador nunca ve la de Anthropic.
- **RLS en base de datos**: cada gerente solo lee sus conversaciones. No depende de
  la app — aunque alguien manipulara el navegador, Postgres lo deniega.
- Middleware protege `/chat` y `/api/*`; sin sesión → 401 o redirección.
- Cabeceras CSP, X-Frame-Options, Referrer-Policy en `next.config.ts`.
- Límite de 60 mensajes/hora por gerente (evita que un bucle dispare la factura).
- El prompt trata los textos pegados por el gerente como datos, nunca como
  instrucciones.
- **Nunca se registra el contenido de las conversaciones en los logs**, solo errores.

## Pendiente

- [ ] Papeleo RGPD antes del primer cliente real (ver final de PASO-A-PASO.md)
- [ ] Probar en uso real si el formato completo en seguimientos cortos resulta pesado
- [ ] Decidir si el PDF debe ser copia literal (actual) o informe-síntesis de toda
      la conversación (llamada extra, 2-4 céntimos más)
- [ ] Aviso `sharp` en `npm audit`: viene de Next.js para optimizar imágenes.
      Esta app no usa ninguna, así que ese código nunca se ejecuta. Se resuelve
      solo al subir a Next 16 más adelante.
