"use client";

import { Drawer, Box, Paper } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

import CleanAlertDialog from "./CleanAlertDialog";
import { useAlgorithm } from "../hooks/useAlgorithm";
import { useTimetable } from "../context/TimetableContext";
import AlgoritmoDialog from "@/components/AlgorithmDialog";
import AssignmentGrid from "./grid/AssignmentGrid";
import GridLegend from "./grid/GridLegend";
import GridToolbar from "./toolbar/GridToolbar";
import FilterBar from "./toolbar/FilterBar";
import FiltersDrawer from "./filters/FiltersDrawer";
import { useCanFilter } from "./filters/useFilterFields";
import DetailsPanel from "./details/DetailsPanel";
import { CollaborativeGridWrapper } from "./CollaborativeGridWrapper";
import NoDataFound from "@/components/NoDataFound";
import SemResultadosFiltro from "./SemResultadosFiltro";
import {
  hasActiveFilters as computeHasActiveFilters,
  hasQuickRule,
  toggleQuickRule,
} from "../model/filters";
import { type DetailsTarget, sameTarget } from "../state/detailsTarget";
import { useDensity } from "../state/useDensity";
import { useTranslations } from "next-intl";

const PREVIEW_DELAY_MS = 150;

export default function TimetableView() {
  const {
    docentes,
    disciplinas,
    formularios,
    filteredDocentes,
    filteredDisciplinas,
    model,
    commands,
    cleanStateAtribuicoes,
    saveAlterations,
    downalodJson,
    docenteFilters,
    disciplinaFilters,
    setDocenteFilters,
    setDisciplinaFilters,
    clearFilters,
    isLockMode,
    setIsLockMode,
  } = useTimetable();

  const {
    openDialog,
    processing,
    disciplinasAlocadas,
    executeProcess,
    handleCloseDialog,
    applySolution,
    interruptExecution,
    estatisticasMonitoradas,
    executionStage,
  } = useAlgorithm();

  const canFilter = useCanFilter();
  const tFilter = useTranslations("Pages.Assignment.FilterBar");
  const [density, setDensity] = useDensity();
  const [openCleanDialog, setOpenCleanDialog] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [drawerTop, setDrawerTop] = useState(0);

  // Painel de detalhes: pré-visualização no hover e fixação (5.7)
  const [details, setDetails] = useState<DetailsTarget | null>(null);
  const [pinned, setPinned] = useState(false);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPreview = () => {
    if (previewTimer.current) {
      clearTimeout(previewTimer.current);
      previewTimer.current = null;
    }
  };

  const handlePreview = (target: DetailsTarget) => {
    cancelPreview();
    if (pinned) return;
    previewTimer.current = setTimeout(() => setDetails(target), PREVIEW_DELAY_MS);
  };

  const handlePin = (target: DetailsTarget) => {
    cancelPreview();
    // Clicar de novo no item fixado desafixa
    if (pinned && sameTarget(details, target)) {
      setPinned(false);
      return;
    }
    setDetails(target);
    setPinned(true);
  };

  const handleUnpin = useCallback(() => setPinned(false), []);

  useEffect(() => cancelPreview, []);

  // Esc fora da grade também sai do modo trava / desafixa o painel
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (isLockMode) setIsLockMode(false);
      else if (pinned) setPinned(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLockMode, setIsLockMode, pinned]);

  const handleCleanApply = () => {
    cleanStateAtribuicoes();
    setOpenCleanDialog(false);
  };

  // Convidado sem permissão não executa nem limpa
  const handleExecute = () => {
    if (!commands.ensureCanEdit()) return;
    executeProcess();
  };

  const handleOpenClean = () => {
    if (!commands.ensureCanEdit()) return;
    setOpenCleanDialog(true);
  };

  const toggleFilters = () => {
    // O drawer começa abaixo da navbar (U8), sem padding fixo
    const main = document.getElementById("main-content");
    setDrawerTop(main ? Math.max(0, main.getBoundingClientRect().top) : 0);
    setFiltersOpen(!filtersOpen);
  };

  const hasActiveFilters = computeHasActiveFilters(docenteFilters, disciplinaFilters);
  const semDocenteActive = hasQuickRule(disciplinaFilters, "semDocente");
  const conflitosActive = hasQuickRule(docenteFilters, "comConflito");

  const hasData =
    docentes.length > 0 && disciplinas.length > 0 && formularios.length > 0;
  const hasRows = filteredDocentes.length > 0 && filteredDisciplinas.length > 0;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          width: "100%",
          overflow: "hidden",
        }}
      >
        <GridToolbar
          onExecute={handleExecute}
          onClean={handleOpenClean}
          onDownload={downalodJson}
          onSave={saveAlterations}
          onToggleFilters={toggleFilters}
          hasActiveFilters={hasActiveFilters}
          density={density}
          onDensityChange={setDensity}
          semDocenteActive={semDocenteActive}
          conflitosActive={conflitosActive}
          onToggleSemDocente={() =>
            setDisciplinaFilters((prev) =>
              toggleQuickRule(prev, "semDocente", tFilter("quickWithoutTeacher")),
            )
          }
          onToggleConflitos={() =>
            setDocenteFilters((prev) =>
              toggleQuickRule(prev, "comConflito", tFilter("quickConflicts")),
            )
          }
          canFilter={canFilter}
        />

        {hasData && <FilterBar />}

        <Drawer
          anchor="right"
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: { xs: "100%", sm: 400, md: 500 },
              padding: 2,
              top: drawerTop,
              height: `calc(100% - ${drawerTop}px)`,
            },
          }}
        >
          <FiltersDrawer
            docenteFilters={docenteFilters}
            disciplinaFilters={disciplinaFilters}
            onDocenteFiltersChange={setDocenteFilters}
            onDisciplinaFiltersChange={setDisciplinaFilters}
            onClearFilters={clearFilters}
            onClose={() => setFiltersOpen(false)}
          />
        </Drawer>

        <CollaborativeGridWrapper>
          <Box sx={{ flex: 1, minHeight: 0, display: "flex", gap: 1, p: 1 }}>
            <Paper
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                // Durante a execução a grade fica translúcida e não interativa (5.9)
                ...(processing && { opacity: 0.5, pointerEvents: "none" }),
              }}
              inert={processing || undefined}
            >
              {hasData ? (
                hasRows ? (
                  <>
                    <AssignmentGrid
                      density={density}
                      onPreview={handlePreview}
                      onLeave={cancelPreview}
                      onPin={handlePin}
                      onUnpin={handleUnpin}
                    />
                    <GridLegend maxPriority={model.maxPriority} />
                  </>
                ) : (
                  <SemResultadosFiltro
                    onClearFilters={canFilter ? clearFilters : undefined}
                  />
                )
              ) : (
                <NoDataFound />
              )}
            </Paper>
            {hasData && (
              <DetailsPanel
                target={details}
                pinned={pinned}
                onPin={handlePin}
                onUnpin={handleUnpin}
              />
            )}
          </Box>
        </CollaborativeGridWrapper>
      </Box>

      <AlgoritmoDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onApply={applySolution}
        onStop={interruptExecution}
        processing={processing}
        stage={executionStage}
        progress={{
          current: disciplinasAlocadas,
          // O algoritmo roda sobre todas as turmas ativas, não só as filtradas
          total: disciplinas.filter((disciplina) => disciplina.ativo).length,
        }}
        estatisticasMonitoradas={estatisticasMonitoradas}
      />

      <CleanAlertDialog
        openDialog={openCleanDialog}
        cleanState={handleCleanApply}
        onCloseDialog={() => setOpenCleanDialog(false)}
      />
    </>
  );
}
