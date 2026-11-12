"use client";

import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { PRIORITY_DIRECTION } from "@/app/[locale]/history/model/solutionSummary";
import { WORKLOAD_BANDS } from "../../model/distributions";
import { formatMetric, formatNumber } from "../../model/metrics";
import { getDistributions } from "../../state/comparisonCache";
import { useCompare } from "../../state/CompareContext";
import {
  PriorityChart,
  ViolationsChart,
  ViolationsComposition,
  WorkloadChart,
} from "../charts";
import { DeltaChip, SideBadge } from "../shared";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="outlined" component="section" aria-label={title}>
      <CardContent>
        <Typography variant="subtitle1" component="h2" gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

function SideValues({
  label,
  a,
  b,
  delta,
}: {
  label: string;
  a: string;
  b: string;
  delta?: React.ReactNode;
}) {
  const { tokens } = useCompare();
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      flexWrap="wrap"
      useFlexGap
      sx={{ mb: 1 }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Stack direction="row" spacing={0.75} alignItems="center">
        <SideBadge side="a" tokens={tokens} size={18} />
        <Typography variant="body2" fontWeight={600}>
          {a}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={0.75} alignItems="center">
        <SideBadge side="b" tokens={tokens} size={18} />
        <Typography variant="body2" fontWeight={600}>
          {b}
        </Typography>
      </Stack>
      {delta}
    </Stack>
  );
}

/** Aba Distribuições: prioridades, violações e carga, todos exportáveis. */
export default function DistributionsTab() {
  const t = useTranslations("Pages.Compare");
  const { comparison, entryA, entryB, locale, tokens, goTo } = useCompare();
  const { priority, violations, workload } = getDistributions(
    comparison,
    entryA,
    entryB,
  );
  const mean = (v: number | null) =>
    formatMetric("decimal1", v ?? undefined, locale);

  const bandLabel = (i: number) => {
    if (i === 0) return t("charts.band0");
    const from = WORKLOAD_BANDS[i - 1];
    const to = WORKLOAD_BANDS[i];
    return to === Infinity
      ? t("charts.bandAbove", { from: formatNumber(from, locale, 0) })
      : t("charts.bandRange", {
          from: formatNumber(from, locale, 0),
          to: formatNumber(to, locale, 0),
        });
  };

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
        alignItems: "start",
      }}
    >
      <Section title={t("charts.priorityTitle")}>
        <SideValues
          label={t("charts.weightedMean")}
          a={mean(priority.meanA)}
          b={mean(priority.meanB)}
          delta={
            <DeltaChip
              delta={
                priority.meanA !== null && priority.meanB !== null
                  ? priority.meanB - priority.meanA
                  : undefined
              }
              direction={PRIORITY_DIRECTION}
            />
          }
        />
        <SideValues
          label={t("charts.totals")}
          a={String(priority.totalA + priority.semFormularioA)}
          b={String(priority.totalB + priority.semFormularioB)}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          component="p"
          sx={{ mb: 1 }}
        >
          {t("charts.priorityHint")}
        </Typography>
        <PriorityChart data={priority} />
      </Section>

      <Section title={t("charts.violationsTitle")}>
        <SideValues
          label={t("charts.totals")}
          a={violations.hasDataA ? String(violations.totalA) : "—"}
          b={violations.hasDataB ? String(violations.totalB) : "—"}
          delta={
            violations.hasDataA && violations.hasDataB ? (
              <DeltaChip
                delta={violations.totalB - violations.totalA}
                direction="lower"
                format="integer"
              />
            ) : undefined
          }
        />
        <ViolationsChart data={violations} />
        <Typography variant="subtitle2" component="h3" sx={{ mt: 2 }}>
          {t("charts.compositionTitle")}
        </Typography>
        <ViolationsComposition data={violations} />
      </Section>

      <Box sx={{ gridColumn: { lg: "1 / -1" } }}>
        <Section title={t("charts.workloadTitle")}>
          <Typography
            variant="caption"
            color="text.secondary"
            component="p"
            sx={{ mb: 1 }}
          >
            {t("charts.workloadHint")}
          </Typography>
          <WorkloadChart
            rows={workload}
            onBarClick={(row, side) =>
              goTo("docentes", { workload: { carga: row.carga, side } })
            }
          />
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            justifyContent="center"
            sx={{ mt: 1 }}
          >
            {WORKLOAD_BANDS.map((_, i) => {
              const { bg, fg } = tokens.workload(i);
              return (
                <Chip
                  key={i}
                  size="small"
                  clickable
                  label={bandLabel(i)}
                  onClick={() => goTo("docentes", { workload: { band: i } })}
                  sx={{
                    bgcolor: bg,
                    color: fg,
                    "&:hover": { bgcolor: bg, opacity: 0.85 },
                  }}
                />
              );
            })}
          </Stack>
        </Section>
      </Box>
    </Box>
  );
}
