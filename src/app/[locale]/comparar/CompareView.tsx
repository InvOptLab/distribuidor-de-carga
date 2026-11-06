"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Container,
  Drawer,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { useTranslations } from "next-intl";
import { useGlobalContext } from "@/context/Global";
import { useAccessibility } from "@/context/Accessibility";
import EmptyHistory from "@/app/[locale]/history/components/EmptyHistory";
import RestoreDialog from "@/app/[locale]/history/components/dialogs/RestoreDialog";
import { useHistoryLabels } from "@/app/[locale]/history/components/useHistoryLabels";
import { useHistoryCommands } from "@/app/[locale]/history/state/useHistoryCommands";
import { getSolutionSummary } from "@/app/[locale]/history/state/summaryCache";
import type { EntityRef } from "@/app/[locale]/history/state/detailNavigation";
import type { TurmaStatus } from "./model/comparison";
import { getComparison } from "./state/comparisonCache";
import { COMPARE_TABS, type CompareTab } from "./state/compareParams";
import {
  CompareContext,
  type CompareContextValue,
  type DocenteFilter,
  type WorkloadFilter,
} from "./state/CompareContext";
import { useCompareParams } from "./state/useCompareParams";
import { useSolutionOptions } from "./state/useSolutionOptions";
import { compareTokens } from "./theme/compareTokens";
import CompareHeader, {
  NAV_HEIGHT,
  type SideActions,
} from "./components/CompareHeader";
import CompatibilityBanner from "./components/CompatibilityBanner";
import CompareInspector, {
  entityInComparison,
} from "./components/inspector/CompareInspector";
import OverviewTab from "./components/tabs/OverviewTab";
import ChangesTab, { DEFAULT_STATUSES } from "./components/tabs/ChangesTab";
import DocentesTab from "./components/tabs/DocentesTab";
import DistributionsTab from "./components/tabs/DistributionsTab";
import ConfigTab from "./components/tabs/ConfigTab";

const INSPECTOR_WIDTH = 420;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

