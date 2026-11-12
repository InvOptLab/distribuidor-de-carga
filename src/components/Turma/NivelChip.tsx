"use client";

import { useCallback } from "react";
import { Chip, Tooltip, type ChipProps } from "@mui/material";
import { useTranslations } from "next-intl";
import type { Espelho } from "@/algoritmo/communs/interfaces/interfaces";
import { tipoNivel, type TipoNivel } from "@/context/Global/utils";

const COR: Record<TipoNivel, ChipProps["color"]> = {
  graduacao: "primary",
  pos: "secondary",
  ambos: "info",
  outro: "default",
};

/** Rótulos curto e longo do nível (Grad / Pós / Grad + Pós). */
export function useNivelLabel() {
  const t = useTranslations("Components.Turma");
  return useCallback((turma: { nivel?: string; espelho?: Espelho }) => {
    const tipo = tipoNivel(turma);
    switch (tipo) {
      case "graduacao":
        return { tipo, curto: t("shortUndergraduate"), longo: t("undergraduate") };
      case "pos":
        return { tipo, curto: t("shortGraduate"), longo: t("graduate") };
      case "ambos":
        return { tipo, curto: t("shortBoth"), longo: t("both") };
      default:
        return { tipo, curto: turma.nivel ?? "", longo: turma.nivel ?? "" };
    }
  }, [t]);
}

interface NivelChipProps {
  nivel?: string;
  espelho?: Espelho;
  size?: "tiny" | "small";
  /** Mostra o rótulo longo (ex.: "Graduação") em vez do curto ("Grad"). */
  long?: boolean;
}

/**
 * Chip do nível da turma. Entende "g", "p", "pg" e "g+p" (turma espelho):
 * antes, cada tela comparava só com "g" e mostrava "g+p" como pós-graduação.
 */
export default function NivelChip({
  nivel,
  espelho,
  size = "small",
  long = false,
}: NivelChipProps) {
  const label = useNivelLabel()({ nivel, espelho });
  if (!label.curto) return null;

  const tiny = size === "tiny";
  return (
    <Tooltip title={label.longo}>
      <Chip
        label={long ? label.longo : label.curto}
        size="small"
        variant="filled"
        color={COR[label.tipo]}
        sx={
          tiny
            ? { height: 16, fontSize: "0.6rem", "& .MuiChip-label": { px: 0.75 } }
            : { height: 20, fontSize: "0.7rem" }
        }
      />
    </Tooltip>
  );
}
