"use client";
import Constraint from "@/algoritmo/abstractions/Constraint";
import { NeighborhoodFunction } from "@/algoritmo/abstractions/NeighborhoodFunction";
import ObjectiveComponent from "@/algoritmo/abstractions/ObjectiveComponent";
import { StopCriteria } from "@/algoritmo/abstractions/StopCriteria";
import { AtribuicaoSemFormulario } from "@/algoritmo/communs/Constraints/AtribuicaoSemFormulario";
import { CargaDeTrabalhoMaximaDocente } from "@/algoritmo/communs/Constraints/CargaDeTrabalhoMaximaDocente";
import { CargaDeTrabalhoMinimaDocente } from "@/algoritmo/communs/Constraints/CargaDeTrabalhoMinimaDocente";
import { ChoqueDeHorarios } from "@/algoritmo/communs/Constraints/ChoqueDeHorarios";
import { DisciplinaSemDocente } from "@/algoritmo/communs/Constraints/DisciplinaSemDocente";
import { ValidaTravas } from "@/algoritmo/communs/Constraints/ValidaTravas";
import { Add } from "@/algoritmo/communs/NeighborhoodGeneration/Add";
import { Remove } from "@/algoritmo/communs/NeighborhoodGeneration/Remove";
import { Swap } from "@/algoritmo/communs/NeighborhoodGeneration/Swap";
import { MinimizarDiferencaCargaDidatica } from "@/algoritmo/communs/ObjectiveComponents/MinimizarDiferencaCargaDidatica";
import { MinimizarDiferencaSaldos } from "@/algoritmo/communs/ObjectiveComponents/MinimizarDiferencaSaldos";
import { MinimizarUtilizacaoSaldos } from "@/algoritmo/communs/ObjectiveComponents/MinimizarUtilizacaoSaldos";
import { PrioridadesDefault } from "@/algoritmo/communs/ObjectiveComponents/PrioridadesDefault";
import { PrioridadesPesosTabelados } from "@/algoritmo/communs/ObjectiveComponents/PrioridadesPesosTabelados";
import { PrioridadesPonderadasPorSaldo } from "@/algoritmo/communs/ObjectiveComponents/PrioridadesPonderadasPorSaldo";
import { IteracoesMaximas } from "@/algoritmo/communs/StopCriteria/IteracoesMaximas";
import IteracoesSemMelhoraAvaliacao from "@/algoritmo/communs/StopCriteria/IteracoesSemMelhoraAvaliacao";
import { IteracoesSemModificacao } from "@/algoritmo/communs/StopCriteria/IteracoesSemModificacao";
import { Objective } from "@/algoritmo/metodos/TabuSearch/AspirationCriteria/Objective";
import SameObjective from "@/algoritmo/metodos/TabuSearch/AspirationCriteria/SameObjective";
import { AspirationCriteria } from "@/algoritmo/metodos/TabuSearch/Classes/Abstract/AspirationCriteria";
import { AlgorithmType } from "@/app/[locale]/types/algorithm-types";
import { useTranslations } from "next-intl";
import { createContext, useContext, useState } from "react";

type NeighborhoodEntry = {
  instance: NeighborhoodFunction;
  isActive: boolean;
};

type StopCriteriaEntry = {
  instance: StopCriteria;
  isActive: boolean;
};

type AspirationCriteriaEntry = {
  instance: AspirationCriteria;
  isActive: boolean;
};

