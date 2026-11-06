"use client";

import { createContext, useContext } from "react";
import type { HistoricoSolucao } from "@/context/Global/utils";
import type { EntityRef } from "@/app/[locale]/history/state/detailNavigation";
import type { Comparison } from "../model/comparison";
import type { CompareTokens } from "../theme/compareTokens";
import type { CompareTab } from "./compareParams";

/** Filtros da aba Docentes, que outras abas podem ligar (placar, histograma). */
export type DocenteFilter =
  | "affected"
  | "all"
  | "lostAll"
  | "unassigned"
  | "conflict"
  | "gainedConflict"
  | "resolvedConflict";

export interface WorkloadFilter {
  /** Carga exata (barra do histograma) ou faixa da legenda. */
  carga?: number;
  band?: number;
  side?: "a" | "b";
}

export interface CompareContextValue {
  comparison: Comparison;
  entryA: HistoricoSolucao;
  entryB: HistoricoSolucao;
  tokens: CompareTokens;
  locale: string;
  openEntity: (ref: EntityRef | null) => void;
  goTo: (
    tab: CompareTab,
    options?: {
      docenteFilter?: DocenteFilter;
      workload?: WorkloadFilter | null;
      statuses?: string[];
    },
  ) => void;
}

export const CompareContext = createContext<CompareContextValue | null>(null);

export function useCompare(): CompareContextValue {
  const value = useContext(CompareContext);
  if (!value) throw new Error("useCompare fora de CompareContext");
  return value;
}
