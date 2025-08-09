import { TabuList } from "../Classes/Abstract/TabuList";
import { Vizinho } from "../Interfaces/utils";
import { atribuicoesIguais } from "../TabuValidation/utils";
import { compararVizihos } from "../utils";

export class Solution extends TabuList<Vizinho[]> {
  public tabuSize: number;

  constructor(tabuSize: number | undefined) {
    super([]);

    this.tabuSize = tabuSize;
  }

  add(vizinho: Vizinho): Vizinho[] {
    if (this.itens.length === this.tabuSize) {
      this.remove(this.itens[0]);
    }

    if (this.itens.length < this.tabuSize) {
      this.itens.push(vizinho);
    }
    return this.itens;
  }

  has(vizinho: Vizinho): boolean {
    return this.itens.some((tabuSet) =>
      vizinho.atribuicoes.every((atribuicao) =>
        tabuSet.atribuicoes.some((tabu) => atribuicoesIguais(tabu, atribuicao))
      )
    );
  }

  indexOf(vizinho: Vizinho): number {
    return this.itens.map((value, key) => {
      if (compararVizihos(value, vizinho)) {
        return key;
      }
    })[0];
  }

  remove(vizinho: Vizinho): Vizinho[] {
    const index = this.indexOf(vizinho);

    this.itens.splice(index);

    return this.itens;
  }
}
