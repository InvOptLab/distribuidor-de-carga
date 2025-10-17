import Constraint from "../../abstractions/Constraint";
import {
  Atribuicao,
  ConstraintInterface,
  Disciplina,
  Docente,
  IParameter,
} from "../interfaces/interfaces";

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
}
