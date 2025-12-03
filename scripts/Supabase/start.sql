-- 1. Habilitar a extensão de vetores
create extension if not exists vector;

-- 2. Criar a tabela de documentos
create table documents (
  id bigserial primary key,
  content text, -- O texto do PDF
  metadata jsonb, -- Página, fonte, etc
  embedding vector(768) -- O vetor do Gemini
);

-- 3. Criar a função de busca por similaridade (Que o LangChain vai chamar)
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
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
  order by similarity desc
  limit match_count;
end;
$$;