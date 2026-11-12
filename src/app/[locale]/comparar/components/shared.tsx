"use client";

import { Box, Chip, Link, Stack, Tooltip, Typography } from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { useTranslations } from "next-intl";
import type { MetricDirection } from "@/app/[locale]/history/model/solutionSummary";
import { compareByDirection } from "@/app/[locale]/history/model/solutionSummary";
import type { Side } from "../model/comparison";
import {
  formatDelta,
  formatPercent,
  type MetricFormat,
} from "../model/metrics";
import { useCompare } from "../state/CompareContext";
import type { CompareTokens } from "../theme/compareTokens";

/** Letra A/B na cor do lado: a identificação não depende só da cor. */
export function SideBadge({
  side,
  tokens,
  size = 20,
}: {
  side: Side;
  tokens: CompareTokens;
  size?: number;
}) {
  const t = useTranslations("Pages.Compare");
  return (
    <Box
      component="span"
      role="img"
      aria-label={t(`side.${side}`)}
      sx={{
        display: "inline-grid",
        placeItems: "center",
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 0.75,
        bgcolor: tokens.side[side].main,
        color: tokens.side[side].contrast,
        fontWeight: 700,
        fontSize: size * 0.6,
        lineHeight: 1,
      }}
    >
      {side.toUpperCase()}
    </Box>
  );
}

/**
 * Δ com direção: ícone ▲ ▼ = e texto ("+5,53, melhor"), além da cor.
 * `verdict` explícito tem precedência sobre o cálculo por `direction`.
 */
export function DeltaChip({
  delta,
  format = "decimal1",
  direction,
  verdict,
  percent,
  size = "small",
}: {
  delta: number | undefined | null;
  format?: MetricFormat;
  direction: MetricDirection;
  verdict?: -1 | 0 | 1;
  percent?: number;
  size?: "small" | "medium";
}) {
  const t = useTranslations("Pages.Compare.delta");
  const { tokens, locale } = useCompare();
  if (delta === undefined || delta === null || !Number.isFinite(delta)) {
    return (
      <Typography variant="body2" color="text.secondary" component="span">
        —
      </Typography>
    );
  }
  const v = verdict ?? compareByDirection(0, delta, direction);
  const zero = Math.abs(delta) < 1e-9;
  const color =
    v > 0
      ? tokens.delta.better
      : v < 0
        ? tokens.delta.worse
        : tokens.delta.neutral;
  const Icon = zero
    ? DragHandleIcon
    : delta > 0
      ? ArrowDropUpIcon
      : ArrowDropDownIcon;
  const text = formatDelta(format, delta, locale);
  const pct = formatPercent(percent, locale);
  const word = zero
    ? t("same")
    : v > 0
      ? t("better")
      : v < 0
        ? t("worse")
        : t("changed");
  return (
    <Box
      component="span"
      aria-label={`${text}${pct ? ` (${pct})` : ""}, ${word}`}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.25,
        color,
        fontWeight: v !== 0 ? 600 : 400,
        fontSize: size === "small" ? "0.8125rem" : "0.9375rem",
        whiteSpace: "nowrap",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <Icon fontSize="small" aria-hidden />
      {text}
      {pct && (
        <Box
          component="span"
          sx={{ color: "text.secondary", fontWeight: 400, ml: 0.5 }}
        >
          ({pct})
        </Box>
      )}
    </Box>
  );
}

/** Pílula da prioridade com a rampa da grade. */
export function PriorityPill({
  value,
  max,
}: {
  value: number | null | undefined;
  max: number;
}) {
  const { tokens } = useCompare();
  const t = useTranslations("Pages.Compare");
  if (value === null || value === undefined) {
    return (
      <Tooltip title={t("noForm")}>
        <Box
          component="span"
          sx={{
            px: 0.75,
            borderRadius: 1,
            border: 1,
            borderStyle: "dashed",
            borderColor: "divider",
            fontSize: "0.75rem",
            color: "text.secondary",
          }}
        >
          —
        </Box>
      </Tooltip>
    );
  }
  const { bg, fg } = tokens.priority(value, max);
  return (
    <Box
      component="span"
      aria-label={t("priorityAria", { value })}
      sx={{
        px: 0.75,
        borderRadius: 1,
        bgcolor: bg,
        color: fg,
        fontWeight: 600,
        fontSize: "0.75rem",
        display: "inline-block",
        minWidth: 22,
        textAlign: "center",
      }}
    >
      {value}
    </Box>
  );
}

/** Nome clicável que abre a entidade no inspetor, sem disparar o clique da linha. */
export function EntityLink({
  kind,
  id,
  children,
  mark,
}: {
  kind: "docente" | "turma";
  id: string;
  children?: React.ReactNode;
  mark?: "added" | "removed";
}) {
  const { openEntity, tokens } = useCompare();
  const t = useTranslations("Pages.Compare.changes");
  return (
    <Link
      component="button"
      type="button"
      underline="hover"
      onClick={(e) => {
        e.stopPropagation();
        openEntity({ kind, id });
      }}
      onKeyDown={(e) => e.stopPropagation()}
      aria-label={
        mark
          ? `${t(mark === "added" ? "addedMark" : "removedMark")}: ${id}`
          : undefined
      }
      sx={{
        color:
          mark === "added"
            ? tokens.added
            : mark === "removed"
              ? tokens.removed
              : "inherit",
        fontWeight: mark === "added" ? 700 : 400,
        textDecoration: mark === "removed" ? "line-through" : undefined,
        fontSize: "inherit",
        textAlign: "left",
        verticalAlign: "baseline",
      }}
    >
      {mark === "added" ? "+" : mark === "removed" ? "−" : ""}
      {children ?? id}
    </Link>
  );
}

/** Lista de docentes de um lado, com os que entraram (+, negrito) e os que saíram (−, riscado). */
export function DocenteList({
  nomes,
  marked,
  mark,
}: {
  nomes: string[];
  marked: string[];
  mark: "added" | "removed";
}) {
  if (nomes.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" component="span">
        —
      </Typography>
    );
  }
  const set = new Set(marked);
  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      columnGap={1}
      rowGap={0.25}
      sx={{ py: 0.5 }}
    >
      {nomes.map((nome) => (
        <EntityLink
          key={nome}
          kind="docente"
          id={nome}
          mark={set.has(nome) ? mark : undefined}
        />
      ))}
    </Stack>
  );
}

export function StatusChip({
  status,
}: {
  status: "added" | "removed" | "modified" | "unchanged";
}) {
  const t = useTranslations("Pages.Compare.status");
  const color =
    status === "added"
      ? "success"
      : status === "removed"
        ? "error"
        : status === "modified"
          ? "warning"
          : "default";
  return (
    <Chip size="small" variant="outlined" color={color} label={t(status)} />
  );
}

/** Download de texto (CSV) no navegador. */
export function downloadText(
  filename: string,
  content: string,
  mime = "text/csv;charset=utf-8",
) {
  const blob = new Blob(["﻿", content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const s = cell === null || cell === undefined ? "" : String(cell);
          return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(";"),
    )
    .join("\n");
}
