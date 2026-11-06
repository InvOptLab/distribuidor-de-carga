"use client";

import { useCallback, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TipoInsercao } from "@/context/Global/utils";
import type { SolutionSummary } from "../model/solutionSummary";
import { formatFullDate, formatShortDate } from "../model/format";

/** Textos derivados de uma solução no locale ativo. */
export function useHistoryLabels() {
  const t = useTranslations("Pages.History");
  const locale = useLocale();

  const originLabel = useCallback(
    (origin: TipoInsercao) => t(`origin.${origin}`),
    [t],
  );

  const algorithmLabel = useCallback(
    (s: Pick<SolutionSummary, "algorithmKey" | "algorithmName" | "origin">) => {
      if (s.algorithmKey) return t(`algorithms.${s.algorithmKey}`);
      // Importações antigas gravam "Importação" como algoritmo: não repetir a origem
      if (s.algorithmName && s.algorithmName !== s.origin)
        return s.algorithmName;
      return undefined;
    },
    [t],
  );

  const dateLabel = useCallback(
    (s: Pick<SolutionSummary, "createdAt" | "id">) =>
      s.createdAt ? formatShortDate(s.createdAt, locale) : s.id,
    [locale],
  );

  const fullDateLabel = useCallback(
    (s: Pick<SolutionSummary, "createdAt" | "id">) =>
      s.createdAt ? formatFullDate(s.createdAt, locale) : s.id,
    [locale],
  );

  return useMemo(
    () => ({ locale, originLabel, algorithmLabel, dateLabel, fullDateLabel }),
    [locale, originLabel, algorithmLabel, dateLabel, fullDateLabel],
  );
}

export type HistoryLabels = ReturnType<typeof useHistoryLabels>;
