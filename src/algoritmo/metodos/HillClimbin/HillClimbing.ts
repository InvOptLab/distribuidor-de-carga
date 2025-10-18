import Algorithm from "../../abstractions/Algorithm";
import Constraint from "../../abstractions/Constraint";
import { NeighborhoodFunction } from "../../abstractions/NeighborhoodFunction";
import { ObjectiveComponent } from "../../abstractions/ObjectiveComponent";
import { StopCriteria } from "../../abstractions/StopCriteria";
import {
  Atribuicao,
  Vizinho,
  Docente,
  Disciplina,
  Celula,
  Formulario,
  Solucao,
} from "../../communs/interfaces/interfaces";

/**
 * Implementação do algoritmo Hill Climbing.
 * Este algoritmo é uma busca local que explora a vizinhança de uma solução
 * e move-se para o melhor vizinho, desde que represente uma melhoria.
 * O processo se repete até que nenhum vizinho melhor possa ser encontrado (ótimo local).
 */
export class HillClimbing extends Algorithm {
  public currentSolution: Vizinho;

  constructor(
    atribuicoes: Atribuicao[],
    docentes: Docente[],
    turmas: Disciplina[],
    travas: Celula[],
    prioridades: Formulario[],
    constraints: Constraint<any>[],
    solution: Solucao | undefined,
    neighborhoodFunctions: NeighborhoodFunction[],
    stopFunctions: StopCriteria[],
    objectiveType: "min" | "max",
    objectiveComponentes: ObjectiveComponent[],
    maiorPrioridade: number | undefined
  ) {
    super(
      "Hill Climbing",
      atribuicoes,
      docentes,
      turmas,
      travas,
      prioridades,
      constraints,
      solution,
      neighborhoodFunctions,
      stopFunctions,
      objectiveType,
      objectiveComponentes,
      maiorPrioridade,
      true // enableStatistics
    );

    // Inicializa a solução atual com base na entrada
    if (solution) {
      this.currentSolution = {
        atribuicoes: solution.atribuicoes,
        isTabu: false, // Não aplicável ao Hill Climbing
        movimentos: { add: [], drop: [] },
        avaliacao: solution.avaliacao,
      };
    } else {
      this.currentSolution = {
        atribuicoes: atribuicoes,
        isTabu: false,
        movimentos: { add: [], drop: [] },
        avaliacao: undefined,
      };
    }
  }

  /**
   * Gera a vizinhança para a solução atual executando todas as funções de vizinhança registradas.
   * @returns Uma promessa que resolve para um array de soluções vizinhas (Vizinho[]).
   */
  private async generateNeighborhood(): Promise<Vizinho[]> {
    const vizinhanca: Vizinho[] = [];
    for (const _process of this.neighborhoodPipe.values()) {
      const vizinhancaProcess = await _process.generate(
        this.context,
        this.constraints.hard,
        this.currentSolution
      );
      if (vizinhancaProcess.length > 0) {
        vizinhanca.push(...vizinhancaProcess);
      }
    }
    return vizinhanca;
  }

  /**
   * Avalia a qualidade de cada vizinho em uma vizinhança.
   * A avaliação é baseada nas restrições flexíveis (soft constraints) e na função objetivo.
   * @param vizinhanca - O array de vizinhos a serem avaliados.
   * @returns Uma promessa que resolve para o array de vizinhos avaliados.
   */
  private async evaluateNeighbors(vizinhanca: Vizinho[]): Promise<Vizinho[]> {
    for (const vizinho of vizinhanca) {
      let avaliacao = 0;

      // Aplica as penalidades das restrições flexíveis ativas
      for (const constraint of this.constraints.soft.values()) {
        if (constraint.isActive) {
          avaliacao += constraint.soft(
            vizinho.atribuicoes,
            this.context.docentes,
            this.context.turmas
          );
        }
      }

      // Calcula o custo/valor da função objetivo principal
      avaliacao += this.objectiveFunction.calculate(
        vizinho.atribuicoes,
        this.context.prioridades,
        this.context.docentes
      );

      vizinho.avaliacao = avaliacao;
    }
    return vizinhanca;
  }

