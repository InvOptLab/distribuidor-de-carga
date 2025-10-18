import { StopCriteria } from "../../abstractions/StopCriteria";
import { Vizinho } from "../interfaces/interfaces";
import { compararVizihos } from "../utils";

export class IteracoesSemModificacao extends StopCriteria {
  public iteacoesSemModificacao: number = 0;

  public limiteIteracoesSemModificacao: number;

  private prevMelhorVizinho: Vizinho = undefined;

  constructor(
    name: string,
    descripion: string,
    limiteIteracoesSemModificacao: number
  ) {
    super(name, descripion);
    this.limiteIteracoesSemModificacao = limiteIteracoesSemModificacao;
  }

  stop(iteracoes?: number, melhorVizinho?: Vizinho): boolean {
    /**
     * Verifica a primeira iteração. A primeira é identificada com `this.prevMelhorVizinho`
     * sendo `undefined`. Sendo assim, `this.prevMelhorVizinho` recebe o melhor vizinho encontrado.
     */
    if (!this.prevMelhorVizinho) {
      this.prevMelhorVizinho = melhorVizinho;
      this.iteacoesSemModificacao = 0;

      return false;
    }

    /**
     * Para verificar se um novo melhor vizinho foi encontrado, utiliza-se a função `compararVizihos`,
     * comparando o `melhorVizinho` enviado pela classe `TabuSearch` com o melhor vizinho armazenado
     * nesta classe `this.prevMelhorVizinho`.
     * Caso sejam iguais, o contador deve ser incrementado. Caso contrário, o `this.prevMelhorVizinho`
     * deve ser atualizado e o contador resetado.
     */
    if (compararVizihos(this.prevMelhorVizinho, melhorVizinho)) {
      this.iteacoesSemModificacao += 1;
    } else {
      this.prevMelhorVizinho = melhorVizinho;
      this.iteacoesSemModificacao = 0;
      // return false
    }

    return this.iteacoesSemModificacao === this.limiteIteracoesSemModificacao;
  }
}
