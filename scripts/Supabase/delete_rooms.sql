-- Habilita a extensão do pg_cron no Supabase (se ainda não estiver ativa)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Cria a função (procedure) que fará a limpeza das salas
CREATE OR REPLACE FUNCTION delete_orphaned_rooms()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM rooms
  WHERE 
    (
      NOT EXISTS (SELECT 1 FROM participants WHERE participants.room_id = rooms.id)
      AND created_at < NOW() - INTERVAL '5 minutes'
    )
    OR
    (
      created_at < NOW() - INTERVAL '12 hours'
    );
END;
$$;

-- Agenda a função para rodar a cada hora (no minuto 0)
SELECT cron.schedule(
  'cleanup_rooms_job',               -- Nome do Job
  '0 * * * *',                       -- Expressão cron (Roda a cada hora: 14:00, 15:00...)
  'SELECT delete_orphaned_rooms();'  -- Ação a ser executada
);