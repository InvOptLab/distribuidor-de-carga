"use client";

import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTranslations } from "next-intl";
import { TURMA_STATUSES, type TurmaStatus } from "../../model/comparison";
import { getDistributions } from "../../state/comparisonCache";
import { useCompare } from "../../state/CompareContext";
import Scorecard from "../Scorecard";
import { PriorityChart, ViolationsChart } from "../charts";

const STATUS_COLOR: Record<
  TurmaStatus,
  "warning" | "success" | "error" | "grey"
> = {
  modified: "warning",
  added: "success",
  removed: "error",
  unchanged: "grey",
};

/** Resumo das mudanças (substitui os chips): barra de composição clicável. */
function ChangesSummary() {
  const t = useTranslations("Pages.Compare");
  const { comparison: c, goTo } = useCompare();
  const total = TURMA_STATUSES.reduce((s, k) => s + c.counts[k], 0);
  const trocados = c.pares.adicionados + c.pares.removidos;
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" component="h2" gutterBottom>
          {t("overview.changesTitle")}
        </Typography>
        <Box
          role="group"
          aria-label={t("overview.compositionAria")}
          sx={{
            display: "flex",
            height: 14,
            borderRadius: 1,
            overflow: "hidden",
            mb: 1.5,
            bgcolor: "action.hover",
          }}
        >
          {total > 0 &&
            TURMA_STATUSES.map((status) =>
              c.counts[status] === 0 ? null : (
                <Tooltip
                  key={status}
                  title={`${c.counts[status]} ${t(`status.${status}`)}`}
                >
                  <ButtonBase
                    aria-label={`${c.counts[status]} ${t(`status.${status}`)}`}
                    onClick={() => goTo("changes", { statuses: [status] })}
                    sx={{
                      width: `${(c.counts[status] / total) * 100}%`,
                      bgcolor: (theme) =>
                        STATUS_COLOR[status] === "grey"
                          ? theme.palette.action.disabled
                          : theme.palette[STATUS_COLOR[status] as "warning"]
                              .main,
                    }}
                  />
                </Tooltip>
              ),
            )}
        </Box>
        <Stack direction="row" flexWrap="wrap" columnGap={1.5} rowGap={0.5}>
          {TURMA_STATUSES.map((status) => (
            <Button
              key={status}
              size="small"
              color="inherit"
              onClick={() => goTo("changes", { statuses: [status] })}
              sx={{ textTransform: "none", px: 0.5, minWidth: 0 }}
            >
              <strong>{c.counts[status]}</strong>&nbsp;
              {t(`status.${status}`).toLocaleLowerCase()}
            </Button>
          ))}
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t("overview.pairs", { kept: c.pares.mantidos, swapped: trocados })}
        </Typography>
        <Button
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={() => goTo("changes")}
          sx={{ mt: 1 }}
        >
          {t("overview.seeChanges")}
        </Button>
      </CardContent>
    </Card>
  );
}

function MiniCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { goTo } = useCompare();
  return (
    <Card variant="outlined">
      <CardActionArea onClick={() => goTo("dist")} aria-label={title}>
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="subtitle2" component="h2" gutterBottom>
            {title}
          </Typography>
          {children}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function OverviewTab() {
  const t = useTranslations("Pages.Compare");
  const { comparison, entryA, entryB } = useCompare();
  const dist = getDistributions(comparison, entryA, entryB);
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 3fr) minmax(0, 2fr)" },
        alignItems: "start",
      }}
    >
      <Box>
        <Typography variant="subtitle1" component="h2" sx={{ mb: 1 }}>
          {t("scorecard.title")}
        </Typography>
        <Scorecard />
      </Box>
      <Stack spacing={2}>
        <ChangesSummary />
        <MiniCard title={t("charts.priorityTitle")}>
          <PriorityChart data={dist.priority} compact />
        </MiniCard>
        <MiniCard title={t("charts.violationsTitle")}>
          <ViolationsChart data={dist.violations} compact />
        </MiniCard>
      </Stack>
    </Box>
  );
}
