"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useGlobalContext } from "@/context/Global";
import { useAlertsContext } from "@/context/Alerts";
import {
  useSolutionHistory,
  type RemovedHistoryEntry,
} from "@/context/SolutionHistory/hooks";
import { exportJson } from "@/app/[locale]/atribuicoes/io/exportJson";
import { useSaveManualSolution } from "@/app/[locale]/atribuicoes/state/useSaveManualSolution";

/** Callback com identidade estável que sempre chama a versão mais recente (lista memoizada). */
function useStableCallback<A extends unknown[], R>(
  fn: (...args: A) => R,
): (...args: A) => R {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args: A) => ref.current(...args), []);
}

export interface UndoState {
  key: number;
  entries: RemovedHistoryEntry[];
}

/**
 * Camada de comandos do histórico (4.2): restaurar com confirmação e broadcast, excluir com
 * desfazer/confirmação em lote, baixar com o mesmo nome de arquivo da grade.
 * `labelOf(id)` dá o texto da solução para os alertas (data formatada no locale ativo).
 */
export function useHistoryCommands(labelOf: (id: string) => string) {
  const t = useTranslations("Pages.History");
  const { atribuicoes } = useGlobalContext();
  const {
    historicoSolucoes,
    solucaoAtual,
    restoreHistoryToSolution,
    removeSolutionsFromHistory,
    reinsertSolutionsInHistory,
    canRestore,
  } = useSolutionHistory();
  const { addAlerta } = useAlertsContext();
  const saveManualSolution = useSaveManualSolution();

  const [restoreTarget, setRestoreTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTargets, setDeleteTargets] = useState<string[] | null>(null);
  const [undo, setUndo] = useState<UndoState | null>(null);
  const undoKey = useRef(0);

  const currentId = solucaoAtual.idHistorico;
  /** Trabalho não salvo: a grade não corresponde a nenhuma entrada e tem alguma atribuição. */
  const hasPendingWork =
    currentId === undefined &&
    atribuicoes.some((a) => (a.docentes?.length ?? 0) > 0);

  const doRestore = useCallback(
    (id: string) => {
      if (restoreHistoryToSolution(id)) {
        addAlerta(t("Alerts.applied", { datetime: labelOf(id) }), "success");
      } else {
        addAlerta(t("Alerts.notAllowed"), "warning");
      }
    },
    [restoreHistoryToSolution, addAlerta, t, labelOf],
  );

  const restore = useCallback(
    (id: string) => {
      if (!historicoSolucoes.has(id) || id === currentId) return;
      if (!canRestore) {
        addAlerta(t("Alerts.notAllowed"), "warning");
        return;
      }
      if (hasPendingWork) setRestoreTarget(id);
      else doRestore(id);
    },
    [
      historicoSolucoes,
      currentId,
      canRestore,
      hasPendingWork,
      doRestore,
      addAlerta,
      t,
    ],
  );

  const confirmRestore = useCallback(
    async (mode: "save" | "discard") => {
      const id = restoreTarget;
      if (!id) return;
      if (mode === "save") {
        setSaving(true);
        try {
          await saveManualSolution();
        } catch (error) {
          console.error(error);
          addAlerta(t("Alerts.saveFailed"), "error");
          setSaving(false);
          return;
        }
        setSaving(false);
      }
      setRestoreTarget(null);
      doRestore(id);
    },
    [restoreTarget, saveManualSolution, doRestore, addAlerta, t],
  );

  const cancelRestore = useCallback(() => {
    if (!saving) setRestoreTarget(null);
  }, [saving]);

  const applyRemove = useCallback(
    (ids: string[]) => {
      const removed = removeSolutionsFromHistory(ids);
      if (removed.length > 0) {
        undoKey.current += 1;
        setUndo({ key: undoKey.current, entries: removed });
      }
      return removed;
    },
    [removeSolutionsFromHistory],
  );

  /** Uma entrada: remove na hora, com desfazer. Várias: pede confirmação. */
  const remove = useCallback(
    (ids: string[]) => {
      const validos = ids.filter((id) => historicoSolucoes.has(id));
      if (validos.length === 0) return;
      if (validos.length === 1) {
        if (validos[0] === currentId) return; // H-B6
        applyRemove(validos);
        return;
      }
      setDeleteTargets(validos);
    },
    [historicoSolucoes, currentId, applyRemove],
  );

  const confirmDelete = useCallback(() => {
    if (deleteTargets) applyRemove(deleteTargets);
    setDeleteTargets(null);
  }, [deleteTargets, applyRemove]);

  const cancelDelete = useCallback(() => setDeleteTargets(null), []);

  const undoRemove = useCallback(() => {
    if (!undo) return;
    reinsertSolutionsInHistory(undo.entries);
    setUndo(null);
    addAlerta(t("undo.restored"), "info");
  }, [undo, reinsertSolutionsInHistory, addAlerta, t]);

  const dismissUndo = useCallback(() => setUndo(null), []);

  /** H-B7: mesmo payload de antes; nome `${id}.json`, igual ao da grade. */
  const download = useCallback(
    (id: string) => {
      const entrada = historicoSolucoes.get(id);
      if (!entrada) return;
      exportJson(
        `${id}.json`,
        entrada.contexto.docentes,
        entrada.contexto.disciplinas,
        entrada.solucao.atribuicoes,
        entrada.contexto.travas,
        entrada,
      );
      addAlerta(t("Alerts.downloaded", { datetime: labelOf(id) }), "success");
    },
    [historicoSolucoes, addAlerta, t, labelOf],
  );

  const stableRestore = useStableCallback(restore);
  const stableRemove = useStableCallback(remove);
  const stableDownload = useStableCallback(download);

  return {
    currentId,
    canRestore,
    restore: stableRestore,
    remove: stableRemove,
    download: stableDownload,
    restoreDialog: {
      target: restoreTarget,
      saving,
      confirm: confirmRestore,
      cancel: cancelRestore,
    },
    deleteDialog: {
      targets: deleteTargets,
      skippedCurrent:
        !!deleteTargets && !!currentId && deleteTargets.includes(currentId),
      count: deleteTargets
        ? deleteTargets.filter((id) => id !== currentId).length
        : 0,
      confirm: confirmDelete,
      cancel: cancelDelete,
    },
    undo: { state: undo, undo: undoRemove, dismiss: dismissUndo },
  };
}

export type HistoryCommands = ReturnType<typeof useHistoryCommands>;
