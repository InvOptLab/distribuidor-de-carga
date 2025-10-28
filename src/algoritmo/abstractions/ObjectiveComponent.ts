import {
  Atribuicao,
  Docente,
  Formulario,
} from "../communs/interfaces/interfaces";
import { modelSCP } from "../metodos/MILP/MILP";
import { OptimizationModel, Term } from "../metodos/MILP/optimization_model";

export abstract class ObjectiveComponent {
  /**
   * Nome dado a componente da função objetivo
   */
  readonly name: string;

  /**
   * Detalhes sobre o componente da função objetivo.
   */
  description: string;

  isActive: boolean;

  /**
   * Multiplicador que será aplicado ao custo (resultado final).
   */
  multiplier: number;

  /**
   * Tipo do componente. Esse valor será utilizado posteriormente para sabermos se iremos
   * somar o valor ao acumulado da função objetivo ou subtrairemos.
   */
  type: "min" | "max";

  constructor(
    name: string,
    isActive: boolean,
    type: "min" | "max",
    description: string | undefined,
    multiplier: number | undefined
  ) {
    this.name = name;
    this.isActive = isActive;
    this.description = description
      ? description
      : "Nenhuma descrição informada";
    this.multiplier = multiplier ? multiplier : 1;
    this.type = type;
  }

  /**
   * Função que calculará o custo do componente da função objetivo.
   * Caso não implementado, o método apresenta uma implementação padrão, entretanto, ele não se adequa a implementação default
   * esperada.
   *
   * @param atribuicoes Conjunto que representa os docentes atribuídos as turmas.
   * @param formularios Conjunto contendo as prioridades que os docentes atribuíram as turmas.
   */
  calculate(
    atribuicoes: Atribuicao[],
    formularios: Formulario[],
    docentes?: Docente[]
  ): number {
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
            this.multiplier * docente.formularios.get(atribuicao.id_disciplina);
        }
      }
    }
    return custo;
  }

  /**
   * (NOVO) Método para formulação do componente na função objetivo do MILP.
   * Retorna os termos que devem ser somados/subtraídos.
   */
  milpFormulation?(model: OptimizationModel, modelData: modelSCP): Term[];
}
