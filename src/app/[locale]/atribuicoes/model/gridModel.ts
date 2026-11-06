import {
  type Atribuicao,
  type Celula,
  type Disciplina,
  type Docente,
  type Formulario,
  TipoTrava,
} from "@/algoritmo/communs/interfaces/interfaces";
import { computeConflictDocentes } from "./conflicts";

export type CellState =
  | "empty"
  | "pref"
  | "assigned"
  | "locked"
  | "lockedAssigned";

const CELL_KEY_SEP = "\u001f";

/** Chave de célula (docente, turma). O separador não aparece em nomes nem ids. */
export function cellKey(nome_docente: string, id_disciplina: string): string {
  return `${nome_docente}${CELL_KEY_SEP}${id_disciplina}`;
}

export interface GridModel {
  priority: Map<string, number>;
  assigned: Set<string>;
  /** Qualquer trava na célula (B7). */
  cellLocked: Set<string>;
  /** Docentes com trava Row. */
  rowLocked: Set<string>;
  /** Turmas com trava Column. */
  colLocked: Set<string>;
  assignedByTurma: Map<string, string[]>;
  assignedByDocente: Map<string, string[]>;
  cargaByDocente: Map<string, number>;
  conflictDocentes: Set<string>;
  maxPriority: number;
  stats: {
    turmasSemDocente: number;
    docentesSemAtribuicao: number;
    conflitos: number;
    travas: number;
  };
}

/**
 * Índices derivados para que toda consulta por célula seja O(1) (P2, P3, P4).
 */
export function buildGridModel(
  docentes: Docente[],
  disciplinas: Disciplina[],
  formularios: Formulario[],
  atribuicoes: Atribuicao[],
  travas: Celula[],
): GridModel {
  const docentesAtivos = new Set<string>();
  for (const d of docentes) if (d.ativo) docentesAtivos.add(d.nome);
  const turmasAtivas = new Map<string, Disciplina>();
  for (const d of disciplinas) if (d.ativo) turmasAtivas.set(d.id, d);

  const priority = new Map<string, number>();
  let maxPriority = 0;
  for (const form of formularios) {
    const key = cellKey(form.nome_docente, form.id_disciplina);
    // Mantém o primeiro formulário encontrado, como a montagem de linhas antiga
    if (!priority.has(key)) priority.set(key, form.prioridade);
    if (
      docentesAtivos.has(form.nome_docente) &&
      turmasAtivas.has(form.id_disciplina)
    ) {
      maxPriority = Math.max(maxPriority, form.prioridade);
    }
  }

  const assigned = new Set<string>();
  const assignedByTurma = new Map<string, string[]>();
  const assignedByDocente = new Map<string, string[]>();
  const cargaByDocente = new Map<string, number>();
  for (const atribuicao of atribuicoes) {
    if (atribuicao.docentes.length === 0) continue;
    assignedByTurma.set(atribuicao.id_disciplina, [...atribuicao.docentes]);
    const turma = turmasAtivas.get(atribuicao.id_disciplina);
    for (const nome of atribuicao.docentes) {
      assigned.add(cellKey(nome, atribuicao.id_disciplina));
      const lista = assignedByDocente.get(nome);
      if (lista) lista.push(atribuicao.id_disciplina);
      else assignedByDocente.set(nome, [atribuicao.id_disciplina]);
      if (turma) {
        cargaByDocente.set(
          nome,
          (cargaByDocente.get(nome) ?? 0) + (turma.carga ?? 1),
        );
      }
    }
  }

  const cellLocked = new Set<string>();
  const rowLocked = new Set<string>();
  const colLocked = new Set<string>();
  for (const trava of travas) {
    if (trava.id_disciplina !== undefined && trava.nome_docente !== undefined) {
      cellLocked.add(cellKey(trava.nome_docente, trava.id_disciplina));
    }
    if (trava.tipo_trava === TipoTrava.Row && trava.nome_docente !== undefined) {
      rowLocked.add(trava.nome_docente);
    }
    if (
      trava.tipo_trava === TipoTrava.Column &&
      trava.id_disciplina !== undefined
    ) {
      colLocked.add(trava.id_disciplina);
    }
  }

  const conflictDocentes = computeConflictDocentes(atribuicoes, disciplinas);

  let turmasSemDocente = 0;
  turmasAtivas.forEach((_, id) => {
    if (!assignedByTurma.has(id)) turmasSemDocente++;
  });
  let docentesSemAtribuicao = 0;
  docentesAtivos.forEach((nome) => {
    if (!assignedByDocente.has(nome)) docentesSemAtribuicao++;
  });
  // Células travadas visíveis (docente e turma ativos), não o total bruto de travas
  let travasAtivas = 0;
  cellLocked.forEach((key) => {
    const [nome, id] = key.split(CELL_KEY_SEP);
    if (docentesAtivos.has(nome) && turmasAtivas.has(id)) travasAtivas++;
  });
  let conflitos = 0;
  conflictDocentes.forEach((nome) => {
    if (docentesAtivos.has(nome)) conflitos++;
  });

  return {
    priority,
    assigned,
    cellLocked,
    rowLocked,
    colLocked,
    assignedByTurma,
    assignedByDocente,
    cargaByDocente,
    conflictDocentes,
    maxPriority,
    stats: {
      turmasSemDocente,
      docentesSemAtribuicao,
      conflitos,
      travas: travasAtivas,
    },
  };
}

export function getCellState(
  model: GridModel,
  nome_docente: string,
  id_disciplina: string,
): CellState {
  const key = cellKey(nome_docente, id_disciplina);
  const locked = model.cellLocked.has(key);
  const assigned = model.assigned.has(key);
  if (locked) return assigned ? "lockedAssigned" : "locked";
  if (assigned) return "assigned";
  return model.priority.get(key) ? "pref" : "empty";
}
