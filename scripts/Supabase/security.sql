-- =====================================================================
-- Segurança das salas colaborativas
--
-- Aplicar UMA vez no SQL Editor do Supabase, depois de realtime.sql.
-- O app funciona antes e depois deste script (antes, cai no acesso direto
-- às tabelas; depois, passa a usar só as funções abaixo).
--
-- O que muda:
--  * As tabelas deixam de ser lidas/escritas diretamente com a chave pública
--    (RLS ligado, sem políticas). Antes, qualquer pessoa podia apagar ou
--    alterar qualquer sala.
--  * O hash da senha sai de rooms.config e vai para room_secrets, que
--    ninguém lê. A senha passa a ser conferida no servidor.
--  * O id de salas privadas não aparece no lobby (view rooms_lobby): só quem
--    acerta a senha recebe o id e, com ele, o canal realtime da sala.
--  * Encerrar a sala e mudar permissões exigem o token do líder.
--  * O líder entra como participante, e cada cliente marca presença
--    (last_seen). Nomes de quem fechou a aba ficam livres depois de ~1 min.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. Estrutura
-- ---------------------------------------------------------------------
create table if not exists room_secrets (
  room_id uuid primary key references rooms(id) on delete cascade,
  password_hash text,
  owner_token_hash text not null
);

alter table participants
  add column if not exists last_seen timestamptz not null default now();

-- Migra salas existentes: hash da senha para room_secrets. Salas antigas
-- recebem um token aleatório (o líder delas não o conhece; elas expiram
-- pela limpeza automática).
insert into room_secrets (room_id, password_hash, owner_token_hash)
select id,
       config ->> 'passwordHash',
       encode(digest(gen_random_uuid()::text, 'sha256'), 'hex')
from rooms
on conflict (room_id) do nothing;

update rooms set config = config - 'passwordHash' where config ? 'passwordHash';

-- ---------------------------------------------------------------------
-- 2. Bloqueio do acesso direto
-- ---------------------------------------------------------------------
alter table rooms enable row level security;
alter table participants enable row level security;
alter table room_secrets enable row level security;

revoke all on rooms, participants, room_secrets from anon, authenticated;

-- Lobby: sem segredos, sem id de salas privadas
create or replace view rooms_lobby as
select
  case when coalesce((r.config ->> 'isPrivate')::boolean, false)
       then null else r.id end as id,
  r.name,
  r.owner_name,
  r.config,
  r.created_at
from rooms r;

grant select on rooms_lobby to anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. Funções (SECURITY DEFINER: rodam com o dono das tabelas)
-- ---------------------------------------------------------------------
create or replace function _room_json(r rooms)
returns json language sql stable as $$
  select json_build_object(
    'id', r.id, 'name', r.name, 'owner_name', r.owner_name,
    'config', r.config - 'passwordHash'
  );
$$;

create or replace function _check_owner(p_room_id uuid, p_owner_token text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from room_secrets
    where room_id = p_room_id
      and owner_token_hash = encode(digest(p_owner_token, 'sha256'), 'hex')
  ) then
    raise exception 'NOT_OWNER';
  end if;
end;
$$;

create or replace function create_room(
  p_name text, p_owner_id text, p_owner_name text,
  p_config jsonb, p_password_hash text default null
) returns json
language plpgsql security definer set search_path = public as $$
declare
  r rooms;
  v_token text := encode(gen_random_bytes(24), 'hex');
begin
  begin
    insert into rooms (name, owner_id, owner_name, config)
    values (p_name, p_owner_id, p_owner_name,
            coalesce(p_config, '{}'::jsonb) - 'passwordHash')
    returning * into r;
  exception when unique_violation then
    raise exception 'ROOM_NAME_TAKEN';
  end;

  insert into room_secrets (room_id, password_hash, owner_token_hash)
  values (r.id,
          case when coalesce((r.config ->> 'isPrivate')::boolean, false)
               then p_password_hash end,
          encode(digest(v_token, 'sha256'), 'hex'));

  insert into participants (room_id, user_id, name)
  values (r.id, p_owner_id, p_owner_name);

  return json_build_object('room', _room_json(r), 'owner_token', v_token);
