"use client";

import type React from "react";
import {
  createContext,
  useContext,
  type ReactNode,
  useCallback,
  useState,
  useMemo,
} from "react";
import { useGlobalContext } from "@/context/Global";
import { useAlertsContext } from "@/context/Alerts";
import { DisciplinaFilters, DocenteFilters } from "../types/types";
import { exportJson, getFormattedDate } from "..";
import {
  Atribuicao,
  Celula,
  Disciplina,
  Docente,
} from "@/algoritmo/communs/interfaces/interfaces";
import { useTranslations } from "next-intl";
import { applyDocenteFilters, applyTurmaFilters } from "../model/filters";
import { buildGridModel, type GridModel } from "../model/gridModel";
import { useSaveManualSolution } from "../state/useSaveManualSolution";
import { useFilterSync } from "../state/useFilterSync";
import { type GridCommands, useGridCommands } from "../state/useGridCommands";

interface TimetableContextType {
  docentes: Docente[];
  disciplinas: Disciplina[];
  filteredDocentes: Docente[];
  filteredDisciplinas: Disciplina[];
  formularios: any[];
  atribuicoes: Atribuicao[];
  travas: Celula[];
  maxPriority: number;
  /** Índices derivados (prioridade, atribuição, travas, conflitos) com consulta O(1). */
  model: GridModel;
  docenteFilters: DocenteFilters;
  disciplinaFilters: DisciplinaFilters;
  setDocenteFilters: React.Dispatch<React.SetStateAction<DocenteFilters>>;
  setDisciplinaFilters: React.Dispatch<React.SetStateAction<DisciplinaFilters>>;
  clearFilters: () => void;
  setAtribuicoes: (atribuicoes: Atribuicao[]) => void;
  setTravas: (travas: Celula[]) => void;
  commands: GridCommands;
  cleanStateAtribuicoes: () => void;
  saveAlterations: () => void;
  downalodJson: () => void;
  isLockMode: boolean;
  setIsLockMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const TimetableContext = createContext<TimetableContextType | undefined>(
  undefined,
);

export function TimetableProvider({ children }: { children: ReactNode }) {
  const {
    docentes,
    disciplinas,
    formularios,
    atribuicoes,
    setAtribuicoes,
    travas,
    setTravas,
    solucaoAtual,
    historicoSolucoes,
  } = useGlobalContext();
  const { addAlerta } = useAlertsContext();

  const t = useTranslations("Pages.Assignment.Alerts");

  const [docenteFilters, setDocenteFilters] = useState<DocenteFilters>({
    search: "",
    rules: [],
  });

  const [disciplinaFilters, setDisciplinaFilters] = useState<DisciplinaFilters>(
    {
      search: "",
      rules: [],
    },
  );

  const [isLockMode, setIsLockMode] = useState(false);

  useFilterSync({
    docenteFilters,
    disciplinaFilters,
    setDocenteFilters,
    setDisciplinaFilters,
    docentes,
    disciplinas,
    atribuicoes,
    formularios,
    travas,
  });

  const model = useMemo(
    () =>
      buildGridModel(docentes, disciplinas, formularios, atribuicoes, travas),
    [docentes, disciplinas, formularios, atribuicoes, travas],
  );
  const maxPriority = model.maxPriority;

  const filteredDocentes = useMemo(
    () =>
      applyDocenteFilters(
        docentes,
        docenteFilters,
        atribuicoes,
        model.conflictDocentes,
      ),
    [docentes, docenteFilters, atribuicoes, model.conflictDocentes],
  );

  const filteredDisciplinas = useMemo(
    () => applyTurmaFilters(disciplinas, disciplinaFilters, atribuicoes),
    [disciplinas, disciplinaFilters, atribuicoes],
  );

  const clearFilters = useCallback(() => {
    setDocenteFilters({ search: "", rules: [] });
    setDisciplinaFilters({ search: "", rules: [] });
  }, []);

  const commands = useGridCommands({
    docentes,
    disciplinas,
    formularios,
    atribuicoes,
    travas,
    setAtribuicoes,
    setTravas,
  });

  /**
   * Salva as alterações atuais no histórico (manual)
   */
  const saveManualSolution = useSaveManualSolution();
  const saveAlterations = useCallback(async () => {
    try {
      await saveManualSolution(maxPriority);
      addAlerta(t("assignmentsAddedToHistory"), "success");
    } catch (error) {
      console.error(t("errorSavingChanges"), error);
      addAlerta(t("errorSavingChanges"), "error");
    }
  }, [saveManualSolution, maxPriority, addAlerta, t]);

  /**
   * Exporta as atribuições para um arquivo JSON
   */
  const downalodJson = useCallback(() => {
    if (!atribuicoes.some((atribuicao) => atribuicao.docentes.length > 0)) {
      // Avisa, mas exporta mesmo assim
      addAlerta(t("noAssignmentMade"), "warning");
    }

    if (solucaoAtual.idHistorico) {
      exportJson(
        solucaoAtual.idHistorico + ".json",
        docentes,
        disciplinas,
        atribuicoes,
        travas,
        historicoSolucoes.get(solucaoAtual.idHistorico),
      );
    } else {
      exportJson(
        getFormattedDate() + ".json",
        docentes,
        disciplinas,
        atribuicoes,
        travas,
      );
    }
  }, [
    atribuicoes,
    addAlerta,
    t,
    solucaoAtual.idHistorico,
    docentes,
    disciplinas,
    travas,
    historicoSolucoes,
  ]);

  const value = useMemo(
    () => ({
      docentes,
      disciplinas,
      filteredDocentes,
      filteredDisciplinas,
      formularios,
      atribuicoes,
      travas,
      maxPriority,
      model,
      docenteFilters,
      disciplinaFilters,
      setDocenteFilters,
      setDisciplinaFilters,
      clearFilters,
      setAtribuicoes,
      setTravas,
      commands,
      cleanStateAtribuicoes: commands.clear,
      saveAlterations,
      downalodJson,
      isLockMode,
      setIsLockMode,
    }),
    [
      docentes,
      disciplinas,
      filteredDocentes,
      filteredDisciplinas,
      formularios,
      atribuicoes,
      travas,
      maxPriority,
      model,
      docenteFilters,
      disciplinaFilters,
      clearFilters,
      setAtribuicoes,
      setTravas,
      commands,
      saveAlterations,
      downalodJson,
      isLockMode,
    ],
  );

  return (
    <TimetableContext.Provider value={value}>
      {children}
    </TimetableContext.Provider>
  );
}

export function useTimetable() {
  const context = useContext(TimetableContext);
  if (context === undefined) {
    throw new Error("useTimetable must be used within a TimetableProvider");
  }
  return context;
}
