import { Atribuicao, Docente, Formulario } from "@/context/Global/utils";
import { ObjectiveComponent } from "../Classes/Abstract/ObjectiveComponent";

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
}
