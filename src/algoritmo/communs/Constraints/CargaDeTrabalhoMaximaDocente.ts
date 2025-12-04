import { modelSCP } from "@/algoritmo/metodos/MILP/MILP";
import {
  OptimizationModel,
  Term,
} from "@/algoritmo/metodos/MILP/optimization_model";
import Constraint from "../../abstractions/Constraint";
import {
  Atribuicao,
  Celula,
  ConstraintInterface,
  Disciplina,
  Docente,
  IParameter,
} from "../interfaces/interfaces";
import { LpSum } from "@/algoritmo/metodos/MILP/utils";

/**
 * Forma do parâmtro que será utilizada na classe
 */
export type LimiteMaximo = {
  maxLimit: IParameter<number>;
};

type constructorLimiteMaximo = {
  maxLimit: number;
};

/**
 * Penaliza a quantidade de carga de trabalho baseada nos saldos dos docentes.
 */
export class CargaDeTrabalhoMaximaDocente extends Constraint<LimiteMaximo> {
  constructor(
    name: string,
    description: string,
    isHard: boolean,
    penalty: number,
    isActive: boolean,
    parametros: constructorLimiteMaximo
  ) {
    super(name, description, isHard, penalty, isActive);

    this.params = {
      maxLimit: {
        value: parametros.maxLimit,
        name: "Carga didática máxima.",
        description:
          "O número máximo de carga didática que pode ser atribuída a um docente.",
      },
    };
  }

  soft(
    atribuicoes: Atribuicao[],
    docentes: Docente[],
    turmas: Disciplina[]
  ): number {
    let avaliacao: number = 0;
    /**
     * Alteração para contabilizar pela carga da turma e não pela quantidade de atribuições.
     * Caso o arquivo não contenha a carga, será utilizado o valor 1, voltando a ser a contabilização por atribuições.
     */
    const cargaDocente = new Map<string, number>();
    for (const docente of docentes) {
      let carga = 0;
      const atribuicoesDocente = atribuicoes.filter((atribuicao) =>
        atribuicao.docentes.includes(docente.nome)
      );

      for (const atribuicao of atribuicoesDocente) {
        const turma = turmas.find((t) => t.id === atribuicao.id_disciplina);
        if (turma) {
          carga += turma.carga;
        }
      }
      cargaDocente.set(docente.nome, carga);
    }

    /**
     * Penalização com base no saldo
     */
    for (const docente of docentes) {
      if (cargaDocente.get(docente.nome) > this.params.maxLimit.value) {
        avaliacao -=
          this.penalty *
          (docente.saldo < -1.0 ? 0.75 : 1.0) *
          (cargaDocente.get(docente.nome) - this.params.maxLimit.value);
      }
    }

    return avaliacao;
  }

  hard(
    atribuicoes?: Atribuicao[],
    docentes?: Docente[],
    disciplinasAtribuidas?: Disciplina[],
    travas?: Celula[],
    disciplinas?: Disciplina[]
  ): boolean {
    if (docentes === undefined) {
      return true;
    }

    for (const docente of docentes) {
      /**
       * Atribuições já existentes
       */
      const atribuicoesDocente = atribuicoes.filter((atribuicao) =>
        atribuicao.docentes.includes(docente.nome)
      );

      /**
       * Atribuição a ser realizada `disciplinasAtribuidas`
       */
      for (const disciplina of disciplinasAtribuidas) {
        atribuicoesDocente.push({
          id_disciplina: disciplina.id,
          docentes: [docente.nome],
        });
      }

      let cargaDocente = 0;

      for (const atribuicao of atribuicoesDocente) {
        cargaDocente += disciplinas.find(
          (disciplina) => disciplina.id === atribuicao.id_disciplina
        ).carga;
      }

      if (cargaDocente > this.params.maxLimit.value) {
        return false;
      }
    }
    return true;
  }

  toObject(): ConstraintInterface {
    return {
      name: this.name,
      descricao: this.description,
      tipo: this.isHard ? "Hard" : "Soft",
      penalidade: String(this.penalty),
      constraint: CargaDeTrabalhoMaximaDocente,
    };
  }

  occurrences(
    atribuicoes: Atribuicao[],
    docentes?: Docente[],
    turmas?: Disciplina[]
  ): { label: string; qtd: number }[] {
    const data: { label: string; qtd: number }[] = [];

    const cargaDocente = new Map<string, number>();
    for (const docente of docentes) {
      let carga = 0;
      const atribuicoesDocente = atribuicoes.filter((atribuicao) =>
        atribuicao.docentes.includes(docente.nome)
      );

      for (const atribuicao of atribuicoesDocente) {
        const turma = turmas.find((t) => t.id === atribuicao.id_disciplina);
        if (turma) {
          carga += turma.carga;
        }
      }
      cargaDocente.set(docente.nome, carga);
    }

    let cargaMaiorQue2 = 0;
    // let saldoPositivoCargaMaiorQue2 = 0;
    /**
     * Penalização com base no saldo
     */
    for (const docente of docentes) {
      if (cargaDocente.get(docente.nome) > this.params.maxLimit.value) {
        cargaMaiorQue2 += 1;

        // if (docente.saldo > -1.0) {
        //   saldoPositivoCargaMaiorQue2 += 1;
        // }
      }
    }

    data.push({
      label: `Carga maior que ${this.params.maxLimit.value}.`,
      qtd: cargaMaiorQue2,
    });

    return data;
  }

  milpHardFormulation(model: OptimizationModel, modelData: modelSCP): void {
    modelData.D.forEach((i) => {
      // Cria o somatório: Σ c_j * x_i,j
      const terms = modelData.T.map((j) => ({
        variable: modelData.x[i][j],
        coefficient: modelData.c[j],
      }));

      // Adiciona a restrição: (Σ c_j * x_i,j) <= L_sup
      model.addConstraint(
        `carga_maxima_${i}`,
        LpSum(terms),
        "<=",
        this.params.maxLimit.value
      );
    });
  }

  milpSoftFormulation(
    model: OptimizationModel,
    modelData: modelSCP
  ): { objectiveTerms: Term[] } {
    /**
     * Restrição
     */
    modelData.D.forEach((i) => {
      // Cria o somatório: Σ c_j * x_i,j
      const terms = modelData.T.map((j) => ({
        variable: modelData.x[i][j],
        coefficient: modelData.c[j],
      }));

      // Adiciona o termo -w_i (antes era -BigM * w_i)
      terms.push({ variable: modelData.w[i], coefficient: -1 });

      // Adiciona a restrição: (Σ c_j * x_i,j) - w_i <= L_sup
      model.addConstraint(
        `carga_maxima_${i}`,
        LpSum(terms),
        "<=",
        this.params.maxLimit.value
      );
    });

    /**
     * Componente na função objetivo
     */
    const objectiveTerms: Term[] = [];

    modelData.D.forEach((i) =>
      objectiveTerms.push({
        variable: modelData.w[i],
        coefficient: this.penalty * modelData.eta[i],
      })
    );

    return { objectiveTerms };
  }
}
