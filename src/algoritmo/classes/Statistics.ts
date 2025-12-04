import Constraint from "../abstractions/Constraint";
import {
  Atribuicao,
  Context,
  Estatisticas,
} from "../communs/interfaces/interfaces";

/**
 * Classe base para coletar e processar estatísticas de execução de algoritmos.
 * Implementa a interface 'Estatisticas' e fornece métodos para popular
 * os dados, tanto iterativos quanto finais.
 */
export class Statistics implements Estatisticas {
  public tempoExecucao: number;
  public iteracoes: number;
  public interrupcao: boolean;
  public avaliacaoPorIteracao: Map<number, number>;
  public tempoPorIteracao: Map<number, number>;
  public docentesPrioridade: Map<number, number>;
  public qtdOcorrenciasRestricoes: Map<
    string,
    { label: string; qtd: number }[]
  >;

  constructor() {
    this.tempoExecucao = 0;
    this.iteracoes = 0;
    this.interrupcao = false;
    this.avaliacaoPorIteracao = new Map<number, number>();
    this.tempoPorIteracao = new Map<number, number>();
    this.docentesPrioridade = new Map<number, number>();
    this.qtdOcorrenciasRestricoes = new Map<
      string,
      { label: string; qtd: number }[]
    >();
  }

  /**
   * Registra os dados de uma única iteração.
   * Usado por algoritmos heurísticos.
   * @param iteracao O número da iteração.
   * @param avaliacao O valor da avaliação nesta iteração.
   * @param tempoMs O tempo gasto nesta iteração (em milissegundos).
   */
  public addIteracaoData(
    iteracao: number,
    avaliacao: number,
    tempoMs: number
  ): void {
    this.avaliacaoPorIteracao.set(iteracao, avaliacao);
    this.tempoPorIteracao.set(iteracao, tempoMs);
    this.iteracoes = iteracao; // Atualiza o contador total
  }

  /**
   * Popula as estatísticas finais (histogramas) com base na solução final.
   * Este método é chamado no final da execução de QUALQUER algoritmo (Heurístico ou Exato).
   *
   * @param atribuicoes As atribuições da solução final.
   * @param context O contexto do algoritmo (docentes, turmas, etc.).
   * @param constraints As restrições do algoritmo.
   */
  public generateFinalStatistics(
    atribuicoes: Atribuicao[],
    context: Context,
    constraints: {
      hard: Map<string, Constraint<any>>;
      soft: Map<string, Constraint<any>>;
    }
  ): void {
    // --- Gerar estatísticas de prioridade ---
    // (Lógica movida de TabuSearch.generateStatistics)

    // Garante que o '0' (sem formulário) exista
    // this.docentesPrioridade.set(0, 0);

    if (context.maiorPrioridade) {
      for (let i = 0; i <= context.maiorPrioridade; i++) {
        this.docentesPrioridade.set(i, 0);
      }
    }

    for (const atribuicao of atribuicoes) {
      for (const _docente of atribuicao.docentes) {
        const docente = context.docentes.find((doc) => doc.nome === _docente);

        if (docente) {
          if (docente.formularios.has(atribuicao.id_disciplina)) {
            const prioridade = docente.formularios.get(
              atribuicao.id_disciplina
            );

            // Garante que a prioridade exista no Map (caso maiorPrioridade esteja dessincronizado)
            if (!this.docentesPrioridade.has(prioridade)) {
              this.docentesPrioridade.set(prioridade, 0);
            }

            const qtd = this.docentesPrioridade.get(prioridade);
            this.docentesPrioridade.set(prioridade, qtd + 1);
          } else {
            // Caso sem formulário (prioridade 0)
            const qtd = this.docentesPrioridade.get(0);
            this.docentesPrioridade.set(0, qtd + 1);
          }
        }
      }
    }

    // --- 2. Gerar ocorrências de restrições ---
    // (Lógica movida de TabuSearch.generateStatistics)

    // Limpa ocorrências antigas para garantir dados frescos
    this.qtdOcorrenciasRestricoes.clear();

    const allConstraints = [
      ...constraints.hard.values(),
      ...constraints.soft.values(),
    ];

    for (const constraint of allConstraints) {
      if (constraint.isActive && constraint.occurrences) {
        this.qtdOcorrenciasRestricoes.set(
          constraint.name,
          constraint.occurrences(
            atribuicoes,
            context.docentes,
            context.turmas,
            context.travas
          )
        );
      }
    }
  }
}
