"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Tooltip,
  Box,
  TableSortLabel,
} from "@mui/material";
import { FilterList as FilterIcon } from "@mui/icons-material";
import {
  Atribuicao,
  Disciplina,
  Docente,
  Formulario,
} from "@/algoritmo/communs/interfaces/interfaces";
import {
  ColumnConfig,
  formatCellValue,
  getCellValue,
} from "@/types/column-config";
import { DocenteCell } from "./DocenteCell";

interface PlanilhaTableProps {
  /**
   * Lista de disciplinas a serem exibidas
   */
  disciplinas: Disciplina[];

  /**
   * Colunas visíveis
   */
  columns: ColumnConfig[];

  /**
   * Lista de docentes disponíveis
   */
  docentes: Docente[];

  /**
   * Lista de formulários (prioridades)
   */
  formularios: Formulario[];

  /**
   * Atribuições
   */
  atribuicoes: Atribuicao[];

  /**
   * Estado de ordenação
   */
  sortState: { columnId: string; direction: "asc" | "desc" | null };

  /**
   * Estado de filtros
   */
  filterState: { [columnId: string]: string };

  /**
   * Callback para ordenação
   */
  onSort: (columnId: string) => void;

  /**
   * Callback para filtro
   */
  onFilter: (columnId: string, value: string) => void;

  /**
   * Callback para atualizar docentes de uma disciplina
   */
  onUpdateDocentes: (disciplinaId: string, docentes: string[]) => void;
}

/**
 * Componente principal da tabela da planilha
 */
export function PlanilhaTable({
  disciplinas,
  columns,
  docentes,
  formularios,
  atribuicoes,
  sortState,
  filterState,
  onSort,
  onFilter,
  onUpdateDocentes,
}: PlanilhaTableProps) {
  // const [editingCell, setEditingCell] = useState<{
  //   disciplinaId: string;
  //   columnId: string;
  // } | null>(null);
  const [showFilters, setShowFilters] = useState<{
    [columnId: string]: boolean;
  }>({});

  // /**
  //  * Calcula o número máximo de horários para determinar células vazias
  //  */
  // const maxHorarios = useMemo(() => {
  //   return Math.max(...disciplinas.map((d) => d.horarios?.length || 0), 0);
  // }, [disciplinas]);

  /**
   * Renderiza o conteúdo de uma célula
   */
  const renderCell = (disciplina: Disciplina, column: ColumnConfig) => {
    const cellValue = getCellValue(disciplina, column);

    // Célula de docentes (editável)
    if (column.type === "docentes") {
      const docentesAtribuidos = atribuicoes.find(
        (atribuicao) => atribuicao.id_disciplina === disciplina.id
      ).docentes;
      return (
        <DocenteCell
          disciplina={disciplina}
          docentesAtribuidos={docentesAtribuidos || []}
          docentesDisponiveis={docentes}
          formularios={formularios}
          onChange={(newDocentes) =>
            onUpdateDocentes(disciplina.id, newDocentes)
          }
        />
      );
    }

    // Célula de horário vazia (inativa)
    if (column.type === "horarios" && !cellValue) {
      return (
        <Box
          sx={{
            backgroundColor: "action.disabledBackground",
            color: "text.disabled",
            padding: "8px",
            textAlign: "center",
            fontSize: "0.875rem",
          }}
        >
          —
        </Box>
      );
    }

    // Célula normal
    return (
      <Box sx={{ padding: "8px", fontSize: "0.875rem" }}>
        {formatCellValue(cellValue, column)}
      </Box>
    );
  };

  /**
   * Renderiza o cabeçalho de uma coluna
   */
  const renderColumnHeader = (column: ColumnConfig) => {
    const isFiltering = showFilters[column.id];
    const hasFilter = filterState[column.id];

    return (
      <TableCell
        key={column.id}
        sx={{
          minWidth: column.width,
          backgroundColor: "background.paper",
          borderBottom: "2px solid",
          borderColor: "divider",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Label com ordenação */}
          {column.sortable ? (
            <TableSortLabel
              active={sortState.columnId === column.id}
              direction={
                sortState.columnId === column.id
                  ? sortState.direction || "asc"
                  : "asc"
              }
              onClick={() => onSort(column.id)}
              sx={{ flex: 1 }}
            >
              {column.label}
            </TableSortLabel>
          ) : (
            <Box sx={{ flex: 1, fontWeight: 600 }}>{column.label}</Box>
          )}

          {/* Botão de filtro */}
          {column.filterable && (
            <Tooltip title="Filtrar">
              <IconButton
                size="small"
                onClick={() =>
                  setShowFilters((prev) => ({
                    ...prev,
                    [column.id]: !prev[column.id],
                  }))
                }
                color={hasFilter ? "primary" : "default"}
              >
                <FilterIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Campo de filtro */}
        {isFiltering && column.filterable && (
          <TextField
            size="small"
            placeholder={`Filtrar ${column.label.toLowerCase()}...`}
            value={filterState[column.id] || ""}
            onChange={(e) => onFilter(column.id, e.target.value)}
            fullWidth
            sx={{ marginTop: 1 }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </TableCell>
    );
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: "calc(100vh - 200px)",
        overflow: "auto",
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>{columns.map(renderColumnHeader)}</TableRow>
        </TableHead>
        <TableBody>
          {disciplinas.map((disciplina) => (
            <TableRow
              key={disciplina.id}
              hover
              sx={{
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={`${disciplina.id}-${column.id}`}
                  sx={{
                    minWidth: column.width,
                    padding: 0,
                    borderRight: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {renderCell(disciplina, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
