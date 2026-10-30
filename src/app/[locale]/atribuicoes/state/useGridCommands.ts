"use client";

import { useCallback, useMemo, useRef } from "react";
import type React from "react";
import type {
  Atribuicao,
  Celula,
  Disciplina,
  Docente,
} from "@/algoritmo/communs/interfaces/interfaces";
import { useCollaboration } from "@/context/Collaboration";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";
import { useAlertsContext } from "@/context/Alerts";
import { useTranslations } from "next-intl";
import {
  clearAssignments,
  isAssigned,
  setAssignment,
} from "../model/assignments";
import {
  hasLock,
  isCellLocked,
  isColumnLocked,
  isRowLocked,
  setCellLock,
  setColumnLock,
  setRowLock,
} from "../model/locks";
import { TipoTrava } from "@/algoritmo/communs/interfaces/interfaces";

interface GridCommandsParams {
  docentes: Docente[];
  disciplinas: Disciplina[];
  formularios: any[];
  atribuicoes: Atribuicao[];
  travas: Celula[];
  setAtribuicoes: React.Dispatch<React.SetStateAction<Atribuicao[]>>;
  setTravas: React.Dispatch<React.SetStateAction<Celula[]>>;
}

export interface GridCommands {
  /** Pode alterar a grade? Fora de sala, sempre. */
  canEdit: boolean;
  /** Avisa e devolve `false` se o usuário não pode alterar (D5). */
  ensureCanEdit: () => boolean;
  /** Clique em célula: alterna trava (`lock`) ou atribuição (B6, B7, B9). */
  cellClick: (nome_docente: string, id_disciplina: string, lock: boolean) => void;
  /** Clique no cabeçalho da turma: só trava/destrava quando `lock` (B9, B10). */
  columnClick: (id_disciplina: string, lock: boolean) => void;
  /** Clique no nome do docente: só trava/destrava quando `lock` (B9, B10). */
  rowClick: (nome_docente: string, lock: boolean) => void;
  /** Limpa as atribuições mantendo travadas e inativas (B16). */
  clear: () => void;
}

/**
 * Camada de comandos: permissão → aplica (funções puras, updater funcional) → broadcast → cleanSolucao.
 * O protocolo de rede é o mesmo de antes (assignment update / FULL_DATA).
 */
export function useGridCommands({
  docentes,
  disciplinas,
  formularios,
  atribuicoes,
  travas,
  setAtribuicoes,
  setTravas,
}: GridCommandsParams): GridCommands {
  const {
    broadcastAssignmentChange,
    broadcastDataUpdate,
    isInRoom,
    config,
    isOwner,
  } = useCollaboration();
  const { cleanSolucaoAtual } = useSolutionHistory();
  const { addAlerta } = useAlertsContext();
  const t = useTranslations("Pages.Assignment.Alerts");

  // Estado mais recente, para decidir a operação e montar o broadcast
  // mesmo com cliques rápidos antes do próximo render (D11).
  const latest = useRef({ atribuicoes, travas, docentes, disciplinas, formularios });
  latest.current = { atribuicoes, travas, docentes, disciplinas, formularios };

  const canEdit = !isInRoom || isOwner || !!config?.guestsCanEdit;

  const ensureCanEdit = useCallback(() => {
    if (canEdit) return true;
    addAlerta(t("onlyRoomLeaderCanMakeChanges"), "warning");
    return false;
  }, [canEdit, addAlerta, t]);

  const applyTravas = useCallback(
    (update: (prev: Celula[]) => Celula[]) => {
      const next = update(latest.current.travas);
      if (next === latest.current.travas) return;
      latest.current.travas = next;
      setTravas(update);

      if (isInRoom) {
        const { docentes, disciplinas, formularios, atribuicoes } = latest.current;
        broadcastDataUpdate(
          { docentes, disciplinas, formularios, atribuicoes, travas: next },
          "FULL_DATA",
        );
      }
      cleanSolucaoAtual();
    },
    [setTravas, isInRoom, broadcastDataUpdate, cleanSolucaoAtual],
  );

  const cellClick = useCallback(
    (nome_docente: string, id_disciplina: string, lock: boolean) => {
      if (!ensureCanEdit()) return;

      if (lock) {
        const locked = !hasLock(latest.current.travas, {
          id_disciplina,
          nome_docente,
          tipo_trava: TipoTrava.Cell,
        });
        applyTravas((prev) =>
          setCellLock(prev, nome_docente, id_disciplina, locked),
        );
        return;
      }

      if (isCellLocked(latest.current.travas, nome_docente, id_disciplina)) {
        return;
      }

      const assigned = !isAssigned(
        latest.current.atribuicoes,
        nome_docente,
        id_disciplina,
      );
      const { atribuicoes: next, changed } = setAssignment(
        latest.current.atribuicoes,
        nome_docente,
        id_disciplina,
        assigned,
      );
      if (!changed) return;
      latest.current.atribuicoes = next;
      setAtribuicoes(
        (prev) =>
          setAssignment(prev, nome_docente, id_disciplina, assigned).atribuicoes,
      );

      if (isInRoom) broadcastAssignmentChange(changed, "update");
      cleanSolucaoAtual();
    },
    [
      ensureCanEdit,
      applyTravas,
      setAtribuicoes,
      isInRoom,
      broadcastAssignmentChange,
      cleanSolucaoAtual,
    ],
  );

  const columnClick = useCallback(
    (id_disciplina: string, lock: boolean) => {
      if (!lock || !ensureCanEdit()) return;
      const locked = !isColumnLocked(latest.current.travas, id_disciplina);
      const todosDocentes = latest.current.docentes;
      applyTravas((prev) =>
        setColumnLock(prev, id_disciplina, todosDocentes, locked),
      );
    },
    [ensureCanEdit, applyTravas],
  );

  const rowClick = useCallback(
    (nome_docente: string, lock: boolean) => {
      if (!lock || !ensureCanEdit()) return;
      const locked = !isRowLocked(latest.current.travas, nome_docente);
      const todasDisciplinas = latest.current.disciplinas;
      applyTravas((prev) =>
        setRowLock(prev, nome_docente, todasDisciplinas, locked),
      );
    },
    [ensureCanEdit, applyTravas],
  );

  const clear = useCallback(() => {
    if (!ensureCanEdit()) return;
    const { travas, docentes, disciplinas, formularios } = latest.current;
    const atribuicoesLimpa = clearAssignments(
      latest.current.atribuicoes,
      travas,
      docentes,
      disciplinas,
    );
    latest.current.atribuicoes = atribuicoesLimpa;
    setAtribuicoes((prev) =>
      clearAssignments(prev, travas, docentes, disciplinas),
    );
    addAlerta(t("solutionClearedSuccessfully"), "success");

    if (isInRoom) {
      broadcastDataUpdate(
        {
          atribuicoes: atribuicoesLimpa,
          disciplinas,
          docentes,
          formularios,
          travas,
        },
        "FULL_DATA",
      );
    }
  }, [ensureCanEdit, setAtribuicoes, addAlerta, t, isInRoom, broadcastDataUpdate]);

  return useMemo(
    () => ({ canEdit, ensureCanEdit, cellClick, columnClick, rowClick, clear }),
    [canEdit, ensureCanEdit, cellClick, columnClick, rowClick, clear],
  );
}
