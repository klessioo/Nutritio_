-- Nutritio: schema de contas, avatar e progresso dos jogos
-- Rode este script inteiro no Supabase: painel do projeto -> SQL Editor -> New query -> Run

create extension if not exists pgcrypto;

-- ============================================================
-- TABELAS
-- ============================================================

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  avatar_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists game_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  game_id int not null,
  stars smallint not null default 0 check (stars between 0 and 3),
  best_score int not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (profile_id, game_id)
);

-- ============================================================
-- RLS: nenhuma policy = acesso direto totalmente bloqueado.
-- O único jeito de ler/escrever é através das funções abaixo.
-- ============================================================

alter table profiles enable row level security;
alter table game_progress enable row level security;

revoke all on profiles from anon, authenticated;
revoke all on game_progress from anon, authenticated;

-- ============================================================
-- Trigger utilitário para updated_at
-- ============================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists trg_game_progress_updated_at on game_progress;
create trigger trg_game_progress_updated_at
  before update on game_progress
  for each row execute function set_updated_at();

-- ============================================================
-- RPCs (SECURITY DEFINER: rodam com permissão total, ignorando
-- a RLS acima, mas cada uma valida/filtra o que expõe)
-- ============================================================

create or replace function check_username_available(p_username text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1 from profiles where username = lower(trim(p_username))
  );
$$;

create or replace function register_user(p_username text, p_password text)
returns table (id uuid, username text, avatar_config jsonb)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_username text := lower(trim(p_username));
  v_new_id uuid;
begin
  if v_username is null or length(v_username) < 3 or length(v_username) > 20 then
    raise exception 'Nome de usuário deve ter entre 3 e 20 caracteres' using errcode = 'P0001';
  end if;

  if p_password is null or length(p_password) < 4 then
    raise exception 'Senha deve ter pelo menos 4 caracteres' using errcode = 'P0001';
  end if;

  if exists (select 1 from profiles p where p.username = v_username) then
    raise exception 'Esse nome de usuário já está em uso' using errcode = 'P0001';
  end if;

  insert into profiles (username, password_hash)
  values (v_username, crypt(p_password, gen_salt('bf')))
  returning profiles.id into v_new_id;

  return query
    select p.id, p.username, p.avatar_config
    from profiles p
    where p.id = v_new_id;
exception
  when unique_violation then
    raise exception 'Esse nome de usuário já está em uso' using errcode = 'P0001';
end;
$$;

create or replace function login_user(p_username text, p_password text)
returns table (id uuid, username text, avatar_config jsonb)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_username text := lower(trim(p_username));
  v_row profiles%rowtype;
begin
  select * into v_row from profiles p where p.username = v_username;

  if not found or v_row.password_hash <> crypt(p_password, v_row.password_hash) then
    raise exception 'Usuário ou senha inválidos' using errcode = 'P0001';
  end if;

  return query
    select v_row.id, v_row.username, v_row.avatar_config;
end;
$$;

create or replace function get_profile(p_profile_id uuid)
returns table (id uuid, username text, avatar_config jsonb)
language sql
security definer
set search_path = public
as $$
  select p.id, p.username, p.avatar_config
  from profiles p
  where p.id = p_profile_id;
$$;

create or replace function update_avatar(p_profile_id uuid, p_avatar_config jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  update profiles
  set avatar_config = p_avatar_config
  where id = p_profile_id;
$$;

create or replace function upsert_game_progress(
  p_profile_id uuid,
  p_game_id int,
  p_stars smallint,
  p_score int,
  p_completed boolean
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into game_progress (profile_id, game_id, stars, best_score, completed)
  values (p_profile_id, p_game_id, p_stars, p_score, p_completed)
  on conflict (profile_id, game_id) do update
  set stars = greatest(game_progress.stars, excluded.stars),
      best_score = greatest(game_progress.best_score, excluded.best_score),
      completed = game_progress.completed or excluded.completed;
$$;

create or replace function get_game_progress(p_profile_id uuid)
returns setof game_progress
language sql
security definer
set search_path = public
as $$
  select * from game_progress where profile_id = p_profile_id;
$$;

-- ============================================================
-- Permissões: só o cliente anônimo (chave "anon public") pode
-- CHAMAR estas funções. Não tem acesso direto às tabelas.
-- ============================================================

grant execute on function check_username_available(text) to anon;
grant execute on function register_user(text, text) to anon;
grant execute on function login_user(text, text) to anon;
grant execute on function get_profile(uuid) to anon;
grant execute on function update_avatar(uuid, jsonb) to anon;
grant execute on function upsert_game_progress(uuid, int, smallint, int, boolean) to anon;
grant execute on function get_game_progress(uuid) to anon;
