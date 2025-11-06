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
import { MinimizarDiferencaSaldos } from "@/algoritmo/communs/ObjectiveComponents/MinimizarDiferencaSaldos";
import { PrioridadesDefault } from "@/algoritmo/communs/ObjectiveComponents/PrioridadesDefault";
import { PrioridadesPesosTabelados } from "@/algoritmo/communs/ObjectiveComponents/PrioridadesPesosTabelados";
import { IteracoesMaximas } from "@/algoritmo/communs/StopCriteria/IteracoesMaximas";
import IteracoesSemMelhoraAvaliacao from "@/algoritmo/communs/StopCriteria/IteracoesSemMelhoraAvaliacao";
import { IteracoesSemModificacao } from "@/algoritmo/communs/StopCriteria/IteracoesSemModificacao";
import { Objective } from "@/algoritmo/metodos/TabuSearch/AspirationCriteria/Objective";
import SameObjective from "@/algoritmo/metodos/TabuSearch/AspirationCriteria/SameObjective";
import { AspirationCriteria } from "@/algoritmo/metodos/TabuSearch/Classes/Abstract/AspirationCriteria";
import { AlgorithmType } from "@/app/types/algorithm-types";
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
  setTabuListType: () => "Ssolução",
  objectiveComponents: new Map<string, ObjectiveComponent<any>>(),
  setObjectiveComponents: () => Map<string, ObjectiveComponent<any>>,
  maiorPrioridade: 0,
  setMaiorPrioridade: () => 0,
  selectedAlgorithm: "tabu-search",
  setSelectedAlgorithm: () => {},
});