  /**
   * Encontra o melhor vizinho de uma lista de vizinhos avaliados.
   * A definição de "melhor" depende do tipo da função objetivo ('max' ou 'min').
   * @param vizinhanca - O array de vizinhos avaliados.
   * @returns O melhor vizinho encontrado.
   */
  private findBestNeighbor(vizinhanca: Vizinho[]): Vizinho {
    if (vizinhanca.length === 0) {
      return this.currentSolution;
    }

    // Reduz a lista ao melhor vizinho com base no tipo de otimização
    return vizinhanca.reduce((melhor, atual) => {
      if (this.objectiveFunction.type === "max") {
        return atual.avaliacao > melhor.avaliacao ? atual : melhor;
      } else {
        return atual.avaliacao < melhor.avaliacao ? atual : melhor;
      }
    });
  }

  /**
   * Verifica se os critérios de parada do algoritmo foram atendidos.
   * @param iteracoes - A contagem de iterações atual.
   * @param melhorVizinhoGerado - O melhor vizinho gerado na iteração atual.
   * @param noImprovement - Flag que indica se houve melhoria na última iteração.
   * @param interrompe - Função opcional para interromper a execução externamente.
   * @returns Verdadeiro se o algoritmo deve parar, falso caso contrário.
   */
  private stop(
    iteracoes: number,
    melhorVizinhoGerado: Vizinho,
    noImprovement: boolean,
    interrompe?: () => boolean
  ): boolean {
    if (interrompe && interrompe()) {
      return true;
    }

    // Verifica os critérios de parada definidos no pipe
    for (const process of this.stopPipe.values()) {
      if (process.stop(iteracoes, this.currentSolution, melhorVizinhoGerado)) {
        return true;
      }
    }

    // Critério de parada principal do Hill Climbing: ótimo local
    if (noImprovement) {
      return true;
    }

    return false;
  }

  /**
   * Executa o loop principal do algoritmo Hill Climbing.
   * @param interrompe - Função opcional para interromper a execução externamente.
   * @returns Uma promessa que resolve para a melhor solução encontrada (ótimo local).
   */
  async execute(interrompe?: () => boolean): Promise<Vizinho> {
    /**
     * Recalcula o valor de avaliação da solução enviada ao construtor.
     */

    this.currentSolution.avaliacao = (
      await this.evaluateNeighbors([this.currentSolution])
    )[0].avaliacao;
    /**
     * Começo Hill Climbing
     */
    let iteracoes = 0;
    let noImprovement = false;
    const tempoInicialTotal = performance.now();

    // Avalia a solução inicial caso ainda não tenha uma avaliação
    if (this.currentSolution.avaliacao === undefined) {
      const [evaluatedSolution] = await this.evaluateNeighbors([
        this.currentSolution,
      ]);
      this.currentSolution = evaluatedSolution;
    }

    // Loop principal do algoritmo
    while (
      !this.stop(iteracoes, this.currentSolution, noImprovement, interrompe)
    ) {
      console.log("Iteração: " + iteracoes);
      const tempoInicialIteracao = performance.now();

      const vizinhanca = await this.generateNeighborhood();
      const vizinhancaAvaliada = await this.evaluateNeighbors(vizinhanca);
      const melhorVizinho = this.findBestNeighbor(vizinhancaAvaliada);

      // Verifica se o melhor vizinho é melhor que a solução atual
      const isBetter =
        this.objectiveFunction.type === "max"
          ? melhorVizinho.avaliacao > this.currentSolution.avaliacao
          : melhorVizinho.avaliacao < this.currentSolution.avaliacao;

      if (isBetter) {
        this.currentSolution = melhorVizinho;
      } else {
        noImprovement = true; // Atingiu um ótimo local, prepara para parar
      }

      // Atualiza estatísticas
      const tempoFinalIteracao = performance.now();
      this.statistics.tempoPorIteracao.set(
        iteracoes,
        tempoFinalIteracao - tempoInicialIteracao
      );
      this.statistics.avaliacaoPorIteracao.set(
        iteracoes,
        this.currentSolution.avaliacao
      );

      iteracoes++;
    }

    // Finaliza as estatísticas
    const tempoFinalTotal = performance.now();
    this.statistics.tempoExecucao = tempoFinalTotal - tempoInicialTotal;
    this.statistics.iteracoes = iteracoes;
    this.statistics.interrupcao = (interrompe && interrompe()) || noImprovement;
    this.solution = {
      atribuicoes: this.currentSolution.atribuicoes,
      avaliacao: this.currentSolution.avaliacao,
    };

    return this.currentSolution;
  }
}
