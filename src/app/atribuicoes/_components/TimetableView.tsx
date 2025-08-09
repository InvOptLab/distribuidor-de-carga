"use client";

import { Box, Grid2, Paper, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material";
import { ReactNode, useState } from "react";
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
  } = useAlgorithm();

  const { formularios, docentes } = useGlobalContext();

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

  function renderHoverCourseChildren(hoveredCourse: Disciplina): ReactNode {
    const turmaFormularios = formularios.filter(
      (f) => f.id_disciplina === hoveredCourse.id
    );

    return turmaFormularios.map((f) => {
      const docente = docentes.find((d) => d.nome === f.nome_docente);
      return (
        <Grid2 size={6} key={`${f.nome_docente}_${f.id_disciplina}`}>
          <Box
            key={`box_hover_${f.nome_docente}_${f.id_disciplina}`}
            display="flex"
            alignItems="center"
          >
            <Typography
              key={`typography_hover_saldo_${f.nome_docente}_${f.id_disciplina}`}
              variant="body2"
              sx={{
                fontFamily: "monospace",
                whiteSpace: "nowrap",
              }}
              color={docente?.saldo < 0 ? "error" : "success"}
            >
              (
              {(docente?.saldo < 0 ? "" : "+") +
                docente?.saldo.toFixed(1).replace(".", ",")}
              )&emsp;
            </Typography>
            <Typography
              key={`typography_hover_${f.nome_docente}_${f.id_disciplina}`}
              variant="body2"
            >
              {f.nome_docente} : {f.prioridade}
            </Typography>
          </Box>
        </Grid2>
      );
    });
  }

  // function renderHoverDocenteChildren(hoveredDocente: Docente): ReactNode {
  //   const turmaFormularios = formularios.filter(
  //     (f) => f.nome_docente === hoveredDocente.nome
  //   );

  //   return turmaFormularios.map((f) => {
  //     const disciplina = disciplinas.find((d) => d.id === f.id_disciplina);
  //     return (
  //       <Grid2 size={6} key={`${f.nome_docente}_${f.id_disciplina}`}>
  //         <Box
  //           key={`box_hover_${f.nome_docente}_${f.id_disciplina}`}
  //           display="flex"
  //           alignItems="center"
  //         >
  //           <Typography
  //             key={`typography_hover_saldo_${f.nome_docente}_${f.id_disciplina}`}
  //             variant="body2"
  //             sx={{
  //               fontFamily: "monospace",
  //               whiteSpace: "nowrap",
  //             }}
  //             //color={docente?.saldo < 0 ? "error" : "success"}
  //           >
  //             ({disciplina?.carga.toFixed(1).replace(".", ",")}
  //             )&emsp;
  //           </Typography>
  //           <Typography
  //             key={`typography_hover_${f.nome_docente}_${f.id_disciplina}`}
  //             variant="body2"
  //           >
  //             {f.id_disciplina} : {f.prioridade}
  //           </Typography>
  //         </Box>
  //       </Grid2>
  //     );
  //   });
  // }
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
      />

      {hoveredCourse && (
        <HoveredCourse
          disciplina={hoveredCourse}
          setHoveredCourese={setHoveredCourse}
        >
          {renderHoverCourseChildren(hoveredCourse)}
        </HoveredCourse>
      )}

      {hoveredDocente && (
        <HoveredDocente
          docente={hoveredDocente}
          setHoveredDocente={setHoveredDocente}
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
