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

export default function TimetableGrid({
  setHoveredCourse,
  setHoveredDocente,
  onMouseLeaveGrid,
}: TimetableGridProps) {
  const { filteredDisciplinas } = useTimetable();
  const { rows } = useTimetableRows();
  const {
    hover,
    setHover,
    handleOnMouseEnter,
    handleOnMouseEnterDocente,
    setHeaderCollor,
    setColumnCollor,
    setCellColor,
    setBorder,
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
      sx={{ maxHeight: "100%", overflow: "scroll" }}
      onMouseLeave={onMouseLeaveGrid}
    >
      <Table
        sx={{ width: "fit-content", height: "fit-content" }}
        aria-label="sticky table"
        stickyHeader
      >
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                minWidth: "9rem",
                maxWidth: "11rem",
                position: "sticky",
                left: 0,
                backgroundColor: "white",
                zIndex: 3,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Docentes
            </TableCell>
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
                    style={{
                      backgroundColor: "white",
                      margin: 0,
                      padding: 1,
                      ...setBorder(
                        hover,
                        { docente: null, id_disciplina: disciplina.id },
                        "coluna"
                      ),
                    }}
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
            <TableRow key={atribuicao.nome} sx={{ maxHeight: "2rem" }}>
              <TableCell
                component="th"
                scope="row"
                sx={{
                  maxWidth: "11rem",
                  position: "sticky",
                  left: 0,
                  backgroundColor: "white",
                  zIndex: 1,
                  textOverflow: "ellipsis",
                  padding: 0,
                  paddingRight: 1,
                }}
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
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: setColumnCollor(atribuicao.nome),
                    padding: "3px",
                    width: "100%",
                    ...setBorder(
                      hover,
                      { docente: atribuicao.nome, id_disciplina: null },
                      "linha"
                    ),
                  }}
                  noWrap
                >
                  {atribuicao.nome}
                </Typography>
              </TableCell>
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
                      style={{
                        backgroundColor: setCellColor(prioridade.prioridade, {
                          nome_docente: atribuicao.nome,
                          id_disciplina: prioridade.id_disciplina,
                          tipo_trava: TipoTrava.Cell,
                        }),
                        padding: "2px",
                        ...setBorder(
                          hover,
                          {
                            docente: atribuicao.nome,
                            id_disciplina: prioridade.id_disciplina,
                          },
                          "celula"
                        ),
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
