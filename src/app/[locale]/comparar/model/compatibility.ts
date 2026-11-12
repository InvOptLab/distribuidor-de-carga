import type { SolutionDetail } from "@/app/[locale]/history/model/solutionDetail";
import { pairKey } from "@/app/[locale]/history/model/solutionDetail";

export interface FormDifference {
  docente: string;
  turma: string;
  /** Prioridade em cada contexto; `null` quando não há formulário daquele lado. */
  a: number | null;
  b: number | null;
}

export interface Compatibility {
  turmasSoA: string[];
  turmasSoB: string[];
  docentesSoA: string[];
  docentesSoB: string[];
  /** Pares (docente, turma) presentes nos dois contextos com prioridade diferente. */
  formulariosDiferentes: FormDifference[];
  maxPriorityA: number;
  maxPriorityB: number;
  /** Nenhuma diferença: os dois lados usam os mesmos dados. */
  identical: boolean;
}

function onlyIn<T>(a: Map<string, T>, b: Map<string, T>): string[] {
  const out: string[] = [];
  a.forEach((_, key) => {
    if (!b.has(key)) out.push(key);
  });
  return out;
}

/**
 * Compara os contextos das duas soluções. Cada métrica da tela usa o contexto da própria
 * solução; isto só aponta onde os dados diferem para que a comparação não fique errada em silêncio.
 */
export function buildCompatibility(
  a: SolutionDetail,
  b: SolutionDetail,
): Compatibility {
  const turmasSoA = onlyIn(a.turmas, b.turmas);
  const turmasSoB = onlyIn(b.turmas, a.turmas);
  const docentesSoA = onlyIn(a.docentes, b.docentes);
  const docentesSoB = onlyIn(b.docentes, a.docentes);

  const formulariosDiferentes: FormDifference[] = [];
  const vistos = new Set<string>();
  const check = (docente: string, turma: string) => {
    const key = pairKey(docente, turma);
    if (vistos.has(key)) return;
    vistos.add(key);
    // Só faz sentido comparar quando o docente e a turma existem dos dois lados
    if (!a.docentes.has(docente) || !b.docentes.has(docente)) return;
    if (!a.turmas.has(turma) || !b.turmas.has(turma)) return;
    const pa = a.prioridade.get(key) ?? null;
    const pb = b.prioridade.get(key) ?? null;
    if (pa !== pb) formulariosDiferentes.push({ docente, turma, a: pa, b: pb });
  };
  for (const f of a.formularios) check(f.nome_docente, f.id_disciplina);
  for (const f of b.formularios) check(f.nome_docente, f.id_disciplina);

  const identical =
    turmasSoA.length === 0 &&
    turmasSoB.length === 0 &&
    docentesSoA.length === 0 &&
    docentesSoB.length === 0 &&
    formulariosDiferentes.length === 0 &&
    a.maxPriority === b.maxPriority;

  return {
    turmasSoA,
    turmasSoB,
    docentesSoA,
    docentesSoB,
    formulariosDiferentes,
    maxPriorityA: a.maxPriority,
    maxPriorityB: b.maxPriority,
    identical,
  };
}
