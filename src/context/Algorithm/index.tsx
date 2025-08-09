import { Objective } from "@/TabuSearch/AspirationCriteria/Objective";
import SameObjective from "@/TabuSearch/AspirationCriteria/SameObjective";
import { AspirationCriteria } from "@/TabuSearch/Classes/Abstract/AspirationCriteria";
import { NeighborhoodFunction } from "@/TabuSearch/Classes/Abstract/NeighborhoodFunction";
import { ObjectiveComponent } from "@/TabuSearch/Classes/Abstract/ObjectiveComponent";
import { StopCriteria } from "@/TabuSearch/Classes/Abstract/StopCriteria";
import Constraint from "@/TabuSearch/Classes/Constraint";
import { AtribuicaoSemFormulario } from "@/TabuSearch/Constraints/AtribuicaoSemFormulario";
import { CargaDeTrabalhoMaximaDocente } from "@/TabuSearch/Constraints/CargaDeTrabalhoMaximaDocente";
import { CargaDeTrabalhoMinimaDocente } from "@/TabuSearch/Constraints/CargaDeTrabalhoMinimaDocente";
import { ChoqueDeHorarios } from "@/TabuSearch/Constraints/ChoqueDeHorarios";
import { DisciplinaSemDocente } from "@/TabuSearch/Constraints/DisciplinaSemDocente";
import { ValidaTravas } from "@/TabuSearch/Constraints/ValidaTravas";
import { Add } from "@/TabuSearch/NeighborhoodGeneration/Add";
import { Remove } from "@/TabuSearch/NeighborhoodGeneration/Remove";
import { Swap } from "@/TabuSearch/NeighborhoodGeneration/Swap";
import { PrioridadesDefault } from "@/TabuSearch/ObjectiveComponents/PrioridadesDefault";
import { PrioridadesPesosTabelados } from "@/TabuSearch/ObjectiveComponents/PrioridadesPesosTabelados";
import { IteracoesMaximas } from "@/TabuSearch/StopCriteria/IteracoesMaximas";
import IteracoesSemMelhoraAvaliacao from "@/TabuSearch/StopCriteria/IteracoesSemMelhoraAvaliacao";
import { IteracoesSemModificacao } from "@/TabuSearch/StopCriteria/IteracoesSemModificacao";
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
  hardConstraints: Map<string, Constraint>;
  softConstraints: Map<string, Constraint>;
  setHardConstraints: React.Dispatch<
    React.SetStateAction<Map<string, Constraint>>
  >;
  setSoftConstraints: React.Dispatch<
    React.SetStateAction<Map<string, Constraint>>
  >;
  allConstraints: Map<string, Constraint>;
  setAllConstraints: React.Dispatch<
    React.SetStateAction<Map<string, Constraint>>
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
  objectiveComponents: Map<string, ObjectiveComponent>;
  setObjectiveComponents: React.Dispatch<
    React.SetStateAction<Map<string, ObjectiveComponent>>
  >;
  maiorPrioridade: number;
  setMaiorPrioridade: React.Dispatch<React.SetStateAction<number>>;
}

const AlgorithmContext = createContext<AlgorithmInterface>({
  hardConstraints: new Map<string, Constraint>(),
  softConstraints: new Map<string, Constraint>(),
  setHardConstraints: () => Map<string, Constraint>,
  setSoftConstraints: () => Map<string, Constraint>,
  allConstraints: new Map<string, Constraint>(),
  setAllConstraints: () => Map<string, Constraint>,
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
  objectiveComponents: new Map<string, ObjectiveComponent>(),
  setObjectiveComponents: () => Map<string, ObjectiveComponent>,
  maiorPrioridade: 0,
  setMaiorPrioridade: () => 0,
});

export function AlgorithmWrapper({ children }: { children: React.ReactNode }) {
  const [hardConstraints, setHardConstraints] = useState(
    new Map<string, Constraint>([
      [
        "Atribuição sem formulário",
        new AtribuicaoSemFormulario(
          "Atribuição sem formulário",
          "Essa restrição verifica se o docente preencheu o formulário para as disciplinas que foi atribuído.",
          true,
          0
        ),
      ],
      [
        "Validar Travas",
        new ValidaTravas(
          "Validar Travas",
          "Restrição que impede a alteração em células travadas.",
          true,
          0
        ),
      ],
    ])
  );
  const [softConstraints, setSoftConstraints] = useState(
    new Map<string, Constraint>([
      [
        "Disciplina sem docente",
        new DisciplinaSemDocente("Disciplina sem docente", "", false, 1000000),
      ],
      [
        "Choque de horários",
        new ChoqueDeHorarios(
          "Choque de horários",
          "Essa restrição verifica se os docentes foram atribuídos a disciplinas que ocorrem ao mesmo tempo ou apresentam conflitos de início e fim de aula.",
          false,
          100000
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
          10000
        ),
      ],
      [
        "Carga de Trabalho Máxima",
        new CargaDeTrabalhoMaximaDocente(
          "Carga de Trabalho Máxima",
          "Penaliza a avaliação da solução para cada docente que tenha ultrapassado o limite de carga de trabalho atribuída (2.0).",
          false,
          10000
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
    new Map<string, ObjectiveComponent>([
      [
        "Maximizar as prioridades",
        new PrioridadesDefault(
          "Maximizar as prioridades",
          true,
          "max",
          "Maximizar as prioridades das atribuições realizadas",
          1000,
          undefined
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
          undefined
        ),
      ],
    ])
  );

  /**
   * Maior prioridade
   */
  const [maiorPrioridade, setMaiorPrioridade] = useState<number>(0);

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
      }}
    >
      {children}
    </AlgorithmContext.Provider>
  );
}

export function useAlgorithmContext() {
  return useContext(AlgorithmContext);
}
