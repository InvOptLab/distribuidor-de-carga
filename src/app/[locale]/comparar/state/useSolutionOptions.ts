"use client";

import { useMemo } from "react";
import type { HistoricoSolucao } from "@/context/Global/utils";
import {
  bestEvaluation,
  type SolutionSummary,
} from "@/app/[locale]/history/model/solutionSummary";
import { chronologicalKey } from "@/app/[locale]/history/model/sort";
import {
  getSolutionDetail,
  getSolutionSummary,
} from "@/app/[locale]/history/state/summaryCache";

export interface SolutionOption extends SolutionSummary {
  /** Pares docente–turma atribuídos (ativos). */
  pares: number;
  chrono: number;
  isCurrent: boolean;
  /** Mesma ★ do histórico (`bestEvaluation`). */
  isBest: boolean;
}

/** Opções dos seletores, da mais recente para a mais antiga. */
export function useSolutionOptions(
  history: Map<string, HistoricoSolucao>,
  currentId: string | undefined,
): SolutionOption[] {
  return useMemo(() => {
    const options: SolutionOption[] = [];
    let order = 0;
    history.forEach((entry, key) => {
      const summary = getSolutionSummary(entry, key);
      const pares = getSolutionDetail(entry).atribuicoes.reduce(
        (s, a) => s + a.docentes.length,
        0,
      );
      options.push({
        ...summary,
        pares,
        chrono: chronologicalKey(summary.createdAt, order++),
        isCurrent: key === currentId,
        isBest: false,
      });
    });
    const best = bestEvaluation(options);
    if (best !== undefined)
      for (const o of options) o.isBest = o.avaliacao === best;
    return options.sort((x, y) => y.chrono - x.chrono);
  }, [history, currentId]);
}