export interface AlgorithmInterface {
  hardConstraints: Map<string, Constraint<any>>;
  softConstraints: Map<string, Constraint<any>>;
  setHardConstraints: React.Dispatch<
    React.SetStateAction<Map<string, Constraint<any>>>
  >;
  setSoftConstraints: React.Dispatch<
    React.SetStateAction<Map<string, Constraint<any>>>
  >;
  allConstraints: Map<string, Constraint<any>>;
  setAllConstraints: React.Dispatch<
    React.SetStateAction<Map<string, Constraint<any>>>
  >;
  parametros: {
    tabuTenure: {
      size: number;
      tenures: {
        add: number;
        drop: number;
      };
    };
    maxIterations: { value?: number; isActive: boolean };
  };
  setParametros: React.Dispatch<
    React.SetStateAction<{
      tabuTenure: {
        size: number;
        tenures: {
          add: number;
          drop: number;
        };
      };
      maxIterations: { value?: number; isActive: boolean };
    }>
  >;
  neighborhoodFunctions: Map<string, NeighborhoodEntry>;
  setNeighborhoodFunctions: React.Dispatch<
    React.SetStateAction<Map<string, NeighborhoodEntry>>
  >;
  stopFunctions: Map<string, StopCriteriaEntry>;
  setStopFunctions: React.Dispatch<
    React.SetStateAction<Map<string, StopCriteriaEntry>>
  >;
  aspirationFunctions: Map<string, AspirationCriteriaEntry>;
  setAspirationFunctions: React.Dispatch<
    React.SetStateAction<Map<string, AspirationCriteriaEntry>>
  >;
  tabuListType: "Solução" | "Movimento";
  setTabuListType: React.Dispatch<"Solução" | "Movimento">;
  objectiveComponents: Map<string, ObjectiveComponent<any>>;
  setObjectiveComponents: React.Dispatch<
    React.SetStateAction<Map<string, ObjectiveComponent<any>>>
  >;
  maiorPrioridade: number;
  setMaiorPrioridade: React.Dispatch<React.SetStateAction<number>>;

  selectedAlgorithm: AlgorithmType;
  setSelectedAlgorithm: React.Dispatch<React.SetStateAction<AlgorithmType>>;
}

const AlgorithmContext = createContext<AlgorithmInterface>({
  hardConstraints: new Map<string, Constraint<any>>(),
  softConstraints: new Map<string, Constraint<any>>(),
  setHardConstraints: () => Map<string, Constraint<any>>,
  setSoftConstraints: () => Map<string, Constraint<any>>,
  allConstraints: new Map<string, Constraint<any>>(),
  setAllConstraints: () => Map<string, Constraint<any>>,
  parametros: {
    tabuTenure: {
      size: 25,
      tenures: {
        add: 5,
        drop: 5,
      },
    },
    maxIterations: { value: undefined, isActive: false },
  },
  setParametros: () => {},
  neighborhoodFunctions: new Map<string, NeighborhoodEntry>(),
  setNeighborhoodFunctions: () => Map<string, NeighborhoodEntry>,
  stopFunctions: new Map<string, StopCriteriaEntry>(),
  setStopFunctions: () => Map<string, StopCriteriaEntry>,
  aspirationFunctions: new Map<string, AspirationCriteriaEntry>(),
  setAspirationFunctions: () => Map<string, AspirationCriteriaEntry>,
  tabuListType: "Solução",
  setTabuListType: () => "Solução",
  objectiveComponents: new Map<string, ObjectiveComponent<any>>(),
  setObjectiveComponents: () => Map<string, ObjectiveComponent<any>>,
  maiorPrioridade: 0,
  setMaiorPrioridade: () => 0,
  selectedAlgorithm: "tabu-search",
  setSelectedAlgorithm: () => {},
});

