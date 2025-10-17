import { StopCriteria } from "../../abstractions/StopCriteria";
import { Vizinho } from "../interfaces/interfaces";
import { compararVizihos } from "../utils";

export default class IteracoesSemMelhoraAvaliacao extends StopCriteria {
  public iteacoesSemModificacao: number;

  public limiteIteracoesSemMelhoraAvaliacao: number;

  private prevMelhorVizinho: Vizinho = undefined;

  constructor(
    name: string,
    descripion: string,
    limiteIteracoesSemModificacao: number
  ) {
    super(name, descripion);
    this.limiteIteracoesSemMelhoraAvaliacao = limiteIteracoesSemModificacao;
    this.iteacoesSemModificacao = 0;
  }

  stop(iteracoes?: number, melhorVizinho?: Vizinho): boolean {
    /**
     * Verifica a primeira iteração. A primeira é identificada com `this.prevMelhorVizinho`
     * sendo `undefined`. Sendo assim, `this.prevMelhorVizinho` recebe o melhor vizinho encontrado.
     */
    if (!this.prevMelhorVizinho) {
      this.prevMelhorVizinho = melhorVizinho;
      this.iteacoesSemModificacao = 0;
    }

    /**
     * Caso o melhor vizinho global seja alterado por algum critério que permita a modificação com avaliações
     * iguais. O contador deve ser reinicializado para poder ter chances de encontrar uma nova melhor solução.
     */
    if (!compararVizihos(this.prevMelhorVizinho, melhorVizinho)) {
      if (this.prevMelhorVizinho.avaliacao !== melhorVizinho.avaliacao) {
        this.prevMelhorVizinho = melhorVizinho;
        this.iteacoesSemModificacao = 0;
      } else {
        // Se forem iguais, devemos apenas atualizar a prevMelhorVizinho, uma vez que a avaliação não mudou.
        this.prevMelhorVizinho = melhorVizinho;
      }
    }

    if (this.prevMelhorVizinho.avaliacao >= melhorVizinho.avaliacao) {
      /**
       * Se é verificado apenas a igualdade entre as avaliações da melhor solução informada a classe e o vizinho
       * enviado para comparação. Dessa forma, se o `prevMelhorVizinho` apresentar sua avaliação sendo maior ou igual
       * ao `melhorVizinho`, o contador deve ser incrementado.
       */
      this.iteacoesSemModificacao += 1;
    } else {
      this.prevMelhorVizinho = melhorVizinho;
      this.iteacoesSemModificacao = 0;

      // return false
    }

    return (
      this.iteacoesSemModificacao === this.limiteIteracoesSemMelhoraAvaliacao
    );
  }
}