end;
$$;

create or replace function join_room(
  p_room_name text, p_user_id text, p_name text,
  p_password_hash text default null
) returns json
language plpgsql security definer set search_path = public as $$
declare
  r rooms;
  s room_secrets;
  other participants;
begin
  select * into r from rooms where name = p_room_name;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;

  select * into s from room_secrets where room_id = r.id;
  if coalesce((r.config ->> 'isPrivate')::boolean, false) then
    if p_password_hash is null or p_password_hash = '' then
      raise exception 'PASSWORD_REQUIRED';
    end if;
    if s.password_hash is distinct from p_password_hash then
      raise exception 'WRONG_PASSWORD';
    end if;
  end if;

  -- Mesmo usuário voltando (recarregou a página)
  if exists (select 1 from participants
             where room_id = r.id and user_id = p_user_id) then
    update participants set name = p_name, last_seen = now()
    where room_id = r.id and user_id = p_user_id;
    return _room_json(r);
  end if;

  select * into other from participants
  where room_id = r.id and name = p_name;
  if found then
    -- Libera o nome de quem sumiu (fechou a aba sem sair). O nome do líder
    -- nunca é liberado para outra pessoa.
    if other.user_id <> r.owner_id
       and other.last_seen < now() - interval '75 seconds' then
      delete from participants where id = other.id;
    else
      raise exception 'NAME_TAKEN';
    end if;
  end if;

  insert into participants (room_id, user_id, name)
  values (r.id, p_user_id, p_name);
  return _room_json(r);
end;
$$;

create or replace function rejoin_owner(p_room_id uuid, p_owner_token text)
returns json
language plpgsql security definer set search_path = public as $$
declare r rooms;
begin
  perform _check_owner(p_room_id, p_owner_token);
  select * into r from rooms where id = p_room_id;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  update participants set last_seen = now()
  where room_id = r.id and user_id = r.owner_id;
  return _room_json(r);
end;
$$;

create or replace function touch_participant(p_room_id uuid, p_user_id text)
returns void
language sql security definer set search_path = public as $$
  update participants set last_seen = now()
  where room_id = p_room_id and user_id = p_user_id;
$$;

create or replace function leave_room(p_room_id uuid, p_user_id text)
returns void
language sql security definer set search_path = public as $$
  delete from participants where room_id = p_room_id and user_id = p_user_id;
$$;

create or replace function end_room(p_room_id uuid, p_owner_token text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  perform _check_owner(p_room_id, p_owner_token);
  delete from rooms where id = p_room_id;
end;
$$;

create or replace function update_room_config(
  p_room_id uuid, p_owner_token text, p_config jsonb
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_config jsonb;
begin
  perform _check_owner(p_room_id, p_owner_token);
  -- Só as permissões mudam; privacidade e senha ficam como foram criadas
  update rooms
  set config = config
    || jsonb_build_object(
         'guestsCanEdit', coalesce((p_config ->> 'guestsCanEdit')::boolean, false),
         'guestsCanFilter', coalesce((p_config ->> 'guestsCanFilter')::boolean, false))
  where id = p_room_id
  returning config into v_config;
  return v_config;
end;
$$;

revoke all on function _check_owner(uuid, text) from public, anon, authenticated;
grant execute on function
  create_room(text, text, text, jsonb, text),
  join_room(text, text, text, text),
  rejoin_owner(uuid, text),
  touch_participant(uuid, text),
  leave_room(uuid, text),
  end_room(uuid, text),
  update_room_config(uuid, text, jsonb)
to anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. Limpeza: substitui a função de delete_rooms.sql.
-- Uma sala é removida quando ninguém dá sinal de vida há 10 minutos
-- (inclui o líder, que agora é participante), ou após 12 horas.
-- ---------------------------------------------------------------------
create or replace function delete_orphaned_rooms()
returns void language plpgsql as $$
begin
  delete from rooms r
  where r.created_at < now() - interval '12 hours'
     or (
       r.created_at < now() - interval '10 minutes'
       and not exists (
         select 1 from participants p
         where p.room_id = r.id and p.last_seen > now() - interval '10 minutes'
       )
     );
end;
$$;
