"use client";

import { Box, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTranslations } from "next-intl";
import ChartContainer from "@/app/[locale]/statistics/_components/ChartContainer";
import type { BarChartExportData } from "@/lib/chart-exporter";
import type {
  PriorityDistribution,
  ViolationsComparison,
  WorkloadRow,
} from "../model/distributions";
import { formatNumber } from "../model/metrics";
import { useCompare } from "../state/CompareContext";

function Empty({ text, height }: { text: string; height: number }) {
  return (
    <Box sx={{ height, display: "grid", placeItems: "center" }}>
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );
}

/** Figura com resumo textual para leitores de tela; a tabela fica no export do ChartContainer. */
function Figure({
  label,
  exportData,
  children,
}: {
  label: string;
  exportData?: BarChartExportData;
  children: React.ReactNode;
}) {
  const body = (
    <Box component="figure" aria-label={label} sx={{ m: 0 }}>
      {children}
    </Box>
  );
  return exportData ? (
    <ChartContainer chartData={exportData}>{body}</ChartContainer>
  ) : (
    body
  );
}

/* ---------------------------------- Prioridades ---------------------------------- */

export function PriorityChart({
  data,
  compact = false,
}: {
  data: PriorityDistribution;
  compact?: boolean;
}) {
  const t = useTranslations("Pages.Compare.charts");
  const { tokens } = useCompare();
  const height = compact ? 160 : 340;
  if (
    data.totalA + data.totalB + data.semFormularioA + data.semFormularioB ===
    0
  )
    return <Empty text={t("noPriority")} height={height} />;

  const categories = [...data.priorities.map(String), t("noForm")];
  const seriesA = [...data.a, data.semFormularioA];
  const seriesB = [...data.b, data.semFormularioB];
  const summary = data.priorities
    .map((p, i) => t("prioritySummaryItem", { p, a: data.a[i], b: data.b[i] }))
    .join("; ");
  const exportData: BarChartExportData = {
    xAxis: { data: categories, label: t("priorityAxis") },
    yAxis: { label: t("assignmentsAxis") },
    series: [
      { data: seriesA, label: t("seriesA"), color: tokens.side.a.main },
      { data: seriesB, label: t("seriesB"), color: tokens.side.b.main },
    ],
    showBarValues: true,
  };
  return (
    <Figure
      label={`${t("priorityTitle")}. ${summary}`}
      exportData={compact ? undefined : exportData}
    >
      <BarChart
        height={height}
        xAxis={[
          {
            scaleType: "band",
            data: categories,
            label: compact ? undefined : t("priorityAxis"),
          },
        ]}
        yAxis={[
          {
            label: compact ? undefined : t("assignmentsAxis"),
            width: compact ? 30 : 50,
          },
        ]}
        series={[
          { data: seriesA, label: t("seriesA"), color: tokens.side.a.main },
          { data: seriesB, label: t("seriesB"), color: tokens.side.b.main },
        ]}
        hideLegend={compact}
        barLabel={compact ? undefined : "value"}
        grid={{ horizontal: true }}
        margin={compact ? { top: 8, bottom: 0, left: 0, right: 8 } : undefined}
      />
    </Figure>
  );
}

/* ---------------------------------- Violações ---------------------------------- */

export function ViolationsChart({
  data,
  compact = false,
}: {
  data: ViolationsComparison;
  compact?: boolean;
}) {
  const t = useTranslations("Pages.Compare.charts");
  const { tokens } = useCompare();
  const height = compact ? 160 : 340;
  if (data.rows.length === 0)
    return <Empty text={t("noViolations")} height={height} />;
  const labels = data.rows.map((r) => r.label);
  const a = data.rows.map((r) => r.a);
  const b = data.rows.map((r) => r.b);
  const exportData: BarChartExportData = {
    xAxis: { data: labels, label: t("constraintsAxis") },
    yAxis: { label: t("violationsAxis") },
    series: [
      { data: a, label: t("seriesA"), color: tokens.side.a.main },
      { data: b, label: t("seriesB"), color: tokens.side.b.main },
    ],
    showBarValues: true,
  };
  const summary = data.rows
    .map((r) => `${r.label}: A ${r.a}, B ${r.b}`)
    .join("; ");
  return (
    <Figure
      label={`${t("violationsTitle")}. ${summary}`}
      exportData={compact ? undefined : exportData}
    >
      <BarChart
        height={height}
        xAxis={[
          {
            scaleType: "band",
            data: labels,
            tickLabelStyle: compact ? { display: "none" } : undefined,
          },
        ]}
        yAxis={[
          {
            label: compact ? undefined : t("violationsAxis"),
            width: compact ? 30 : 50,
          },
        ]}
        series={[
          { data: a, label: t("seriesA"), color: tokens.side.a.main },
          { data: b, label: t("seriesB"), color: tokens.side.b.main },
        ]}
        hideLegend={compact}
        barLabel={compact ? undefined : "value"}
        grid={{ horizontal: true }}
        margin={compact ? { top: 8, bottom: 0, left: 0, right: 8 } : undefined}
      />
    </Figure>
  );
}

