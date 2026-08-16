"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import { useTimetableRows } from "../hooks/useTimetableRows";
import { useHoverEffects } from "../hooks/useHoverEffects";
import HeaderCell from "./HeaderCell";
import { useTimetable } from "../context/TimetableContext";
import { TipoTrava, Disciplina } from "@/algoritmo/communs/interfaces/interfaces";
import { useCollaboration } from "@/context/Collaboration";
import { useTranslations } from "next-intl";
import { useAccessibility } from "@/context/Accessibility";

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
  borderBottom: "1px solid",
  borderColor: "divider",
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
  const { filteredDisciplinas, isLockMode, travas } = useTimetable();
  const { rows } = useTimetableRows();

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

  //  Pegar infos da colaboração
  const { isInRoom, isOwner, config } = useCollaboration();
  const { cursors } = useCollaboration();
  const t = useTranslations("Pages.Assignment.TimetableGrid");
  const { isHighContrast } = useAccessibility();

  const handleMouseEnterDocente = (
    atribuicao: {
      nome: string;
      prioridades: {
        id_disciplina: string;
        prioridade: number;
      }[];
    } | null,
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
        height: "100%",
        width: "100%",
        overflow: "auto",
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
              {t("professors")}
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
                      borderBottom: "1px solid",
                      borderColor: "divider",
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
                    {isLockMode && travas.some(t => t.id_disciplina === disciplina.id && t.tipo_trava === TipoTrava.Column) && (
                      <LockOutlinedIcon sx={{ position: "absolute", top: 2, right: 2, fontSize: "1rem", color: "text.secondary" }} />
                    )}
                  </TableCell>
                ),
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
                  {isLockMode && travas.some(t => t.nome_docente === atribuicao.nome && t.tipo_trava === TipoTrava.Row) && (
                    <LockOutlinedIcon sx={{ position: "absolute", top: 2, right: 2, fontSize: "1rem", color: "text.secondary" }} />
                  )}
                </Typography>
              </TableCell>

              {/* CÉLULAS BODY DADOS (PRIORIDADES) */}
              {atribuicao.prioridades.map(
                (prioridade) =>
                  filteredDisciplinas.find(
                    (disciplina) =>
                      disciplina.id == prioridade.id_disciplina &&
                      disciplina.ativo,
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
                        padding: "2px",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        borderRight: "1px solid rgba(224, 224, 224, 1)",
                        ...(setCellColor(prioridade.prioridade, {
                          nome_docente: atribuicao.nome,
                          id_disciplina: prioridade.id_disciplina,
                          tipo_trava: TipoTrava.Cell,
                        }, isHighContrast) as any),
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
                          cursor: isLockMode ? "pointer" : "default",
                        },
                      }}
                      onClick={(event) =>
                        handleCellClick(
                          event,
                          {
                            nome_docente: atribuicao.nome,
                            id_disciplina: prioridade.id_disciplina,
                            tipo_trava: TipoTrava.Cell,
                          },
                          {
                            isInRoom: isInRoom,
                            isOwner: isOwner,
                            config: config,
                          },
                        )
                      }
                      onMouseEnter={() =>
                        handleOnMouseEnter(
                          atribuicao.nome,
                          prioridade.id_disciplina,
                        )
                      }
                      onMouseLeave={() => {
                        setHover({ docente: "", id_disciplina: "" });
                        onMouseLeaveGrid();
                      }}
                    >
                      <Box sx={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {prioridade.prioridade}
                        {isLockMode && travas.some(t => t.id_disciplina === prioridade.id_disciplina && t.nome_docente === atribuicao.nome) && (
                          <LockOutlinedIcon sx={{ position: "absolute", opacity: 0.6, fontSize: "1.2rem" }} />
                        )}
                      </Box>
                    </TableCell>
                  ),
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
