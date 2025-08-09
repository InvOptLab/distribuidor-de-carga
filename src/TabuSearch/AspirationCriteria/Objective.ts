import { AspirationCriteria } from "../Classes/Abstract/AspirationCriteria";
import { Vizinho } from "../Interfaces/utils";

/**
 * Classe responsável pelo critério de aspiração que valida se o vizinho apresenta uma avaliação maior
 * que o melhor vizinho global, validando também o seu status tabu.
 * Dessa forma, o método `fulfills` retornará **verdadeiro** apenas se o vizinho for tabu e apresentar
 * a avaliação maior que a do melhor vizinho global.
 */
export class Objective extends AspirationCriteria {
  constructor(name: string, description: string) {
    super(name, description);
  }

  fulfills(vizinho: Vizinho, melhorVizinho: Vizinho): boolean {
    return vizinho.isTabu && vizinho.avaliacao > melhorVizinho.avaliacao;
  }
}
