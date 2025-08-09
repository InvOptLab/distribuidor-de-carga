import { Atribuicao, Disciplina, Docente } from "@/context/Global/utils";
import { ConstraintInterface } from "../Interfaces/utils";
import Constraint from "../Classes/Constraint";

/**
 * Penaliza a quantidade de carga de trabalho baseada nos saldos dos docentes.
 */
export class CargaDeTrabalho extends Constraint {
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
      if (cargaDocente.get(docente.nome) > 2.0) {
        avaliacao -= this.penalty * (docente.saldo < -1.0 ? 0.75 : 1.0);
      } else if (cargaDocente.get(docente.nome) < 1.0) {
        avaliacao -= this.penalty * (docente.saldo > 1.0 ? 0.75 : 1.0);
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
      constraint: CargaDeTrabalho,
    };
  }

  occurrences(
    atribuicoes: Atribuicao[],
    docentes?: Docente[],
    turmas?: Disciplina[]
  ): { label: string; qtd: number }[] {
    const data: { label: string; qtd: number }[] = [];
    let qtdMaisDois: number = 0;
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

    let zeroAtribuicoes = 0;
    let cargaMaiorQue2 = 0;

    let saldoPositivoCargaMaiorQue2 = 0;

    let saldoNegativoCargaMenorQueMenos1 = 0;
    let saldoNegativoCargaZero = 0;
    /**
     * Penalização com base no saldo
     */
    for (const docente of docentes) {
      if (cargaDocente.get(docente.nome) > 2) {
        qtdMaisDois += 1;
      } else if (cargaDocente.get(docente.nome) < 1) {
        qtdMenosUm += 1;

        if (docente.saldo < -1.0) {
          saldoNegativoCargaMenorQueMenos1 += 1;
        }
      }

      if (cargaDocente.get(docente.nome) === 0) {
        zeroAtribuicoes += 1;
        if (docente.saldo < -1.0) {
          saldoNegativoCargaZero += 1;
        }
      }

      if (cargaDocente.get(docente.nome) > 2.0) {
        cargaMaiorQue2 += 1;

        if (docente.saldo > -1.0) {
          saldoPositivoCargaMaiorQue2 += 1;
        }
      }
    }

    const discretizacao = new Map<number, number>();

    for (const docente of docentes) {
      const qtd = Math.round(cargaDocente.get(docente.nome));
      if (discretizacao.has(qtd)) {
        const old = discretizacao.get(qtd);
        discretizacao.set(qtd, old + 1);
      } else {
        discretizacao.set(qtd, 1);
      }
    }

    data.push(
      { label: "Quantidade Menor que 1.", qtd: qtdMenosUm },
      { label: "0 atribuições.", qtd: zeroAtribuicoes },
      { label: "Quantidade Maior que 2.", qtd: qtdMaisDois },
      { label: "Carga maior que 2 (real).", qtd: cargaMaiorQue2 },
      {
        label: "Saldo Positivo Carga Maior que 2.",
        qtd: saldoPositivoCargaMaiorQue2,
      },
      {
        label: "Saldo Negativo Carga Menor que -1",
        qtd: saldoNegativoCargaMenorQueMenos1,
      },
      { label: "Saldo Negativo 0 atribuições", qtd: saldoNegativoCargaZero }
    );

    /**
     * Converter o map discretizacao para um array e ordenar as keys.
     * Código retirado do Gemini.
     */
    // 1. Convert the Map to an array of [key, value] pairs
    const mapToArray = Array.from(discretizacao);

    // 2. Sort the array based on the numeric keys
    // The sort() method's compare function (a, b) => a[0] - b[0] sorts by the first element (the key) in ascending order.
    const sortedArray = mapToArray.sort((a, b) => a[0] - b[0]);

    // 3. Convert the sorted array back into a new Map
    const sortedMap = new Map<number, number>(sortedArray);

    for (const key of sortedMap.keys()) {
      data.push({ label: key + " Atrib.", qtd: sortedMap.get(key) });
    }

    return data;
  }
}
