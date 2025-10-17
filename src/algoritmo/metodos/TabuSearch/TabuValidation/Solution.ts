import { Atribuicao, Vizinho } from "../../../communs/interfaces/interfaces";
import { atribuicoesIguais } from "../../../communs/utils";
import { TabuValidationFunction } from "../Classes/Abstract/TabuValidationFunction";

export class Solution extends TabuValidationFunction<
  [Atribuicao[][], Vizinho]
> {
  constructor(name: string, description: string | undefined) {
    super(name, description);
  }

  validate(tabuList: Atribuicao[][], vizinho: Vizinho): boolean {
    return tabuList.some((tabuSet) =>
      vizinho.atribuicoes.every((atribuicao) =>
        tabuSet.some((tabu) => atribuicoesIguais(tabu, atribuicao))
      )
    );
  }
}
