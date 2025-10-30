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
import TimetableDataGrid from "./TimetableDataGrid";

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
  } = useAlgorithm();

  const { formularios, docentes, disciplinas, atribuicoes } =
    useGlobalContext();

  const [openCleanDialog, setOpenCleanDialog] = useState(false);
  const [hoveredCourse, setHoveredCourse] = useState<Disciplina | null>(null);
  const [hoveredDocente, setHoveredDocente] = useState<Docente | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const enterTimer = useRef<NodeJS.Timeout | null>(null);
  const leaveTimer = useRef<NodeJS.Timeout | null>(null);

  const ENTER_DELAY_MS = 150;
  const LEAVE_DELAY_MS = 200;

  const courseCardContentRef = useRef<HTMLDivElement>(null);
  const docenteCardContentRef = useRef<HTMLDivElement>(null);

  const clearTimers = () => {
    if (enterTimer.current) {
      clearTimeout(enterTimer.current);
      enterTimer.current = null;
    }
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  const handleCourseEnter = (disciplina: Disciplina | null) => {
    if (!disciplina) return;
    clearTimers();
    enterTimer.current = setTimeout(() => {
      setHoveredCourse(disciplina);
      setHoveredDocente(null);
    }, ENTER_DELAY_MS);
  };

  const handleDocenteEnter = (nome: string | null) => {
    clearTimers();
    if (!nome) return;

    const docente = docentes.find((d) => d.nome === nome);
    if (!docente) return;

    enterTimer.current = setTimeout(() => {
      setHoveredDocente(docente);
      setHoveredCourse(null);
    }, ENTER_DELAY_MS);
  };

  const handleMouseLeave = () => {
    clearTimers();
    leaveTimer.current = setTimeout(() => {
      setHoveredCourse(null);
      setHoveredDocente(null);
    }, LEAVE_DELAY_MS);
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

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (hoveredDocente && docenteCardContentRef.current) {
        event.preventDefault();
        docenteCardContentRef.current.scrollTop += event.deltaY;
      } else if (hoveredCourse && courseCardContentRef.current) {
        event.preventDefault();
        courseCardContentRef.current.scrollTop += event.deltaY;
      }
    };

    if (hoveredDocente || hoveredCourse) {
      window.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [hoveredDocente, hoveredCourse]);

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          // Define a altura total do layout da grade.
          // '100%' funciona se o layout pai (ex: em page.tsx ou layout.tsx)
          // já tiver uma altura definida.
          // Uma alternativa comum é 'calc(100vh - 80px)' (se sua navbar tiver 80px)
          // Vamos usar o valor que você tinha (88vh), mas aplicando-o ao
          // contêiner inteiro, não apenas à grade.
          height: "90vh",
          width: "100%",
          gap: 1, // Substitui o 'space-y-4' (gap: 2 = 16px)
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

        <Paper
          sx={{
            // width: "100%",
            // overflow: "hidden",
            flex: 1, // <-- CHAVE: Faz o Paper preencher o espaço restante
            display: "flex", // Para que o TableContainer possa usar height: 100%
          }}
        >
          {filteredDocentes.length > 0 && filteredDisciplinas.length > 0 && (
            <TimetableDataGrid //TimetableDataGrid -> Futuro
              setHoveredCourse={handleCourseEnter}
              setHoveredDocente={handleDocenteEnter}
              onMouseLeaveGrid={handleMouseLeave}
            />
          )}
        </Paper>
      </Box>

      <AlgoritmoDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onApply={applySolution}
        onStop={interruptExecution}
        processing={processing}
        progress={{
          current: disciplinasAlocadas,
          total: filteredDisciplinas.filter((disciplina) => disciplina.ativo)
            .length,
        }}
        estatisticasMonitoradas={estatisticasMonitoradas}
      />

      <Fade in={!!hoveredCourse} timeout={150}>
        <div
          style={{ position: "fixed", zIndex: 99, bottom: "6vh", right: "2vw" }}
        >
          {hoveredCourse && (
            <HoveredCourse
              ref={courseCardContentRef}
              disciplina={hoveredCourse}
              formularios={formularios}
              docentes={docentes}
              onMouseEnter={clearTimers}
              onMouseLeave={handleMouseLeave}
            />
          )}
        </div>
      </Fade>

      <Fade in={!!hoveredDocente} timeout={150}>
        <div
          style={{ position: "fixed", zIndex: 99, bottom: "6vh", right: "2vw" }}
        >
          {hoveredDocente && (
            <HoveredDocente
              ref={docenteCardContentRef}
              docente={hoveredDocente}
              disciplinas={disciplinas}
              formularios={formularios}
              atribuicoes={atribuicoes.filter((atribuicao) =>
                atribuicao.docentes.includes(hoveredDocente.nome)
              )}
              onMouseEnter={clearTimers}
              onMouseLeave={handleMouseLeave}
            />
          )}
        </div>
      </Fade>

      <CleanAlertDialog
        openDialog={openCleanDialog}
        cleanState={handleCleanApply}
        onCloseDialog={handleCleanDialogClose}
      />
    </ThemeProvider>
  );
}
