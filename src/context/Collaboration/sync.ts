import type { Atribuicao } from "@/algoritmo/communs/interfaces/interfaces";

/**
 * Mudança pontual de uma turma na sala colaborativa. Em vez de enviar a lista
 * inteira de docentes (o que fazia a última mensagem apagar edições
 * simultâneas de outra pessoa na mesma turma), envia só quem entrou e quem saiu.
 * Aplicar deltas sobre docentes diferentes é comutativo, então todos convergem.
 */
export interface AssignmentDelta {
  id_disciplina: string;
  add: string[];
  remove: string[];
}

/** Formato antigo (lista inteira), aceito para compatibilidade entre versões. */
interface LegacyAssignment {
  id_disciplina: string;
  docentes: string[];
}

export function diffDocentes(
  id_disciplina: string,
  prev: string[] = [],
  next: string[] = [],
): AssignmentDelta {
  return {
    id_disciplina,
    add: next.filter((d) => !prev.includes(d)),
    remove: prev.filter((d) => !next.includes(d)),
  };
}

export function isEmptyDelta(delta: AssignmentDelta): boolean {
  return delta.add.length === 0 && delta.remove.length === 0;
}

/**
 * Aplica um delta (ou uma atribuição no formato antigo) sobre as atribuições.
 * Devolve o mesmo array quando nada muda.
 */
export function applyAssignmentDelta(
  atribuicoes: Atribuicao[],
  change: AssignmentDelta | LegacyAssignment,
): Atribuicao[] {
  const index = atribuicoes.findIndex(
    (a) => a.id_disciplina === change.id_disciplina,
  );
  const atual = index === -1 ? [] : atribuicoes[index].docentes;

  let docentes: string[];
  if ("docentes" in change) {
    docentes = [...change.docentes];
  } else {
    docentes = atual.filter((d) => !change.remove.includes(d));
    for (const d of change.add) if (!docentes.includes(d)) docentes.push(d);
  }

  if (
    index !== -1 &&
    docentes.length === atual.length &&
    docentes.every((d, i) => d === atual[i])
  ) {
    return atribuicoes;
  }

  const record: Atribuicao = { id_disciplina: change.id_disciplina, docentes };
  if (index === -1) return [...atribuicoes, record];
  const next = [...atribuicoes];
  next[index] = { ...atribuicoes[index], docentes };
  return next;
}
