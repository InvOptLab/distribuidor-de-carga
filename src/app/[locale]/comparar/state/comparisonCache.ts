import type { HistoricoSolucao } from "@/context/Global/utils";
import {
  getSolutionDetail,
  getSolutionSummary,
} from "@/app/[locale]/history/state/summaryCache";
import { buildComparison, type Comparison } from "../model/comparison";
import {
  priorityDistribution,
  violationsComparison,
  workloadHistogram,
  type PriorityDistribution,
  type ViolationsComparison,
  type WorkloadRow,
} from "../model/distributions";

/**
 * Cache por par ordenado (A, B). As entradas do histórico são imutáveis depois de inseridas,
 * então o resultado nunca expira; o WeakMap libera a memória quando a entrada sai do Map.
 * Trocar A ⇄ B calcula o par invertido uma vez e depois reaproveita os dois.
 */
const cache = new WeakMap<HistoricoSolucao, WeakMap<HistoricoSolucao, Comparison>>();

export function getComparison(
  entryA: HistoricoSolucao,
  keyA: string,
  entryB: HistoricoSolucao,
  keyB: string,
): Comparison {
  let inner = cache.get(entryA);
  if (!inner) {
    inner = new WeakMap();
    cache.set(entryA, inner);
  }
  let comparison = inner.get(entryB);
  if (!comparison) {
    comparison = buildComparison(
      getSolutionSummary(entryA, keyA),
      getSolutionSummary(entryB, keyB),
      getSolutionDetail(entryA),
      getSolutionDetail(entryB),
    );
    inner.set(entryB, comparison);
  }
  return comparison;
}

export interface Distributions {
  priority: PriorityDistribution;
  workload: WorkloadRow[];
  violations: ViolationsComparison;
}

const distCache = new WeakMap<Comparison, Distributions>();

export function getDistributions(
  comparison: Comparison,
  entryA: HistoricoSolucao,
  entryB: HistoricoSolucao,
): Distributions {
  let dist = distCache.get(comparison);
  if (!dist) {
    dist = {
      priority: priorityDistribution(comparison.detailA, comparison.detailB),
      workload: workloadHistogram(comparison.detailA, comparison.detailB),
      violations: violationsComparison(entryA, entryB),
    };
    distCache.set(comparison, dist);
  }
  return dist;
}
