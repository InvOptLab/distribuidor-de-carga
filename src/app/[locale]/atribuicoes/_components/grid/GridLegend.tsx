"use client";

import { Box, Typography, useTheme } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import LockIcon from "@mui/icons-material/Lock";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useAccessibility } from "@/context/Accessibility";
import { gridTokens } from "../../theme/gridTokens";

interface GridLegendProps {
  maxPriority: number;
}

function Swatch({ sx, children }: { sx: object; children?: ReactNode }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: 28,
        height: 20,
        borderRadius: 0.5,
        border: 1,
        borderColor: "divider",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        fontSize: "0.75rem",
        fontVariantNumeric: "tabular-nums",
        flexShrink: 0,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Legenda dos estados da grade (U1), usando os mesmos tokens das células.
 */
export default function GridLegend({ maxPriority }: GridLegendProps) {
  const theme = useTheme();
  const { isHighContrast } = useAccessibility();
  const tk = gridTokens(theme, isHighContrast);
  const t = useTranslations("Pages.Assignment.Grid");
  const top = Math.max(1, maxPriority);
  const first = tk.ramp(1, top);
  const last = tk.ramp(top, top);

  const item = (swatch: ReactNode, label: string) => (
    <Box display="flex" alignItems="center" gap={0.75}>
      {swatch}
      <Typography variant="caption">{label}</Typography>
    </Box>
  );

  return (
    <Box
      component="footer"
      aria-label={t("legend")}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        columnGap: 2.5,
        rowGap: 0.75,
        px: 1.5,
        py: 0.75,
        borderTop: 1,
        borderColor: "divider",
        flexShrink: 0,
      }}
    >
      <Typography variant="caption" fontWeight="bold">
        {t("legend")}:
      </Typography>
      {item(
        <Swatch sx={{ ...tk.cell.empty, color: tk.cell.empty.color }}>·</Swatch>,
        t("legendEmpty"),
      )}
      {item(
        tk.highContrast ? (
          // No alto contraste a prioridade é só texto amarelo com borda (B23), sem rampa
          <Swatch sx={tk.cell.pref}>1…{top}</Swatch>
        ) : (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Swatch sx={{ backgroundColor: first.bg, color: first.fg }}>1</Swatch>
            <Box
              aria-hidden="true"
              sx={{ width: 48, height: 8, borderRadius: 1, background: tk.rampGradient }}
            />
            <Swatch sx={{ backgroundColor: last.bg, color: last.fg }}>{top}</Swatch>
          </Box>
        ),
        `${t("legendPriority")} (${t("legendPriorityHint")})`,
      )}
      {item(
        <Swatch sx={tk.cell.assigned}>
          <CheckIcon sx={{ fontSize: "0.9rem" }} />
        </Swatch>,
        t("legendAssigned"),
      )}
      {item(
        <Swatch
          sx={{
            ...tk.cell.empty,
            backgroundImage: tk.lockedPattern,
            ...(tk.lockedBorder && { border: tk.lockedBorder }),
          }}
        >
          <LockIcon sx={{ fontSize: "0.8rem" }} />
        </Swatch>,
        t("legendLocked"),
      )}
      {item(
        <WarningAmberIcon
          aria-hidden="true"
          sx={{ fontSize: "1.1rem", color: tk.conflict.color }}
        />,
        t("legendConflict"),
      )}
    </Box>
  );
}
