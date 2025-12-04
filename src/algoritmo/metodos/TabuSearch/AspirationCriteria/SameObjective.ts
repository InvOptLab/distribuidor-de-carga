import { Vizinho } from "../../../communs/interfaces/interfaces";
import { compararVizihos } from "../../../communs/utils";
import { AspirationCriteria } from "../Classes/Abstract/AspirationCriteria";

/**
 * Essa classe tem como objetivo implementar o critério de aspiração chamado de
 * "Critério de Aceitação de Mesmas Avaliações" na dissertação.
 *
 * Esse critério tem como objetivo aceitar soluções com o valor objetivo (avaliação) maior ou igual
 * ao melhor global após uma determinada quantidade de iterações sem modificação do
 * melhor vizinho. O objetivo é tormar soluções "parecidas" (com mesma avaliação porém
 * com diferentes atribuições) melhores globais, incentivando a busca por melhores vizinhanças.
 */
export default class SameObjective extends AspirationCriteria {
  public iteracoesParaAceitacao: number;

  public qtdIteracoesSemModificacao: number = 0;

  public prevMelhorVizinho: Vizinho | undefined = undefined;

  public iteracao: number = 0;

  constructor(
    name: string,
    description: string,
    iteracoesParaAceitacao: number
  ) {
    super(name, description);
    this.iteracoesParaAceitacao = iteracoesParaAceitacao;
    this.qtdIteracoesSemModificacao = 0;
    this.iteracao = 0;
  }

  fulfills(
    vizinho: Vizinho,
    melhorVizinho: Vizinho,
    iteracao: number
  ): boolean {
    /**
     * Verifica a primeira iteração. A primeira é identificada com `this.prevMelhorVizinho`
     * sendo `undefined`. Sendo assim, `this.prevMelhorVizinho` recebe o melhor vizinho enviado.
     */
    if (!this.prevMelhorVizinho) {
      this.prevMelhorVizinho = melhorVizinho;
      this.iteracao = iteracao;
      this.qtdIteracoesSemModificacao = 0;
    }

    if (!compararVizihos(this.prevMelhorVizinho, melhorVizinho)) {
      /**
       * Esse if valida se o melhor vizinho global sofreu alterações, dessa forma, o `this.prevMelhorVizinho`
       * deverá ser atualizado e o contador zerado.
       */
      this.prevMelhorVizinho = melhorVizinho;
      this.qtdIteracoesSemModificacao = 0;
    } else {
      /**
       * Caso contrário, isso indica que o melhor vizinho ainda é o mesmo,
       * indicando que o contador deve ser incrementado.
       */

      if (this.iteracao != iteracao && !vizinho.isTabu) {
        this.qtdIteracoesSemModificacao += 1;
        this.iteracao = iteracao;
      }
    }

    /**
     * Para ser possível aplicar a aspiração, o contador deve ter atingido o seu limite mínimo, o vizinho deve possuir
     * sua avaliação sendo maior ou igual a do melhor vizinho e as duas vizinhanças devem ser diferentes.
     */
    return this.qtdIteracoesSemModificacao >= this.iteracoesParaAceitacao;
  }
}
