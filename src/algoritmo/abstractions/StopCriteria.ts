import { Vizinho } from "../communs/interfaces/interfaces";

export abstract class StopCriteria {
  /**
   * Propriedades
   */
  /**
   * Nome dado ao critéio
   */
  readonly name: string;

  /**
   * Detalhes sobre o critério de parada
   */
  description: string | undefined;

  constructor(name: string, description: string | undefined) {
    this.name = name;
    this.description = description;
  }

  /**
   * @description Método responsável por indicar se o processo da busca tabu deve ser encerrado.
   * Esse método poderá apresentar parâmetros os quais não serão utilizados, contudo, devem
   * ser informados por conta das implementações que possam vir a existir.
   * @returns {boolean} Retorna `True` caso a condição seja atendida e o método deverá encerrado.
   * `False` caso contrário.
   */
  abstract stop(
    iteracoes?: number,
    melhorVizinho?: Vizinho,
    vizinhoGerado?: Vizinho
  ): boolean;
}
