import { Vizinho } from "../../../communs/interfaces/interfaces";
import { TabuList } from "../Classes/Abstract/TabuList";

export type TenureSizes = {
  add: number;
  drop: number;
};

export class Moviment extends TabuList<{
  addList: Map<string, number>;
  dropList: Map<string, number>;
}> {
  public tenures: TenureSizes;

  /**
   * A lista **Add** define quando um movimento **previamente removido**
   * poderá ser novamente permitido.
   *
   * key: turmaId,docente
   * value: iteração que o movimento ficará disponível
   */
  //public addList: Map<string, number>;

  /**
   * A lista **Drop** armazena os **movimentos adicionados**,
   * determinando quando poderão ser revertidos.
   *
   * key: turmaId,docente
   * value: iteração que o movimento ficará disponível
   */
  //public dropList: Map<string, number>;

  constructor(addTenure: number, dropTenure: number) {
    super({
      addList: new Map<string, number>(),
      dropList: new Map<string, number>(),
    });
    this.tenures = { add: addTenure, drop: dropTenure };

    // this.addList = new Map<string, number>();
    // this.dropList = new Map<string, number>();
  }

  add(
    vizinho: Vizinho,
    iteracaoAtual: number
  ): {
    addList: Map<string, number>;
    dropList: Map<string, number>;
  } {
    /** Lembrar que o Add do ENUM é para ser inserido na ``dropList`` */
    for (const movimento of vizinho.movimentos.add) {
      const key = `${movimento.turmaId},${movimento.docente}`;
      this.itens.dropList.set(key, iteracaoAtual + this.tenures.drop);
    }

    for (const movimento of vizinho.movimentos.drop) {
      const key = `${movimento.turmaId},${movimento.docente}`;
      this.itens.addList.set(key, iteracaoAtual + this.tenures.add);
    }

    return { addList: this.itens.addList, dropList: this.itens.dropList };
  }

  /**
   * O Drop deve impedir que outro movimento seja realizado naquela mesma turma
   */
  has(vizinho: Vizinho, iteracaoAtual: number): boolean {
    for (const movimento of vizinho.movimentos.add) {
      const key = `${movimento.turmaId},${movimento.docente}`;

      if (
        /*this.itens.dropList.has(key) &&*/
        this.itens.dropList.get(key) >= iteracaoAtual
      ) {
        return true;
      }
    }

    for (const movimento of vizinho.movimentos.drop) {
      const key = `${movimento.turmaId},${movimento.docente}`;
      if (
        /*this.itens.addList.has(key) &&*/
        this.itens.addList.get(key) >= iteracaoAtual
      ) {
        return true;
      }
    }
    return false;
  }

  remove(): { addList: Map<string, number>; dropList: Map<string, number> } {
    return { addList: this.itens.addList, dropList: this.itens.dropList };
  }
}
