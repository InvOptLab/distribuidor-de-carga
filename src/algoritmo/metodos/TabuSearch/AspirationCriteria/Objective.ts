import { Vizinho } from "../../../communs/interfaces/interfaces";
import { AspirationCriteria } from "../Classes/Abstract/AspirationCriteria";

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
    /** Nunca acontecerá o caso de chegar aqui e não existir uma avaliação para o vizinho,
     * entretanto, para retirar o "erro" do lint, esse if foi adicionado.
     */
    if (vizinho.avaliacao && melhorVizinho.avaliacao) {
      return vizinho.isTabu && vizinho.avaliacao > melhorVizinho.avaliacao;
    }

    return false;
  }
}
