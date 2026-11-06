"use client";

import { useCallback } from "react";
import { useGlobalContext } from "@/context/Global";
import { useAlgorithmContext } from "@/context/Algorithm";
import type ObjectiveComponent from "@/algoritmo/abstractions/ObjectiveComponent";
import type { Solucao } from "@/algoritmo/communs/interfaces/interfaces";
import { calculateManualSolution } from "@/algoritmo/communs/calculateManualSolution";
import type { ContextoExecucao } from "@/context/Global/utils";
import { removeInativos, saveAtribuicoesInHistoryState } from "..";
import { buildGridModel } from "../model/gridModel";
import { InsercaoManual } from "./InsercaoManual";

/**
 * Salva o estado de trabalho atual no histórico como inserção manual (avaliação calculada com as
 * restrições e objetivos ativos). Compartilhado pela grade ("Salvar alterações") e pelo histórico
 * ("Salvar atual e restaurar"). Lança em caso de erro; quem chama mostra o alerta.
 */
export function useSaveManualSolution() {
  const {
    docentes,
    disciplinas,
    formularios,
    atribuicoes,
    travas,
    historicoSolucoes,
    setHistoricoSolucoes,
    setSolucaoAtual,
  } = useGlobalContext();
  const { hardConstraints, softConstraints, objectiveComponents } =
    useAlgorithmContext();

  return useCallback(
    async (maxPriorityOverride?: number) => {
      const maxPriority =
        maxPriorityOverride ??
        buildGridModel(docentes, disciplinas, formularios, atribuicoes, travas)
          .maxPriority;

      const objectives: ObjectiveComponent<any>[] = Array.from(
        objectiveComponents.values(),
      ).filter((entry) => entry.isActive);

      const ativos = removeInativos(docentes, disciplinas, atribuicoes);

      const solucaoManual: Solucao = await calculateManualSolution(
        ativos.atribuicoes,
        ativos.docentes,
        ativos.turmas,
        travas,
        formularios,
        softConstraints, // Map de restrições soft
        hardConstraints, // Map de restrições hard
        objectives,
        maxPriority,
      );

      const contextoExecucao: ContextoExecucao = {
        disciplinas: [...disciplinas],
        docentes: [...docentes],
        travas: [...travas],
        maxPriority: maxPriority,
        formularios: formularios,
      };

      /**
       * Precisa ser revisto, talvez uma opção seja criar um método "manual" para facilitar a inserção.
       */
      const algorithm = new InsercaoManual(
        "manual-insert",
        {
          atribuicoes: ativos.atribuicoes,
          docentes: ativos.docentes,
          turmas: ativos.turmas,
          prioridades: formularios,
          travas: travas,
          maiorPrioridade: maxPriority,
        },
        [...hardConstraints.values(), ...softConstraints.values()],
        solucaoManual,
        "max",
        [...objectiveComponents.values()],
        maxPriority,
      );

      saveAtribuicoesInHistoryState(
        solucaoManual.atribuicoes,
        solucaoManual.avaliacao,
        historicoSolucoes,
        setHistoricoSolucoes,
        setSolucaoAtual,
        contextoExecucao,
        algorithm,
        solucaoManual.estatisticas,
      );
    },
    [
      objectiveComponents,
      docentes,
      disciplinas,
      atribuicoes,
      travas,
      formularios,
      softConstraints,
      hardConstraints,
      historicoSolucoes,
      setHistoricoSolucoes,
      setSolucaoAtual,
    ],
  );
}
