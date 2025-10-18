import { ObjectiveComponent } from "../../abstractions/ObjectiveComponent";
import { Atribuicao, Docente, Formulario } from "../interfaces/interfaces";

/**
 * Esse componente tem como intenção **minimizar** a diferença entre as atirbuições para um mesmo docente.
 * $$min \sum_{i \in D} \sum_{j \in T} \sum_{k = j+1}^{|T|} (x_ij x_ik | p_ij - p_ik|)$$
 *
 * Talvez essa implementação seja interessante utilizar o conceito de tabela de pesos por prioridade.
 *
 * Testar fazer da seguinte forma:
 * n = | p_ij - p_ik|
 * custo = | p_ij - p_ik| * 2^(P_max - n)
 * Dessa forma, quando i = 0, teremos o maior valor possível
 */
export class DiferencaEntrePrioridades extends ObjectiveComponent {
  tabelaMultiplicadores: Map<number, number>;

  maiorPrioridade: number = undefined;

  useMultiplierTable: boolean;

  constructor(
    name: string,
    isActive: boolean,
    type: "min" | "max",
    description: string | undefined,
    multiplier: number | undefined
    // useMultiplierTable: boolean,
    // maiorPrioridade: number | undefined,
    // tabelaMultiplicadores: Map<number, number> | undefined
  ) {
    super(name, isActive, type, description, multiplier);

    // this.useMultiplierTable = useMultiplierTable;

    // if (useMultiplierTable) {
    //   this.maiorPrioridade = maiorPrioridade;
    //   /**
    //    * Caso a maior prioridade seja informada mas a tabela com os multiplicadores não,
    //    * será chamado o método para gerar os valores automaticamente.
    //    */
    //   if (this.maiorPrioridade && !tabelaMultiplicadores) {
    //     this.setTabelaMultiplicadores();
    //   } else {
    //     this.tabelaMultiplicadores = tabelaMultiplicadores;
    //   }
    // }
  }

  setTabelaMultiplicadores() {
    this.tabelaMultiplicadores = new Map<number, number>();

    for (let i = 0; i <= this.maiorPrioridade; i++) {
      //2^n
      // n = P_max - p
      // this.tabelaMultiplicadores.set(
      //   this.maiorPrioridade - i,
      //   Math.pow(2, i + 1)
      // );

      this.tabelaMultiplicadores.set(i, Math.pow(2, i + 1));
    }
    // Caso precise verificar uma atribuição sem prioridade definida.

    // this.tabelaMultiplicadores.set(0, Math.pow(2, this.maiorPrioridade + 1));
  }

  setMaiorPrioridade(formularios: Formulario[]): number {
    this.maiorPrioridade = 0;

    for (const formulario of formularios) {
      if (formulario.prioridade > this.maiorPrioridade) {
        this.maiorPrioridade = formulario.prioridade;
      }
    }
    this.maiorPrioridade = this.maiorPrioridade + 1;

    return this.maiorPrioridade;
  }

  // calculate(
  //   atribuicoes: Atribuicao[],
  //   formularios: Formulario[],
  //   docentes?: Docente[]
  // ): number {
  //   if (this.useMultiplierTable) {
  //     /**
  //      * Verifica se `this.maiorPrioridade` já foi calculada. Caso negativo deverá calculará.
  //      * Juntamenmte, será calculada a tabela com os multiplicadores por prioridade.
  //      */
  //     if (!this.maiorPrioridade) {
  //       this.setMaiorPrioridade(formularios);
  //       //this.setTabelaMultiplicadores();
  //     }

  //     if (
  //       !this.tabelaMultiplicadores ||
  //       this.tabelaMultiplicadores.size === 0
  //     ) {
  //       this.setTabelaMultiplicadores();
  //     }
  //   }

  //   let custo = 0;

  //   const prioridadesAtribuicoesPorDocente = new Map<string, number[]>(); // Docente, Prioridades

