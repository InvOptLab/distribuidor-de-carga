"use client";

import { useState, useRef, useEffect } from "react";
import { useGlobalContext } from "@/context/Global";
import { useAlertsContext } from "@/context/Alerts";
import { useAlgorithmContext } from "@/context/Algorithm";
import { TabuSearch } from "@/TabuSearch/Classes/TabuSearch";
import {
  type Solucao,
  TipoInsercao,
  type ContextoExecucao,
  getActiveFormularios,
} from "@/context/Global/utils";
import {
  addNewSolutionToHistory,
  updateSolutionId,
} from "@/context/SolutionHistory/utils";
import { useTimetable } from "../context/TimetableContext";

export function useAlgorithm() {
  const {
    docentes,
    disciplinas,
    formularios,
    atribuicoes,
    travas,
    solucaoAtual,
    setSolucaoAtual,
    historicoSolucoes,
    setHistoricoSolucoes,
    updateAtribuicoes,
  } = useGlobalContext();

  const { maxPriority } = useTimetable();

  const {
    parametros,
    hardConstraints,
    softConstraints,
    neighborhoodFunctions,
    stopFunctions,
    aspirationFunctions,
    tabuListType,
    objectiveComponents,
  } = useAlgorithmContext();
  const { addAlerta } = useAlertsContext();

  const [openDialog, setOpenDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [interrompe, setInterrompe] = useState(false);
  const [disciplinasAlocadas, setDisciplinasAlocadas] = useState(0);

  const disciplinasAlocadasRef = useRef(disciplinasAlocadas);
  const interrompeRef = useRef(interrompe);

  useEffect(() => {
    interrompeRef.current = interrompe;
    disciplinasAlocadasRef.current = disciplinasAlocadas;
  }, [interrompe, disciplinasAlocadas]);

  /**
   * Executa o algoritmo Busca Tabu
   */
  const executeProcess = async () => {
    handleClickOpenDialog();
    setProcessing(true);

    try {
      const neighborhood = Array.from(neighborhoodFunctions.values())
        .filter((entry) => entry.isActive)
        .map((entry) => entry.instance);

      const stop = Array.from(stopFunctions.values())
        .filter((entry) => entry.isActive)
        .map((entry) => entry.instance);

      const aspiration = Array.from(aspirationFunctions.values())
        .filter((entry) => entry.isActive)
        .map((entry) => entry.instance);

      const objectives = Array.from(objectiveComponents.values()).filter(
        (entry) => entry.isActive
      );

      // Filter only active items
      const activeDocentes = docentes.filter((d) => d.ativo);
      const activeDisciplinas = disciplinas.filter((d) => d.ativo);
      const activeFormularios = getActiveFormularios(
        formularios,
        disciplinas,
        docentes
      );

      // Filter atribuicoes to only include active items
      const activeAtribuicoes = atribuicoes
        .filter((attr) =>
          activeDisciplinas.some((d) => d.id === attr.id_disciplina)
        )
        .map((attr) => ({
          ...attr,
          docentes: attr.docentes.filter((docente) =>
            activeDocentes.some((d) => d.nome === docente)
          ),
        }));

      const buscaTabu = new TabuSearch(
        activeAtribuicoes,
        activeDocentes,
        activeDisciplinas,
        travas,
        activeFormularios,
        [...hardConstraints.values(), ...softConstraints.values()],
        { atribuicoes: activeAtribuicoes },
        neighborhood,
        tabuListType,
        tabuListType === "Solução"
          ? parametros.tabuTenure.size
          : parametros.tabuTenure.tenures,
        stop,
        aspiration,
        undefined, //maxPriority + 1
        objectives
      );

      await new Promise((resolve) => setTimeout(resolve, 0));

      await buscaTabu.run(() => interrompeRef.current, setDisciplinasAlocadas);

      const solucao: Solucao = {
        atribuicoes: buscaTabu.bestSolution.atribuicoes,
        avaliacao: buscaTabu.bestSolution.avaliacao,
        estatisticas: buscaTabu.statistics,
        algorithm: buscaTabu,
      };
      setSolucaoAtual(solucao);
    } catch (error) {
      console.error("Erro na execução do algoritmo:", error);
      addAlerta("Erro na execução do algoritmo!", "error");
    } finally {
      setProcessing(false);
      setInterrompe(false);
      setDisciplinasAlocadas(0);
    }
  };

  const handleClickOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  /**
   * Aplica a solução encontrada pelo algoritmo no state global
   */
  const applySolution = () => {
    try {
      const contextoExecucao: ContextoExecucao = {
        disciplinas: [...disciplinas],
        docentes: [...docentes],
        travas: [...travas],
        maxPriority: maxPriority,
        formularios: formularios,
      };

      const idSolucao: string = addNewSolutionToHistory(
        solucaoAtual,
        setHistoricoSolucoes,
        historicoSolucoes,
        TipoInsercao.Algoritmo,
        contextoExecucao
      );

      updateSolutionId(setSolucaoAtual, idSolucao);
      updateAtribuicoes(solucaoAtual.atribuicoes);

      addAlerta("A solução foi aplicada com sucesso!", "success");
      handleCloseDialog();
    } catch (error) {
      console.error("Erro ao aplicar solução:", error);
      addAlerta("Erro ao aplicar a solução!", "error");
    }
  };

  /**
   * Interrompe a execução do algoritmo
   */
  const interruptExecution = () => {
    setInterrompe(true);
    addAlerta("A execução do algoritmo foi interrompida!", "warning");
  };

  return {
    openDialog,
    processing,
    disciplinasAlocadas,
    executeProcess,
    handleCloseDialog,
    applySolution,
    interruptExecution,
  };
}
