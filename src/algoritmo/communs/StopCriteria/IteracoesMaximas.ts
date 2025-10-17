import { StopCriteria } from "../../abstractions/StopCriteria";

export class IteracoesMaximas extends StopCriteria {
  /**
   * Propriedade privada da classe que representa o limite de iterações que o
   * processo poderá continuar sendo executado.
   */
  public maxIteracoes: number;

  constructor(
    name: string,
    description: string | undefined,
    maxIteracoes: number
  ) {
    super(name, description);
    this.maxIteracoes = maxIteracoes;
  }

  /**
   * @description Será verificada se a quantidade de iterações atingiu um máximo definido nos
   * parâmetros.
   *
   * @param iteracoes {number} Iteração atual do algoritmo.
   * @returns {boolean} `True` se o processo deverá ser encerrado. `False` caso contrário.
   */

  stop(iteracoes: number): boolean {
    return iteracoes === this.maxIteracoes;
  }
}
