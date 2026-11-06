import {
  compareByDirection,
  EVALUATION_DIRECTION,
  PRIORITY_DIRECTION,
  type MetricDirection,
} from "@/app/[locale]/history/model/solutionSummary";
import {
  EMPTY_VALUE,
  formatDuration,
  formatEvaluation,
} from "@/app/[locale]/history/model/format";
import type { Comparison, Side } from "./comparison";

export type MetricFormat =
  | "integer"
  | "decimal1"
  | "decimal2"
  | "evaluation"
  | "duration"
  | "coverage";

/** Para onde leva o clique na linha do placar. */
export type MetricTarget =
  | { tab: "changes" }
  | { tab: "docentes"; filter: "conflict" | "unassigned" }
  | { tab: "dist" }
  | { tab: "config" };

export type MetricId =
  | "avaliacao"
  | "cobertura"
  | "pares"
  | "docentesUnicos"
  | "semAtribuicao"
  | "conflitos"
  | "semFormulario"
  | "prioMedia"
  | "cargaDesvio"
  | "travas"
  | "iteracoes"
  | "tempo";

export interface MetricDef {
  id: MetricId;
  get: (c: Comparison, side: Side) => number | undefined;
  /** Define cor e ícone do Δ. */
  direction: MetricDirection;
  format: MetricFormat;
  /** Mostra variação % quando A existe e é diferente de 0. */
  percent?: boolean;
  target?: MetricTarget;
}

const pick = <T>(side: Side, a: T, b: T) => (side === "a" ? a : b);
const nn = (v: number | null | undefined) => (v === null ? undefined : v);

export const METRICS: MetricDef[] = [
  {
    id: "avaliacao",
    get: (c, s) => pick(s, c.a, c.b).avaliacao,
    direction: EVALUATION_DIRECTION,
    format: "evaluation",
    percent: true,
    target: { tab: "config" },
  },
  {
    id: "cobertura",
    get: (c, s) => pick(s, c.a, c.b).turmasAtendidas,
    direction: "higher",
    format: "coverage",
    target: { tab: "changes" },
  },
  {
    id: "pares",
    get: (c, s) => pick(s, c.statsA, c.statsB).pares,
    direction: "neutral",
    format: "integer",
    percent: true,
    target: { tab: "changes" },
  },
  {
    id: "docentesUnicos",
    get: (c, s) => pick(s, c.statsA, c.statsB).docentesUnicos,
    direction: "neutral",
    format: "integer",
  },
  {
    id: "semAtribuicao",
    get: (c, s) => pick(s, c.a, c.b).docentesSemAtribuicao,
    direction: "lower",
    format: "integer",
    target: { tab: "docentes", filter: "unassigned" },
  },
  {
    id: "conflitos",
    get: (c, s) => pick(s, c.a, c.b).conflitos,
    direction: "lower",
    format: "integer",
    target: { tab: "docentes", filter: "conflict" },
  },
  {
    id: "semFormulario",
    get: (c, s) => pick(s, c.a, c.b).semFormulario,
    direction: "lower",
    format: "integer",
    target: { tab: "changes" },
  },
  {
    id: "prioMedia",
    get: (c, s) => nn(pick(s, c.statsA, c.statsB).prioMedia),
    direction: PRIORITY_DIRECTION,
    format: "decimal1",
    target: { tab: "dist" },
  },
  {
    id: "cargaDesvio",
    get: (c, s) => nn(pick(s, c.statsA, c.statsB).cargaDesvio),
    direction: "lower",
    format: "decimal2",
    target: { tab: "dist" },
  },
  {
    id: "travas",
    get: (c, s) => pick(s, c.a, c.b).travas,
    direction: "neutral",
    format: "integer",
  },
  {
    id: "iteracoes",
    get: (c, s) => pick(s, c.a, c.b).iteracoes,
    // Mais ou menos iterações não diz nada sobre a qualidade
    direction: "neutral",
    format: "integer",
    percent: true,
  },
  {
    id: "tempo",
    get: (c, s) => pick(s, c.a, c.b).tempoExecucaoMs,
    direction: "neutral",
    format: "duration",
    percent: true,
  },
];

export interface MetricDelta {
  /** B − A; ausente se faltar um dos lados. */
  delta?: number;
  /** Variação relativa; ausente quando A é 0 ou não existe (nada de "∞%"). */
  percent?: number;
  /** 1 = B melhor, -1 = B pior, 0 = igual ou neutro. */
  verdict: -1 | 0 | 1;
}

export function metricDelta(
  def: MetricDef,
  a: number | undefined,
  b: number | undefined,
): MetricDelta {
  if (a === undefined || b === undefined) return { verdict: 0 };
  const delta = b - a;
  const percent =
    def.percent && a !== 0 ? (delta / Math.abs(a)) * 100 : undefined;
  return { delta, percent, verdict: compareByDirection(a, b, def.direction) };
}

export function formatNumber(
  value: number,
  locale: string,
  digits: number,
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Valor de uma métrica no locale ativo. Ausente vira "—", nunca 0. */
export function formatMetric(
  format: MetricFormat,
  value: number | undefined,
  locale: string,
  total?: number,
): string {
  if (value === undefined || !Number.isFinite(value)) return EMPTY_VALUE;
  switch (format) {
    case "evaluation":
      return formatEvaluation(value, locale);
    case "duration":
      return formatDuration(value, locale);
    case "decimal1":
      return formatNumber(value, locale, 1);
    case "decimal2":
      return formatNumber(value, locale, 2);
    case "coverage":
      return total !== undefined
        ? `${formatNumber(value, locale, 0)}/${formatNumber(total, locale, 0)}`
        : formatNumber(value, locale, 0);
    default:
      return formatNumber(value, locale, 0);
  }
}

/** Δ com sinal ("+5,53", "−2", "="). Duração usa o formato de duração com sinal. */
export function formatDelta(
  format: MetricFormat,
  delta: number | undefined,
  locale: string,
): string {
  if (delta === undefined || !Number.isFinite(delta)) return EMPTY_VALUE;
  if (Math.abs(delta) < 1e-9) return "=";
  const sign = delta > 0 ? "+" : "−";
  const abs = Math.abs(delta);
  const body =
    format === "duration"
      ? formatDuration(abs, locale)
      : formatMetric(format === "coverage" ? "integer" : format, abs, locale);
  return `${sign}${body}`;
}

export function formatPercent(
  percent: number | undefined,
  locale: string,
): string | undefined {
  if (percent === undefined || !Number.isFinite(percent)) return undefined;
  const text = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(percent);
  // Mesmo sinal de menos tipográfico do Δ
  return `${text.replace(/^-/, "−")}%`;
}
