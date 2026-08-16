import { Vizinho } from "../../../communs/interfaces/interfaces";
import { TabuList } from "../Classes/Abstract/TabuList";

/**
 * Gerencia a lista tabu de forma eficiente, armazenando apenas os HASHES (strings)
 * das soluções visitadas.
 * * O cálculo do hash NÃO é feito aqui. Esta classe assume que 'vizinho.hash'
 * já foi preenchido corretamente pelo ZobristHasher antes de chegar aqui.
 */
export class HashSolution extends TabuList<Set<string>> {
  public _name = "Hash";
  public tabuSize: number;
  private queue: (string | undefined)[]; // Fila circular para remoção FIFO
  private head: number; // Ponteiro da fila

  constructor(tabuSize: number | undefined) {
    super(new Set<string>());

    this.tabuSize = tabuSize || 10; // Valor default seguro
    this.queue = new Array(this.tabuSize);
    this.head = 0;
  }

  /**
   * Adiciona o hash do vizinho à lista.
   * Remove o mais antigo se a lista estiver cheia.
   */
  add(vizinho: Vizinho, iteracaoAtual: number): Set<string> {
    if (!vizinho.hash) {
      throw new Error(
        "Erro: Tentativa de adicionar vizinho sem hash na HashSolution.",
      );
    }

    // 1. Identifica o hash antigo que será sobrescrito (FIFO)
    const oldHash = this.queue[this.head];

    // 2. Remove o antigo do Set de busca rápida
    if (oldHash !== undefined) {
      this.itens.delete(oldHash);
    }

    // 3. Adiciona o novo hash na fila e no Set
    this.queue[this.head] = vizinho.hash;
    this.itens.add(vizinho.hash);

    // 4. Avança o ponteiro circular
    this.head = (this.head + 1) % this.tabuSize;

    return this.itens;
  }

  /**
   * Verifica se o hash do vizinho está na lista.
   * Complexidade: O(1)
   */
  has(vizinho: Vizinho, iteracaoAtual: number): boolean {
    if (!vizinho.hash) {
      // Se por algum motivo o hash não existir, não é Tabu (ou lançar erro)
      return false;
    }
    return this.itens.has(vizinho.hash);
  }

  /**
   * Remove um vizinho específico (usado quando ocorre aspiração)
   */
  remove(vizinho: Vizinho): Set<string> {
    if (vizinho.hash && this.itens.has(vizinho.hash)) {
      this.itens.delete(vizinho.hash);

      // Nota: Não removemos da Queue para não quebrar a ordem circular.
      // Apenas removemos do Set, o que já libera a solução para ser visitada.
      // O valor na Queue será sobrescrito naturalmente quando o ponteiro passar por lá.
    }
    return this.itens;
  }
}
