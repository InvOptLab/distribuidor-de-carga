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

// =========================================================
// 2. REGISTRO DE COMPONENTES (O Dicionário do Worker)
// =========================================================
const ComponentRegistry: Record<string, any> = {
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
 * Função utilitária para reconstruir instâncias das classes
 * usando Object.assign. Mantém as configurações (pesos, active)
 * que vieram da UI de forma exata.
 */
function reviveInstances(serializedItems: any[]) {
  if (!serializedItems || !Array.isArray(serializedItems)) return [];

  return serializedItems
    .map((item) => {
      const ClassDef = ComponentRegistry[item.name];
      if (!ClassDef) {
        console.warn(
          `[Worker] Classe '${item.name}' não foi registrada no ComponentRegistry do Worker!`,
        );
        return null;
      }

      const config = item.data || {};

      // 1. Tenta instanciar passando os dados no construtor.
      // Passamos variações comuns para garantir que a classe receba a configuração se precisar.
      let instance;
      try {
        instance = new ClassDef(config.params || config);
      } catch (e) {
        try {
          instance = new ClassDef();
        } catch (err) {
          // Fallback extremo caso o construtor exija algo muito específico
          instance = Object.create(ClassDef.prototype);
        }
      }

      // 2. Faz um Deep Merge Seguro (Mescla Profunda).
      const safeAssign = (target: any, source: any) => {
        if (!source || typeof source !== "object") return;
        Object.keys(source).forEach((key) => {
          const val = source[key];
          if (val !== null && typeof val === "object" && !Array.isArray(val)) {
            if (!target[key] || typeof target[key] !== "object") {
              target[key] = {};
            }
            safeAssign(target[key], val);
          } else {
            target[key] = val; // Copia direta para primitivos e arrays
          }
        });
      };

      safeAssign(instance, config);

      // GARANTIA: Evita que leituras como `this.params.limiteDocente` explodam o worker.
      // Se não houver configurações, atribui um objeto vazio para retornar `undefined` de forma segura.
      if (!instance.params) instance.params = {};

      return instance;
    })
    .filter(Boolean);
}

self.addEventListener("message", async (event) => {
  const { type, payload } = event.data;

  if (type === "START_TABU") {
    try {
      const { contextData, configData, activeComponents } = payload;

      // =========================================================
      // 3. RECONSTRUÇÃO (Ressurreição das classes instanciadas na UI)
      // =========================================================
      const constraints = reviveInstances(activeComponents.constraints);
      console.log(constraints);
      const neighborhood = reviveInstances(activeComponents.neighborhood);
      const stopFunctions = reviveInstances(activeComponents.stopFunctions);
      const aspiration = reviveInstances(activeComponents.aspiration);
      const objectives = reviveInstances(activeComponents.objectives);

      // =========================================================
      // 4. EXECUTAR A BUSCA TABU
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
