import {
  OptimizationModel,
  Term,
} from "@/algoritmo/metodos/MILP/optimization_model";
import { ObjectiveComponent } from "../../abstractions/ObjectiveComponent";
import { Atribuicao, Docente, Formulario } from "../interfaces/interfaces";
import { modelSCP } from "@/algoritmo/metodos/MILP/MILP";

/**
 * Esse componente implementa a ideia de aplicar um multiplicador difirente para cada prioridade.
 * A propriedade `tabelaMultiplicadores` pode ser enviada para o construtor, ou, caso não seja informada,
 * seguirá os valores de 2^n, sendo n o valor da prioridade invertido.
 * P_max = max(P) + 1
 * p_ij = P_max - p_ij
 *
 * **Observação**
 * Aparentemente a abordagem de 2^n não está apresentando resultados muito interessantes, uma vez
 * que apresenta uma alta quantidade de docentes com mais de duas atribuições.
 * Talvez seja interessante implementar uma outra ideia do Elias, trazendo as primeiras atibuições com valores
 * exponenciais e as demais algum outro fator, a fim de observar o comportamento.
 */
export class PrioridadesPesosTabelados extends ObjectiveComponent {
  tabelaMultiplicadores: Map<number, number>;

  maiorPrioridade: number = undefined;

  constructor(
    name: string,
    isActive: boolean,
    type: "min" | "max",
    description: string | undefined,
    multiplier: number | undefined,
    maiorPrioridade: number | undefined,
    tabelaMultiplicadores: Map<number, number> | undefined
  ) {
    super(name, isActive, type, description, multiplier);

    this.maiorPrioridade = maiorPrioridade;
    /**
     * Caso a maior prioridade seja informada mas a tabela com os multiplicadores não,
     * será chamado o método para gerar os valores automaticamente.
     */
    if (this.maiorPrioridade && !tabelaMultiplicadores) {
      this.setTabelaMultiplicadores();
    } else {
      this.tabelaMultiplicadores = tabelaMultiplicadores;
    }
  }

  setTabelaMultiplicadores() {
    this.tabelaMultiplicadores = new Map<number, number>();

    for (let i = 0; i < this.maiorPrioridade; i++) {
      //2^n
      // n = P_max - p
      this.tabelaMultiplicadores.set(this.maiorPrioridade - i, Math.pow(2, i));
    }
    // Caso precise verificar uma atribuição sem prioridade definida.

    this.tabelaMultiplicadores.set(0, 0);
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

  calculate(
    atribuicoes: Atribuicao[],
    formularios: Formulario[],
    docentes?: Docente[]
  ): number {
    /**
     * Verifica se `this.maiorPrioridade` já foi calculada. Caso negativo deverá calculará.
     * Juntamenmte, será calculada a tabela com os multiplicadores por prioridade.
     */
    if (!this.maiorPrioridade) {
      this.setMaiorPrioridade(formularios);
      //this.setTabelaMultiplicadores();
    }

    if (!this.tabelaMultiplicadores || this.tabelaMultiplicadores.size === 0) {
      this.setTabelaMultiplicadores();
    }

    let custo = 0;
    for (const atribuicao of atribuicoes) {
      for (const docenteAtribuido of atribuicao.docentes) {
        const docente: Docente = docentes.find(
          (d) => d.nome === docenteAtribuido
        );

        /**
         * Caso não exista um docente atribuído a turma, o processo deve ir para a próxima iteração.
         * Penalização já aplicada anteriormente.
         */
        if (!docente) {
          continue;
        }

        if (docente.formularios.get(atribuicao.id_disciplina)) {
          const prioridade = docente.formularios.get(atribuicao.id_disciplina);
          custo +=
            this.multiplier *
            //prioridade *
            this.tabelaMultiplicadores.get(prioridade);
        }
      }
    }
    return custo;
  }

  milpFormulation(model: OptimizationModel, modelData: modelSCP): Term[] {
    console.log(this.tabelaMultiplicadores);

    const objectiveTerms: Term[] = [];
    modelData.D.forEach((i) =>
      modelData.T.forEach((j) => {
        objectiveTerms.push({
          variable: modelData.x[i][j],
          coefficient:
            this.multiplier * this.tabelaMultiplicadores.get(modelData.p[i][j]),
        });
      })
    );

    return objectiveTerms;
  }
}
