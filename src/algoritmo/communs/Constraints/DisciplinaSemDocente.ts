import { modelSCP } from "@/algoritmo/metodos/MILP/MILP";
import {
  OptimizationModel,
  Term,
} from "@/algoritmo/metodos/MILP/optimization_model";
import Constraint from "../../abstractions/Constraint";
import {
  Atribuicao,
  ConstraintInterface,
  Docente,
  IParameter,
} from "../interfaces/interfaces";
import { LpSum } from "@/algoritmo/metodos/MILP/utils";

/**
 * Parâmetro para o limite de docentes por turma.
 */
export type LimiteDocente = {
  limiteDocente: IParameter<number>;
};

type constructorLimiteDocente = {
  limiteDocente: number;
};

/**
 * TODO: Observar se manteremos o parâmetro sem causar nenhum tipo de penalidade.
 */
export class DisciplinaSemDocente extends Constraint<LimiteDocente> {
  readonly _name = "DisciplinaSemDocente";

  constructor(
    name: string,
    description: string,
    isHard: boolean,
    penalty: number,
    isActive: boolean,
    parametros: constructorLimiteDocente,
  ) {
    super(name, description, isHard, penalty, isActive);

    this.params = {
      limiteDocente: {
        value: parametros.limiteDocente,
        name: "Limite de Docentes.",
        description:
          "O número máximo de docentes que podem ser atribuídos a uma turma.",
      },
    };
  }

  soft(atribuicoes: Atribuicao[]): number {
    let avaliacao: number = 0;

    for (const atribuicao of atribuicoes) {
      if (atribuicao.docentes.length === 0) {
        avaliacao -= this.penalty;
      }
    }

    return avaliacao;
  }

  hard(atribuicoes?: Atribuicao[], docentes?: Docente[]): boolean {
    /**
     * A restrição precisou ser feita desta forma pois na função `podeAtribuir` o valor do docente quando a chamada vem da
     * função `gerarVizinhoComRemocao` se é passado o parâmetro Docente como null. A `podeAtribuir` passa [null].
     */
    return (
      docentes.filter((doc) => doc !== null && doc !== undefined).length > 0
    );
  }

  toObject(): ConstraintInterface {
    return {
      name: this.name,
      descricao: this.description,
      tipo: this.isHard ? "Hard" : "Soft",
      penalidade: String(this.penalty),
      constraint: DisciplinaSemDocente,
    };
  }

  occurrences(atribuicoes: Atribuicao[]): { label: string; qtd: number }[] {
    const data: { label: string; qtd: number }[] = [];

    if (this.penalty !== 0 && !this.hard) {
      const softEvaluation = this.soft(atribuicoes);

      data.push({
        label: "Sem Docente",
        qtd: Math.abs(softEvaluation / this.penalty),
      });
    } else {
      let qtd: number = 0;

      for (const atribuicao of atribuicoes) {
        if (atribuicao.docentes.length === 0) {
          qtd += 1;
        }
      }
      data.push({
        label: "Sem Docente",
        qtd: qtd,
      });
    }

    return data;
  }

  milpHardFormulation(model: OptimizationModel, modelData: modelSCP): void {
    modelData.T.forEach((j) => {
      const lhs = modelData.D.map((i) => modelData.x[i][j]);
      model.addConstraint(
        `cobertura_turma_hard_${j}`,
        LpSum(lhs),
        "==",
        this.params.limiteDocente.value,
      );
    });
  }

  milpSoftFormulation(
    model: OptimizationModel,
    modelData: modelSCP,
  ): { objectiveTerms: Term[] } {
    /**
     * Restrições
     */
    modelData.T.forEach((j) => {
      const lhs = modelData.D.map((i) => modelData.x[i][j]);
      lhs.push(modelData.u[j]);
      model.addConstraint(
        `cobertura_turma_soft_${j}`,
        LpSum(lhs),
        "==",
        this.params.limiteDocente.value,
      );
    });

    /**
     * Componentes na função objetivo
     */

    const objectiveTerms: Term[] = [];

    modelData.T.forEach((j) => {
      objectiveTerms.push({
        variable: modelData.u[j],
        coefficient: this.penalty,
      });
    });

    return { objectiveTerms };
  }
}
