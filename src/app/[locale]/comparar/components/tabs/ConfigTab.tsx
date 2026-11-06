"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslations } from "next-intl";
import { useHistoryLabels } from "@/app/[locale]/history/components/useHistoryLabels";
import {
  formatDuration,
  formatEvaluation,
  EMPTY_VALUE,
} from "@/app/[locale]/history/model/format";
import type { HistoricoSolucao } from "@/context/Global/utils";
import {
  algorithmConfig,
  mergeByKey,
  sameComponent,
  sameConstraint,
  sameTabu,
  type ComponentConfig,
  type TabuConfig,
} from "../../model/config";
import { useCompare } from "../../state/CompareContext";
import { SideBadge } from "../shared";

const DIFF_SX = { bgcolor: "action.selected" } as const;

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

function SideHeader() {
  const { tokens } = useCompare();
  return (
    <>
      <TableCell align="center" width="30%">
        <SideBadge side="a" tokens={tokens} size={18} />
      </TableCell>
      <TableCell align="center" width="30%">
        <SideBadge side="b" tokens={tokens} size={18} />
      </TableCell>
    </>
  );
}

interface GeneralRow {
  key: string;
  a: string;
  b: string;
}

function generalRows(
  entryA: HistoricoSolucao,
  entryB: HistoricoSolucao,
  label: (e: HistoricoSolucao, k: string) => string,
  keys: string[],
): GeneralRow[] {
  return keys.map((k) => ({
    key: k,
    a: label(entryA, k),
    b: label(entryB, k),
  }));
}

function tabuText(
  tabu: TabuConfig | null,
  t: (k: string, v?: Record<string, string | number>) => string,
) {
  if (!tabu) return EMPTY_VALUE;
  if (tabu.type === "solution")
    return t("tabu.solution", { size: tabu.size ?? EMPTY_VALUE });
  if (tabu.type === "moviment")
    return t("tabu.moviment", {
      add: tabu.add ?? EMPTY_VALUE,
      drop: tabu.drop ?? EMPTY_VALUE,
    });
  return tabu.name;
}

function ComponentList({ items }: { items?: ComponentConfig }) {
  if (!items)
    return (
      <Typography variant="body2" color="text.secondary">
        {EMPTY_VALUE}
      </Typography>
    );
  return (
    <Tooltip title={items.description ?? ""}>
      <Typography variant="body2">{items.name}</Typography>
    </Tooltip>
  );
}

