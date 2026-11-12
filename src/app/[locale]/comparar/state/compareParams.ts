import type { HistoricoSolucao } from "@/context/Global/utils";
import {
  chronologicalKey,
  entryCreatedAt,
} from "@/app/[locale]/history/model/sort";
import {
  parseEntityRef,
  type EntityRef,
} from "@/app/[locale]/history/state/detailNavigation";

export const COMPARE_TABS = [
  "overview",
  "changes",
  "docentes",
  "dist",
  "config",
] as const;
export type CompareTab = (typeof COMPARE_TABS)[number];

export interface RawCompareParams {
  a: string | null;
  b: string | null;
  /** Link legado do histórico: `?ids=a,b[,c…]`. */
  ids: string | null;
  tab: string | null;
  ent: string | null;
}

export interface ResolvedCompareParams {
  a: string | null;
  b: string | null;
  /** Ids pedidos na URL que não existem no histórico (aviso, sem substituição silenciosa). */
  missing: string[];
  /** Ids além dos dois primeiros no link legado (só 2 são comparados). */
  ignored: string[];
  tab: CompareTab;
  ent: EntityRef | null;
  /** Mudanças a gravar na URL com `replace` (conversão de `?ids=`, padrão de A). `null` = nada. */
  changes: Record<string, string | null> | null;
}

function splitIds(raw: string | null): string[] {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Solução mais recente pela data do id (`datetime` é texto local e não serve para ordenar). */
export function mostRecentId(
  history: Map<string, HistoricoSolucao>,
): string | null {
  let best: string | null = null;
  let bestKey = -Infinity;
  let order = 0;
  history.forEach((entry, key) => {
    const k = chronologicalKey(entryCreatedAt(entry, key), order++);
    if (k > bestKey) {
      bestKey = k;
      best = key;
    }
  });
  return best;
}

/** Padrão de A: a solução atual, se estiver no histórico; senão, a mais recente. */
export function defaultA(
  history: Map<string, HistoricoSolucao>,
  currentId: string | undefined,
): string | null {
  if (currentId && history.has(currentId)) return currentId;
  return mostRecentId(history);
}

/**
 * Resolve a URL contra o histórico atual. Roda a cada mudança do histórico, então um link aberto
 * antes da hidratação passa a valer assim que as entradas chegam.
 */
export function resolveCompareParams(
  raw: RawCompareParams,
  history: Map<string, HistoricoSolucao>,
  currentId: string | undefined,
): ResolvedCompareParams {
  const changes: Record<string, string | null> = {};
  let aId = raw.a;
  let bId = raw.b;
  let ignored: string[] = [];

  if (raw.ids !== null) {
    const ids = [...new Set(splitIds(raw.ids))];
    if (aId === null && bId === null) {
      aId = ids[0] ?? null;
      bId = ids[1] ?? null;
      ignored = ids.slice(2);
    }
    changes.ids = null;
    changes.a = aId;
    changes.b = bId;
  }

  const missing: string[] = [];
  let a: string | null = null;
  if (aId !== null) {
    if (history.has(aId)) a = aId;
    else missing.push(aId);
  } else if (history.size > 0) {
    a = defaultA(history, currentId);
    if (a) changes.a = a;
  }

  let b: string | null = null;
  if (bId !== null) {
    if (history.has(bId)) b = bId;
    else missing.push(bId);
  }
  if (a !== null && a === b) {
    b = null;
    changes.b = null;
  }

  const tab = (COMPARE_TABS as readonly string[]).includes(raw.tab ?? "")
    ? (raw.tab as CompareTab)
    : "overview";

  return {
    a,
    b,
    missing,
    ignored,
    tab,
    ent: parseEntityRef(raw.ent),
    changes: Object.keys(changes).length > 0 ? changes : null,
  };
}
