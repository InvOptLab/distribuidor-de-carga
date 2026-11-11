import type { HistoricoSolucao } from "@/context/Global/utils";
import {
  pairKey,
  type SolutionDetail,
} from "@/app/[locale]/history/model/solutionDetail";

/* ---------------------------------- Prioridades ---------------------------------- */

export interface PriorityDistribution {
  /** Prioridades de 1 até `maxPriority` (sem a barra 0). */
  priorities: number[];
  a: number[];
  b: number[];
  /** Atribuições sem formulário, em barra separada (antes eram descartadas em silêncio). */
  semFormularioA: number;
  semFormularioB: number;
  /** Média ponderada só dos pares com formulário. */
  meanA: number | null;
  meanB: number | null;
  totalA: number;
  totalB: number;
}

function countPriorities(detail: SolutionDetail, size: number) {
  const counts = new Array<number>(size).fill(0);
  let sem = 0;
  let sum = 0;
  let n = 0;
  for (const atribuicao of detail.atribuicoes) {
    for (const nome of atribuicao.docentes) {
      const p = detail.prioridade.get(pairKey(nome, atribuicao.id_disciplina));
      if (p === undefined) {
        sem++;
        continue;
      }
      if (p >= 1 && p <= size) counts[p - 1]++;
      sum += p;
      n++;
    }
  }
  return { counts, sem, mean: n > 0 ? sum / n : null, total: n };
}

function observedMax(detail: SolutionDetail): number {
  let max = 0;
  detail.prioridade.forEach((p) => {
    if (p > max) max = p;
  });
  return max;
}

export function priorityDistribution(
  a: SolutionDetail,
  b: SolutionDetail,
): PriorityDistribution {
  const size = Math.max(
    a.maxPriority,
    b.maxPriority,
    observedMax(a),
    observedMax(b),
    1,
  );
  const ca = countPriorities(a, size);
  const cb = countPriorities(b, size);
  return {
    priorities: Array.from({ length: size }, (_, i) => i + 1),
    a: ca.counts,
    b: cb.counts,
    semFormularioA: ca.sem,
    semFormularioB: cb.sem,
    meanA: ca.mean,
    meanB: cb.mean,
    totalA: ca.total,
    totalB: cb.total,
  };
}

/* ------------------------------------ Carga ------------------------------------ */

/** Faixas da legenda (as mesmas de antes): 0, até 2, até 4, até 6, acima de 6. */
export const WORKLOAD_BANDS = [0, 2, 4, 6, Infinity] as const;

export function workloadBand(carga: number): number {
  if (carga <= 0) return 0;
  if (carga <= 2) return 1;
  if (carga <= 4) return 2;
  if (carga <= 6) return 3;
  return 4;
}

export interface WorkloadRow {
  /** Carga arredondada para 2 casas. */
  carga: number;
  a: number;
  b: number;
}

export function roundCarga(carga: number): number {
  return Math.round(carga * 100) / 100;
}

/** Histograma de docentes ativos por carga, cada lado no seu contexto. */
export function workloadHistogram(
  a: SolutionDetail,
  b: SolutionDetail,
): WorkloadRow[] {
  const rows = new Map<number, WorkloadRow>();
  const add = (detail: SolutionDetail, side: "a" | "b") => {
    detail.docentes.forEach((d) => {
      const carga = roundCarga(d.carga);
      let row = rows.get(carga);
      if (!row) {
        row = { carga, a: 0, b: 0 };
        rows.set(carga, row);
      }
      row[side]++;
    });
  };
  add(a, "a");
  add(b, "b");
  return [...rows.values()].sort((x, y) => x.carga - y.carga);
}

/* ---------------------------------- Violações ---------------------------------- */

/**
 * `qtdOcorrenciasRestricoes` é indexado pelo nome **traduzido** da restrição. Para casar soluções
 * salvas em idiomas diferentes, os rótulos conhecidos são mapeados para a chave estável
 * `_name` (a mesma de `serializeComponentMap`). Chaves desconhecidas ficam como estão.
 */
