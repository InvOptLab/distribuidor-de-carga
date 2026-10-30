"use client";

import { useCallback, useEffect, useState } from "react";

export type Density = "compact" | "comfortable";

const STORAGE_KEY = "atribuicoes.density";

/**
 * Densidade da grade (5.2), lembrada por navegador. Falha de storage não quebra a página.
 */
export function useDensity(): [Density, (density: Density) => void] {
  const [density, setDensityState] = useState<Density>("comfortable");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "compact" || saved === "comfortable") setDensityState(saved);
    } catch {
      // storage indisponível: fica o padrão
    }
  }, []);

  const setDensity = useCallback((next: Density) => {
    setDensityState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage indisponível: vale só nesta sessão
    }
  }, []);

  return [density, setDensity];
}
