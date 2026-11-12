"use client";

import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import type { Side } from "../model/comparison";
import {
  formatMetric,
  METRICS,
  metricDelta,
  type MetricDef,
} from "../model/metrics";
import { useCompare } from "../state/CompareContext";
import { DeltaChip, SideBadge } from "./shared";

type RunStatus = "complete" | "interrupted" | "none";

/**
 * Placar A | B | Δ: substitui os dois resumos e a tabela de estatísticas.
 * Clicar numa linha com destino leva à aba correspondente.
 */
export default function Scorecard() {
  const t = useTranslations("Pages.Compare.scorecard");
  const { comparison: c, entryA, entryB, tokens, locale, goTo } = useCompare();

  const value = (def: MetricDef, side: Side) => {
    const total =
      def.format === "coverage"
        ? side === "a"
          ? c.a.turmasAtivas
          : c.b.turmasAtivas
        : undefined;
    return formatMetric(def.format, def.get(c, side), locale, total);
  };

  const status = (side: Side): RunStatus => {
    const est = (side === "a" ? entryA : entryB).solucao?.estatisticas;
    if (!est) return "none";
    return est.interrupcao === true ? "interrupted" : "complete";
  };

  const open = (def: MetricDef) => {
    const target = def.target;
    if (!target) return;
    if (target.tab === "docentes")
      goTo("docentes", { docenteFilter: target.filter });
    else goTo(target.tab);
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label={t("title")}>
        <TableHead>
          <TableRow>
            <TableCell>{t("metric")}</TableCell>
            {(["a", "b"] as const).map((side) => (
              <TableCell key={side} align="right">
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                  }}
                >
                  <SideBadge side={side} tokens={tokens} size={18} />
                </Box>
              </TableCell>
            ))}
            <TableCell align="right">Δ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {METRICS.map((def) => {
            const d = metricDelta(def, def.get(c, "a"), def.get(c, "b"));
            const clickable = !!def.target;
            return (
              <TableRow
                key={def.id}
                hover={clickable}
                onClick={clickable ? () => open(def) : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          open(def);
                        }
                      }
                    : undefined
                }
                tabIndex={clickable ? 0 : undefined}
                aria-label={
                  clickable
                    ? t("openRow", { metric: t(`metrics.${def.id}`) })
                    : undefined
                }
                sx={{ cursor: clickable ? "pointer" : undefined }}
              >
                <TableCell component="th" scope="row">
                  <Typography variant="body2">
                    {t(`metrics.${def.id}`)}
                  </Typography>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {value(def, "a")}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {value(def, "b")}
                </TableCell>
                <TableCell align="right">
                  <DeltaChip
                    delta={d.delta}
                    percent={d.percent}
                    verdict={d.verdict}
                    direction={def.direction}
                    format={def.format}
                  />
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell component="th" scope="row">
              <Typography variant="body2">{t("metrics.status")}</Typography>
            </TableCell>
            {(["a", "b"] as const).map((side) => {
              const s = status(side);
              return (
                <TableCell key={side} align="right">
                  {s === "none" ? (
                    <Typography variant="body2" color="text.secondary">
                      {t("status.none")}
                    </Typography>
                  ) : (
                    <Chip
                      size="small"
                      variant="outlined"
                      color={s === "interrupted" ? "warning" : "success"}
                      label={t(`status.${s}`)}
                    />
                  )}
                </TableCell>
              );
            })}
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