const LABEL_TO_STABLE: Record<string, string> = {
  "Atribuição sem formulário": "AtribuicaoSemFormulario",
  "Assignment without forms": "AtribuicaoSemFormulario",
  "Validar Travas": "ValidaTravas",
  "Validate Locks": "ValidaTravas",
  "Turma sem docente": "DisciplinaSemDocente",
  "Class without teacher": "DisciplinaSemDocente",
  "Conflito de horário": "ChoqueDeHorarios",
  "Schedule conflict": "ChoqueDeHorarios",
  "Carga Didática Mínima": "CargaDeTrabalhoMinimaDocente",
  "Minimum Teaching Load": "CargaDeTrabalhoMinimaDocente",
  "Carga Didática Máxima": "CargaDeTrabalhoMaximaDocente",
  "Maximum Teaching Load": "CargaDeTrabalhoMaximaDocente",
  "Carga de Trabalho Mínima (Contínua)": "CargaDeTrabalhoMinimaDocenteContinua",
  // Restrição legada que agrupava a carga: só os 2 primeiros grupos são violações
  "Carga Didática": "CargaDidatica",
  "Teaching Load": "CargaDidatica",
};

/** Chaves cujas ocorrências trazem, depois dos 2 primeiros itens, a distribuição de carga. */
const GROUPED_KEYS = new Set(["CargaDidatica"]);

export function stableConstraintKey(key: string): string {
  return LABEL_TO_STABLE[key] ?? key;
}

export interface ViolationRow {
  key: string;
  /** Rótulo gravado (de B, com fallback para A). */
  label: string;
  a: number;
  b: number;
}

export interface ViolationsComparison {
  rows: ViolationRow[];
  totalA: number;
  totalB: number;
  /** Alguma das soluções tem estatísticas de restrições. */
  hasDataA: boolean;
  hasDataB: boolean;
}

type Occurrences = NonNullable<
  NonNullable<
    HistoricoSolucao["solucao"]["estatisticas"]
  >["qtdOcorrenciasRestricoes"]
>;

function toEntries(raw: unknown): [string, { qtd: number }[]][] {
  if (!raw) return [];
  if (raw instanceof Map) return [...(raw as Occurrences).entries()];
  // Dado legado serializado sem o reviver: objeto ou lista de pares
  if (Array.isArray(raw)) return raw as [string, { qtd: number }[]][];
  if (typeof raw === "object")
    return Object.entries(raw as Record<string, { qtd: number }[]>);
  return [];
}

function violationTotals(entry: HistoricoSolucao) {
  const out = new Map<string, { label: string; total: number }>();
  for (const [label, list] of toEntries(
    entry.solucao?.estatisticas?.qtdOcorrenciasRestricoes,
  )) {
    const key = stableConstraintKey(label);
    const items = Array.isArray(list)
      ? GROUPED_KEYS.has(key)
        ? list.slice(0, 2)
        : list
      : [];
    const total = items.reduce((s, v) => s + (Number(v?.qtd) || 0), 0);
    const prev = out.get(key);
    out.set(key, { label, total: (prev?.total ?? 0) + total });
  }
  return out;
}

export function violationsComparison(
  a: HistoricoSolucao,
  b: HistoricoSolucao,
): ViolationsComparison {
  const va = violationTotals(a);
  const vb = violationTotals(b);
  const keys = new Set([...va.keys(), ...vb.keys()]);
  const rows: ViolationRow[] = [];
  let totalA = 0;
  let totalB = 0;
  keys.forEach((key) => {
    const ra = va.get(key);
    const rb = vb.get(key);
    const row = {
      key,
      label: rb?.label ?? ra!.label,
      a: ra?.total ?? 0,
      b: rb?.total ?? 0,
    };
    totalA += row.a;
    totalB += row.b;
    rows.push(row);
  });
  return { rows, totalA, totalB, hasDataA: va.size > 0, hasDataB: vb.size > 0 };
}
