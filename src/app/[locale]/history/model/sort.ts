import type { HistoricoSolucao } from "@/context/Global/utils";

/** Formato do id gerado por `getFormattedDate` (+ sufixo anti-colisão opcional `_2`, `_3`…). */
const ID_PATTERN = /^(\d{4})(\d{2})(\d{2})_(\d{2})_(\d{2})_(\d{2})(?:_(\d+))?$/;

/**
 * Converte o id (`YYYYMMDD_hh_mm_ss[_n]`) em Date, no fuso local (o mesmo usado para gerá-lo).
 * Devolve `undefined` para ids em outro formato (por exemplo, importados de outra ferramenta).
 */
export function parseHistoryId(id: string | undefined | null): Date | undefined {
  if (!id) return undefined;
  const match = ID_PATTERN.exec(id);
  if (!match) return undefined;
  const [, y, mo, d, h, mi, s] = match.map(Number);
  const date = new Date(y, mo - 1, d, h, mi, s);
  // Rejeita datas "roladas" (ex.: mês 13)
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== mo - 1 ||
    date.getDate() !== d
  ) {
    return undefined;
  }
  return date;
}

/** Sufixo anti-colisão do id (1 quando não houver). */
export function historyIdSequence(id: string): number {
  const match = ID_PATTERN.exec(id);
  return match?.[7] ? Number(match[7]) : 1;
}

/**
 * Data de criação da entrada: primeiro pelo id; se não der, tenta o `datetime` gravado
 * (que está no locale de quem gravou e só é confiável quando é ISO ou similar).
 */
export function entryCreatedAt(
  entry: Pick<HistoricoSolucao, "id" | "datetime">,
  key?: string,
): Date | undefined {
  const fromId = parseHistoryId(key ?? entry.id) ?? parseHistoryId(entry.id);
  if (fromId) return fromId;
  if (entry.datetime) {
    const parsed = Date.parse(entry.datetime);
    if (Number.isFinite(parsed)) return new Date(parsed);
  }
  return undefined;
}

/**
 * Chave numérica de ordenação cronológica. Entradas sem data ficam no começo (mais antigas),
 * e a ordem de inserção do Map desempata (inclusive ids com sufixo no mesmo segundo).
 */
export function chronologicalKey(createdAt: Date | undefined, order: number): number {
  return (createdAt ? createdAt.getTime() : 0) * 1000 + order;
}

/** Gera um id livre a partir de `base`, acrescentando `_2`, `_3`… só quando houver colisão. */
export function nextFreeHistoryId(base: string, taken: (id: string) => boolean): string {
  if (!taken(base)) return base;
  let n = 2;
  while (taken(`${base}_${n}`)) n++;
  return `${base}_${n}`;
}
