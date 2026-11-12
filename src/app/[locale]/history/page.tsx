"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Container,
  Snackbar,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useGlobalContext } from "@/context/Global";
import HistoryTable from "./components/HistoryTable";
import HistoryToolbar from "./components/HistoryToolbar";
import EmptyHistory from "./components/EmptyHistory";
import SolutionDetailDialog from "./components/SolutionDetail/SolutionDetailDialog";
import RestoreDialog from "./components/dialogs/RestoreDialog";
import DeleteDialog from "./components/dialogs/DeleteDialog";
import { useHistoryLabels } from "./components/useHistoryLabels";
import { useHistoryList, type HistoryRow } from "./state/useHistoryList";
import { useHistoryCommands } from "./state/useHistoryCommands";
import { getSolutionSummary } from "./state/summaryCache";
import {
  detailPosition,
  successorAfterRemoval,
} from "./state/detailNavigation";

function HistoryView() {
  const t = useTranslations("Pages.History");
  const router = useRouter();
  const { historicoSolucoes, docentes, disciplinas, solucaoAtual } =
    useGlobalContext();
  const labels = useHistoryLabels();
  const { locale } = labels;

  const searchTextOf = useCallback(
    (row: HistoryRow) =>
      [
        row.id,
        labels.dateLabel(row),
        labels.fullDateLabel(row),
        labels.originLabel(row.origin),
        labels.algorithmLabel(row) ?? "",
      ].join(" "),
    [labels],
  );

  const list = useHistoryList(
    historicoSolucoes,
    solucaoAtual.idHistorico,
    searchTextOf,
  );

  const labelOf = useCallback(
    (id: string) => {
      const entry = historicoSolucoes.get(id);
      return entry ? labels.dateLabel(getSolutionSummary(entry, id)) : id;
    },
    [historicoSolucoes, labels],
  );
  const commands = useHistoryCommands(labelOf);
  const { restore, remove, download } = commands;

  // Excluir a solução aberta: o diálogo vai para a próxima (ou fecha) e desfazer a reabre (4.5)
  const listRef = useRef(list);
  listRef.current = list;
  const reopenOnUndo = useRef<string | null>(null);
  const onDelete = useCallback(
    (id: string) => {
      const { detailId, rows, showDetail } = listRef.current;
      if (id === detailId && id !== commands.currentId) {
        reopenOnUndo.current = id;
        showDetail(successorAfterRemoval(rows, id));
      } else {
        reopenOnUndo.current = null;
      }
      remove([id]);
    },
    [remove, commands.currentId],
  );
  const undoRemove = useCallback(() => {
    const id = reopenOnUndo.current;
    const reopen =
      !!id && !!commands.undo.state?.entries.some((e) => e.id === id);
    commands.undo.undo();
    reopenOnUndo.current = null;
    if (reopen && id) {
      const { detailId, showDetail, openDetail } = listRef.current;
      if (detailId) showDetail(id);
      else openDetail(id);
    }
  }, [commands.undo]);
  const onStatistics = useCallback(
    (id: string) =>
      router.push(`/${locale}/statistics?id=${encodeURIComponent(id)}`),
    [router, locale],
  );
  const onCompare = useCallback(
    (ids: string[]) =>
      router.push(
        `/${locale}/comparar?ids=${ids.slice(0, 2).map(encodeURIComponent).join(",")}`,
      ),
    [router, locale],
  );
  const handlers = useMemo(
    () => ({
      onRestore: restore,
      onDelete,
      onDownload: download,
      onStatistics,
      onCompare,
    }),
    [restore, onDelete, download, onStatistics, onCompare],
  );

  const openRow = useMemo(
    () =>
      list.detailId
        ? list.allRows.find((r) => r.id === list.detailId)
        : undefined,
    [list.detailId, list.allRows],
  );
  const openEntry = list.detailId
    ? historicoSolucoes.get(list.detailId)
    : undefined;
  const position = useMemo(
    () => detailPosition(list.rows, list.detailId),
    [list.rows, list.detailId],
  );

  // A linha continua marcada depois de fechar, e o foco volta para ela
  const [lastOpenId, setLastOpenId] = useState<string | null>(null);
  const previousDetail = useRef<string | null>(null);
  useEffect(() => {
    const prev = previousDetail.current;
    previousDetail.current = list.detailId;
    if (list.detailId) {
      setLastOpenId(list.detailId);
      return;
    }
    if (!prev) return;
    const timer = setTimeout(() => {
      const cell = document.querySelector<HTMLElement>(
        `.MuiDataGrid-row[data-id="${CSS.escape(prev)}"] .MuiDataGrid-cell[data-field="chrono"]`,
      );
      cell?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [list.detailId]);

  // Selecionar só o que não é a solução atual para o lote
  const { selection, setSelection } = list;
  const deleteSelected = useCallback(
    () => remove(selection),
    [remove, selection],
  );
  const compareSelected = useCallback(
    () => onCompare(selection),
    [onCompare, selection],
  );
  const clearSelection = useCallback(() => setSelection([]), [setSelection]);

  const goToGrid = useCallback(
    () => router.push(`/${locale}/atribuicoes`),
    [router, locale],
  );

  const hasLoadedData = docentes.length > 0 && disciplinas.length > 0;
  const restoreTarget = commands.restoreDialog.target;

  return (
    <Container maxWidth={false} sx={{ py: 2, maxWidth: 1800 }}>
      {historicoSolucoes.size === 0 ? (
        <EmptyHistory onGoToGrid={goToGrid} />
      ) : (
        <>
          {!hasLoadedData && (
            // H1: o histórico é autocontido; sem dados carregados a lista continua acessível
            <Alert severity="info" sx={{ mb: 2 }}>
              {t("noDataBanner")}
            </Alert>
          )}
          <Box>
            <Box sx={{ minWidth: 0 }}>
              <HistoryToolbar
                total={historicoSolucoes.size}
                labels={labels}
                query={list.query}
                onQueryChange={list.setQuery}
                origins={list.origins}
                onOriginsChange={list.setOrigins}
                sortModel={list.sortModel}
                onSortModelChange={list.setSortModel}
                selection={selection}
                onClearSelection={clearSelection}
                onCompare={compareSelected}
                onDeleteSelected={deleteSelected}
              />
              {list.rows.length === 0 ? (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography color="text.secondary" gutterBottom>
                    {t("noResults")}
                  </Typography>
                  <Button
                    onClick={() => {
                      list.setQuery("");
                      list.setOrigins([]);
                    }}
                  >
                    {t("clearFilters")}
                  </Button>
                </Box>
              ) : (
                <HistoryTable
                  rows={list.rows}
                  labels={labels}
                  currentId={commands.currentId}
                  openId={list.detailId ?? lastOpenId}
                  selection={selection}
                  onSelectionChange={setSelection}
                  sortModel={list.sortModel}
                  onSortModelChange={list.setSortModel}
                  onOpen={list.openDetail}
                  {...handlers}
                />
              )}
            </Box>
          </Box>
        </>
      )}

      {openEntry && openRow && (
        <SolutionDetailDialog
          entry={openEntry}
          row={openRow}
          labels={labels}
          currentId={commands.currentId}
          entity={list.entity}
          inspect={list.inspect}
          onEntityChange={list.setEntity}
          onInspectChange={list.setInspect}
          onNavigate={list.navigateDetail}
          position={position}
          onClose={list.closeDetail}
          {...handlers}
        />
      )}
      <RestoreDialog
        open={!!restoreTarget}
        label={restoreTarget ? labelOf(restoreTarget) : ""}
        saving={commands.restoreDialog.saving}
        onSave={() => commands.restoreDialog.confirm("save")}
        onDiscard={() => commands.restoreDialog.confirm("discard")}
        onCancel={commands.restoreDialog.cancel}
      />
      <DeleteDialog
        open={!!commands.deleteDialog.targets}
        count={commands.deleteDialog.count}
        skippedCurrent={commands.deleteDialog.skippedCurrent}
        onConfirm={commands.deleteDialog.confirm}
        onCancel={commands.deleteDialog.cancel}
      />
      <Snackbar
        key={commands.undo.state?.key}
        open={!!commands.undo.state}
        autoHideDuration={6000}
        onClose={(_, reason) => {
          if (reason !== "clickaway") commands.undo.dismiss();
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        message={t("undo.removed", {
          count: commands.undo.state?.entries.length ?? 0,
        })}
        action={
          <Button
            color="inherit"
            size="small"
            sx={{ fontWeight: 700 }}
            onClick={undoRemove}
          >
            {t("undo.undo")}
          </Button>
        }
      />
    </Container>
  );
}

export default function History() {
  // useSearchParams exige um limite de Suspense
  return (
    <Suspense fallback={null}>
      <HistoryView />
    </Suspense>
  );
}
