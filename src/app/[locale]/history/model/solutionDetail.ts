import {
  type Atribuicao,
  type Disciplina,
  type Docente,
  type Formulario,
  type HistoricoSolucao,
} from "@/context/Global/utils";
import { cellKey } from "@/app/[locale]/atribuicoes/model/gridModel";
import { computeConflictPairs } from "@/app/[locale]/atribuicoes/model/conflicts";

export interface DocenteDetail {
  docente: Docente;
  /** Turmas ativas atribuídas ao docente, na ordem das atribuições. */
  turmas: string[];
  /** Turmas ativas para as quais o docente preencheu formulário. */
  formTurmas: string[];
  /** Soma de `carga` (padrão 1) das turmas atribuídas. */
  carga: number;
  /** Turma atribuída → turmas atribuídas com que ela choca. */
  conflitos: Map<string, string[]>;
}

export interface TurmaDetail {
  turma: Disciplina;
  /** Docentes ativos atribuídos à turma. */
  docentes: string[];
  /** Docentes ativos que preencheram formulário para a turma. */
  formDocentes: string[];
  /** Algum docente atribuído tem conflito envolvendo esta turma. */
  conflito: boolean;
}

export interface SolutionDetail {
  docentes: Map<string, DocenteDetail>;
  turmas: Map<string, TurmaDetail>;
  /** `cellKey(docente, turma)` → prioridade do formulário. */
  prioridade: Map<string, number>;
  maxPriority: number;
  /** Formulários com docente e turma ativos. */
  formularios: Formulario[];
  /** Atribuições da solução restritas a turmas e docentes ativos. */
  atribuicoes: Atribuicao[];
  /** Pares (docente, turma) atribuídos sem formulário. */
  semFormulario: number;
  /** Travas de célula com docente e turma ativos. */
  travas: number;
}

export function pairKey(docente: string, turma: string): string {
  return cellKey(docente, turma);
}

/**
 * Índices do detalhe de uma entrada do histórico (substitui `processAtribuicoesToTree`).
 * Guarda referências aos objetos do `contexto` (sem spread nem grafo aninhado) e é O(D + T + F + A).
 * Tolerante a dado legado: saldo ausente, atribuições a turmas/docentes inativos ou inexistentes,
 * `docentes` ausente na atribuição.
 */