  //   /**
  //    * Prepara um map contendo todos os docentes e todas as prioridades atribuídas a cada um desses docentes.
  //    */
  //   for (const atribuicao of atribuicoes) {
  //     for (const _docente of atribuicao.docentes) {
  //       if (!prioridadesAtribuicoesPorDocente.has(_docente)) {
  //         const docente = docentes.find((d) => d.nome === _docente);
  //         if (!docente) {
  //           continue;
  //         }
  //         let prioridade = docente.formularios.get(atribuicao.id_disciplina);

  //         prioridadesAtribuicoesPorDocente.set(_docente, [
  //           prioridade ? prioridade : 0,
  //         ]);
  //       } else {
  //         const prioridades = prioridadesAtribuicoesPorDocente.get(_docente);
  //         const docente = docentes.find((d) => d.nome === _docente);
  //         if (!docente) {
  //           continue;
  //         }
  //         const prioridade = docente.formularios.get(atribuicao.id_disciplina);
  //         prioridades.push(prioridade ? prioridade : 0);

  //         prioridadesAtribuicoesPorDocente.set(_docente, prioridades);
  //       }
  //     }
  //   }

  //   /**
  //    * TODO: REFATORAR - como posso melhorar essa questão de utilizar a tabela ou não ?
  //    * Será que não devemos implicar que esse método usará a tabela ? Caso não queira todos os valores
  //    * assumem 1 ?
  //    */
  //   /**
  //    * Calcular a diferença entre todas as prioridades das atribuições de todos os docentes.
  //    * Comparando apenas internamente.
  //    */
  //   if (this.useMultiplierTable) {
  //     for (const prioridades of prioridadesAtribuicoesPorDocente.values()) {
  //       if (prioridades.length === 1) {
  //         continue; //não tem com oq comparar
  //       } else {
  //         for (let i = 0; i < prioridades.length; i++) {
  //           for (let j = i + 1; j < prioridades.length; j++) {
  //             let valor = Math.abs(prioridades[i] - prioridades[j]);
  //             custo += valor * this.tabelaMultiplicadores.get(valor);
  //           }
  //         }
  //       }
  //     }
  //   } else {
  //     for (const prioridades of prioridadesAtribuicoesPorDocente.values()) {
  //       if (prioridades.length === 1) {
  //         continue;
  //       }
  //       for (let i = 0; i < prioridades.length; i++) {
  //         for (let j = i + 1; j < prioridades.length; j++) {
  //           custo += Math.abs(prioridades[i] - prioridades[j]);
  //         }
  //       }
  //     }
  //   }

  //   return custo * this.multiplier;
  // }

  calculate(
    atribuicoes: Atribuicao[],
    formularios: Formulario[],
    docentes?: Docente[]
  ): number {
    let custo = 0;
    const prioridadesAtribuicoesPorDocente = new Map<string, number[]>(); // Docente, Prioridades

    for (const atribuicao of atribuicoes) {
      for (const _docente of atribuicao.docentes) {
        if (!prioridadesAtribuicoesPorDocente.has(_docente)) {
          const docente = docentes.find((d) => d.nome === _docente);
          if (!docente) {
            continue;
          }
          const prioridade = docente.formularios.get(atribuicao.id_disciplina);

          prioridadesAtribuicoesPorDocente.set(_docente, [
            prioridade ? prioridade : 0,
          ]);
        } else {
          const prioridades = prioridadesAtribuicoesPorDocente.get(_docente);
          const docente = docentes.find((d) => d.nome === _docente);
          if (!docente) {
            continue;
          }
          const prioridade = docente.formularios.get(atribuicao.id_disciplina);
          prioridades.push(prioridade ? prioridade : 0);

          prioridadesAtribuicoesPorDocente.set(_docente, prioridades);
        }
      }
    }

    /**
     * Compara a menor com a maior
     */
    for (const docente of docentes) {
      if (prioridadesAtribuicoesPorDocente.get(docente.nome)) {
        const menor = Math.min(
          ...Array.from(prioridadesAtribuicoesPorDocente.get(docente.nome))
        );
        const maior = Math.max(
          ...Array.from(prioridadesAtribuicoesPorDocente.get(docente.nome))
        );

        custo += (maior - menor) * this.multiplier;
      }
    }

    return custo;
  }
}
