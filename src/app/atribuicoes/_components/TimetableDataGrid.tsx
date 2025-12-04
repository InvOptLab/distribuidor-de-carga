"use client";

import type React from "react";
import { useMemo } from "react";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import { Box, Typography, Tooltip } from "@mui/material";
import { useTimetable } from "../context/TimetableContext";
import { useHoverEffects } from "../hooks/useHoverEffects";
import {
  type Celula,
  TipoTrava,
  type Disciplina,
} from "@/context/Global/utils";
import { useCollaboration } from "@/context/Collaboration";

interface TimetableDataGridProps {
  setHoveredCourse: React.Dispatch<React.SetStateAction<Disciplina | null>>;
  setHoveredDocente: React.Dispatch<React.SetStateAction<string | null>>;
  onMouseLeaveGrid: () => void;
}

/**
 * Componente de grade de dados usando MUI X DataGrid
 * Substitui a tabela HTML customizada por uma solução mais robusta e performática
 */
export default function TimetableDataGrid({
  setHoveredCourse,
  setHoveredDocente,
  onMouseLeaveGrid,
}: TimetableDataGridProps) {
  const {
    filteredDocentes,
    filteredDisciplinas,
    formularios,
    atribuicoes,
    travas,
    maxPriority,
    handleCellClick,
    handleColumnClick,
    handleRowClick,
  } = useTimetable();

  const {
    hover,
    handleOnMouseEnter,
    handleOnMouseEnterDocente,
    setHeaderCollor,
    setColumnCollor,
    setCellColor,
    verificaConflitosDocente,
  } = useHoverEffects();

  //  Pegar infos da colaboração
  const { isInRoom, isOwner, config } = useCollaboration();

  const rows = useMemo(() => {
    return filteredDocentes
      .filter((docente) => docente.ativo)
      .map((docente, index) => {
        const row: any = {
          id: index,
          docente: docente.nome,
        };

        // Adiciona prioridades para cada disciplina
        filteredDisciplinas.forEach((disciplina) => {
          const formulario = formularios.find(
            (f) =>
              f.nome_docente === docente.nome &&
              f.id_disciplina === disciplina.id
          );
          row[disciplina.id] = formulario?.prioridade || null;
        });

        return row;
      });
  }, [filteredDocentes, filteredDisciplinas, formularios]);

  const columns = useMemo((): GridColDef[] => {
    // Coluna fixa do docente
    const docenteColumn: GridColDef = {
      field: "docente",
      headerName: "Docente",
      width: 200,
      pinnable: true,
      renderHeader: () => (
        <Box
          sx={{
            fontWeight: "bold",
            fontSize: "14px",
            padding: "8px",
            position: "sticky",
            left: 0,
            zIndex: 10,
            backgroundColor: "background.paper",
          }}
        >
          Docente
        </Box>
      ),
      renderCell: (params: GridRenderCellParams) => {
        const nomeDocente = params.value as string;
        const temConflito = verificaConflitosDocente(nomeDocente);

        return (
          <Tooltip title={temConflito ? "Docente com conflito de horário" : ""}>
            <Box
              onClick={(event) =>
                handleRowClick(event, {
                  nome_docente: nomeDocente,
                  id_disciplina: null,
                  tipo_trava: TipoTrava.Row,
                })
              }
              onMouseEnter={() => {
                handleOnMouseEnterDocente(nomeDocente);
                handleOnMouseEnter(nomeDocente, null);
                setHoveredDocente(nomeDocente);
              }}
              onMouseLeave={() => setHoveredDocente(null)}
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                padding: "8px",
                backgroundColor: setColumnCollor(nomeDocente),
                cursor: "pointer",
                fontWeight: temConflito ? "bold" : "normal",
                color: temConflito ? "error.main" : "inherit",
                transition: "background-color 0.2s ease",
                position: "sticky",
                left: 0,
                zIndex: 5, // Menor que o zIndex do header
              }}
            >
              {nomeDocente}
            </Box>
          </Tooltip>
        );
      },
    };

    // Colunas das disciplinas
    const disciplinaColumns: GridColDef[] = filteredDisciplinas.map(
      (disciplina) => ({
        field: disciplina.id,
        headerName: disciplina.codigo,
        width: 200,
        renderHeader: () => (
          <Box
            onClick={(event) =>
              handleColumnClick(event, {
                nome_docente: "",
                id_disciplina: disciplina.id,
                tipo_trava: TipoTrava.Column,
              })
            }
            onMouseEnter={() => {
              handleOnMouseEnter(null, disciplina.id);
              setHoveredCourse(disciplina);
            }}
            onMouseLeave={() => setHoveredCourse(null)}
            sx={{
              width: "100%",
              height: "100%",
              backgroundColor: setHeaderCollor(disciplina.id),
              cursor: "pointer",
              padding: "8px",
              transition: "background-color 0.2s ease",
            }}
            display="flex"
            flexDirection="column"
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                fontSize: "12px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {disciplina.codigo}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: "11px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {disciplina.nome}
            </Typography>
            {disciplina.horarios &&
              disciplina.horarios.length > 0 &&
              disciplina.horarios.map((horario) => {
                return (
                  <Typography
                    key={`${disciplina.id}_${horario.dia}-${horario.inicio}:-${horario.fim}`}
                    variant="caption"
                    sx={{
                      fontSize: "10px",
                      color: "text.secondary",
                    }}
                  >
                    {horario.dia} {horario.inicio}:{horario.fim}
                  </Typography>
                );
              })}
          </Box>
        ),
        renderCell: (params: GridRenderCellParams) => {
          const prioridade = params.value as number | null;
          const nomeDocente = params.row.docente as string;
          const celula: Celula = {
            nome_docente: nomeDocente,
            id_disciplina: disciplina.id,
            tipo_trava: TipoTrava.Cell,
          };

          const isAtribuido = atribuicoes.some(
            (atrib) =>
              atrib.id_disciplina === disciplina.id &&
              atrib.docentes.includes(nomeDocente)
          );

          const isTravado = travas.some(
            (trava) =>
              trava.id_disciplina === disciplina.id &&
              trava.nome_docente === nomeDocente
          );

          const isHovered =
            hover.docente === nomeDocente ||
            hover.id_disciplina === disciplina.id;

          return (
            <Box
              onClick={(event) =>
                handleCellClick(event, celula, {
                  isInRoom: isInRoom,
                  isOwner: isOwner,
                  config: config,
                })
              }
              onMouseEnter={() => {
                handleOnMouseEnter(nomeDocente, disciplina.id);
                onMouseLeaveGrid();
              }}
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: setCellColor(prioridade, celula),
                cursor: "pointer",
                fontWeight: isAtribuido ? "bold" : "normal",
                position: "relative",
                transition: "border 0.1s ease-out, z-index 0.1s ease-out",
                // border:
                //   hover.docente === nomeDocente ||
                //   hover.id_disciplina === disciplina.id
                //     ? "4px solid rgba(25, 118, 210, 1)"
                //     : "1px solid rgba(224, 224, 224, 0.5)",

                ...(isHovered
                  ? {
                      // ESTADO HOVER (LINHA/COLUNA)
                      border: "4px solid rgba(25, 118, 210, 1)", // Borda grossa azul (como no seu original)
                      zIndex: 15,
                    }
                  : {
                      // ESTADO PADRÃO
                      border: "1px solid rgba(224, 224, 224, 0.5)", // Borda fina cinza
                      zIndex: 1,
                    }),

                // &:hover NA CÉLULA ESPECÍFICA
                "&:hover": {
                  zIndex: 20, // Garante que a célula sob o mouse fique no topo
                  borderColor: "rgba(25, 118, 210, 1)", // Garante a cor azul
                  borderWidth: "4px", // Garante a espessura (sem "afinamento")
                },
              }}
            >
              {prioridade && (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "13px",
                    color: isAtribuido ? "error.main" : "inherit",
                  }}
                >
                  {prioridade}
                </Typography>
              )}
              {isTravado && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "warning.main",
                  }}
                />
              )}
            </Box>
          );
        },
      })
    );

    return [docenteColumn, ...disciplinaColumns];
  }, [
    filteredDisciplinas,
    atribuicoes,
    travas,
    hover,
    maxPriority,
    handleCellClick,
    handleColumnClick,
    handleRowClick,
    handleOnMouseEnter,
    handleOnMouseEnterDocente,
    setHeaderCollor,
    setColumnCollor,
    setCellColor,
    verificaConflitosDocente,
    setHoveredCourse,
    setHoveredDocente,
  ]);

  const handleLeaveDataGrid = () => {
    onMouseLeaveGrid();
    handleOnMouseEnter(null, null);
  };

  return (
    <Box
      sx={{ width: "100%", height: "calc(100vh - 200px)" }}
      onMouseLeave={onMouseLeaveGrid}
    >
      <DataGrid
        columnHeaderHeight={100}
        onColumnHeaderLeave={handleLeaveDataGrid}
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooter
        disableAutosize
        // disableColumnFilter
        // disableColumnSorting
        sx={{
          border: "none",
          "& .MuiDataGrid-cell": {
            padding: 0,
            // border: "1px solid rgba(224, 224, 224, 0.5)",
          },
          "& .MuiDataGrid-columnHeader": {
            padding: 0,
            border: "1px solid rgba(224, 224, 224, 1)",
            backgroundColor: "background.paper",
          },
          "& .MuiDataGrid-columnHeaders": {
            borderBottom: "2px solid rgba(224, 224, 224, 1)",
          },
          "& .MuiDataGrid-row": {
            "&:hover": {
              backgroundColor: "transparent",
            },
          },
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeader:focus": {
            outline: "none",
          },
          // // NOVOS ESTILOS PARA "PINAR" A COLUNA 'docente'
          // "& .MuiDataGrid-columnHeader[data-field='docente']": {
          //   position: "sticky",
          //   left: 0,
          //   zIndex: 10, // Garante que o header fixo fique acima das células
          //   backgroundColor: "background.paper",
          // },
          // "& .MuiDataGrid-cell[data-field='docente']": {
          //   position: "sticky",
          //   left: 0,
          //   zIndex: 5, // Fica acima das células normais, mas abaixo do header
          //   backgroundColor: "background.paper",
          // },
        }}
      />
    </Box>
  );
}