export function buildSolutionDetail(entry: HistoricoSolucao): SolutionDetail {
  const contexto = entry.contexto ?? ({} as HistoricoSolucao["contexto"]);
  const allDocentes = contexto.docentes ?? [];
  const allTurmas = contexto.disciplinas ?? [];
  const rawAtribuicoes = entry.solucao?.atribuicoes ?? [];

  const docentes = new Map<string, DocenteDetail>();
  for (const docente of allDocentes) {
    if (!docente?.ativo || docentes.has(docente.nome)) continue;
    docentes.set(docente.nome, {
      docente,
      turmas: [],
      formTurmas: [],
      carga: 0,
      conflitos: new Map(),
    });
  }

  const turmas = new Map<string, TurmaDetail>();
  for (const turma of allTurmas) {
    if (!turma?.ativo || turmas.has(turma.id)) continue;
    turmas.set(turma.id, {
      turma,
      docentes: [],
      formDocentes: [],
      conflito: false,
    });
  }

  // Mesmo critério de `getActiveFormularios`, com consulta O(1)
  const formularios = (contexto.formularios ?? []).filter(
    (f) => f && docentes.has(f.nome_docente) && turmas.has(f.id_disciplina),
  );
  const prioridade = new Map<string, number>();
  let maxFromForms = 0;
  for (const form of formularios) {
    const key = pairKey(form.nome_docente, form.id_disciplina);
    if (prioridade.has(key)) continue; // primeiro formulário vence, como na grade
    prioridade.set(key, form.prioridade);
    if (form.prioridade > maxFromForms) maxFromForms = form.prioridade;
    docentes.get(form.nome_docente)?.formTurmas.push(form.id_disciplina);
    turmas.get(form.id_disciplina)?.formDocentes.push(form.nome_docente);
  }

  const atribuicoes: Atribuicao[] = [];
  let semFormulario = 0;
  for (const atribuicao of rawAtribuicoes) {
    const turmaDetail = turmas.get(atribuicao?.id_disciplina);
    if (!turmaDetail) continue;
    const ativos: string[] = [];
    for (const nome of atribuicao.docentes ?? []) {
      const docenteDetail = docentes.get(nome);
      if (!docenteDetail || ativos.includes(nome)) continue;
      ativos.push(nome);
      docenteDetail.turmas.push(turmaDetail.turma.id);
      docenteDetail.carga += turmaDetail.turma.carga ?? 1;
      if (!prioridade.has(pairKey(nome, turmaDetail.turma.id))) semFormulario++;
    }
    turmaDetail.docentes.push(...ativos);
    atribuicoes.push({
      id_disciplina: atribuicao.id_disciplina,
      docentes: ativos,
    });
  }

  const pares = computeConflictPairs(atribuicoes, allTurmas);
  pares.forEach((porTurma, nome) => {
    const docenteDetail = docentes.get(nome);
    if (!docenteDetail) return;
    docenteDetail.conflitos = porTurma;
    porTurma.forEach((_, turmaId) => {
      const turmaDetail = turmas.get(turmaId);
      if (turmaDetail) turmaDetail.conflito = true;
    });
  });

  let travas = 0;
  const vistas = new Set<string>();
  for (const trava of contexto.travas ?? []) {
    if (trava?.nome_docente === undefined || trava?.id_disciplina === undefined)
      continue;
    if (!docentes.has(trava.nome_docente) || !turmas.has(trava.id_disciplina))
      continue;
    const key = pairKey(trava.nome_docente, trava.id_disciplina);
    if (vistas.has(key)) continue;
    vistas.add(key);
    travas++;
  }

  const maxPriority =
    typeof contexto.maxPriority === "number" && contexto.maxPriority > 0
      ? contexto.maxPriority
      : maxFromForms;

  return {
    docentes,
    turmas,
    prioridade,
    maxPriority,
    formularios,
    atribuicoes,
    semFormulario,
    travas,
  };
}

/** Linha da tabela unificada (formulários × atribuições) do painel de detalhe. */
export interface RelationRow {
  /** Nome do docente (quando a entidade é turma) ou id da turma (quando é docente). */
  id: string;
  prioridade: number | null;
  atribuida: boolean;
  /** Ids das turmas com que a turma desta linha choca, para o docente em questão. */
  chocaCom: string[];
}

/**
 * União de formulários e atribuições de uma entidade: o que foi preenchido e o que foi
 * atribuído aparecem juntos, e "sem formulário" fica explícito.
 */
export function relationsOf(
  detail: SolutionDetail,
  entity: { kind: "docente" | "turma"; id: string },
): RelationRow[] {
  if (entity.kind === "docente") {
    const docente = detail.docentes.get(entity.id);
    if (!docente) return [];
    const ids = [...docente.turmas];
    for (const id of docente.formTurmas) if (!ids.includes(id)) ids.push(id);
    return ids.map((turmaId) => ({
      id: turmaId,
      prioridade: detail.prioridade.get(pairKey(entity.id, turmaId)) ?? null,
      atribuida: docente.turmas.includes(turmaId),
      chocaCom: docente.conflitos.get(turmaId) ?? [],
    }));
  }

  const turma = detail.turmas.get(entity.id);
  if (!turma) return [];
  const nomes = [...turma.docentes];
  for (const nome of turma.formDocentes)
    if (!nomes.includes(nome)) nomes.push(nome);
  return nomes.map((nome) => ({
    id: nome,
    prioridade: detail.prioridade.get(pairKey(nome, entity.id)) ?? null,
    atribuida: turma.docentes.includes(nome),
    chocaCom: detail.docentes.get(nome)?.conflitos.get(entity.id) ?? [],
  }));
}
