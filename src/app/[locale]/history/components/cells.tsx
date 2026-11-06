"use client";

import {
  Box,
  Chip,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import PanToolAltIcon from "@mui/icons-material/PanToolAlt";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import StarIcon from "@mui/icons-material/Star";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useTranslations } from "next-intl";
import { TipoInsercao } from "@/context/Global/utils";
import { EMPTY_VALUE, formatEvaluation } from "../model/format";
import type { HistoryRow } from "../state/useHistoryList";
import type { HistoryLabels } from "./useHistoryLabels";

const ORIGIN_ICON = {
  [TipoInsercao.Algoritmo]: SettingsSuggestIcon,
  [TipoInsercao.Manual]: PanToolAltIcon,
  [TipoInsercao.Importação]: FileUploadIcon,
} as const;

/** Chip "Atual" com ícone e texto, não só cor. */
export function CurrentBadge({
  size = "small",
}: {
  size?: "small" | "medium";
}) {
  const t = useTranslations("Pages.History");
  return (
    <Chip
      size={size}
      color="primary"
      icon={<FiberManualRecordIcon />}
      label={t("current")}
      sx={{ height: 20, "& .MuiChip-icon": { fontSize: 10 } }}
    />
  );
}

export function DateCell({
  row,
  labels,
}: {
  row: HistoryRow;
  labels: HistoryLabels;
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
      <Tooltip title={labels.fullDateLabel(row)}>
        <Typography
          variant="body2"
          noWrap
          fontWeight={row.isCurrent ? 600 : 400}
        >
          {labels.dateLabel(row)}
        </Typography>
      </Tooltip>
      {row.isCurrent && <CurrentBadge />}
    </Stack>
  );
}

export function OriginChip({
  row,
  labels,
}: {
  row: Pick<HistoryRow, "origin" | "algorithmKey" | "algorithmName">;
  labels: HistoryLabels;
}) {
  const Icon = ORIGIN_ICON[row.origin] ?? PanToolAltIcon;
  const algorithm = labels.algorithmLabel(row);
  const origin = labels.originLabel(row.origin);
  // Para entradas do algoritmo, o nome do método diz mais que "Algoritmo" (5.1)
  const label =
    row.origin === TipoInsercao.Algoritmo && algorithm ? algorithm : origin;
  return (
    <Tooltip
      title={
        algorithm && label !== algorithm ? `${origin} · ${algorithm}` : origin
      }
    >
      <Chip
        size="small"
        variant="outlined"
        icon={<Icon fontSize="small" />}
        label={label}
        sx={{ maxWidth: "100%" }}
      />
    </Tooltip>
  );
}

export function EvaluationCell({
  row,
  locale,
}: {
  row: HistoryRow;
  locale: string;
}) {
  const t = useTranslations("Pages.History");
  if (row.avaliacao === undefined) {
    return (
      <Typography variant="body2" color="text.secondary">
        {EMPTY_VALUE}
      </Typography>
    );
  }
  const tooltip = row.isBest
    ? t("best")
    : t("deltaFromBest", {
        delta: formatEvaluation(row.deltaFromBest, locale),
      });
  return (
    <Tooltip title={tooltip}>
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        justifyContent="flex-end"
        sx={{ width: "100%" }}
      >
        {row.isBest ? (
          <StarIcon fontSize="small" color="warning" aria-label={t("best")} />
        ) : (
          <ArrowDropDownIcon fontSize="small" color="action" aria-hidden />
        )}
        <Typography
          variant="body2"
          fontFamily="monospace"
          fontWeight={row.isBest ? 600 : 400}
        >
          {formatEvaluation(row.avaliacao, locale)}
        </Typography>
      </Stack>
    </Tooltip>
  );
}

export function CoverageCell({
  row,
}: {
  row: Pick<HistoryRow, "turmasAtendidas" | "turmasAtivas" | "coverage">;
}) {
  const t = useTranslations("Pages.History");
  return (
    <Tooltip
      title={t("coverageTooltip", {
        done: row.turmasAtendidas,
        total: row.turmasAtivas,
      })}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ width: "100%" }}
      >
        <LinearProgress
          variant="determinate"
          value={row.coverage * 100}
          sx={{ flex: 1, height: 6, borderRadius: 3 }}
          aria-label={t("columns.coverage")}
        />
        <Typography variant="body2" fontFamily="monospace" noWrap>
          {row.turmasAtendidas}/{row.turmasAtivas}
        </Typography>
      </Stack>
    </Tooltip>
  );
}

export function ConflictsCell({ count }: { count: number }) {
  const t = useTranslations("Pages.History");
  if (count === 0) {
    return (
      <Tooltip title={t("noConflicts")}>
        <Typography variant="body2" color="text.secondary">
          {EMPTY_VALUE}
        </Typography>
      </Tooltip>
    );
  }
  return (
    <Tooltip title={t("conflictsTooltip", { count })}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          color: "error.main",
        }}
      >
        <WarningAmberIcon fontSize="small" aria-hidden />
        <Typography variant="body2" fontWeight={600}>
          {count}
        </Typography>
      </Box>
    </Tooltip>
  );
}
