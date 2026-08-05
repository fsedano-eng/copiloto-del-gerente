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

## 3. Configurar el acceso por enlace mágico 🔑

En el panel de Supabase, **Authentication**:

1. **Sign In / Providers** → asegúrate de que **Email** está activado.
2. En ese mismo apartado, **desactiva "Allow new users to sign up"**.
   Esto es lo que hace que solo entre quien tú das de alta. (El código ya lo
   impide por su lado; esto es el segundo cerrojo.)
3. **URL Configuration** → en **Redirect URLs** añade:
   - `http://localhost:3000/auth/callback` (para probar en tu ordenador)
   - `https://TU-DOMINIO/auth/callback` (cuando lo despliegues, paso 7)

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

## 6. Darte de alta a ti mismo para probar 🔑

1. Supabase → **Authentication** → **Users** → **Add user** → **Send invitation**.
   Pon tu email (`fsedano@loke.es`). Te llega un correo.
2. Copia el **UUID** que aparece en la lista de usuarios.
3. Vuelve a **SQL Editor** y ejecuta esto, cambiando los valores:

```sql
-- Primero la empresa (para probar, la tuya)
insert into public.clientes (nombre, plan)
values ('Loke — pruebas', 'liderazgo')
returning id;
-- ↑ copia el id que devuelve

-- Ahora tú como gerente (rol admin: podrás ver todas las conversaciones)
insert into public.gerentes (id, email, nombre, cliente_id, rol)
values (
  'PEGA-AQUI-TU-UUID-DE-AUTH',
  'fsedano@loke.es',
  'Fran Sedano',
  'PEGA-AQUI-EL-ID-DE-CLIENTES',
  'admin'
);
```

**Sin este paso 3, el email entra pero la app le dice que su cuenta no está
configurada.** Es a propósito: el alta la controlas tú.

## 7. Probarlo en tu ordenador

Desde una terminal, dentro de la carpeta del proyecto:

```bash
npm run dev
```

Abre `http://localhost:3000`, pon tu email, y te llega el enlace de acceso.

Qué comprobar:
- [ ] Llega el email y el enlace te mete en el chat
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
4. En **Environment Variables**, añade las mismas cuatro de tu `.env.local`,
   pero con `NEXT_PUBLIC_SITE_URL` = la URL real de Vercel.
5. **Deploy**.
6. Vuelve a Supabase → **Authentication** → **URL Configuration** y añade la URL
   real de Vercel a **Redirect URLs** (si no, los enlaces mágicos te devolverán
   a localhost).
7. **Repite las comprobaciones del paso 7 en producción.** El entorno local
   miente a veces.

---

## Antes de meter a un cliente de verdad ⚠️

Esto no es opcional. Las conversaciones guardan datos de empleados concretos, así
que Loke actúa como **encargado del tratamiento**:

- [ ] Política de privacidad que cubra explícitamente esta herramienta
- [ ] **Contrato de encargado del tratamiento** firmado con cada empresa cliente
      (documento estándar, tu gestoría lo tiene)
- [ ] Política de borrado definida: cuánto tiempo se guardan las conversaciones y
      qué pasa cuando un cliente se va (ver el final de `schema.sql`)
- [ ] Decírselo al gerente dentro de la propia herramienta, sin letra pequeña
      (ahora mismo hay un aviso bajo el cuadro de escritura — revisa que te vale)

Mientras resuelves esto, puedes probarlo tú y con quien tenga confianza.

## Añadir un cliente nuevo (cuando ya esté en marcha)

Mismo procedimiento del paso 6, pero con `rol` = `'gerente'` en vez de `'admin'`.
Un cliente puede tener varios gerentes: se insertan varias filas con el mismo
`cliente_id`.

## Dar de baja a un cliente (derecho de supresión)

```sql
delete from public.clientes where id = 'UUID-DEL-CLIENTE';
```

Borra en cascada sus gerentes, conversaciones y mensajes. El usuario de acceso hay
que borrarlo aparte, en **Authentication** → **Users**.
