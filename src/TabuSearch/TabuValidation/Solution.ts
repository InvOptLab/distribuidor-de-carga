import { Atribuicao } from "@/context/Global/utils";
import { TabuValidationFunction } from "../Classes/Abstract/TabuValidationFunction";
import { Vizinho } from "../Interfaces/utils";
import { atribuicoesIguais } from "./utils";

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
