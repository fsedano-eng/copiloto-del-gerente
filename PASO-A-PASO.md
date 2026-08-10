# Copiloto del Gerente — puesta en marcha

Guía para dejarlo funcionando. Los pasos marcados con 🔑 solo puedes hacerlos tú
(cuentas y claves). El resto ya está hecho.

---

## 1. Crear el proyecto en Supabase 🔑

1. Entra en [supabase.com](https://supabase.com) y crea una cuenta (plan gratuito).
2. **New project**. Ponle de nombre `copiloto-loke`.
3. Elige región **West EU (Ireland)** — datos de empleados españoles dentro de la UE.
4. Guarda la contraseña de la base de datos que te genera (en tu gestor de contraseñas).
5. Espera un par de minutos a que termine de crearse.

## 2. Crear las tablas

1. En el panel de Supabase: **SQL Editor** → **New query**.
2. Abre el archivo `supabase/schema.sql` de este proyecto, copia **todo** el contenido y pégalo.
3. Pulsa **Run**.

Debe decir "Success". Esto crea las tablas y, sobre todo, las reglas de seguridad
(RLS) que hacen que cada gerente solo pueda ver sus propias conversaciones.

## 3. Configurar el acceso por código 🔑

Se entra con un código de varias cifras que llega por correo. No hay contraseña
ni enlace: da igual el navegador o el dispositivo donde se abra.

En el panel de Supabase, **Authentication**:

1. **Sign In / Providers** → asegúrate de que **Email** está activado.
2. En ese mismo apartado, **desactiva "Allow new users to sign up"**.
   Esto es lo que hace que solo entre quien tú das de alta. (El código ya lo
   impide por su lado; esto es el segundo cerrojo.)
3. **Emails** → plantilla **Magic Link** → sustituye el enlace por el código,
   usando la variable `{{ .Token }}`. Si dejas la plantilla por defecto, al
   gerente le llegará un enlace que la app ya no usa.

## 4. Conseguir las claves 🔑

**De Supabase** — panel → **Settings** → **API**:
- `Project URL`
- `anon public` key

**De Anthropic** — [console.anthropic.com](https://console.anthropic.com) → **API Keys**:
- Crea una clave nueva. Es **tuya y de pago por uso**, distinta de tu suscripción
  de Claude Code. Cárgale 10-20 € para empezar: da para meses a vuestro volumen.

## 5. Poner las claves en el proyecto 🔑

Abre el archivo `.env.local` de este proyecto y sustituye los valores de ejemplo
por los reales:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
CHAT_MODEL=claude-sonnet-5
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Este archivo **nunca se sube a git** (ya está excluido). Las claves no salen de tu
ordenador hasta que las pongas también en Vercel (paso 7).

## 6. Dar de alta a alguien (a ti, o a un gerente) 🔑

Son siempre dos pasos: crear el usuario, y decirle a qué empresa pertenece.

**Paso 1 — crear el usuario.**
Supabase → **Authentication** → **Users** → **Add user** → **Create new user**:

- Email de la persona
- Contraseña: cualquier cosa aleatoria. No se usa nunca — aquí se entra con un
  código que llega por correo, no con contraseña
- Marca **Auto Confirm User**. Si te lo saltas, la cuenta queda sin confirmar y
  el código de acceso puede fallar
- Copia el **UID** que aparece en la lista

**Paso 2 — asignarle empresa y rol.** En **SQL Editor**.

Para una empresa nueva (crea la empresa y su primer gerente de una vez):

```sql
with empresa as (
  insert into public.clientes (nombre, plan)
  values ('Nombre de la empresa', 'liderazgo')
  returning id
)
insert into public.gerentes (id, email, nombre, cliente_id, rol)
select 'PEGA-AQUI-EL-UID', 'gerente@empresa.com', 'Nombre Apellido', empresa.id, 'gerente'
from empresa;
```

Para añadir otro gerente a una empresa que ya existe (no hace falta buscar ids):

```sql
insert into public.gerentes (id, email, nombre, cliente_id, rol)
select 'PEGA-AQUI-EL-UID', 'gerente@empresa.com', 'Nombre Apellido', id, 'gerente'
from public.clientes where nombre = 'Nombre exacto de la empresa';
```

`plan` acepta `liderazgo`, `360_estandar` o `360_premium`.
`rol` va en `gerente`; `admin` es solo para ti (ve todas las conversaciones en
`/admin`).

**Sin el paso 2, la persona entra pero la app le dice que su cuenta no está
configurada.** Es a propósito: el alta la controlas tú.

## 7. Probarlo en tu ordenador

Desde una terminal, dentro de la carpeta del proyecto:

```bash
npm run dev
```

Abre `http://localhost:3000`, pon tu email, y te llega el código de acceso.

Qué comprobar:
- [ ] Llega el email con el código y con él entras en el chat
- [ ] Escribes una situación real y responde con el Método Loke
- [ ] Te hace preguntas antes de dar el análisis (Fase 1)
- [ ] Al terminar, la conversación aparece en la lista de la izquierda con título propio
- [ ] Cierras y vuelves a entrar: la conversación sigue ahí
- [ ] El botón "Descargar en PDF" abre el diálogo de impresión y se ve bien
- [ ] En el móvil se ve correctamente

## 8. Desplegarlo en Vercel 🔑

1. Sube este proyecto a un repositorio de GitHub **propio** (no el del OS).
2. [vercel.com](https://vercel.com) → **Add New** → **Project** → importa ese repo.
3. **Importante**: si el proyecto está dentro de otra carpeta, configura
   **Root Directory** apuntando a la carpeta del Copiloto.
4. En **Environment Variables**, añade las mismas de tu `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `ANTHROPIC_API_KEY`, `CHAT_MODEL` y `RESEND_API_KEY` (esta última es para
   los avisos de uso; sin ella no falla nada, simplemente no llegan).
   Ojo al pegar las claves: cópialas de donde las tengas en claro, **nunca del
   panel del proveedor**, que las muestra enmascaradas con puntitos. Una clave
   enmascarada rompe la app con un error de lo más críptico.
5. **Deploy**.
6. **Repite las comprobaciones del paso 7 en producción.** El entorno local
   miente a veces.

Cambiar una variable de entorno **no vuelve a desplegar solo**: después de
tocarlas hay que ir a **Deployments** → **Redeploy**.

---

## Antes de meter a un cliente de verdad ⚠️

Esto no es opcional. Las conversaciones guardan datos de empleados concretos, así
que Loke actúa como **encargado del tratamiento**:

- [ ] **Contrato de encargado del tratamiento** firmado con cada empresa cliente
- [ ] DPA y transferencias internacionales de los proveedores (Anthropic está
      en EE. UU. — hace falta comprobar el mecanismo y guardarlo)
- [ ] Valorar si procede una Evaluación de Impacto (EIPD)
- [ ] Texto informativo para los empleados, que se lo das al cliente hecho
- [ ] Política de conservación y borrado
- [ ] Política de privacidad que cubra explícitamente esta herramienta
- [ ] Registro de actividades de tratamiento

**Todo esto está desarrollado, con el porqué de cada punto, en
[`LEGAL-RGPD.md`](./LEGAL-RGPD.md)** — ese es el documento para llevar a la
gestoría.

Mientras resuelves esto, puedes probarlo tú y con quien tenga confianza.

## Añadir un cliente nuevo (cuando ya esté en marcha)

Mismo procedimiento del **paso 6**. Una empresa puede tener varios gerentes: se
insertan varias filas con el mismo `cliente_id` (la segunda consulta del paso 6
lo resuelve buscando la empresa por su nombre).

## Ver lo que consultan los gerentes

En `/admin` (solo con `rol = 'admin'`): todas las consultas agrupadas por
empresa, y cada una se abre entera en solo lectura. También llega un aviso por
correo cada vez que alguien abre una consulta nueva — lleva quién, de qué
empresa y cuándo, nunca el contenido.

## Dar de baja a un cliente (derecho de supresión)

```sql
delete from public.clientes where id = 'UUID-DEL-CLIENTE';
```

Borra en cascada sus gerentes, conversaciones y mensajes. El usuario de acceso hay
que borrarlo aparte, en **Authentication** → **Users**.
