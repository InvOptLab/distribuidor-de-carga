"use client";

import { memo, useMemo } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRowSelectionModel,
  type GridSortModel,
} from "@mui/x-data-grid";
import { ptBR } from "@mui/x-data-grid/locales";
import { useTranslations } from "next-intl";
import { EMPTY_VALUE, formatDuration } from "../model/format";
import type { HistoryRow } from "../state/useHistoryList";
import type { HistoryLabels } from "./useHistoryLabels";
import { ConflictsCell, CoverageCell, DateCell, EvaluationCell, OriginChip } from "./cells";
import RowActions from "./RowActions";

export interface RowHandlers {
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  onStatistics: (id: string) => void;
  onCompare: (ids: string[]) => void;
}

interface HistoryTableProps extends RowHandlers {
  rows: HistoryRow[];
  labels: HistoryLabels;
  currentId?: string;
  openId: string | null;
  selection: string[];
  onSelectionChange: (ids: string[]) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  onOpen: (id: string) => void;
}

/**
 * Lista do histórico com o DataGrid MIT (4.3): ordenação (controlada pela URL), seleção por
 * checkbox, teclado e ARIA prontos. Clique ou Enter na linha abre o painel de detalhe.
 */
function HistoryTable({
  rows,
  labels,
  currentId,
  openId,
  selection,
  onSelectionChange,
  sortModel,
  onSortModelChange,
  onOpen,
  ...handlers
}: HistoryTableProps) {
  const t = useTranslations("Pages.History");
  const { locale } = labels;

  const columns = useMemo<GridColDef<HistoryRow>[]>(
    () => [
      {
        field: "chrono",
        headerName: t("columns.date"),
        flex: 1.2,
        minWidth: 205,
        renderCell: ({ row }) => <DateCell row={row} labels={labels} />,
      },
      {
        field: "origin",
        headerName: t("columns.origin"),
        flex: 1,
        minWidth: 150,
        renderCell: ({ row }) => <OriginChip row={row} labels={labels} />,
      },
      {
        field: "avaliacao",
        headerName: t("columns.evaluation"),
        flex: 0.9,
        minWidth: 130,
        align: "right",
        headerAlign: "right",
        renderCell: ({ row }) => <EvaluationCell row={row} locale={locale} />,
      },
      {
        field: "coverage",
        headerName: t("columns.coverage"),
        flex: 1,
        minWidth: 140,
        renderCell: ({ row }) => <CoverageCell row={row} />,
      },
      {
        field: "conflitos",
        headerName: t("columns.conflicts"),
        width: 110,
        align: "center",
        headerAlign: "center",
        renderCell: ({ row }) => <ConflictsCell count={row.conflitos} />,
      },
      {
        field: "tempoExecucaoMs",
        headerName: t("columns.time"),
        width: 100,
        align: "right",
        headerAlign: "right",
        renderCell: ({ row }) =>
          row.tempoExecucaoMs ? (
            <Tooltip
              title={t("timeTooltip", {
                time: formatDuration(row.tempoExecucaoMs, locale),
                iterations: row.iteracoes ?? 0,
              })}
            >
              <Typography variant="body2" fontFamily="monospace">
                {formatDuration(row.tempoExecucaoMs, locale)}
              </Typography>
            </Tooltip>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {EMPTY_VALUE}
            </Typography>
          ),
      },
      {
        field: "actions",
        headerName: t("columns.actions"),
        width: 100,
        sortable: false,
        disableColumnMenu: true,
        align: "right",
        headerAlign: "right",
        renderCell: ({ row }) => (
          <RowActions
            id={row.id}
            label={labels.dateLabel(row)}
            isCurrent={row.isCurrent}
            currentId={currentId}
            {...handlers}
          />
        ),
      },
    ],
    // handlers são estáveis o bastante; recriar colunas a cada render custa pouco
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, labels, locale, currentId, handlers.onRestore, handlers.onDelete, handlers.onDownload, handlers.onStatistics, handlers.onCompare],
  );

  const selectionModel = useMemo<GridRowSelectionModel>(
    () => ({ type: "include", ids: new Set(selection) }),
    [selection],
  );

  const handleSelection = (model: GridRowSelectionModel) => {
    if (model.type === "include") {
      onSelectionChange(Array.from(model.ids, String));
    } else {
      // "Selecionar tudo": tudo o que está visível, menos os excluídos
      onSelectionChange(rows.map((r) => r.id).filter((id) => !model.ids.has(id)));
    }
  };

  const localeText =
    locale === "pt-BR" ? ptBR.components.MuiDataGrid.defaultProps.localeText : undefined;

  return (
    <Box sx={{ height: { xs: 520, lg: "calc(100vh - 260px)" }, minHeight: 420, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        localeText={localeText}
        checkboxSelection
        disableRowSelectionOnClick
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={handleSelection}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        sortingOrder={["desc", "asc"]}
        disableColumnFilter
        initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
        pageSizeOptions={[25, 50, 100]}
        onRowClick={({ id }) => onOpen(String(id))}
        onCellKeyDown={(params, event) => {
          if (event.key !== "Enter") return;
          if (params.field === "__check__" || params.field === "actions") return;
          event.preventDefault();
          onOpen(String(params.id));
        }}
        getRowClassName={({ row }) =>
          [row.isCurrent ? "row-current" : "", row.id === openId ? "row-open" : ""].join(" ")
        }
        aria-label={t("title", { count: rows.length })}
        sx={{
          "& .MuiDataGrid-row": { cursor: "pointer" },
          "& .row-current": { backgroundColor: "action.selected" },
          "& .row-open": {
            boxShadow: (theme) => `inset 3px 0 0 ${theme.palette.primary.main}`,
          },
          "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": {
            outlineOffset: -2,
          },
        }}
      />
    </Box>
  );
}

export default memo(HistoryTable);