/** Tela de comparação. */
export default function CompareView() {
  const t = useTranslations("Pages.Compare");
  const tHistory = useTranslations("Pages.History");
  const router = useRouter();
  const theme = useTheme();
  const { isHighContrast } = useAccessibility();
  const { historicoSolucoes, solucaoAtual, docentes, disciplinas } =
    useGlobalContext();
  const labels = useHistoryLabels();
  const { locale } = labels;
  const currentId = solucaoAtual.idHistorico;

  const params = useCompareParams(historicoSolucoes, currentId);
  const { a, b, tab, ent, setTab, setEntity } = params;
  const options = useSolutionOptions(historicoSolucoes, currentId);
  const tokens = useMemo(
    () => compareTokens(theme, isHighContrast),
    [theme, isHighContrast],
  );

  const labelOf = useCallback(
    (id: string) => {
      const entry = historicoSolucoes.get(id);
      return entry ? labels.dateLabel(getSolutionSummary(entry, id)) : id;
    },
    [historicoSolucoes, labels],
  );
  const commands = useHistoryCommands(labelOf);

  const entryA = a ? historicoSolucoes.get(a) : undefined;
  const entryB = b ? historicoSolucoes.get(b) : undefined;
  const comparison = useMemo(
    () =>
      entryA && entryB && a && b ? getComparison(entryA, a, entryB, b) : null,
    [entryA, entryB, a, b],
  );

  // Filtros que outras abas podem ligar (placar, resumo, histograma)
  const [statuses, setStatuses] = useState<TurmaStatus[]>(DEFAULT_STATUSES);
  const [docenteFilter, setDocenteFilter] = useState<DocenteFilter>("affected");
  const [workload, setWorkload] = useState<WorkloadFilter | null>(null);

  const goTo = useCallback<CompareContextValue["goTo"]>(
    (next, options) => {
      if (options?.statuses) setStatuses(options.statuses as TurmaStatus[]);
      if (options?.workload !== undefined) {
        setWorkload(options.workload);
        if (options.workload) setDocenteFilter("all");
      }
      if (options?.docenteFilter) {
        setDocenteFilter(options.docenteFilter);
        setWorkload(null);
      }
      setTab(next);
      if (typeof window !== "undefined")
        window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setTab],
  );

  const entity: EntityRef | null =
    ent && comparison && entityInComparison(comparison, ent) ? ent : null;
  // Entidade inexistente no par atual (link antigo, troca de solução): limpa sem erro
  useEffect(() => {
    if (ent && comparison && !entity) setEntity(null);
  }, [ent, comparison, entity, setEntity]);

  const openEntity = useCallback(
    (ref: EntityRef | null) => setEntity(ref),
    [setEntity],
  );

  const contextValue = useMemo<CompareContextValue | null>(
    () =>
      comparison && entryA && entryB
        ? { comparison, entryA, entryB, tokens, locale, openEntity, goTo }
        : null,
    [comparison, entryA, entryB, tokens, locale, openEntity, goTo],
  );

  // Atalhos: X troca, 1–5 mudam de aba, Esc fecha o inspetor
  const stateRef = useRef({ params, comparison, entity });
  stateRef.current = { params, comparison, entity };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      // Menus, popovers e diálogos do MUI tratam as próprias teclas
      // (menus mantidos montados ficam com `MuiModal-hidden` e não contam)
      if (
        document.querySelector(
          ".MuiModal-root:not(.MuiModal-hidden), .MuiAutocomplete-popper",
        )
      )
        return;
      const { params: p, comparison: c, entity: en } = stateRef.current;
      if (e.key === "Escape" && en) {
        e.preventDefault();
        p.setEntity(null);
        return;
      }
      if (e.key === "x" || e.key === "X") {
        if (p.a && p.b) {
          e.preventDefault();
          p.swap();
        }
        return;
      }
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= COMPARE_TABS.length) {
        const next = COMPARE_TABS[n - 1];
        if (next === "overview" || c) {
          e.preventDefault();
          p.setTab(next);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const actions = useMemo<SideActions>(
    () => ({
      restore: commands.restore,
      download: commands.download,
      openInHistory: (id) =>
        router.push(`/${locale}/history?detalhe=${encodeURIComponent(id)}`),
      openStatistics: (id) =>
        router.push(`/${locale}/statistics?id=${encodeURIComponent(id)}`),
      currentId: commands.currentId,
    }),
    [commands.restore, commands.download, commands.currentId, router, locale],
  );

  const wide = useMediaQuery(theme.breakpoints.up(1200));

  // Altura do cabeçalho fixo: o inspetor lateral gruda logo abaixo dele
  const [headerEl, setHeaderEl] = useState<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    if (!headerEl) return;
    const update = () =>
      setHeaderHeight(headerEl.getBoundingClientRect().height);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(headerEl);
    return () => observer.disconnect();
  }, [headerEl]);
  const asideTop = NAV_HEIGHT.sm + headerHeight + 16;
  const goToGrid = useCallback(
    () => router.push(`/${locale}/atribuicoes`),
    [router, locale],
  );
  const restoreTarget = commands.restoreDialog.target;
  const hasLoadedData = docentes.length > 0 && disciplinas.length > 0;

  if (historicoSolucoes.size === 0) {
    return (
      <Container maxWidth={false} sx={{ py: 2, maxWidth: 1800 }}>
        <EmptyHistory onGoToGrid={goToGrid} />
      </Container>
    );
  }

  const effectiveTab: CompareTab = comparison ? tab : "overview";
  const counts = comparison
    ? {
        changes:
          comparison.counts.modified +
          comparison.counts.added +
          comparison.counts.removed,
        docentes: comparison.docentes.filter((d) => d.afetado).length,
      }
    : null;

  const panel = (() => {
    switch (effectiveTab) {
      case "changes":
        return (
          <ChangesTab statuses={statuses} onStatusesChange={setStatuses} />
        );
      case "docentes":
        return (
          <DocentesTab
            filter={docenteFilter}
            onFilterChange={(f) => setDocenteFilter(f)}
            workload={workload}
            onWorkloadChange={setWorkload}
          />
        );
      case "dist":
        return <DistributionsTab />;
      case "config":
        return <ConfigTab />;
      default:
        return <OverviewTab />;
    }
  })();

  return (
    <Container maxWidth={false} sx={{ pb: 4, maxWidth: 1800 }}>
      <CompareHeader
        options={options}
        a={a}
        b={b}
        onChangeA={params.setA}
        onChangeB={params.setB}
        onSwap={params.swap}
        tab={effectiveTab}
        onTab={setTab}
        counts={counts}
        labels={labels}
        tokens={tokens}
        actions={actions}
        headerRef={setHeaderEl}
      />

      {!hasLoadedData && (
        // cada solução é autocontida; sem dados carregados a tela continua funcionando
        <Alert severity="info" sx={{ mb: 2 }}>
          {tHistory("noDataBanner")}
        </Alert>
      )}
      {params.missing.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t("missing", { ids: params.missing.join(", ") })}
        </Alert>
      )}
      {params.ignored.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={params.dismissIgnored}>
          {t("ignored", { count: params.ignored.length })}
        </Alert>
      )}

      {!contextValue ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <CompareArrowsIcon sx={{ fontSize: 48, color: "text.secondary" }} />
          <Typography variant="h6" component="p" gutterBottom>
            {historicoSolucoes.size < 2
              ? t("empty.needTwo")
              : t("empty.selectTwo")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {historicoSolucoes.size < 2
              ? t("empty.needTwoBody")
              : t("empty.selectTwoBody")}
          </Typography>
          {historicoSolucoes.size < 2 && (
            <Button variant="contained" onClick={goToGrid}>
              {tHistory("empty.goToGrid")}
            </Button>
          )}
        </Paper>
      ) : (
        <CompareContext.Provider value={contextValue}>
          <CompatibilityBanner />
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <Box
              role="tabpanel"
              id={`compare-panel-${effectiveTab}`}
              aria-labelledby={`compare-tab-${effectiveTab}`}
              sx={{ flex: 1, minWidth: 0 }}
            >
              {panel}
            </Box>
            {entity && wide && (
              <Paper
                component="aside"
                variant="outlined"
                aria-label={t("inspector.aria")}
                sx={{
                  width: INSPECTOR_WIDTH,
                  flexShrink: 0,
                  position: "sticky",
                  top: asideTop,
                  maxHeight: `calc(100vh - ${asideTop + 16}px)`,
                  overflow: "auto",
                }}
              >
                <CompareInspector
                  entity={entity}
                  onClose={() => setEntity(null)}
                />
              </Paper>
            )}
          </Box>
          {!wide && (
            <Drawer
              anchor="right"
              open={!!entity}
              // Acima da barra de navegação (sticky, z-index acima de drawer)
              sx={{ zIndex: (th) => th.zIndex.modal }}
              onClose={() => setEntity(null)}
              slotProps={{
                paper: {
                  sx: { width: { xs: "100%", sm: INSPECTOR_WIDTH } },
                  component: "aside",
                  "aria-label": t("inspector.aria"),
                } as object,
              }}
            >
              {entity && (
                <CompareInspector
                  entity={entity}
                  onClose={() => setEntity(null)}
                />
              )}
            </Drawer>
          )}
        </CompareContext.Provider>
      )}

      <RestoreDialog
        open={!!restoreTarget}
        label={restoreTarget ? labelOf(restoreTarget) : ""}
        saving={commands.restoreDialog.saving}
        onSave={() => commands.restoreDialog.confirm("save")}
        onDiscard={() => commands.restoreDialog.confirm("discard")}
        onCancel={commands.restoreDialog.cancel}
      />
    </Container>
  );
}
