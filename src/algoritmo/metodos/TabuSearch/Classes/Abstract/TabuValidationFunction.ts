export abstract class TabuValidationFunction<T extends any[]> {
  /**
   * Nome dado a função.
   */
  readonly name: string;

  /**
   * Detalhes sobre o processo.
   */
  description: string | undefined;

  constructor(name: string, description: string | undefined) {
    this.name = name;
    this.description = description;
  }

  /**
   * Método responsável por validar se uma solução, atributo ou movimento está presente na lista tabu.
   * @returns {boolean} Verdadeiro caso a solução, atributo ou movimento esteja na lista tabu. Falso
   * caso contrário.
   */
  abstract validate(...args: T): boolean;
}
