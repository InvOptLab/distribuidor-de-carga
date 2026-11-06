import type { HistoricoSolucao } from "@/context/Global/utils";
import {
  buildSolutionDetail,
  type SolutionDetail,
} from "../model/solutionDetail";
import {
  buildSolutionSummary,
  type SolutionSummary,
} from "../model/solutionSummary";

/**
 * Cache por entrada. Uma entrada do histórico é imutável depois de inserida, então o
 * resultado nunca expira; o WeakMap libera a memória quando a entrada sai do Map.
 */
const detailCache = new WeakMap<HistoricoSolucao, SolutionDetail>();
const summaryCache = new WeakMap<
  HistoricoSolucao,
  Map<string, SolutionSummary>
>();

export function getSolutionDetail(entry: HistoricoSolucao): SolutionDetail {
  let detail = detailCache.get(entry);
  if (!detail) {
    detail = buildSolutionDetail(entry);
    detailCache.set(entry, detail);
  }
  return detail;
}

export function getSolutionSummary(
  entry: HistoricoSolucao,
  key: string,
): SolutionSummary {
  let porChave = summaryCache.get(entry);
  if (!porChave) {
    porChave = new Map();
    summaryCache.set(entry, porChave);
  }
  let summary = porChave.get(key);
  if (!summary) {
    summary = buildSolutionSummary(entry, getSolutionDetail(entry), key);
    porChave.set(key, summary);
  }
  return summary;
}
