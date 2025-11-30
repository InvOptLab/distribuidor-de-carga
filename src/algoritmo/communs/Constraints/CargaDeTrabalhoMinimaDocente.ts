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
export type LimiteMinimo = {
  minLimit: IParameter<number>;
};

type constructorLimiteMinimo = {
  minLimit: number;
};

/**
 * Penaliza caso docentes não atinjam a carga de trabalho mínima.
 */
export class CargaDeTrabalhoMinimaDocente extends Constraint<LimiteMinimo> {
  constructor(
    name: string,
    description: string,
    isHard: boolean,
    penalty: number,
    isActive: boolean,
    parametros: constructorLimiteMinimo
  ) {
    super(name, description, isHard, penalty, isActive);

    this.params = {
      minLimit: {
        value: parametros.minLimit,
        name: "Carga didática mínimo.",
        description:
          "O número mínimo de carga didática que pode ser atribuída a um docente.",
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
     * Contar a quantidade de atribuições por docente
     */
    const qtdAtribDocente = new Map<string, number>();
    for (const docente of docentes) {
      const qtd = atribuicoes.filter((atribuicao) =>
        atribuicao.docentes.includes(docente.nome)
      ).length;
      qtdAtribDocente.set(docente.nome, qtd);
    }

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
      if (cargaDocente.get(docente.nome) < this.params.minLimit.value) {
        avaliacao -= this.penalty * (docente.saldo > 2.0 ? 0.75 : 1.0);
      }
    }

    return avaliacao;
  }

  /**
   * Será que faz sentido eu ver se estou menor que o limite apenas quando eu for remover e ver quando
   * estou passando o máximo apenas quando estiver adicionando ?
   */

  hard(
    atribuicoes?: Atribuicao[],
    docentes?: Docente[],
    disciplinasAtribuidas?: Disciplina[],
    travas?: Celula[],
    disciplinas?: Disciplina[]
  ): boolean {
    // for (const docente of docentes) {
    //   /**
    //    * Atribuições já existentes
    //    */
    //   const atribuicoesClone = structuredClone(atribuicoes);
    //   /**
    //    * Atribuição a ser realizada `disciplinasAtribuidas`
    //    */
    //   for (const disciplina of disciplinasAtribuidas) {
    //     const novaAtribuicao = atribuicoesClone.find(
    //       (atribuicao) => atribuicao.id_disciplina === disciplina.id
    //     );
    //     novaAtribuicao.docentes = [docente.nome];
    //   }

    //   if (
    //     this.calculaCargaDidatica(docente, atribuicoesClone, disciplinas) <
    //     this.params.minLimit.value
    //   ) {
    //     return false;
    //   }
    // }

    /**
     * Quer dizer que estou removendo um docente de uma turma
     */
    if (docentes.length === 0) {
      /**
       * Para todas as turmas em `disciplinasAtribuidas`, podemos observar os docentes atribuídos e remove-los para
       * ver qual a carga que eles ficarão.
       */

      for (const disciplina of disciplinasAtribuidas) {
        const docentesAtribuidos = atribuicoes.find(
          (atribuicao) => atribuicao.id_disciplina === disciplina.id
        ).docentes;

        for (const _docente of docentesAtribuidos) {
          const atribuicoesClone = structuredClone(atribuicoes);

          const novaAtribuicao = atribuicoesClone.find(
            (atribuicao) => atribuicao.id_disciplina === disciplina.id
          );
          novaAtribuicao.docentes = novaAtribuicao.docentes.filter(
            (nome) => nome !== _docente
          );

          const docente = docentes.find((docente) => docente.nome === _docente);

          if (
            docente &&
            this.calculaCargaDidatica(docente, atribuicoesClone, disciplinas) <
              this.params.minLimit.value
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  private calculaCargaDidatica(
    docente: Docente,
    atribuicoes: Atribuicao[],
    disciplinas: Disciplina[]
  ) {
    const atribuicoesDocente = atribuicoes.filter((atribuicao) =>
      atribuicao.docentes.includes(docente.nome)
    );

    let cargaDocente = 0;

    for (const atribuicao of atribuicoesDocente) {
      cargaDocente += disciplinas.find(
        (disciplina) => disciplina.id === atribuicao.id_disciplina
      ).carga;
    }
    return cargaDocente;
  }

  toObject(): ConstraintInterface {
    return {
      name: this.name,
      descricao: this.description,
      tipo: this.isHard ? "Hard" : "Soft",
      penalidade: String(this.penalty),
      constraint: CargaDeTrabalhoMinimaDocente,
    };
  }

  occurrences(
    atribuicoes: Atribuicao[],
    docentes?: Docente[],
    turmas?: Disciplina[]
  ): { label: string; qtd: number }[] {
    const data: { label: string; qtd: number }[] = [];
    let qtdMenosUm: number = 0;

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

    // let zeroAtribuicoes = 0;
    // let saldoNegativoCargaMenorQueMenos1 = 0;
    // let saldoNegativoCargaZero = 0;
    /**
     * Penalização com base no saldo
     */
    for (const docente of docentes) {
      if (cargaDocente.get(docente.nome) < this.params.minLimit.value) {
        qtdMenosUm += 1;
        // if (docente.saldo < -1.0) {
        //   saldoNegativoCargaMenorQueMenos1 += 1;
        // }
      }

      // if (cargaDocente.get(docente.nome) === 0) {
      //   zeroAtribuicoes += 1;
      //   if (docente.saldo < -1.0) {
      //     saldoNegativoCargaZero += 1;
      //   }
      // }
    }

    // const discretizacao = new Map<number, number>();

    // for (const docente of docentes) {
    //   const qtd = Math.round(cargaDocente.get(docente.nome));
    //   if (discretizacao.has(qtd)) {
    //     const old = discretizacao.get(qtd);
    //     discretizacao.set(qtd, old + 1);
    //   } else {
    //     discretizacao.set(qtd, 1);
    //   }
    // }

    data.push(
      {
        label: `Carga Menor que ${this.params.minLimit.value}.`,
        qtd: qtdMenosUm,
      }
      // { label: "0 atribuições.", qtd: zeroAtribuicoes },
      // {
      //   label: "Saldo Negativo Carga Menor que -1",
      //   qtd: saldoNegativoCargaMenorQueMenos1,
      // },
      // { label: "Saldo Negativo 0 atribuições", qtd: saldoNegativoCargaZero }
    );

    return data;
  }

  milpHardFormulation(model: OptimizationModel, modelData: modelSCP): void {
    modelData.D.forEach((i) => {
      const terms = modelData.T.map((j) => ({
        variable: modelData.x[i][j],
        coefficient: modelData.c[j],
      }));
      model.addConstraint(
        `carga_minima_hard_${i}`,
        LpSum(terms),
        ">=",
        this.params.minLimit.value
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
      const terms = modelData.T.map((j) => ({
        variable: modelData.x[i][j],
        coefficient: modelData.c[j],
      }));
      terms.push({ variable: modelData.z[i], coefficient: modelData.BigM });
      model.addConstraint(
        `carga_minima_soft_${i}`,
        LpSum(terms),
        ">=",
        this.params.minLimit.value
      );
    });

    /**
     * Componente na função objetivo
     */
    const objectiveTerms: Term[] = [];

    modelData.D.forEach((i) =>
      objectiveTerms.push({
        variable: modelData.z[i],
        coefficient: this.penalty * modelData.omega[i],
      })
    );

    return { objectiveTerms };
  }
}
