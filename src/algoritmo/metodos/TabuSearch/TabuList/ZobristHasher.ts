import {
  Atribuicao,
  Vizinho,
} from "../../../communs/interfaces/interfaces";

export class ZobristHasher {
  /**
   * Tabela Hash Transposition:
   * Chave: string ("idDisciplina:nomeDocente")
   * Valor: bigint (Inteiro aleatório de 64 bits)
   */
  private table: Map<string, bigint> = new Map();

  /**
   * Armazena o hash da solução "pai" (Incumbente ou BestSolution atual).
   * Serve de base para calcular os vizinhos apenas com XOR.
   */
  private currentBaseHash: bigint = BigInt(0);

  constructor() {
    this.currentBaseHash = BigInt(0);
  }

  /**
   * Recupera ou gera (Lazy Loading) um valor aleatório único para o par (Turma, Docente).
   */
  private getRandomValue(turmaId: string, docenteNome: string): bigint {
    const key = `${turmaId}:${docenteNome}`;

    if (!this.table.has(key)) {
      // Gera um número aleatório seguro de 64 bits
      const randomVal = BigInt(
        Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      );
      // Dica: Se quiser entropia total de 64 bits, pode-se usar 2 Math.random combinados,
      // mas MAX_SAFE_INTEGER (53 bits) já é suficiente para evitar colisões nesse contexto.
      this.table.set(key, randomVal);
    }

    return this.table.get(key)!;
  }

  /**
   * Calcula o Hash "do zero" (Full Scan).
   * Complexidade: O(N) onde N é o número total de alocações.
   * Deve ser usado apenas na inicialização ou quando a base muda drasticamente.
   */
  public computeFullHash(atribuicoes: Atribuicao[]): string {
    let hash = BigInt(0);

    for (const atrib of atribuicoes) {
      // atrib.id_disciplina corresponde a Movimento.turmaId
      for (const docente of atrib.docentes) {
        hash ^= this.getRandomValue(atrib.id_disciplina, docente);
      }
    }

    this.currentBaseHash = hash;
    return hash.toString(16); // Retorna Hexadecimal
  }

  /**
   * Calcula o Hash de um Vizinho usando a propriedade do XOR (Incremental).
   * Complexidade: O(k) onde k é o número de movimentos (geralmente 2 ou 4).
   * * @param vizinho O vizinho a ser calculado
   * @param baseHashStr O hash da solução original de onde o vizinho foi gerado (opcional, usa o interno se omitido)
   */
  public computeNeighborHash(vizinho: Vizinho, baseHashStr?: string): string {
    // Se, por algum motivo, não houver movimentos registrados, fazemos o fallback para cálculo completo
    if (
      !vizinho.movimentos ||
      (vizinho.movimentos.add.length === 0 &&
        vizinho.movimentos.drop.length === 0)
    ) {
      return this.computeFullHash(vizinho.atribuicoes);
    }

    // Pega o hash base (convertendo de Hex string para BigInt)
    let hash = baseHashStr ? BigInt("0x" + baseHashStr) : this.currentBaseHash;

    /**
     * Aplica DROPS (Remoções):
     * A propriedade do XOR diz que A ^ B ^ B = A.
     * Portanto, fazer XOR com o valor de um par que já existe remove ele do hash.
     */
    for (const move of vizinho.movimentos.drop) {
      hash ^= this.getRandomValue(move.turmaId, move.docente);
    }

    /**
     * Aplica ADDS (Adições):
     * Fazer XOR com um valor que não existe adiciona ele ao hash.
     */
    for (const move of vizinho.movimentos.add) {
      hash ^= this.getRandomValue(move.turmaId, move.docente);
    }

    return hash.toString(16);
  }

  /**
   * Atualiza o hash base interno.
   * Deve ser chamado sempre que a busca Tabu aceitar uma nova solução como o novo centro de vizinhança.
   */
  public updateBaseHash(newHashHex: string) {
    this.currentBaseHash = BigInt("0x" + newHashHex);
  }
}
