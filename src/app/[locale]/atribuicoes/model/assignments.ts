import type {
  Atribuicao,
  Celula,
  Disciplina,
  Docente,
} from "@/algoritmo/communs/interfaces/interfaces";

export function isAssigned(
  atribuicoes: Atribuicao[],
  nome_docente: string,
  id_disciplina: string,
): boolean {
  return atribuicoes.some(
    (atribuicao) =>
      atribuicao.id_disciplina === id_disciplina &&
      atribuicao.docentes.includes(nome_docente),
  );
}

/**
 * Garante a presença (ou ausência) do docente na atribuição da turma.
 * Idempotente, para poder ser usada como updater funcional sobre o estado mais recente.
 * Retorna a lista nova e a atribuição alterada (para broadcast), ou `changed: null` se nada mudou.
 */
export function setAssignment(
  atribuicoes: Atribuicao[],
  nome_docente: string,
  id_disciplina: string,
  assigned: boolean,
): { atribuicoes: Atribuicao[]; changed: Atribuicao | null } {
  const index = atribuicoes.findIndex((a) => a.id_disciplina === id_disciplina);
  const current = index !== -1 ? atribuicoes[index] : undefined;
  const has = !!current?.docentes.includes(nome_docente);

  if (has === assigned) return { atribuicoes, changed: null };

  if (assigned) {
    if (!current) {
      const nova = { id_disciplina, docentes: [nome_docente] };
      return { atribuicoes: [...atribuicoes, nova], changed: nova };
    }
    const updated = {
      ...current,
      docentes: [...current.docentes, nome_docente],
    };
    const next = [...atribuicoes];
    next[index] = updated;
    return { atribuicoes: next, changed: updated };
  }

  const updated = {
    ...current,
    docentes: current.docentes.filter((docente) => docente != nome_docente),
  };
  const next = [...atribuicoes];
  next[index] = updated;
  return { atribuicoes: next, changed: updated };
}

/**
 * Alterna o docente na turma. Vários docentes por turma são permitidos.
 */
export function toggleAssignment(
  atribuicoes: Atribuicao[],
  nome_docente: string,
  id_disciplina: string,
) {
  return setAssignment(
    atribuicoes,
    nome_docente,
    id_disciplina,
    !isAssigned(atribuicoes, nome_docente, id_disciplina),
  );
}

/**
 * Limpa as atribuições:
 * - turmas ativas mantêm apenas docentes travados naquela célula (qualquer tipo de trava) ou inativos;
 * - turmas inativas ficam intocadas (decisão: não remover docentes de turmas inativas).
 */
export function clearAssignments(
  atribuicoes: Atribuicao[],
  travas: Celula[],
  docentes: Docente[],
  disciplinas: Disciplina[],
): Atribuicao[] {
  const docentesAtivos = new Set(
    docentes.filter((d) => d.ativo).map((d) => d.nome),
  );
  const turmasAtivas = new Set(
    disciplinas.filter((d) => d.ativo).map((d) => d.id),
  );
  const travadas = new Set(
    travas
      .filter(
        (t) => t.id_disciplina !== undefined && t.nome_docente !== undefined,
      )
      .map((t) => `${t.id_disciplina}\u001f${t.nome_docente}`),
  );

  return atribuicoes.map((atribuicao) => {
    if (!turmasAtivas.has(atribuicao.id_disciplina)) {
      return { ...atribuicao, docentes: [...atribuicao.docentes] };
    }
    return {
      ...atribuicao,
      docentes: atribuicao.docentes.filter(
        (d) =>
          travadas.has(`${atribuicao.id_disciplina}\u001f${d}`) ||
          !docentesAtivos.has(d),
      ),
    };
  });
}
