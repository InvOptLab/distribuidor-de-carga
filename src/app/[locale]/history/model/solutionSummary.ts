import { TipoInsercao, type HistoricoSolucao } from "@/context/Global/utils";
import type { SolutionDetail } from "./solutionDetail";
import { entryCreatedAt } from "./sort";

/** Algoritmos com nome traduzido em `Pages.History.algorithms.*`. */
export const KNOWN_ALGORITHMS = [
  "tabu-search",
  "simulated-annealing",
  "integer-solver",
  "manual-insert",
] as const;
export type KnownAlgorithm = (typeof KNOWN_ALGORITHMS)[number];

export interface SolutionSummary {
  id: string;
  createdAt?: Date;
  origin: TipoInsercao;
  /** Chave conhecida (traduzível) do algoritmo, quando houver. */
  algorithmKey?: KnownAlgorithm;
  /** Nome cru do algoritmo, para os desconhecidos. */
  algorithmName?: string;
  avaliacao?: number;
  turmasAtivas: number;
  turmasAtendidas: number;
  docentesAtivos: number;
  docentesSemAtribuicao: number;
  conflitos: number;
  semFormulario: number;
  travas: number;
  tempoExecucaoMs?: number;
  iteracoes?: number;
}

/** Nome do algoritmo da entrada: instância (ou objeto serializado) ou string (importação legada). */
export function algorithmNameOf(entry: HistoricoSolucao): string | undefined {
  const candidates: unknown[] = [entry.solucao?.algorithm, entry.algorithm];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
    if (candidate && typeof candidate === "object") {
      const name = (candidate as { name?: unknown }).name;
      if (typeof name === "string" && name.trim()) return name;
    }
  }
  return undefined;
}

export function normalizeOrigin(value: unknown): TipoInsercao {
  if (
    value === TipoInsercao.Algoritmo ||
    value === TipoInsercao.Manual ||
    value === TipoInsercao.Importação
  ) {
    return value;
  }
  return TipoInsercao.Manual;
}

function finite(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

/** Métricas da linha da lista, derivadas do detalhe (mesmos números nos dois lugares). */
export function buildSolutionSummary(
  entry: HistoricoSolucao,
  detail: SolutionDetail,
  key?: string,
): SolutionSummary {
  const name = algorithmNameOf(entry);
  const algorithmKey = (KNOWN_ALGORITHMS as readonly string[]).includes(
    name ?? "",
  )
    ? (name as KnownAlgorithm)
    : undefined;

  let turmasAtendidas = 0;
  detail.turmas.forEach((t) => {
    if (t.docentes.length > 0) turmasAtendidas++;
  });
  let docentesSemAtribuicao = 0;
  let conflitos = 0;
  detail.docentes.forEach((d) => {
    if (d.turmas.length === 0) docentesSemAtribuicao++;
    if (d.conflitos.size > 0) conflitos++;
  });

  const estatisticas = entry.solucao?.estatisticas;
  const tempo = finite(estatisticas?.tempoExecucao);
  const iteracoes = finite(estatisticas?.iteracoes);

  return {
    id: key ?? entry.id,
    createdAt: entryCreatedAt(entry, key),
    origin: normalizeOrigin(entry.tipoInsercao),
    algorithmKey,
    algorithmName: algorithmKey ? undefined : name,
    avaliacao: finite(entry.solucao?.avaliacao),
    turmasAtivas: detail.turmas.size,
    turmasAtendidas,
    docentesAtivos: detail.docentes.size,
    docentesSemAtribuicao,
    conflitos,
    semFormulario: detail.semFormulario,
    travas: detail.travas,
    tempoExecucaoMs: tempo && tempo > 0 ? tempo : undefined,
    iteracoes: iteracoes && iteracoes > 0 ? iteracoes : undefined,
  };
}

/** Direção de "melhor" de uma métrica: define a cor e o ícone do Δ. */
export type MetricDirection = "higher" | "lower" | "neutral";

/**
 * Fonte única de direção, compartilhada por histórico, comparação e grade.
 * - Avaliação: maximização (o código passa "max" para todos os métodos).
 * - Prioridade: 1 = mais preferida (rampa da grade e `PrioridadesDefault`), então menor é melhor.
 */
export const EVALUATION_DIRECTION: MetricDirection = "higher";
export const PRIORITY_DIRECTION: MetricDirection = "lower";

/** `b` é melhor (1), pior (-1) ou igual/indiferente (0) a `a`, segundo a direção. */
export function compareByDirection(
  a: number,
  b: number,
  direction: MetricDirection,
  epsilon = 1e-9,
): -1 | 0 | 1 {
  if (direction === "neutral" || Math.abs(b - a) <= epsilon) return 0;
  const higher = b > a;
  return (direction === "higher") === higher ? 1 : -1;
}

/** Melhor avaliação da lista, segundo `EVALUATION_DIRECTION`. */
export function bestEvaluation(
  summaries: Iterable<SolutionSummary>,
): number | undefined {
  let best: number | undefined;
  for (const s of summaries) {
    if (s.avaliacao === undefined) continue;
    if (
      best === undefined ||
      compareByDirection(best, s.avaliacao, EVALUATION_DIRECTION) > 0
    )
      best = s.avaliacao;
  }
  return best;
}
