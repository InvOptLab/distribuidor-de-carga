"use client";

import { Chip, Tooltip } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import { useTranslations } from "next-intl";
import type { Espelho } from "@/algoritmo/communs/interfaces/interfaces";
import { formatEspelho } from "@/context/Global/utils";

interface EspelhoChipProps {
  espelho?: Espelho;
  size?: "tiny" | "small";
}

/**
 * Indica que a turma da graduação tem uma turma espelho na pós (mesma turma,
 * outro código). Mostra o código da pós; o nome completo fica na dica.
 */
export default function EspelhoChip({ espelho, size = "small" }: EspelhoChipProps) {
  const t = useTranslations("Components.Turma");
  if (!espelho) return null;

  const label = formatEspelho(espelho);
  const tiny = size === "tiny";
  return (
    <Tooltip title={t("mirrorTooltip", { label, nome: espelho.nome })}>
      <Chip
        icon={<LinkIcon />}
        label={label}
        size="small"
        variant="outlined"
        color="info"
        aria-label={t("mirrorTooltip", { label, nome: espelho.nome })}
        sx={
          tiny
            ? {
                height: 16,
                fontSize: "0.6rem",
                "& .MuiChip-icon": { fontSize: 12, ml: 0.5 },
                "& .MuiChip-label": { px: 0.5 },
              }
            : { height: 20, fontSize: "0.7rem", "& .MuiChip-icon": { fontSize: 14 } }
        }
      />
    </Tooltip>
  );
}