/** Aba Configuração: a configuração dos dois algoritmos lado a lado. */
export default function ConfigTab() {
  const t = useTranslations("Pages.Compare.config");
  const { entryA, entryB, comparison: c, locale } = useCompare();
  const labels = useHistoryLabels();
  const [onlyDiffs, setOnlyDiffs] = useState(false);

  const cfgA = useMemo(() => algorithmConfig(entryA), [entryA]);
  const cfgB = useMemo(() => algorithmConfig(entryB), [entryB]);

  const general = useMemo(() => {
    const summary = (e: HistoricoSolucao) => (e === entryA ? c.a : c.b);
    const detail = (e: HistoricoSolucao) =>
      e === entryA ? c.detailA : c.detailB;
    const value = (e: HistoricoSolucao, k: string): string => {
      const s = summary(e);
      const est = e.solucao?.estatisticas;
      const ctx = e.contexto;
      switch (k) {
        case "algorithm":
          return labels.algorithmLabel(s) ?? t("manual");
        case "origin":
          return labels.originLabel(s.origin);
        case "date":
          return labels.fullDateLabel(s);
        case "id":
          return e.id;
        case "evaluation":
          return formatEvaluation(s.avaliacao, locale);
        case "iterations":
          return s.iteracoes !== undefined ? String(s.iteracoes) : EMPTY_VALUE;
        case "time":
          return formatDuration(s.tempoExecucaoMs, locale);
        case "status":
          return est
            ? est.interrupcao === true
              ? t("interrupted")
              : t("complete")
            : EMPTY_VALUE;
        case "docentes":
          return `${detail(e).docentes.size} / ${ctx?.docentes?.length ?? 0}`;
        case "turmas":
          return `${detail(e).turmas.size} / ${ctx?.disciplinas?.length ?? 0}`;
        case "travas":
          return String(ctx?.travas?.length ?? 0);
        case "maxPriority":
          return String(detail(e).maxPriority);
        case "dataPoints": {
          const pts = est?.avaliacaoPorIteracao;
          return pts instanceof Map ? String(pts.size) : EMPTY_VALUE;
        }
        default:
          return EMPTY_VALUE;
      }
    };
    return generalRows(entryA, entryB, value, [
      "algorithm",
      "origin",
      "date",
      "id",
      "evaluation",
      "iterations",
      "time",
      "status",
      "dataPoints",
      "docentes",
      "turmas",
      "travas",
      "maxPriority",
    ]);
  }, [entryA, entryB, c, labels, locale, t]);

  const constraints = useMemo(
    () => mergeByKey(cfgA.constraints, cfgB.constraints, sameConstraint),
    [cfgA, cfgB],
  );
  const lists = useMemo(
    () =>
      (["neighborhood", "stop", "aspiration"] as const).map((k) => ({
        key: k,
        rows: mergeByKey(cfgA[k], cfgB[k], sameComponent),
      })),
    [cfgA, cfgB],
  );
  const tabuDiffers = !sameTabu(cfgA.tabu, cfgB.tabu);

  const show = <T extends { differs: boolean }>(rows: T[]) =>
    onlyDiffs ? rows.filter((r) => r.differs) : rows;
  const generalShown = onlyDiffs ? general.filter((r) => r.a !== r.b) : general;
  const neither = !cfgA.hasAlgorithm && !cfgB.hasAlgorithm;

  const yesNo = (v: boolean | undefined) =>
    v === undefined ? (
      EMPTY_VALUE
    ) : v ? (
      <CheckIcon fontSize="small" color="success" aria-label={t("active")} />
    ) : (
      <CloseIcon fontSize="small" color="disabled" aria-label={t("inactive")} />
    );

  return (
    <Stack spacing={2}>
      <FormControlLabel
        control={
          <Switch
            checked={onlyDiffs}
            onChange={(e) => setOnlyDiffs(e.target.checked)}
          />
        }
        label={t("onlyDiffs")}
      />

      <Section title={t("general")}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("parameter")}</TableCell>
                <SideHeader />
              </TableRow>
            </TableHead>
            <TableBody>
              {generalShown.map((r) => (
                <TableRow
                  key={r.key}
                  sx={
                    r.a !== r.b && r.key !== "id" && r.key !== "date"
                      ? DIFF_SX
                      : undefined
                  }
                >
                  <TableCell component="th" scope="row">
                    {t(`rows.${r.key}`)}
                  </TableCell>
                  <TableCell align="center">{r.a}</TableCell>
                  <TableCell align="center">{r.b}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>

      {neither ? (
        <Alert severity="info">{t("noAlgorithmBoth")}</Alert>
      ) : (
        <>
          {(!cfgA.hasAlgorithm || !cfgB.hasAlgorithm) && (
            <Alert severity="info">
              {t("noAlgorithmSide", { side: cfgA.hasAlgorithm ? "B" : "A" })}
            </Alert>
          )}
          <Section title={t("constraints")}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell rowSpan={2}>{t("constraint")}</TableCell>
                    <TableCell rowSpan={2}>{t("type")}</TableCell>
                    <TableCell align="center" colSpan={2}>
                      {t("activeHeader")}
                    </TableCell>
                    <TableCell align="center" colSpan={2}>
                      {t("penalty")}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <SideHeader />
                    <SideHeader />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {show(constraints).map((r) => {
                    const any = r.b ?? r.a!;
                    return (
                      <TableRow
                        key={r.key}
                        sx={r.differs ? DIFF_SX : undefined}
                      >
                        <TableCell component="th" scope="row">
                          <Tooltip title={any.description ?? ""}>
                            <span>{any.name}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            variant="outlined"
                            color={any.kind === "hard" ? "error" : "warning"}
                            label={t(any.kind)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {yesNo(r.a?.active)}
                        </TableCell>
                        <TableCell align="center">
                          {yesNo(r.b?.active)}
                        </TableCell>
                        <TableCell align="center">
                          {r.a?.penalty ?? EMPTY_VALUE}
                        </TableCell>
                        <TableCell align="center">
                          {r.b?.penalty ?? EMPTY_VALUE}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Section>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
            }}
          >
            {lists.map(({ key, rows }) => (
              <Section key={key} title={t(`lists.${key}`)}>
                {rows.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t("none")}
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <SideHeader />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {show(rows).map((r) => (
                        <TableRow
                          key={r.key}
                          sx={r.differs ? DIFF_SX : undefined}
                        >
                          <TableCell align="center">
                            <ComponentList items={r.a} />
                          </TableCell>
                          <TableCell align="center">
                            <ComponentList items={r.b} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Section>
            ))}
            {(!onlyDiffs || tabuDiffers) && (
              <Section title={t("lists.tabu")}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <SideHeader />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={tabuDiffers ? DIFF_SX : undefined}>
                      <TableCell align="center">
                        {tabuText(cfgA.tabu, t)}
                      </TableCell>
                      <TableCell align="center">
                        {tabuText(cfgB.tabu, t)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Section>
            )}
          </Box>
        </>
      )}
    </Stack>
  );
}
