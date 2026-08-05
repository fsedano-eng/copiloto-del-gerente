-- ═══════════════════════════════════════════════════════════════════════
--  Copiloto del Gerente — esquema de base de datos
--  Ejecutar en: Supabase → SQL Editor → New query → pegar → Run
--
--  IMPORTANTE: este esquema guarda conversaciones que nombran a empleados
--  concretos de las empresas cliente. Loke actúa como ENCARGADO DEL
--  TRATAMIENTO. Antes de dar de alta a un cliente real hacen falta:
--    · política de privacidad que lo cubra
--    · contrato de encargado del tratamiento firmado con la empresa
--    · política de borrado (ver función borrar_gerente más abajo)
-- ═══════════════════════════════════════════════════════════════════════

-- ── Empresas cliente ───────────────────────────────────────────────────
create table if not exists public.clientes (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  -- servicio contratado: liderazgo | 360_estandar | 360_premium
  plan        text not null default 'liderazgo',
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── Gerentes autorizados ───────────────────────────────────────────────
--  Solo por invitación: un email sin fila aquí NO puede usar la app,
--  aunque exista en auth.users.
create table if not exists public.gerentes (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  nombre      text,
  cliente_id  uuid not null references public.clientes(id) on delete cascade,
  -- 'gerente' (usa la app) | 'admin' (Fran, ve todo)
  rol         text not null default 'gerente' check (rol in ('gerente', 'admin')),
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists gerentes_cliente_idx on public.gerentes (cliente_id);

-- ── Conversaciones ─────────────────────────────────────────────────────
create table if not exists public.conversaciones (
  id          uuid primary key default gen_random_uuid(),
  gerente_id  uuid not null references public.gerentes(id) on delete cascade,
  titulo      text not null default 'Nueva conversación',
  archivada   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists conversaciones_gerente_idx
  on public.conversaciones (gerente_id, updated_at desc);

-- ── Mensajes ───────────────────────────────────────────────────────────
create table if not exists public.mensajes (
  id               uuid primary key default gen_random_uuid(),
  conversacion_id  uuid not null references public.conversaciones(id) on delete cascade,
  rol              text not null check (rol in ('user', 'assistant')),
  contenido        text not null,
  created_at       timestamptz not null default now()
);

create index if not exists mensajes_conversacion_idx
  on public.mensajes (conversacion_id, created_at asc);

-- ── updated_at automático en conversaciones ────────────────────────────
create or replace function public.touch_conversacion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversaciones
     set updated_at = now()
   where id = new.conversacion_id;
  return new;
end;
$$;

drop trigger if exists mensajes_touch_conversacion on public.mensajes;
create trigger mensajes_touch_conversacion
  after insert on public.mensajes
  for each row execute function public.touch_conversacion();

-- ═══════════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
--  Sin esto, cualquier usuario autenticado podría leer las conversaciones
--  de cualquier otro. Es la pieza de seguridad crítica del sistema.
-- ═══════════════════════════════════════════════════════════════════════

alter table public.clientes       enable row level security;
alter table public.gerentes       enable row level security;
alter table public.conversaciones enable row level security;
alter table public.mensajes       enable row level security;

-- Helper: ¿el usuario actual es admin (Fran)?
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.gerentes
     where id = auth.uid() and rol = 'admin' and activo
  );
$$;

-- ── clientes ───────────────────────────────────────────────────────────
drop policy if exists clientes_lectura on public.clientes;
create policy clientes_lectura on public.clientes
  for select using (
    public.es_admin()
    or id in (select cliente_id from public.gerentes where id = auth.uid())
  );

-- ── gerentes ───────────────────────────────────────────────────────────
--  Cada gerente ve solo su propia ficha. El admin las ve todas.
drop policy if exists gerentes_lectura on public.gerentes;
create policy gerentes_lectura on public.gerentes
  for select using (id = auth.uid() or public.es_admin());

-- Nadie se da de alta ni se cambia el rol desde la app: eso lo hace Fran
-- desde el panel de Supabase (service role, que salta el RLS).

-- ── conversaciones ─────────────────────────────────────────────────────
drop policy if exists conversaciones_lectura on public.conversaciones;
create policy conversaciones_lectura on public.conversaciones
  for select using (gerente_id = auth.uid() or public.es_admin());

drop policy if exists conversaciones_insercion on public.conversaciones;
create policy conversaciones_insercion on public.conversaciones
  for insert with check (gerente_id = auth.uid());

drop policy if exists conversaciones_actualizacion on public.conversaciones;
create policy conversaciones_actualizacion on public.conversaciones
  for update using (gerente_id = auth.uid())
  with check (gerente_id = auth.uid());

drop policy if exists conversaciones_borrado on public.conversaciones;
create policy conversaciones_borrado on public.conversaciones
  for delete using (gerente_id = auth.uid());

-- ── mensajes ───────────────────────────────────────────────────────────
drop policy if exists mensajes_lectura on public.mensajes;
create policy mensajes_lectura on public.mensajes
  for select using (
    public.es_admin()
    or conversacion_id in (
      select id from public.conversaciones where gerente_id = auth.uid()
    )
  );

drop policy if exists mensajes_insercion on public.mensajes;
create policy mensajes_insercion on public.mensajes
  for insert with check (
    conversacion_id in (
      select id from public.conversaciones where gerente_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════════════════════
--  ALTA DE UN GERENTE (proceso manual de Fran)
--
--  1. Supabase → Authentication → Users → "Invite user" con su email.
--     (Esto crea la fila en auth.users y le manda un email de invitación.)
--  2. Copiar el UUID que aparece en la lista de usuarios.
--  3. Ejecutar aquí, sustituyendo los valores:
--
--     insert into public.clientes (nombre, plan)
--     values ('Nombre de la empresa', 'liderazgo')
--     returning id;   -- copia este id para el paso siguiente
--
--     insert into public.gerentes (id, email, nombre, cliente_id)
--     values (
--       'UUID-DEL-USUARIO-DE-AUTH',
--       'gerente@empresa.com',
--       'Nombre del gerente',
--       'UUID-DEL-CLIENTE'
--     );
--
--  Sin el paso 3 la persona puede autenticarse pero la app le dirá que su
--  cuenta no está configurada. Es intencionado: el alta la controlas tú.
-- ═══════════════════════════════════════════════════════════════════════

-- ── Baja de un cliente (RGPD: derecho de supresión) ────────────────────
--  Borrar la fila de clientes arrastra en cascada gerentes, conversaciones
--  y mensajes. Ejecutar con service role desde el panel:
--
--     delete from public.clientes where id = 'UUID-DEL-CLIENTE';
--
--  El usuario de auth.users hay que borrarlo aparte, en Authentication → Users.
