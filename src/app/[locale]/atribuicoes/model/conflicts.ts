import type {
  Atribuicao,
  Disciplina,
} from "@/algoritmo/communs/interfaces/interfaces";

/** Aceita `conflitos` como Set (formato atual) ou array (dado legado/serializado sem reviver). */
function choca(turma: Disciplina, outraId: string): boolean {
  const conflitos = turma.conflitos as Set<string> | string[] | undefined;
  if (!conflitos) return false;
  if (conflitos instanceof Set) return conflitos.has(outraId);
  return Array.isArray(conflitos) && conflitos.includes(outraId);
}

/**
 * Pares de turmas em choque de horário, por docente: docente → turma → turmas com que ela choca.
 * Mesma semântica de `computeConflictDocentes`: só entre as turmas ATIVAS atribuídas ao docente.
 * Docentes sem conflito não aparecem no Map.
 */
export function computeConflictPairs(
  atribuicoes: Atribuicao[],
  disciplinas: Disciplina[],
): Map<string, Map<string, string[]>> {
  const turmasAtivas = new Map<string, Disciplina>();
  for (const disciplina of disciplinas) {
    if (disciplina.ativo) turmasAtivas.set(disciplina.id, disciplina);
  }

  const turmasByDocente = new Map<string, Disciplina[]>();
  for (const atribuicao of atribuicoes) {
    const turma = turmasAtivas.get(atribuicao.id_disciplina);
    if (!turma) continue;
    for (const nome of atribuicao.docentes) {
      const lista = turmasByDocente.get(nome);
      if (lista) lista.push(turma);
      else turmasByDocente.set(nome, [turma]);
    }
  }

  const result = new Map<string, Map<string, string[]>>();
  const link = (pares: Map<string, string[]>, a: string, b: string) => {
    const lista = pares.get(a);
    if (!lista) pares.set(a, [b]);
    else if (!lista.includes(b)) lista.push(b);
  };
  turmasByDocente.forEach((turmas, nome) => {
    let pares: Map<string, string[]> | undefined;
    for (let i = 0; i < turmas.length; i++) {
      for (let j = i + 1; j < turmas.length; j++) {
        const a = turmas[i];
        const b = turmas[j];
        if (a.id === b.id) continue;
        if (choca(a, b.id) || choca(b, a.id)) {
          pares ??= new Map();
          link(pares, a.id, b.id);
          link(pares, b.id, a.id);
        }
      }
    }
    if (pares) result.set(nome, pares);
  });
  return result;
}

/**
 * Docentes com choque de horário entre turmas atribuídas.
 * Considera TODAS as turmas ativas, não só as filtradas.
 */
export function computeConflictDocentes(
  atribuicoes: Atribuicao[],
  disciplinas: Disciplina[],
): Set<string> {
  const turmasAtivas = new Map<string, Disciplina>();
  for (const disciplina of disciplinas) {
    if (disciplina.ativo) turmasAtivas.set(disciplina.id, disciplina);
  }

  const turmasByDocente = new Map<string, Disciplina[]>();
  for (const atribuicao of atribuicoes) {
    const turma = turmasAtivas.get(atribuicao.id_disciplina);
    if (!turma) continue;
    for (const nome of atribuicao.docentes) {
      const lista = turmasByDocente.get(nome);
      if (lista) lista.push(turma);
      else turmasByDocente.set(nome, [turma]);
    }
  }

  const conflitos = new Set<string>();
  turmasByDocente.forEach((turmas, nome) => {
    for (let i = 0; i < turmas.length && !conflitos.has(nome); i++) {
      for (let j = i + 1; j < turmas.length; j++) {
        if (turmas[i].conflitos?.has(turmas[j].id)) {
          conflitos.add(nome);
          break;
        }
      }
    }
  });
  return conflitos;
}
