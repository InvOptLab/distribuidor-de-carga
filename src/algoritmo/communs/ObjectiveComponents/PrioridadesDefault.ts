import { modelSCP } from "@/algoritmo/metodos/MILP/MILP";
import {
  OptimizationModel,
  Term,
} from "@/algoritmo/metodos/MILP/optimization_model";
import { ObjectiveComponent } from "../../abstractions/ObjectiveComponent";
import { Atribuicao, Docente, Formulario } from "../interfaces/interfaces";

/**
 * Componente padrão utilizada. Maximizar as prioridades das atribuições.
 * Tendo em vista que as prioridades devem ser invertidas, já que 1 é a maior prioridade.
 * $P_max = max(P) + 1$
 * $p_ij = P_max - p_ij$
 */
export class PrioridadesDefault extends ObjectiveComponent {
  /**
   * Representa a maior prioridade encontrada no conjunto dos formulários.
   * Utilizada para "inverter" os valores das prioridades.
   */
  maiorPrioridade: number = undefined;
  constructor(
    name: string,
    isActive: boolean,
    type: "min" | "max",
    description: string | undefined,
    multiplier: number | undefined,
    maiorPrioridade: number | undefined
  ) {
    super(name, isActive, type, description, multiplier);

    this.maiorPrioridade = maiorPrioridade;
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
    docentes: Docente[]
  ): number {
    /**
     * Verifica se `this.maiorPrioridade` já foi calculada. Caso negativo deverá calculalá.
     */
    if (!this.maiorPrioridade) {
      this.setMaiorPrioridade(formularios);
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
          custo +=
            this.multiplier *
            (this.maiorPrioridade -
              docente.formularios.get(atribuicao.id_disciplina));
        }
      }
    }
    return custo;
  }

  /**
   * Essa formulação **DEVE** ser revisitada e analisada a questão de ter um valor de prioridade para a prioridade 0
   * (por exemplo o valor 1)
   * @param model
   * @param modelData
   * @returns
   */
  milpFormulation(model: OptimizationModel, modelData: modelSCP): Term[] {
    const objectiveTerms: Term[] = [];
    modelData.D.forEach((i) =>
      modelData.T.forEach((j) => {
        objectiveTerms.push({
          variable: modelData.x[i][j],
          coefficient:
            this.multiplier *
            (modelData.p[i][j] > 0 ? modelData.Pmax - modelData.p[i][j] : 0),
        });
      })
    );

    return objectiveTerms;
  }
}
