"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTimetableRows } from "../hooks/useTimetableRows";
import { useHoverEffects } from "../hooks/useHoverEffects";
import HeaderCell from "./HeaderCell";
import { useTimetable } from "../context/TimetableContext";
import {
  Disciplina,
  TipoTrava,
} from "@/algoritmo/communs/interfaces/interfaces";

interface TimetableGridProps {
  setHoveredCourse: (disciplina: Disciplina | null) => void;
  setHoveredDocente: (docente: string | null) => void;
  onMouseLeaveGrid: () => void;
}

// Estilos reutilizáveis para a coluna sticky
const stickyHeaderCellSx = {
  position: "sticky",
  left: 0,
  backgroundColor: "background.paper", // Evita transparência no scroll
  zIndex: 3, // Header da coluna sticky
  borderRight: "1px solid rgba(224, 224, 224, 1)",
  borderBottom: "1px solid rgba(224, 224, 224, 1)",
};

const stickyBodyCellSx = {
  ...stickyHeaderCellSx,
  zIndex: 1, // Célula do body sticky
  maxWidth: "11rem",
  padding: 0, // Remover padding da célula para o Typography controlar
};

export default function TimetableGrid({
  setHoveredCourse,
  setHoveredDocente,
  onMouseLeaveGrid,
}: TimetableGridProps) {
  const { filteredDisciplinas } = useTimetable();
  const { rows } = useTimetableRows();

  // O hook agora não retorna mais 'setBorder'
  const {
    hover,
    setHover,
    handleOnMouseEnter,
    handleOnMouseEnterDocente,
    setHeaderCollor,
    setColumnCollor,
    setCellColor,
  } = useHoverEffects();

  const { handleCellClick, handleColumnClick, handleRowClick } = useTimetable();

  const handleMouseEnterDocente = (
    atribuicao: {
      nome: string;
      prioridades: {
        id_disciplina: string;
        prioridade: number;
      }[];
    } | null
  ) => {
    if (atribuicao) {
      handleOnMouseEnterDocente(atribuicao.nome);
      setHoveredDocente(atribuicao.nome);
    } else {
      handleOnMouseEnterDocente(null);
      onMouseLeaveGrid();
    }
  };

  return (
    <TableContainer
      sx={{
        height: "calc(100vh - 200px)", // Preenche o <Paper> pai
        width: "100%", // Preenche o <Paper> pai
        overflow: "auto", // Adiciona scrolls X e Y
        borderTop: "1px solid rgba(224, 224, 224, 1)",
        borderLeft: "1px solid rgba(224, 224, 224, 1)",
      }}
      onMouseLeave={onMouseLeaveGrid}
    >
      <Table aria-label="sticky table" stickyHeader>
        <TableHead>
          <TableRow>
            {/* CÉLULA HEADER DOCENTES (STICKY) */}
            <TableCell
              sx={{
                ...stickyHeaderCellSx,
                minWidth: "9rem",
                maxWidth: "11rem",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "0.875rem",
              }}
            >
              Docentes
            </TableCell>

            {/* CÉLULAS HEADER DISCIPLINAS */}
            {filteredDisciplinas.map(
              (disciplina) =>
                disciplina.ativo && (
                  <TableCell
                    key={disciplina.id}
                    onClick={(e) =>
                      handleColumnClick(e, {
                        id_disciplina: disciplina.id,
                        tipo_trava: TipoTrava.Column,
                      })
                    }
                    sx={{
                      // 'style' com 'setBorder' foi removido
                      backgroundColor: "white",
                      margin: 0,
                      padding: 0, // O HeaderCell controla seu padding
                      borderBottom: "1px solid rgba(224, 224, 224, 1)",
                      borderRight: "1px solid rgba(224, 224, 224, 1)",
                      verticalAlign: "top",
                    }}
                    onMouseLeave={onMouseLeaveGrid}
                  >
                    <HeaderCell
                      key={disciplina.id}
                      disciplina={disciplina}
                      setHeaderCollor={setHeaderCollor}
                      setParentHoveredCourse={setHoveredCourse}
                    />
                  </TableCell>
                )
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows().map((atribuicao) => (
            <TableRow
              key={atribuicao.nome}
              sx={{
                maxHeight: "2rem",
                "&:hover": { backgroundColor: "transparent" }, // Desativa hover padrão
              }}
            >
              {/* CÉLULA BODY DOCENTES (STICKY) */}
              <TableCell
                component="th"
                scope="row"
                sx={stickyBodyCellSx}
                onClick={(e) =>
                  handleRowClick(e, {
                    nome_docente: atribuicao.nome,
                    tipo_trava: TipoTrava.Row,
                  })
                }
                onMouseEnter={() => handleMouseEnterDocente(atribuicao)}
                onMouseLeave={() => handleMouseEnterDocente(null)}
              >
                <Typography
                  align="left"
                  variant="body2"
                  noWrap
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: setColumnCollor(atribuicao.nome), // Highlight da linha
                    padding: "6px 10px",
                    width: "100%",
                    height: "100%",
                    transition: "background-color 0.2s ease",
                    // '...setBorder' foi removido
                  }}
                  onMouseLeave={() => handleMouseEnterDocente(null)}
                >
                  {atribuicao.nome}
                </Typography>
              </TableCell>

              {/* CÉLULAS BODY DADOS (PRIORIDADES) */}
              {atribuicao.prioridades.map(
                (prioridade) =>
                  filteredDisciplinas.find(
                    (disciplina) =>
                      disciplina.id == prioridade.id_disciplina &&
                      disciplina.ativo
                  ) && (
                    <TableCell
                      key={
                        atribuicao.nome +
                        "_" +
                        prioridade.prioridade +
                        "_" +
                        prioridade.id_disciplina
                      }
                      align="center"
                      sx={{
                        // 'style' com 'setBorder' foi removido
                        backgroundColor: setCellColor(prioridade.prioridade, {
                          nome_docente: atribuicao.nome,
                          id_disciplina: prioridade.id_disciplina,
                          tipo_trava: TipoTrava.Cell,
                        }),
                        padding: "2px",
                        borderBottom: "1px solid rgba(224, 224, 224, 1)",
                        borderRight: "1px solid rgba(224, 224, 224, 1)",
                        transition: "background-color 0.2s ease",
                        // Highlight sutil para linha/coluna hover
                        ...(hover.docente === atribuicao.nome && {
                          boxShadow: "inset 0 0 0 4px rgba(25, 118, 210, 0.5)",
                        }),
                        ...(hover.id_disciplina ===
                          prioridade.id_disciplina && {
                          boxShadow: "inset 0 0 0 4px rgba(25, 118, 210, 0.5)",
                        }),
                        // Efeito de hover na célula individual
                        "&:hover": {
                          boxShadow: "inset 0 0 0 5px rgba(25, 118, 210, 0.9)",
                          zIndex: 2,
                        },
                      }}
                      onClick={(event) =>
                        handleCellClick(event, {
                          nome_docente: atribuicao.nome,
                          id_disciplina: prioridade.id_disciplina,
                          tipo_trava: TipoTrava.Cell,
                        })
                      }
                      onMouseEnter={() =>
                        handleOnMouseEnter(
                          atribuicao.nome,
                          prioridade.id_disciplina
                        )
                      }
                      onMouseLeave={() => {
                        setHover({ docente: "", id_disciplina: "" });
                        onMouseLeaveGrid();
                      }}
                    >
                      {prioridade.prioridade}
                    </TableCell>
                  )
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
