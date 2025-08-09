import { Atribuicao, Disciplina, Docente } from "@/context/Global/utils";
import Constraint from "../Classes/Constraint";
import { ConstraintInterface } from "../Interfaces/utils";

/**
 * Penaliza a quantidade de carga de trabalho baseada nos saldos dos docentes.
 */
export class CargaDeTrabalhoMaximaDocente extends Constraint {
  constructor(
    name: string,
    description: string,
    /*algorithm: string,*/
    isHard: boolean,
    penalty: number
  ) {
    super(name, description, isHard, penalty);
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
      if (cargaDocente.get(docente.nome) > 2.0) {
        avaliacao -=
          this.penalty *
          // (cargaDocente.get(docente.nome) - 2.0) *
          (docente.saldo < -1.0 ? 0.75 : 1.0);
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
      if (cargaDocente.get(docente.nome) > 2.0) {
        cargaMaiorQue2 += 1;

        // if (docente.saldo > -1.0) {
        //   saldoPositivoCargaMaiorQue2 += 1;
        // }
      }
    }

    data.push(
      //{ label: "Quantidade Maior que 2.", qtd: qtdMaisDois },
      { label: "Carga maior que 2.", qtd: cargaMaiorQue2 }
    );

    return data;
  }
}
