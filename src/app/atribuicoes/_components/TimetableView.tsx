"use client";

import { Fade, Paper } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material";
import { useEffect, useRef, useState } from "react";
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

  // Refs dos timers
  const enterTimer = useRef<NodeJS.Timeout | null>(null);
  const leaveTimer = useRef<NodeJS.Timeout | null>(null);

  const ENTER_DELAY_MS = 150; // Atraso para entrar
  const LEAVE_DELAY_MS = 200; // Atraso para sair (dá tempo de mover o mouse para o card)

  // Refs para os *elementos de conteúdo rolável* dentro dos cards
  const courseCardContentRef = useRef<HTMLDivElement>(null);
  const docenteCardContentRef = useRef<HTMLDivElement>(null);

  // Limpa qualquer timer pendente
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

  // Handler para ENTRAR em um CURSO
  const handleCourseEnter = (disciplina: Disciplina | null) => {
    if (!disciplina) return;
    clearTimers();
    enterTimer.current = setTimeout(() => {
      setHoveredCourse(disciplina);
      setHoveredDocente(null); // Garante que só um esteja aberto
    }, ENTER_DELAY_MS);
  };

  // Handler para ENTRAR em um DOCENTE
  const handleDocenteEnter = (nome: string | null) => {
    clearTimers();
    if (!nome) return;

    const docente = docentes.find((d) => d.nome === nome);
    if (!docente) return;

    enterTimer.current = setTimeout(() => {
      setHoveredDocente(docente);
      setHoveredCourse(null); // Garante que só um esteja aberto
    }, ENTER_DELAY_MS);
  };

  // Handler para SAIR (seja do trigger ou do próprio card)
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

  // useEffect para encaminhamento de Scroll
  useEffect(() => {
    // Esta função será chamada CADA vez que o usuário usar o scroll
    const handleWheel = (event: WheelEvent) => {
      // Verifica se o card de Docente está ativo e se sua ref existe
      if (hoveredDocente && docenteCardContentRef.current) {
        event.preventDefault(); // Impede a página de rolar
        // Aplica o scroll manualmente ao conteúdo do card
        docenteCardContentRef.current.scrollTop += event.deltaY;
      }
      // Se não, verifica se o card de Curso está ativo
      else if (hoveredCourse && courseCardContentRef.current) {
        event.preventDefault(); // Impede a página de rolar
        // Aplica o scroll manualmente ao conteúdo do card
        courseCardContentRef.current.scrollTop += event.deltaY;
      }
      // Se nenhum card estiver ativo, esta função não fará nada
      // (e o listener idealmente já terá sido removido)
    };

    // Adiciona o listener SÓ SE um dos cards estiver ativo
    if (hoveredDocente || hoveredCourse) {
      // Adicionamos { passive: false } para permitir o uso de event.preventDefault()
      window.addEventListener("wheel", handleWheel, { passive: false });
    }

    // Função de limpeza do useEffect:
    // Isso é chamado quando o componente é desmontado
    // ou ANTES de o efeito rodar novamente (quando as dependências mudam)
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [hoveredDocente, hoveredCourse]); // Dependências: re-executa se o card ativo mudar

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
              setHoveredCourse={handleCourseEnter}
              setHoveredDocente={handleDocenteEnter}
              onMouseLeaveGrid={handleMouseLeave} // Handler de saída
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

      {/* Envolve os cards em <Fade> para fluidez */}
      {/* O `in` agora é um booleano */}
      <Fade in={!!hoveredCourse} timeout={150}>
        {/* Wrapper <div style={{...}}> é necessário para o Fade 
            posicionar corretamente um item 'fixed' */}
        <div
          style={{ position: "fixed", zIndex: 99, bottom: "6vh", right: "2vw" }}
        >
          {/* Só renderiza o conteúdo se o objeto existir (evita erro no Fade out) */}
          {hoveredCourse && (
            <HoveredCourse
              ref={courseCardContentRef}
              disciplina={hoveredCourse}
              formularios={formularios}
              docentes={docentes}
              onMouseEnter={clearTimers} // Se entrar no card, cancela o "fechar"
              onMouseLeave={handleMouseLeave} // Se sair do card, agenda o "fechar"
            ></HoveredCourse>
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
            ></HoveredDocente>
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
