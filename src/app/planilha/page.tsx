"use client";

import { useState } from "react";
import { Box, Button, Typography, Toolbar, AppBar } from "@mui/material";
import {
  ViewColumn as ViewColumnIcon,
  Refresh as RefreshIcon,
  FileDownload,
} from "@mui/icons-material";
import { useGlobalContext } from "@/context/Global";
import { usePlanilhaColumns } from "@/hooks/use-planilha-columns";
import { PlanilhaTable } from "@/components/Planilha/PlanilhaTable";
import { ColumnManager } from "@/components/Planilha/ColumnManager";
import { exportToExcel } from "./excel-export";

/**
 * Página principal da Planilha
 *
 * Esta página exibe as disciplinas em formato de planilha estilo Excel,
 * permitindo visualização, filtragem, ordenação e edição de docentes.
 *
 * Funcionalidades:
 * - Visualização em formato de tabela com colunas configuráveis
 * - Colunas dinâmicas para horários (Horário 1, Horário 2, etc.)
 * - Filtros e ordenação por coluna
 * - Gerenciamento de visibilidade e ordem das colunas
 * - Edição de docentes atribuídos a cada disciplina
 * - Células vazias de horário com cor de "inativo"
 */
export default function PlanilhaPage() {
  const { disciplinas, docentes, updateAtribuicoes, atribuicoes, formularios } =
    useGlobalContext();
  const [columnManagerOpen, setColumnManagerOpen] = useState(false);

  // Hook para gerenciar colunas, filtros e ordenação
  const {
    columns,
    visibleColumns,
    sortState,
    filterState,
    processedDisciplinas,
    toggleColumnVisibility,
    reorderColumns,
    handleSort,
    handleFilter,
  } = usePlanilhaColumns(disciplinas.filter((disciplina) => disciplina.ativo));

  /**
   * Atualiza os docentes de uma disciplina
   */
  const handleUpdateDocentes = (
    disciplinaId: string,
    newDocentes: string[]
  ) => {
    const updatedAtribuicoes = atribuicoes.map((atrib) =>
      atrib.id_disciplina === disciplinaId
        ? { ...atrib, docentes: newDocentes }
        : atrib
    );

    // Se a disciplina não tem atribuição ainda, cria uma nova
    const hasAtribuicao = atribuicoes.some(
      (a) => a.id_disciplina === disciplinaId
    );
    if (!hasAtribuicao) {
      updatedAtribuicoes.push({
        id_disciplina: disciplinaId,
        docentes: newDocentes,
      });
    }

    updateAtribuicoes(updatedAtribuicoes);
  };

  /**
   * Reseta todos os filtros e ordenação
   */
  const handleReset = () => {
    Object.keys(filterState).forEach((columnId) => {
      handleFilter(columnId, "");
    });
    if (sortState.columnId) {
      handleSort(sortState.columnId);
      handleSort(sortState.columnId);
    }
  };

  // Função para exportar para Excel
  /**
   * Exporta a planilha atual para formato Excel
   */
  const handleExportToExcel = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `planilha-disciplinas-${timestamp}.xlsx`;
    exportToExcel(
      processedDisciplinas,
      visibleColumns,
      docentes,
      atribuicoes,
      filename
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Barra de ferramentas */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Planilha de Disciplinas
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            {/* Botão de exportar para Excel */}
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={handleExportToExcel}
              color="success"
            >
              Exportar Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
            >
              Limpar Filtros
            </Button>

            <Button
              variant="contained"
              startIcon={<ViewColumnIcon />}
              onClick={() => setColumnManagerOpen(true)}
            >
              Gerenciar Colunas
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Informações */}
      <Box sx={{ padding: 2, backgroundColor: "background.default" }}>
        <Typography variant="body2" color="text.secondary">
          Exibindo {processedDisciplinas.length} de {disciplinas.length}{" "}
          disciplinas
          {Object.keys(filterState).length > 0 && " (filtrado)"}
        </Typography>
      </Box>

      {/* Tabela principal */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <PlanilhaTable
          disciplinas={processedDisciplinas}
          columns={visibleColumns}
          docentes={docentes}
          sortState={sortState}
          filterState={filterState}
          onSort={handleSort}
          onFilter={handleFilter}
          onUpdateDocentes={handleUpdateDocentes}
          formularios={formularios}
          atribuicoes={atribuicoes}
        />
      </Box>

      {/* Diálogo de gerenciamento de colunas */}
      <ColumnManager
        open={columnManagerOpen}
        onClose={() => setColumnManagerOpen(false)}
        columns={columns}
        onToggleColumn={toggleColumnVisibility}
        onReorderColumns={reorderColumns}
      />
    </Box>
  );
}
