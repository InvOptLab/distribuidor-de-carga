"use client";

import { Fade, Drawer, Box, Paper } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import CleanAlertDialog from "./CleanAlertDialog";

import TimetableFilters from "./TimetableFilters";
import ActionBar from "./ActionBar";
import { useAlgorithm } from "../hooks/useAlgorithm";

import { useTimetable } from "../context/TimetableContext";
import { useGlobalContext } from "@/context/Global";
import { Disciplina, Docente } from "@/algoritmo/communs/interfaces/interfaces";
import AlgoritmoDialog from "@/components/AlgorithmDialog";
import HoveredCourse from "./HoveredCourse";
import HoveredDocente from "./HoveredDocente";
// import TimetableDataGrid from "./TimetableDataGrid";
// import TimetableGrid from "./TimetableGrid";
// import TimetableDataGrid from "./TimetableDataGrid";
import TimetableGrid from "./TimetableGrid";
import { CollaborativeGridWrapper } from "./CollaborativeGridWrapper";
import NoDataFound from "@/components/NoDataFound";
import SemResultadosFiltro from "./SemResultadosFiltro";

const customTheme = createTheme({
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(224, 224, 224, 1)",
        },
      },
    },
  },
});

export default function TimetableView() {
  const {
    filteredDocentes,
    filteredDisciplinas,
    cleanStateAtribuicoes,
    saveAlterations,
    downalodJson,
    docenteFilters,
    disciplinaFilters,
    setDocenteFilters,
    setDisciplinaFilters,
    clearFilters,
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

  const { formularios, docentes, disciplinas, atribuicoes } =
    useGlobalContext();

  const [openCleanDialog, setOpenCleanDialog] = useState(false);
  const [hoveredCourse, setHoveredCourse] = useState<Disciplina | null>(null);
  const [hoveredDocente, setHoveredDocente] = useState<Docente | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleCourseClick = (disciplina: Disciplina | null) => {
    setHoveredCourse(disciplina);
  };

  const handleDocenteClick = (nome: string | null) => {
    if (!nome) {
      setHoveredDocente(null);
      return;
    }
    const docente = docentes.find((d) => d.nome === nome);
    if (docente) {
      setHoveredDocente(docente);
    }
  };

  const handleCleanDialogClose = () => {
    setOpenCleanDialog(false);
  };

  const handleCleanApply = () => {
    cleanStateAtribuicoes();
    setOpenCleanDialog(false);
  };

  const hasActiveFilters =
    docenteFilters.search ||
    docenteFilters.rules.length > 0 ||
    disciplinaFilters.search ||
    disciplinaFilters.rules.length > 0;

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "90vh",
          width: "100%",
          gap: 1, // Substitui o 'space-y-4' (gap: 2 = 16px)overflow: "hidden"
          overflow: "hidden",
        }}
      >
        <ActionBar
          onExecute={executeProcess}
          onClean={() => setOpenCleanDialog(true)}
          onDownload={downalodJson}
          onSave={saveAlterations}
          onToggleFilters={() => setFiltersOpen(!filtersOpen)}
          hasActiveFilters={!!hasActiveFilters}
        />

        <Drawer
          anchor="right"
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: { xs: "100%", sm: 400, md: 500 },
              padding: 2,
            },
          }}
        >
          <TimetableFilters
            docenteFilters={docenteFilters}
            disciplinaFilters={disciplinaFilters}
            onDocenteFiltersChange={setDocenteFilters}
            onDisciplinaFiltersChange={setDisciplinaFilters}
            onClearFilters={clearFilters}
            onClose={() => setFiltersOpen(false)}
          />
        </Drawer>

        <CollaborativeGridWrapper>
          <Paper
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              width: "100%",
              overflow: "hidden",
            }}
          >
            {docentes.length > 0 &&
            disciplinas.length > 0 &&
            formularios.length > 0 ? (
              filteredDocentes.length > 0 && filteredDisciplinas.length > 0 ? (
                <TimetableGrid
                  setHoveredCourse={handleCourseClick}
                  setHoveredDocente={handleDocenteClick}
                />
              ) : (
                <SemResultadosFiltro />
              )
            ) : (
              <NoDataFound />
            )}
          </Paper>
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
          total: filteredDisciplinas.filter((disciplina) => disciplina.ativo)
            .length,
        }}
        estatisticasMonitoradas={estatisticasMonitoradas}
      />

      {/* Modal de Detalhes */}
      {hoveredCourse && (
        <HoveredCourse
          open={!!hoveredCourse}
          onClose={() => setHoveredCourse(null)}
          disciplina={hoveredCourse}
          docentes={docentes}
          formularios={formularios}
        />
      )}

      {hoveredDocente && (
        <HoveredDocente
          open={!!hoveredDocente}
          onClose={() => setHoveredDocente(null)}
          docente={hoveredDocente}
          disciplinas={disciplinas}
          formularios={formularios}
          atribuicoes={atribuicoes.filter((atribuicao) =>
            atribuicao.docentes.includes(hoveredDocente.nome),
          )}
        />
      )}

      <CleanAlertDialog
        openDialog={openCleanDialog}
        cleanState={handleCleanApply}
        onCloseDialog={handleCleanDialogClose}
      />
    </ThemeProvider>
  );
}
