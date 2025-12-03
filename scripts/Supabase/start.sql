-- 1. Habilitar a extensão de vetores
create extension if not exists vector;

-- 2. Criar a tabela de documentos
create table documents (
  id bigserial primary key,
  content text, -- O texto do PDF
  metadata jsonb, -- Página, fonte, etc
  embedding vector(768) -- O vetor do Gemini
);

-- 1. Derruba a função antiga para garantir limpeza
DROP FUNCTION IF EXISTS match_documents;

-- 2. Cria a nova função com valores PADRÃO (DEFAULT) para evitar erros de parâmetros faltando
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float DEFAULT 0, -- <--- AQUI ESTÁ A CORREÇÃO: Valor padrão 0 se não for enviado
  match_count int DEFAULT 10,
  filter jsonb DEFAULT '{}'
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  and documents.metadata @> filter
  order by similarity desc
  limit match_count;
end;
$$;