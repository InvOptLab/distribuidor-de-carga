"use client";

import { Paper } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material";
import { useState } from "react";
import TimetableGrid from "./TimetableGrid";
import AlgoritmoDialog from "@/components/AlgorithmDialog";
import CleanAlertDialog from "./CleanAlertDialog";
import HoveredCourse from "./HoveredCourse";
import HoveredDocente from "./HoveredDocente";
import TimetableFilters from "./TimetableFilters";
import { useAlgorithm } from "../hooks/useAlgorithm";
import type { Disciplina, Docente } from "@/context/Global/utils";
import { useTimetable } from "../context/TimetableContext";
import { useGlobalContext } from "@/context/Global";

// Customizar todos os TableCell
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

  const handleCleanDialogClose = () => {
    setOpenCleanDialog(false);
  };

  const handleCleanApply = () => {
    cleanStateAtribuicoes();
    setOpenCleanDialog(false);
  };

  const setHoveredCourseInChildren = (nome: string | null) => {
    const docente = docentes.find((d) => d.nome === nome);

    setHoveredDocente(docente);
  };

  return (
    <ThemeProvider theme={customTheme}>
      <div className="space-y-4">
        <TimetableFilters
          docenteFilters={docenteFilters}
          disciplinaFilters={disciplinaFilters}
          onDocenteFiltersChange={setDocenteFilters}
          onDisciplinaFiltersChange={setDisciplinaFilters}
          onClearFilters={clearFilters}
        />

        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          {filteredDocentes.length > 0 && filteredDisciplinas.length > 0 && (
            <TimetableGrid
              onExecute={executeProcess}
              onClean={() => setOpenCleanDialog(true)}
              onDownload={downalodJson}
              onSave={saveAlterations}
              setHoveredCourse={setHoveredCourse}
              setHoveredDocente={setHoveredCourseInChildren}
            />
          )}
        </Paper>
      </div>

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

      {hoveredCourse && (
        <HoveredCourse
          disciplina={hoveredCourse}
          setHoveredCourese={setHoveredCourse}
          formularios={formularios}
          docentes={docentes}
        >
          {/* {renderHoverCourseChildren(hoveredCourse)} */}
        </HoveredCourse>
      )}

      {hoveredDocente && (
        <HoveredDocente
          docente={hoveredDocente}
          setHoveredDocente={setHoveredDocente}
          disciplinas={disciplinas}
          formularios={formularios}
          atribuicoes={atribuicoes.filter((atribuicao) =>
            atribuicao.docentes.includes(hoveredDocente.nome)
          )}
        >
          {/* {renderHoverDocenteChildren(hoveredDocente)} */}
        </HoveredDocente>
      )}

      <CleanAlertDialog
        openDialog={openCleanDialog}
        cleanState={handleCleanApply}
        onCloseDialog={handleCleanDialogClose}
      />
    </ThemeProvider>
  );
}