export function AlgorithmWrapper({ children }: { children: React.ReactNode }) {
  const t = useTranslations("AlgorithmContext");
  const [hardConstraints, setHardConstraints] = useState(
    new Map<string, Constraint<any>>([
      [
        t("Constraints.assignmentWithoutForms"),
        new AtribuicaoSemFormulario(
          t("Constraints.assignmentWithoutForms"),
          t("Constraints.assignmentWithoutFormsDescription"),
          true,
          0,
          true,
          null,
        ),
      ],
      [
        t("Constraints.validateLocks"),
        new ValidaTravas(
          t("Constraints.validateLocks"),
          t("Constraints.validateLocksDescription"),
          true,
          0,
          true,
          null,
        ),
      ],
    ]),
  );
  const [softConstraints, setSoftConstraints] = useState(
    new Map<string, Constraint<any>>([
      [
        t("Constraints.classeWithoutTeacher"),
        new DisciplinaSemDocente(
          t("Constraints.classeWithoutTeacher"),
          t("Constraints.classeWithoutTeacherDescription"),
          false,
          1000000,
          true,
          null,
        ),
      ],
      [
        t("Constraints.scheduleConflict"),
        new ChoqueDeHorarios(
          t("Constraints.scheduleConflict"),
          t("Constraints.scheduleConflictDescription"),
          false,
          100000,
          true,
          null,
        ),
      ],
      [
        t("Constraints.minimumTeachingLoad"),
        new CargaDeTrabalhoMinimaDocente(
          t("Constraints.minimumTeachingLoad"),
          t("Constraints.minimumTeachingLoadDescription"),
          false,
          10000,
          true,
          { minLimit: 1 },
        ),
      ],
      [
        t("Constraints.maximumTeachingLoad"),
        new CargaDeTrabalhoMaximaDocente(
          t("Constraints.maximumTeachingLoad"),
          t("Constraints.maximumTeachingLoadDescription"),
          false,
          10000,
          true,
          { maxLimit: 2 },
        ),
      ],
    ]),
  );

  const [allConstraints, setAllConstraints] = useState(
    new Map([...softConstraints, ...hardConstraints]),
  );

  const [parametros, setParametros] = useState<{
    tabuTenure: {
      size: number;
      tenures: {
        add: number;
        drop: number;
      };
    };
    maxIterations: { value?: number; isActive: boolean };
  }>({
    tabuTenure: {
      size: 25,
      tenures: {
        add: 5,
        drop: 5,
      },
    },
    maxIterations: { value: undefined, isActive: false },
  });

  /**
   * Estado responsável pelos processos de geração de vizinhança
   */
  const [neighborhoodFunctions, setNeighborhoodFunctions] = useState(
    new Map<string, NeighborhoodEntry>([
      [
        "Add",
        {
          instance: new Add(t("Movements.add"), t("Movements.addDescription")),
          isActive: true,
        },
      ],
      [
        "Remove",
        {
          instance: new Remove(
            t("Movements.remove"),
            t("Movements.removeDescription"),
          ),
          isActive: true,
        },
      ],
      [
        "Swap",
        {
          instance: new Swap(
            t("Movements.swap"),
            t("Movements.swapDescription"),
          ),
          isActive: true,
        },
      ],
    ]),
  );

  /**
   * Estado responsável pelas funções de `stop`, que encerrarão a execução do algoritmo.
   */
  const [stopFunctions, setStopFunctions] = useState(
    new Map<string, StopCriteriaEntry>([
      [
        t("StopCriteria.iterationLimit"),
        {
          instance: new IteracoesMaximas(
            t("StopCriteria.iterationLimit"),
            t("StopCriteria.iterationLimitDescription"),
            300,
          ),
          isActive: true,
        },
      ],
      [
        t("StopCriteria.iterationsWithoutModification"),

        {
          instance: new IteracoesSemModificacao(
            t("StopCriteria.iterationsWithoutModification"),
            t("StopCriteria.iterationsWithoutModificationDescription"),
            50,
          ),
          isActive: false,
        },
      ],
      [
        t("StopCriteria.iterationsWithoutImprovementInEvaluation"),
        {
          instance: new IteracoesSemMelhoraAvaliacao(
            t("StopCriteria.iterationsWithoutImprovementInEvaluation"),
            t(
              "StopCriteria.iterationsWithoutImprovementInEvaluationDescription",
            ),
            10,
          ),
          isActive: false,
        },
      ],
    ]),
  );

  /**
   * Estado responsável pelos critérios de aspiração.
   */
  const [aspirationFunctions, setAspirationFunctions] = useState(
    new Map<string, AspirationCriteriaEntry>([
      [
        t("AspirationCriteria.objective"),
        {
          instance: new Objective(
            t("AspirationCriteria.objectiveName"),
            t("AspirationCriteria.objectiveDescription"),
          ),
          isActive: false,
        },
      ],
      [
        t("AspirationCriteria.sameEvaluation"),
        {
          instance: new SameObjective(
            t("AspirationCriteria.sameEvaluationName"),
            t("AspirationCriteria.sameEvaluationDescription"),
            10,
          ),
          isActive: false,
        },
      ],
    ]),
  );

  // TODO: Os textos devem ser modificados para um ENEM de forma a podermos utilizar as traduções de forma correta e não através de ajustes.
  // FIX: Removi a tipagem pois os tipos estavam fixados em texto < "Solução" | "Movimento">
  const [tabuListType, setTabuListType] = useState(
    t("TabuType.solution") as "Solução" | "Movimento",
  );

  const [objectiveComponents, setObjectiveComponents] = useState(
    new Map<string, ObjectiveComponent<any>>([
      [
        t("ObjectiveComponent.maximizepriorities"),
        new PrioridadesDefault(
          t("ObjectiveComponent.maximizepriorities"),
          false,
          "max",
          t("ObjectiveComponent.maximizeprioritiesDescription"),
          1000,
          undefined,
          null,
        ),
      ],
      [
        t("ObjectiveComponent.weightedpriorities"),
        new PrioridadesPesosTabelados(
          t("ObjectiveComponent.weightedpriorities"),
          false,
          "max",
          t("ObjectiveComponent.weightedprioritiesDescription"),
          1,
          undefined,
          undefined,
          null,
        ),
      ],
      [
        t("ObjectiveComponent.minimizeDifferenceBetweenBalances"),
        new MinimizarDiferencaSaldos(
          t("ObjectiveComponent.minimizeDifferenceBetweenBalances"),
          false,
          "min",
          t("ObjectiveComponent.minimizeDifferenceBetweenBalancesDescription"),
          1,
          null,
        ),
      ],
      [
        t("ObjectiveComponent.maximizePrioritiesUsingBalances"),
        new PrioridadesPonderadasPorSaldo(
          t("ObjectiveComponent.maximizePrioritiesUsingBalances"),
          true,
          "max",
          t("ObjectiveComponent.maximizePrioritiesUsingBalancesDescription"),
          1000,
          undefined,
          { alpha: 0.1 },
        ),
      ],
      [
        t("ObjectiveComponent.minimizeDifferenceInTeachingLoad"),
        new MinimizarDiferencaCargaDidatica(
          t("ObjectiveComponent.minimizeDifferenceInTeachingLoad"),
          false,
          "min",
          t("ObjectiveComponent.minimizeDifferenceInTeachingLoadDescription"),
          1,
          null,
        ),
      ],
      [
        t("ObjectiveComponent.minimizeBalanceUtilization"),
        new MinimizarUtilizacaoSaldos(
          t("ObjectiveComponent.minimizeBalanceUtilization"),
          true,
          "min",
          t("ObjectiveComponent.minimizeBalanceUtilizationDescription"),
          1,
          null,
        ),
      ],
    ]),
  );

  /**
   * Maior prioridade
   */
  const [maiorPrioridade, setMaiorPrioridade] = useState<number>(0);

  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<AlgorithmType>("integer-solver");

  return (
    <AlgorithmContext.Provider
      value={{
        hardConstraints: hardConstraints,
        softConstraints: softConstraints,
        setHardConstraints: setHardConstraints,
        setSoftConstraints: setSoftConstraints,
        allConstraints: allConstraints,
        setAllConstraints: setAllConstraints,
        parametros: parametros,
        setParametros: setParametros,
        neighborhoodFunctions: neighborhoodFunctions,
        setNeighborhoodFunctions: setNeighborhoodFunctions,
        stopFunctions: stopFunctions,
        setStopFunctions: setStopFunctions,
        aspirationFunctions: aspirationFunctions,
        setAspirationFunctions: setAspirationFunctions,
        tabuListType: tabuListType,
        setTabuListType: setTabuListType,
        objectiveComponents: objectiveComponents,
        setObjectiveComponents: setObjectiveComponents,
        maiorPrioridade: maiorPrioridade,
        setMaiorPrioridade: setMaiorPrioridade,
        selectedAlgorithm,
        setSelectedAlgorithm,
      }}
    >
      {children}
    </AlgorithmContext.Provider>
  );
}

export function useAlgorithmContext() {
  return useContext(AlgorithmContext);
}
