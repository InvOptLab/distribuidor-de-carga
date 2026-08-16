import { SimulatedAnnealing } from "@/algoritmo/metodos/SimulatedAnnealing/Classes/SimulatedAnnealing";

// =========================================================
// 1. IMPORTAÇÃO DE TODAS AS CLASSES DO SISTEMA
// =========================================================

// Restrições (Constraints)
import { AtribuicaoSemFormulario } from "@/algoritmo/communs/Constraints/AtribuicaoSemFormulario";
import { CargaDeTrabalhoMaximaDocente } from "@/algoritmo/communs/Constraints/CargaDeTrabalhoMaximaDocente";
import { CargaDeTrabalhoMinimaDocente } from "@/algoritmo/communs/Constraints/CargaDeTrabalhoMinimaDocente";
import { CargaDeTrabalhoMinimaDocenteContinua } from "@/algoritmo/communs/Constraints/CargaDeTrabalhoMinimaDocenteContinua";
import { ChoqueDeHorarios } from "@/algoritmo/communs/Constraints/ChoqueDeHorarios";
import { DisciplinaSemDocente } from "@/algoritmo/communs/Constraints/DisciplinaSemDocente";
import { ValidaTravas } from "@/algoritmo/communs/Constraints/ValidaTravas";

// Geração de Vizinhança (Neighborhood)
import { Add } from "@/algoritmo/communs/NeighborhoodGeneration/Add";
import { Remove } from "@/algoritmo/communs/NeighborhoodGeneration/Remove";
import { Swap } from "@/algoritmo/communs/NeighborhoodGeneration/Swap";
import { StochasticMove } from "@/algoritmo/communs/NeighborhoodGeneration/StochasticMove";

// Componentes da Função Objetivo (Objectives)
import { MinimizarDiferencaCargaDidatica } from "@/algoritmo/communs/ObjectiveComponents/MinimizarDiferencaCargaDidatica";
import { MinimizarDiferencaSaldos } from "@/algoritmo/communs/ObjectiveComponents/MinimizarDiferencaSaldos";
import { MinimizarUtilizacaoSaldos } from "@/algoritmo/communs/ObjectiveComponents/MinimizarUtilizacaoSaldos";
import { PrioridadesDefault } from "@/algoritmo/communs/ObjectiveComponents/PrioridadesDefault";
import { PrioridadesPesosTabelados } from "@/algoritmo/communs/ObjectiveComponents/PrioridadesPesosTabelados";
import { PrioridadesPonderadasPorSaldo } from "@/algoritmo/communs/ObjectiveComponents/PrioridadesPonderadasPorSaldo";

// Critérios de Parada (Stop Criteria)
import { IteracoesMaximas } from "@/algoritmo/communs/StopCriteria/IteracoesMaximas";
import { IteracoesSemModificacao } from "@/algoritmo/communs/StopCriteria/IteracoesSemModificacao";
import IteracoesSemMelhoraAvaliacao from "@/algoritmo/communs/StopCriteria/IteracoesSemMelhoraAvaliacao";

import { Estatisticas } from "@/algoritmo/communs/interfaces/interfaces";
import Constraint from "@/algoritmo/abstractions/Constraint";
import { NeighborhoodFunction } from "@/algoritmo/abstractions/NeighborhoodFunction";
import ObjectiveComponent from "@/algoritmo/abstractions/ObjectiveComponent";
import { StopCriteria } from "@/algoritmo/abstractions/StopCriteria";

export interface SerializedComponent<TData = RevivedComponentData> {
  name: string;
  data: TData;
}

interface RevivedComponentData {
  name: string;
  displayName?: string;
  [key: string]: unknown;
}

export type AlgorithmBaseComponent =
  | Constraint<any>
  | NeighborhoodFunction
  | ObjectiveComponent<any>
  | StopCriteria
  | any;

export type ComponentConstructor<T> = new (...args: any[]) => T;

const ComponentRegistry: Record<
  string,
  ComponentConstructor<AlgorithmBaseComponent>
