import { Vizinho } from "../../../../communs/interfaces/interfaces";

export abstract class AspirationCriteria {
  /**
   * Propriedades
   */
  /**
   * Nome dado ao critéio de aspiração.
   */
  readonly name: string;

  /**
   * Detalhes sobre o critério de aspiração.
   */
  description: string | undefined;

  constructor(name: string, description: string | undefined) {
    this.name = name;
    this.description = description;
  }

  abstract fulfills(
    vizinho: Vizinho,
    melhorVizinho: Vizinho,
    iteracao?: number
  ): boolean;
}
