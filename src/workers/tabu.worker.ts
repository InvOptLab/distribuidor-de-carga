import { TabuSearch } from "@/algoritmo/metodos/TabuSearch/Classes/TabuSearch";

// =========================================================
// 1. IMPORTAÇÃO DE TODAS AS CLASSES DO SISTEMA
// =========================================================

// Restrições (Constraints)
import { AtribuicaoSemFormulario } from "@/algoritmo/communs/Constraints/AtribuicaoSemFormulario";
import { CargaDeTrabalhoMaximaDocente } from "@/algoritmo/communs/Constraints/CargaDeTrabalhoMaximaDocente";
import { CargaDeTrabalhoMinimaDocente } from "@/algoritmo/communs/Constraints/CargaDeTrabalhoMinimaDocente";
import { ChoqueDeHorarios } from "@/algoritmo/communs/Constraints/ChoqueDeHorarios";
import { DisciplinaSemDocente } from "@/algoritmo/communs/Constraints/DisciplinaSemDocente";
import { ValidaTravas } from "@/algoritmo/communs/Constraints/ValidaTravas";

// Geração de Vizinhança (Neighborhood)
import { Add } from "@/algoritmo/communs/NeighborhoodGeneration/Add";
import { Remove } from "@/algoritmo/communs/NeighborhoodGeneration/Remove";
import { Swap } from "@/algoritmo/communs/NeighborhoodGeneration/Swap";

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

// Critérios de Aspiração (Aspiration Criteria)
import { Objective } from "@/algoritmo/metodos/TabuSearch/AspirationCriteria/Objective";
import IteracoesSemMelhoraAvaliacao from "@/algoritmo/communs/StopCriteria/IteracoesSemMelhoraAvaliacao";
import SameObjective from "@/algoritmo/metodos/TabuSearch/AspirationCriteria/SameObjective";
import { Estatisticas } from "@/algoritmo/communs/interfaces/interfaces";
import Constraint from "@/algoritmo/abstractions/Constraint";
import { NeighborhoodFunction } from "@/algoritmo/abstractions/NeighborhoodFunction";
import ObjectiveComponent from "@/algoritmo/abstractions/ObjectiveComponent";
import { StopCriteria } from "@/algoritmo/abstractions/StopCriteria";
import { AspirationCriteria } from "@/algoritmo/metodos/TabuSearch/Classes/Abstract/AspirationCriteria";

// Representação do objeto que vem do postMessage (UI -> Worker)
export interface SerializedComponent<TData = Record<string, unknown>> {
  name: string;
  data: TData;
}

// Um "Union Type" de todos os componentes
export type AlgorithmBaseComponent =
  | Constraint<any>
  | NeighborhoodFunction
  | ObjectiveComponent<any>
  | StopCriteria
  | any; // O "any" está aqui como fallback temporário para classes como AspirationCriteria

// Tipagem de um Construtor Genérico de Classe
export type ComponentConstructor<T> = new (...args: any[]) => T;

// =========================================================
// REGISTRO DE COMPONENTES
// =========================================================
const ComponentRegistry: Record<
  string,
  ComponentConstructor<AlgorithmBaseComponent>
> = {
  // Constraints
  AtribuicaoSemFormulario,
  CargaDeTrabalhoMaximaDocente,
  CargaDeTrabalhoMinimaDocente,
  ChoqueDeHorarios,
  DisciplinaSemDocente,
  ValidaTravas,

  // Neighborhood
  Add,
  Remove,
  Swap,

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

  // Aspiration Criteria
  Objective,
  SameObjective,
};

/**
 * Função utilitária para reconstruir instâncias das classes.
 * O uso de Generics <T> remove a necessidade de retornos 'any[]'.
 */