> = {
  // Constraints
  AtribuicaoSemFormulario,
  CargaDeTrabalhoMaximaDocente,
  CargaDeTrabalhoMinimaDocente,
  CargaDeTrabalhoMinimaDocenteContinua,
  ChoqueDeHorarios,
  DisciplinaSemDocente,
  ValidaTravas,

  // Neighborhood
  Add,
  Remove,
  Swap,
  StochasticMove,

  // Objectives
  MinimizarDiferencaCargaDidatica,
  MinimizarDiferencaSaldos,
  MinimizarUtilizacaoSaldos,
  PrioridadesDefault,
  PrioridadesPesosTabelados,
  PrioridadesPonderadasPorSaldo,

  // Stop Criteria
  IteracoesMaximas,
  IteracoesSemMelhoraAvaliacao,
  IteracoesSemModificacao,
};

function reviveInstances<T>(
  serializedItems: SerializedComponent[] | undefined,
): T[] {
  if (!serializedItems || !Array.isArray(serializedItems)) return [];

  return serializedItems
    .map((item): T | null => {
      const ClassDef = ComponentRegistry[item.name];
      if (!ClassDef) {
        console.warn(
          `[Worker] Classe '${item.name}' não foi registrada no ComponentRegistry do Worker!`,
        );
        return null;
      }

      const instance: any = Object.create(ClassDef.prototype);
      const raw = item.data ?? {};

      const safeAssign = (
        target: Record<string, any>,
        source: Record<string, any>,
      ) => {
        for (const [key, val] of Object.entries(source)) {
          if (val instanceof Map) target[key] = new Map(val);
          else if (val instanceof Set) target[key] = new Set(val);
          else if (Array.isArray(val)) target[key] = val.slice();
          else if (val !== null && typeof val === "object") {
            target[key] =
              target[key] && typeof target[key] === "object" ? target[key] : {};
            safeAssign(target[key], val);
          } else {
            target[key] = val;
          }
        }
      };

      safeAssign(instance, raw); 

      if (instance.params === undefined) instance.params = {};
      if (instance.isActive === undefined) instance.isActive = true;

      return instance as T;
    })
    .filter((item): item is T => item !== null);
}

self.addEventListener("message", async (event) => {
  const { type, payload } = event.data;

  if (type === "START_SA") {
    try {
      const { contextData, configData, activeComponents } = payload;

      const constraints = reviveInstances<Constraint<any>>(
        activeComponents.constraints,
      );

      const neighborhood = reviveInstances<NeighborhoodFunction>(
        activeComponents.neighborhood,
      );

      const stopFunctions = reviveInstances<StopCriteria>(
        activeComponents.stopFunctions,
      );

      const objectives = reviveInstances<ObjectiveComponent<any>>(
        activeComponents.objectives,
      );

      const sa = new SimulatedAnnealing(
        contextData.atribuicoes,
        contextData.docentes,
        contextData.turmas,
        contextData.travas,
        contextData.prioridades,
        constraints,
        { atribuicoes: contextData.atribuicoes }, // initial solution state
        neighborhood,
        stopFunctions,
        configData.maxPriority,
        configData.objectiveType,
        objectives,
        configData.saConfig.initialTemperature,
        configData.saConfig.coolingRate,
        configData.saConfig.iterationsPerTemperature
      );

      let isInterrompido = false;

      const handleInternalMessage = (e: MessageEvent) => {
        if (e.data.type === "STOP_SA") isInterrompido = true;
      };
      self.addEventListener("message", handleInternalMessage);

      await sa.execute(
        () => isInterrompido,
        (qtd) => {
          self.postMessage({ type: "PROGRESS_ALLOCATION", payload: qtd });
        },
        {
          campos: new Map<keyof Estatisticas, number>([
            ["iteracoes", 1],
            ["tempoPorIteracao", 1],
            ["avaliacaoPorIteracao", 1],
          ]),
          onUpdate: (estatisticas) => {
            self.postMessage({ type: "PROGRESS_STATS", payload: estatisticas });
          },
        }
      );

      self.removeEventListener("message", handleInternalMessage);

      self.postMessage({
        type: "SUCCESS",
        payload: {
          atribuicoes: sa.bestSolution.atribuicoes,
          avaliacao: sa.bestSolution.avaliacao,
          estatisticas: sa.statistics,
        },
      });
    } catch (error: any) {
      self.postMessage({
        type: "ERROR",
        payload: error.message || String(error),
      });
    }
  }
});
