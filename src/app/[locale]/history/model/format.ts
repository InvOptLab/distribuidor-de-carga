/** Traço usado quando não há valor. */
export const EMPTY_VALUE = "—";

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Saldo com sinal e uma casa decimal (`+1,5`, `-0,5`). Devolve "—" quando não houver valor.
 */
export function formatSaldo(
  saldo: number | undefined | null,
  locale = "pt-BR",
): string {
  if (!isNumber(saldo)) return EMPTY_VALUE;
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "always",
  }).format(saldo);
}

/** Avaliação com 2 casas no locale ativo. */
export function formatEvaluation(
  value: number | undefined | null,
  locale = "pt-BR",
): string {
  if (!isNumber(value)) return EMPTY_VALUE;
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Duração legível: "850 ms", "12 s", "2 min 5 s". */
export function formatDuration(
  ms: number | undefined | null,
  locale = "pt-BR",
): string {
  if (!isNumber(ms) || ms <= 0) return EMPTY_VALUE;
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const seconds = ms / 1000;
  if (seconds < 60)
    return `${nf.format(seconds < 10 ? Math.round(seconds * 10) / 10 : Math.round(seconds))} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds - minutes * 60);
  return rest > 0 ? `${minutes} min ${rest} s` : `${minutes} min`;
}

/** Data curta no locale ativo (lista) e completa (tooltip). */
export function formatShortDate(
  date: Date | undefined,
  locale = "pt-BR",
): string {
  if (!date) return EMPTY_VALUE;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatFullDate(
  date: Date | undefined,
  locale = "pt-BR",
): string {
  if (!date) return EMPTY_VALUE;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "medium",
  }).format(date);
}
