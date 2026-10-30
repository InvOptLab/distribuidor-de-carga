import type {
  Atribuicao,
  Disciplina,
} from "@/algoritmo/communs/interfaces/interfaces";

/**
 * Docentes com choque de horário entre turmas atribuídas (B12).
 * Considera TODAS as turmas ativas, não só as filtradas (D9).
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