/**
 * Composição das violações de cada solução em barras 100% empilhadas: substitui as pizzas,
 * compara melhor lado a lado e mostra a mesma informação.
 */
export function ViolationsComposition({
  data,
}: {
  data: ViolationsComparison;
}) {
  const t = useTranslations("Pages.Compare.charts");
  const { locale } = useCompare();
  if (data.totalA + data.totalB === 0)
    return <Empty text={t("noViolations")} height={200} />;
  const sides = [t("seriesA"), t("seriesB")];
  const pct = (v: number, total: number) =>
    total > 0 ? `${formatNumber((v / total) * 100, locale, 0)}%` : "—";
  const exportData: BarChartExportData = {
    xAxis: { data: sides, label: t("compositionAxis") },
    yAxis: { label: t("violationsAxis") },
    series: data.rows.map((r) => ({ data: [r.a, r.b], label: r.label })),
  };
  return (
    <Figure label={t("compositionTitle")} exportData={exportData}>
      <BarChart
        height={220}
        layout="horizontal"
        yAxis={[{ scaleType: "band", data: sides, width: 90 }]}
        xAxis={[
          {
            valueFormatter: (v: number) =>
              `${formatNumber(v * 100, locale, 0)}%`,
          },
        ]}
        series={data.rows.map((r) => ({
          data: [r.a, r.b],
          label: r.label,
          stack: "total",
          stackOffset: "expand" as const,
          valueFormatter: (
            _v: number | null,
            { dataIndex }: { dataIndex: number },
          ) => {
            const raw = dataIndex === 0 ? r.a : r.b;
            const total = dataIndex === 0 ? data.totalA : data.totalB;
            return `${raw} (${pct(raw, total)})`;
          },
        }))}
        slotProps={{
          legend: { position: { vertical: "bottom", horizontal: "center" } },
        }}
      />
    </Figure>
  );
}

/* ------------------------------------ Carga ------------------------------------ */

export function WorkloadChart({
  rows,
  onBarClick,
}: {
  rows: WorkloadRow[];
  onBarClick?: (row: WorkloadRow, side: "a" | "b") => void;
}) {
  const t = useTranslations("Pages.Compare.charts");
  const { tokens, locale } = useCompare();
  if (rows.length === 0) return <Empty text={t("noWorkload")} height={340} />;
  const labels = rows.map((r) =>
    formatNumber(r.carga, locale, r.carga % 1 === 0 ? 0 : 2),
  );
  const a = rows.map((r) => r.a);
  const b = rows.map((r) => r.b);
  const exportData: BarChartExportData = {
    xAxis: { data: labels, label: t("workloadAxis") },
    yAxis: { label: t("docentesAxis") },
    series: [
      { data: a, label: t("seriesA"), color: tokens.side.a.main },
      { data: b, label: t("seriesB"), color: tokens.side.b.main },
    ],
    showBarValues: true,
  };
  const summary = rows
    .map((r, i) =>
      t("workloadSummaryItem", { carga: labels[i], a: r.a, b: r.b }),
    )
    .join("; ");
  return (
    <Figure label={`${t("workloadTitle")}. ${summary}`} exportData={exportData}>
      <BarChart
        height={340}
        xAxis={[{ scaleType: "band", data: labels, label: t("workloadAxis") }]}
        yAxis={[{ label: t("docentesAxis"), width: 50 }]}
        series={[
          { id: "a", data: a, label: t("seriesA"), color: tokens.side.a.main },
          { id: "b", data: b, label: t("seriesB"), color: tokens.side.b.main },
        ]}
        barLabel="value"
        grid={{ horizontal: true }}
        onItemClick={
          onBarClick
            ? (_e, item) => {
                const row = rows[item.dataIndex];
                if (row) onBarClick(row, item.seriesId === "b" ? "b" : "a");
              }
            : undefined
        }
        sx={
          onBarClick
            ? { "& .MuiBarElement-root": { cursor: "pointer" } }
            : undefined
        }
      />
    </Figure>
  );
}
