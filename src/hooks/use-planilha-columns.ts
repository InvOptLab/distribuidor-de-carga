"use client";

import { Disciplina } from "@/algoritmo/communs/interfaces/interfaces";
import {
  ColumnConfig,
  FilterState,
  getCellValue,
  SortState,
} from "@/types/column-config";
import { useState, useMemo, useCallback } from "react";

/**
 * Hook para gerenciar colunas da planilha
 */
export function usePlanilhaColumns(disciplinas: Disciplina[]) {
  // Calcula o número máximo de horários entre todas as disciplinas
  const maxHorarios = useMemo(() => {
    return Math.max(...disciplinas.map((d) => d.horarios?.length || 0), 0);
  }, [disciplinas]);

  // Configuração inicial das colunas
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    const baseColumns: ColumnConfig[] = [
      {
        id: "id",
        label: "ID",
        type: "id",
        visible: true,
        order: 0,
        width: 100,
        sortable: true,
        filterable: true,
      },
      {
        id: "codigo",
        label: "Código",
        type: "codigo",
        visible: true,
        order: 1,
        width: 120,
        sortable: true,
        filterable: true,
      },
      {
        id: "turma",
        label: "Turma",
        type: "turma",
        visible: true,
        order: 2,
        width: 100,
        sortable: true,
        filterable: true,
      },
      {
        id: "nome",
        label: "Nome",
        type: "nome",
        visible: true,
        order: 3,
        width: 250,
        sortable: true,
        filterable: true,
      },
      {
        id: "docentes",
        label: "Docentes",
        type: "docentes",
        visible: true,
        order: 4,
        width: 200,
        sortable: false,
        filterable: true,
        editable: true,
      },
      {
        id: "cursos",
        label: "Cursos",
        type: "cursos",
        visible: true,
        order: 5,
        width: 200,
        sortable: true,
        filterable: true,
      },
      {
        id: "nivel",
        label: "Nível",
        type: "nivel",
        visible: true,
        order: 6,
        width: 120,
        sortable: true,
        filterable: true,
      },
      // {
      //   id: "prioridade",
      //   label: "Prioridade",
      //   type: "prioridade",
      //   visible: true,
      //   order: 7,
      //   width: 120,
      //   sortable: true,
      //   filterable: true,
      // },
      {
        id: "noturna",
        label: "Noturna",
        type: "noturna",
        visible: true,
        order: 8,
        width: 100,
        sortable: true,
        filterable: true,
      },
      {
        id: "ingles",
        label: "Inglês",
        type: "ingles",
        visible: true,
        order: 9,
        width: 100,
        sortable: true,
        filterable: true,
      },
      {
        id: "ativo",
        label: "Ativo",
        type: "ativo",
        visible: true,
        order: 10,
        width: 100,
        sortable: true,
        filterable: true,
      },
      {
        id: "grupo",
        label: "Grupo",
        type: "grupo",
        visible: true,
        order: 11,
        width: 120,
        sortable: true,
        filterable: true,
      },
      {
        id: "carga",
        label: "Carga",
        type: "carga",
        visible: true,
        order: 12,
        width: 100,
        sortable: true,
        filterable: true,
      },
    ];

    // Adiciona colunas dinâmicas de horários
    const horarioColumns: ColumnConfig[] = [];
    for (let i = 0; i < maxHorarios; i++) {
      horarioColumns.push({
        id: `horario-${i}`,
        label: `Horário ${i + 1}`,
        type: "horarios",
        visible: true,
        order: 13 + i,
        width: 150,
        sortable: false,
        filterable: false,
        horarioIndex: i,
      });
    }

    return [...baseColumns, ...horarioColumns];
  });

  // Estado de ordenação
  const [sortState, setSortState] = useState<SortState>({
    columnId: "",
    direction: null,
  });

  // Estado de filtros
  const [filterState, setFilterState] = useState<FilterState>({});

  /**
   * Colunas visíveis ordenadas
   */
  const visibleColumns = useMemo(() => {
    return columns
      .filter((col) => col.visible)
      .sort((a, b) => a.order - b.order);
  }, [columns]);

  /**
   * Alterna a visibilidade de uma coluna
   */
  const toggleColumnVisibility = useCallback((columnId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  }, []);

  /**
   * Reordena as colunas
   */
  const reorderColumns = useCallback((fromIndex: number, toIndex: number) => {
    setColumns((prev) => {
      const visibleCols = prev
        .filter((c) => c.visible)
        .sort((a, b) => a.order - b.order);
      const hiddenCols = prev.filter((c) => !c.visible);

      const [movedColumn] = visibleCols.splice(fromIndex, 1);
      visibleCols.splice(toIndex, 0, movedColumn);

      // Atualiza a ordem
      const reorderedVisible = visibleCols.map((col, idx) => ({
        ...col,
        order: idx,
      }));

      return [...reorderedVisible, ...hiddenCols];
    });
  }, []);

  /**
   * Aplica ordenação
   */
  const handleSort = useCallback((columnId: string) => {
    setSortState((prev) => {
      if (prev.columnId !== columnId) {
        return { columnId, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { columnId, direction: "desc" };
      }
      return { columnId: "", direction: null };
    });
  }, []);

  /**
   * Aplica filtro
   */
  const handleFilter = useCallback((columnId: string, value: string) => {
    setFilterState((prev) => {
      if (!value) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [columnId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [columnId]: value };
    });
  }, []);

  /**
   * Disciplinas filtradas e ordenadas
   */
  const processedDisciplinas = useMemo(() => {
    let result = [...disciplinas];

    // Aplica filtros
    Object.entries(filterState).forEach(([columnId, filterValue]) => {
      const column = columns.find((c) => c.id === columnId);
      if (!column || !filterValue) return;

      result = result.filter((disciplina) => {
        const cellValue = getCellValue(disciplina, column);
        const stringValue = String(cellValue).toLowerCase();
        return stringValue.includes(filterValue.toLowerCase());
      });
    });

    // Aplica ordenação
    if (sortState.columnId && sortState.direction) {
      const column = columns.find((c) => c.id === sortState.columnId);
      if (column) {
        result.sort((a, b) => {
          const aValue = getCellValue(a, column);
          const bValue = getCellValue(b, column);

          if (aValue === null || aValue === undefined) return 1;
          if (bValue === null || bValue === undefined) return -1;

          let comparison = 0;
          if (typeof aValue === "string" && typeof bValue === "string") {
            comparison = aValue.localeCompare(bValue);
          } else if (typeof aValue === "number" && typeof bValue === "number") {
            comparison = aValue - bValue;
          } else {
            comparison = String(aValue).localeCompare(String(bValue));
          }

          return sortState.direction === "asc" ? comparison : -comparison;
        });
      }
    }

    return result;
  }, [disciplinas, filterState, sortState, columns]);

  return {
    columns,
    visibleColumns,
    sortState,
    filterState,
    processedDisciplinas,
    toggleColumnVisibility,
    reorderColumns,
    handleSort,
    handleFilter,
  };
}
