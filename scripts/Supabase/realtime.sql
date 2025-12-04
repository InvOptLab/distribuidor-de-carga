-- 1. Tabela de Salas
create table rooms (
  id uuid default gen_random_uuid() primary key,
  name text unique not null, -- Nome único da sala
  owner_id text not null, -- ID do dono (gerado no front)
  owner_name text not null,
  config jsonb default '{"guestsCanEdit": false}', -- Configurações
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Participantes (para garantir nomes únicos DENTRO da sala)
create table participants (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references rooms(id) on delete cascade,
  user_id text not null,
  name text not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(room_id, name) -- Garante que não tenha dois "João" na mesma sala
);

-- 3. Habilitar Realtime para essas tabelas
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table participants;