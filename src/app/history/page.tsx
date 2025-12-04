"use client";

import { useGlobalContext } from "@/context/Global";
import {
  Container,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Fade,
} from "@mui/material";
import SolutionHistoryRow from "./_components/SolutionHistoryRow";
import HoveredCourse from "../atribuicoes/_components/HoveredCourse";
import { useEffect, useRef, useState } from "react";
import { TreeDisciplina } from "./_components/SolutionHistoryStatistics";
import { Formulario } from "@/algoritmo/communs/interfaces/interfaces";

const tableColumns = [
  "Identificador",
  "Avaliação",
  "Inserção",
  /*'Algoritmo',*/ "Ações",
];

export default function History() {
  const { historicoSolucoes } = useGlobalContext();

  /**
   * State para controlar o hover nos filhos do table header a fim de exibir o componenete HoveredCourese
   */
  const [hoveredCourse, setHoveredCourse] = useState<TreeDisciplina | null>(
    null
  );

  // Refs dos timers
  const enterTimer = useRef<NodeJS.Timeout | null>(null);
  const leaveTimer = useRef<NodeJS.Timeout | null>(null);

  const LEAVE_DELAY_MS = 200; // Atraso para sair (dá tempo de mover o mouse para o card)

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

  // Handler para SAIR (seja do trigger ou do próprio card)
  const handleMouseLeave = () => {
    clearTimers();
    leaveTimer.current = setTimeout(() => {
      setHoveredCourse(null);
    }, LEAVE_DELAY_MS);
  };

  const createHistoryColumns = () => {
    const historyColumns = [];

    for (const column of tableColumns) {
      historyColumns.push(
        <TableCell align="center" key={`cell_row_${column}`}>
          <Typography
            key={`typigraphy_${column}`}
            variant="h6"
            color="textPrimary"
            align="center"
          >
            {column}
          </Typography>
        </TableCell>
      );
    }

    return historyColumns;
  };

  const createHistoryComponents = () => {
    const historyComponents = [];

    historicoSolucoes.forEach((value, key) => {
      historyComponents.push(
        <SolutionHistoryRow
          key={`component_${key}`}
          id={key}
          solucao={value}
          setHoveredCourese={setHoveredCourse}
        />
      );
    });

    return historyComponents;
  };

  // Refs para os *elementos de conteúdo rolável* dentro dos cards
  const courseCardContentRef = useRef<HTMLDivElement>(null);

  // useEffect para encaminhamento de Scroll
  useEffect(() => {
    // Esta função será chamada CADA vez que o usuário usar o scroll
    const handleWheel = (event: WheelEvent) => {
      // Verifica se o card de Docente está ativo e se sua ref existe
      if (hoveredCourse && courseCardContentRef.current) {
        event.preventDefault(); // Impede a página de rolar
        // Aplica o scroll manualmente ao conteúdo do card
        courseCardContentRef.current.scrollTop += event.deltaY;
      }
      // Se nenhum card estiver ativo, esta função não fará nada
      // (e o listener idealmente já terá sido removido)
    };

    // Adiciona o listener SÓ SE um dos cards estiver ativo
    if (hoveredCourse) {
      // Adicionamos { passive: false } para permitir o uso de event.preventDefault()
      window.addEventListener("wheel", handleWheel, { passive: false });
    }

    // Função de limpeza do useEffect:
    // Isso é chamado quando o componente é desmontado
    // ou ANTES de o efeito rodar novamente (quando as dependências mudam)
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [hoveredCourse]); // Dependências: re-executa se o card ativo mudar

  return (
    <Container maxWidth="lg" key="container">
      <TableContainer key="tabbleContainer" onMouseLeave={handleMouseLeave}>
        <Table key="table">
          <TableHead key="tableHead">
            <TableRow key="tableHeadRow">
              <TableCell key="emptyCellRow" />
              {createHistoryColumns()}
            </TableRow>
          </TableHead>
          <TableBody key="tableBody">{createHistoryComponents()}</TableBody>
        </Table>
      </TableContainer>
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
              onMouseEnter={clearTimers} // Se entrar no card, cancela o "fechar"
              onMouseLeave={handleMouseLeave} // Se sair do card, agenda o "fechar"
              docentes={Array.from(new Set(hoveredCourse.formularios.values()))}
              formularios={Array.from(
                hoveredCourse.formularios.values().map((item) => {
                  const formulario: Formulario = {
                    id_disciplina: hoveredCourse.id,
                    nome_docente: item.nome,
                    prioridade: item.prioridade,
                  };
                  return formulario;
                })
              )}
            >
              {/* <Grid
                container
                size={{ xs: 12 }}
                spacing={1}
                //sx={{ maxHeight: "10em", overflowY: "auto" }}
                maxWidth="40em"
                key="grid_history_main"
              >
                {renderHoverCourseChildren(hoveredCourse)}
              </Grid> */}
            </HoveredCourse>
          )}
        </div>
      </Fade>
    </Container>
  );
}
