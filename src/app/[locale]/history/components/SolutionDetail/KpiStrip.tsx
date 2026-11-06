"use client";

import type React from "react";
import { Box, Stack, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import AssignmentLateOutlinedIcon from "@mui/icons-material/AssignmentLateOutlined";
import StarIcon from "@mui/icons-material/Star";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import { useTranslations } from "next-intl";
import { formatDuration, formatEvaluation } from "../../model/format";
import type { HistoryRow } from "../../state/useHistoryList";

function Kpi({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "error" | "warning";
}) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 0.75,
        borderRadius: 1,
        border: 1,
        borderColor: tone ? `${tone}.main` : "divider",
        minWidth: 96,
        flexShrink: 0,
      }}
    >
      <Typography variant="caption" color="text.secondary" component="div" noWrap>
        {label}
      </Typography>
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{ color: tone ? `${tone}.main` : "text.primary" }}
      >
        {icon}
        <Typography variant="subtitle1" fontWeight={600} fontFamily="monospace" component="span">
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}

/** Resumo numérico da solução aberta no painel (5.3). */
export default function KpiStrip({
  row,
  locale,
  singleLine,
}: {
  row: HistoryRow;
  locale: string;
  /** Telas estreitas: uma linha com rolagem horizontal, para não roubar altura. */
  singleLine?: boolean;
}) {
  const t = useTranslations("Pages.History.detail.kpi");
  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={singleLine ? { flexWrap: "nowrap", overflowX: "auto", pb: 0.5 } : { flexWrap: "wrap" }}
    >
      <Kpi
        label={t("evaluation")}
        value={formatEvaluation(row.avaliacao, locale)}
        icon={row.isBest ? <StarIcon fontSize="small" color="warning" aria-label={t("best")} /> : undefined}
      />
      <Kpi label={t("coverage")} value={`${row.turmasAtendidas}/${row.turmasAtivas}`} />
      <Kpi
        label={t("unassigned")}
        value={row.docentesSemAtribuicao}
        icon={<PersonOffOutlinedIcon fontSize="small" aria-hidden />}
      />
      <Kpi
        label={t("conflicts")}
        value={row.conflitos}
        tone={row.conflitos > 0 ? "error" : undefined}
        icon={<WarningAmberIcon fontSize="small" aria-hidden />}
      />
      <Kpi
        label={t("noForm")}
        value={row.semFormulario}
        tone={row.semFormulario > 0 ? "warning" : undefined}
        icon={<AssignmentLateOutlinedIcon fontSize="small" aria-hidden />}
      />
      <Kpi label={t("locks")} value={row.travas} icon={<LockOutlinedIcon fontSize="small" aria-hidden />} />
      {row.tempoExecucaoMs !== undefined && (
        <Kpi
          label={t("time")}
          value={formatDuration(row.tempoExecucaoMs, locale)}
          icon={<TimerOutlinedIcon fontSize="small" aria-hidden />}
        />
      )}
    </Stack>
  );
}