export function AlgorithmWrapper({ children }: { children: React.ReactNode }) {
  const [hardConstraints, setHardConstraints] = useState(
    new Map<string, Constraint<any>>([
      [
        "Atribuição sem formulário",
        new AtribuicaoSemFormulario(
          "Atribuição sem formulário",
          "Essa restrição verifica se o docente preencheu o formulário para as disciplinas que foi atribuído.",
          true,
          0,
          true,
          null
        ),
      ],
      [
        "Validar Travas",
        new ValidaTravas(
          "Validar Travas",
          "Restrição que impede a alteração em células travadas.",
          true,
          0,
          true,
          null
        ),
      ],
    ])
  );
  const [softConstraints, setSoftConstraints] = useState(
    new Map<string, Constraint<any>>([
      [
        "Disciplina sem docente",
        new DisciplinaSemDocente(
          "Disciplina sem docente",
          "",
          false,
          1000000,
          true,
          null
        ),
      ],
      [
        "Choque de horários",
        new ChoqueDeHorarios(
          "Choque de horários",
          "Essa restrição verifica se os docentes foram atribuídos a disciplinas que ocorrem ao mesmo tempo ou apresentam conflitos de início e fim de aula.",
          false,
          100000,
          true,
          null
        ),
      ],
      // [
      //   "Carga de Trabalho",
      //   new CargaDeTrabalho(
      //     "Carga de Trabalho",
      //     "Essa restrição tem como objetivo incentivar a atribuição de turmas a docentes com saldos negativos, atribuíndo uma maior penalização para eles, como também, desincentivar a atribuição de muitas turmas para docentes com saldos positivos.",
      //     false,
      //     10000
      //   ),
      // ],
      // Adicione outras restrições conforme necessário
      [
        "Carga de Trabalho Mínima",
        new CargaDeTrabalhoMinimaDocente(
          "Carga de Trabalho Mínima",
          "Penaliza a avaliação da solução para cada docente que não tenha atingido o mínimo de carga de trabalho atribuída (1.0).",
          false,
          10000,
          true,
          { minLimit: 1 }
        ),
      ],
      [
        "Carga de Trabalho Máxima",
        new CargaDeTrabalhoMaximaDocente(
          "Carga de Trabalho Máxima",
          "Penaliza a avaliação da solução para cada docente que tenha ultrapassado o limite de carga de trabalho atribuída (2.0).",
          false,
          10000,
          true,
          { maxLimit: 2 }
        ),
      ],
    ])
  );

  const [allConstraints, setAllConstraints] = useState(
    new Map([...softConstraints, ...hardConstraints])
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
      ["Add", { instance: new Add("Adiciona", "Adição"), isActive: true }],
      ["Remove", { instance: new Remove("Remove", "Remover"), isActive: true }],
      ["Swap", { instance: new Swap("Troca", "Trocar"), isActive: true }],
    ])
  );

  /**
   * Estado responsável pelas funções de `stop`, que encerrarão a execução do
   * algoritmo.
   */
  const [stopFunctions, setStopFunctions] = useState(
    new Map<string, StopCriteriaEntry>([
      [
        "Limite de Iterações",
        {
          instance: new IteracoesMaximas(
            "Limite de Iterações",
            "Função que interromperá o algoritmo caso uma determinada quantidade de iterações seja atingida.",
            300
          ),
          isActive: true,
        },
      ],
      [
        "Iterações sem Modificação",
        {
          instance: new IteracoesSemModificacao(
            "Iterações sem Modificação",
            "Função que interromperá o algoritmo caso uma determinada quantidade de iterações sem modificação da melhor solução seja atingida.",
            50
          ),
          isActive: false,
        },
      ],
      [
        "Iterações sem Melhora na Avaliação",
        {
          instance: new IteracoesSemMelhoraAvaliacao(
            "Iterações sem Melhora na Avaliação",
            "Função que interrompe a execução do algoritmo caso a avaliação das soluções não apresnetem melhora em uma determinada quantidade de iterações.",
            10
          ),
          isActive: false,
        },
      ],
    ])
  );

  /**
   * Estado responsável pelos critérios de aspiração.
   */
  const [aspirationFunctions, setAspirationFunctions] = useState(
    new Map<string, AspirationCriteriaEntry>([
      [
        "Objetivo",
        {
          instance: new Objective(
            "Aspiração por Objetivo",
            "O tabu será quebrado caso a solução observada apresente um valor objetivo maior que a melhor solução global encontrada."
          ),
          isActive: false,
        },
      ],
      [
        "Critério de Aceitação de Mesmas Avaliações",
        {
          instance: new SameObjective(
            "Aceitação de Mesmas Avaliações",
            'Esse critério tem como objetivo aceitar soluções com o valor objetivo (avaliação) maior ou igual ao melhor global após uma determinada quantidade de iterações sem modificação do melhor vizinho. O objetivo é tormar soluções "parecidas" (com mesma avaliação porémcom diferentes atribuições) melhores globais, incentivando a busca por melhores vizinhanças.',
            10
          ),
          isActive: false,
        },
      ],
    ])
  );

  const [tabuListType, setTabuListType] = useState<"Solução" | "Movimento">(
    "Solução"
  );

  const [objectiveComponents, setObjectiveComponents] = useState(
    new Map<string, ObjectiveComponent<any>>([
      [
        "Maximizar as prioridades",
        new PrioridadesDefault(
          "Maximizar as prioridades",
          true,
          "max",
          "Maximizar as prioridades das atribuições realizadas",
          1000,
          undefined,
          null
        ),
      ],
      [
        "Prioridades com Pesos Tabelados",
        new PrioridadesPesosTabelados(
          "Prioridade com pesos tabelados",
          false,
          "max",
          "Maximizar as prioridades das atribuições com as prioridades assumindo valores pré-definidos, com o conceito aplicado na F1, onde o primeiro colocado recebe mais pontos que o segundo, e assim por diante, ponderando ainda mais as prioridades.",
          1,
          undefined,
          undefined,
          null
        ),
      ],
      [
        "Minimizar Diferenca entre os Saldos",
        new MinimizarDiferencaSaldos(
          "Minimizar diferenca entre os saldos",
          false,
          "min",
          "Minimizar a diferença entre os saldos dos docentes.",
          1,
          null
        ),
      ],
    ])
  );

  /**
   * Maior prioridade
   */
  const [maiorPrioridade, setMaiorPrioridade] = useState<number>(0);

  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<AlgorithmType>("tabu-search");

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