function reviveInstances<T>(
  serializedItems: SerializedComponent[] | undefined,
): T[] {
  if (!serializedItems || !Array.isArray(serializedItems)) return [];

  return serializedItems
    .map((item): T | null => {
      const ClassDef = ComponentRegistry[item.name];
      if (!ClassDef) {
        console.warn(
          `[Worker] Classe '${item.name}' não registrada no ComponentRegistry.`,
        );
        return null;
      }

      // Não adivinha o shape do construtor: instancia "vazio" e preenche via safeAssign.
      let instance: any;
      try {
        instance = new ClassDef();
      } catch (e) {
        console.error(
          `[Worker] Falha ao instanciar '${item.name}' sem argumentos:`,
          e,
        );
        instance = Object.create(ClassDef.prototype);
      }

      // Log defensivo — pega exatamente o bug (d) se ele existir.
      if (!item.data || Object.keys(item.data).length === 0) {
        console.warn(
          `[Worker] '${item.name}' chegou sem 'data' preenchido. Payload bruto:`,
          item,
        );
      }

      const safeAssign = (
        target: Record<string, any>,
        source: Record<string, any>,
      ) => {
        if (!source || typeof source !== "object") return;
        for (const [key, val] of Object.entries(source)) {
          if (val instanceof Map) {
            target[key] = new Map(val);
          } else if (val instanceof Set) {
            target[key] = new Set(val);
          } else if (Array.isArray(val)) {
            target[key] = val.slice();
          } else if (val !== null && typeof val === "object") {
            if (!target[key] || typeof target[key] !== "object")
              target[key] = {};
            safeAssign(target[key], val);
          } else {
            target[key] = val;
          }
        }
      };

      safeAssign(instance, item.data ?? {});

      Object.defineProperty(instance, "name", {
        value: item.name,
        writable: true,
        configurable: true,
        enumerable: true,
      });

      if (instance.params === undefined) instance.params = {};

      // Sanity check: garante que a instância tem pelo menos um método de comportamento.
      const hasBehaviour = [
        "hard",
        "soft",
        "generate",
        "calculate",
        "stop",
        "fulfills",
        "validate",
      ].some((m) => typeof instance[m] === "function");
      if (!hasBehaviour) {
        console.error(
          `[Worker] '${item.name}' revivido sem nenhum método de comportamento — verifique o registry/protótipo.`,
        );
      }

      return instance as T;
    })
    .filter((item): item is T => item !== null);
}

self.addEventListener("message", async (event) => {
  const { type, payload } = event.data;

  if (type === "START_TABU") {
    try {
      const { contextData, configData, activeComponents } = payload;

      console.log(activeComponents);

      // =========================================================
      // RECONSTRUÇÃO
      // =========================================================
      // Vai retornar um array estrito de Constraint<any>[]
      const constraints = reviveInstances<Constraint<any>>(
        activeComponents.constraints,
      );

      // Vai retornar um array estrito de NeighborhoodFunction[]
      const neighborhood = reviveInstances<NeighborhoodFunction>(
        activeComponents.neighborhood,
      );

      // Vai retornar um array estrito de StopCriteria[]
      const stopFunctions = reviveInstances<StopCriteria>(
        activeComponents.stopFunctions,
      );

      // Vai retornar um array estrito de ObjectiveComponent<any>[]
      const objectives = reviveInstances<ObjectiveComponent<any>>(
        activeComponents.objectives,
      );

      // O Aspiration precisa do tipo exportado (coloquei any como fallback lá em cima,
      // mas você pode importar e usar AspirationCriteria aqui)
      const aspiration = reviveInstances<AspirationCriteria>(
        activeComponents.aspiration,
      );

      console.log(constraints);

      // =========================================================
      // EXECUTAR A BUSCA TABU
      // =========================================================

      const buscaTabu = new TabuSearch(
        contextData.atribuicoes,
        contextData.docentes,
        contextData.turmas,
        contextData.travas,
        contextData.prioridades,
        constraints,
        { atribuicoes: contextData.atribuicoes }, // initial solution state
        neighborhood,
        configData.tabuListType,
        configData.tabuSize,
        stopFunctions,
        aspiration,
        configData.maxPriority,
        configData.objectiveType,
        objectives,
      );

      console.log(buscaTabu);

      let isInterrompido = false;

      // Escuta para sinais de interrupção vindos da UI
      const handleInternalMessage = (e: MessageEvent) => {
        if (e.data.type === "STOP_TABU") isInterrompido = true;
      };
      self.addEventListener("message", handleInternalMessage);

      // Roda o Algoritmo Otimizado (livre da Thread Principal!)
      await buscaTabu.execute(
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
        },
      );

      self.removeEventListener("message", handleInternalMessage);

      // Envia o sucesso
      self.postMessage({
        type: "SUCCESS",
        payload: {
          atribuicoes: buscaTabu.bestSolution.atribuicoes,
          avaliacao: buscaTabu.bestSolution.avaliacao,
          estatisticas: buscaTabu.statistics,
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
