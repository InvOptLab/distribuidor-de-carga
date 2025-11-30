import { delay } from "@/algoritmo/communs/utils";
import Constraint from "../../../abstractions/Constraint";
import { NeighborhoodFunction } from "../../../abstractions/NeighborhoodFunction";
import ObjectiveComponent from "../../../abstractions/ObjectiveComponent";
import { StopCriteria } from "../../../abstractions/StopCriteria";
import {
  Atribuicao,
  Celula,
  Disciplina,
  Docente,
  Estatisticas,
  Formulario,
  OpcoesMonitoramento,
  Solucao,
  Vizinho,
} from "../../../communs/interfaces/interfaces";
import { Moviment, TenureSizes } from "../TabuList/Moviment";
import { Solution } from "../TabuList/Solution";
import { AspirationCriteria } from "./Abstract/AspirationCriteria";
import { TabuList } from "./Abstract/TabuList";
import { HeuristicAlgorithm } from "@/algoritmo/abstractions/HeuristicAlgorithm";
import { TabuStatistics } from "./TabuStatistics";

export interface EstatisticasTabu {
  tempoPorIteracaoTabu: Map<number, number>;
}

export class TabuSearch extends HeuristicAlgorithm {
  /**
   * Lista tabu com a sua tipagem dinâmica devido a possibilidades de diferentes interpretações.
   */
  public tabuList: TabuList<
    | Vizinho[]
    | {
        addList: Map<string, number>;
        dropList: Map<string, number>;
      }
  >;

  /**
   * Solução final após a execução do algoritmo ou a melhor solução encontrada até o momento.
   * O valor é `undefined` até o algoritmo ser executado ou salvo no histórico (solução manual).
   */
  public bestSolution: Vizinho;

  /**
   * Melhor solução global.
   */
  public incumbente: Vizinho;

  /**
   * Lista que armazena os critérios de aspiração que serão aplicados durante a execução
   * do algoritmo.
   */
  public aspirationPipe: Map<string, AspirationCriteria> = new Map<
    string,
    AspirationCriteria
  >();

  public statistics: TabuStatistics;

  constructor(
    atribuicoes: Atribuicao[],
    docentes: Docente[],
    turmas: Disciplina[],
    travas: Celula[],
    prioridades: Formulario[],
    constraints: Constraint<any>[],
    solution: Solucao | undefined,
    neighborhoodFunctions: NeighborhoodFunction[],
    tipoTabuList: "Solução" | "Atribuição" | "Movimento",
    tabuSize: number | TenureSizes,
    stopFunctions: StopCriteria[],
    aspirationFunctions: AspirationCriteria[],
    maiorPrioridade: number | undefined,
    objectiveType: "min" | "max",
    objectiveComponentes: ObjectiveComponent<any>[]
  ) {
    /**
     * Inicialização do contexto.
     */

    super(
      "tabu-search",
      {
        atribuicoes: atribuicoes,
        docentes: docentes,
        prioridades: prioridades,
        travas: travas,
        turmas: turmas,
      },
      constraints,
      solution,
      objectiveType,
      objectiveComponentes,
      maiorPrioridade,
      true,
      neighborhoodFunctions,
      stopFunctions
    );

    /**
     * Inicialização do atribuito bestSolution para iniciar com uma solução caso já exista e seja informada como parâmetro.
     */
    if (solution) {
      this.bestSolution = {
        atribuicoes: solution.atribuicoes,
        isTabu: false,
        movimentos: { add: [], drop: [] },
        avaliacao: solution.avaliacao,
      };
    } else {
      this.bestSolution = {
        atribuicoes: atribuicoes,
        isTabu: false,
        movimentos: { add: [], drop: [] },
        avaliacao: undefined,
      };
    }

    this.incumbente = structuredClone(this.bestSolution);

    /**
     * Inicializar a lista tabu com tipagem correta.
     */
    if (tipoTabuList === "Solução") {
      this.tabuList = new Solution(tabuSize as number);
    } else if (tipoTabuList === "Movimento") {
      /**
       * Precisamos desse if para o lint não reclamar que tabuSize é um number e não possuí as caracterpisticas que
       * precisamos.
       * */
      if (
        typeof tabuSize === "object" &&
        tabuSize !== null &&
        "add" in tabuSize &&
        "drop" in tabuSize
      ) {
        this.tabuList = new Moviment(tabuSize.add, tabuSize.drop);
      }
    }
    // TODO: Implementar os demais casos quando as classes forem criadas.

    /**
     * Inicializa a classe de estatísticas específica do Tabu.
     * Isso sobrescreve a inicialização padrão do 'Algorithm'.
     */
    this.statistics = new TabuStatistics();

    /**
     * Inicializa os critérios de aspiração
     */
    for (const func of aspirationFunctions) {
      this.aspirationPipe.set(func.name, func);
    }
  }

  /**
   * Bloco responsável por executar todos od processos definidos para o Pipe Line de geração de vizinhanças.
   * @returns Vizinhança gerada.
   */
  async generateNeighborhood(): Promise<Vizinho[]> {
    const vizinhanca: Vizinho[] = [];

    for (const _process of this.neighborhoodPipe.keys()) {
      /**
       * Criar essa variável para caso não sejam gerados vizinhos, aplicar uma condição de não concatenar
       * na vizinhança global.
       */
      const vizinhancaProcess = await this.neighborhoodPipe
        .get(_process)
        .generate(this.context, this.constraints.hard, this.bestSolution);

      if (vizinhancaProcess.length > 0) {
        vizinhanca.push(...vizinhancaProcess);
      }
    }

    return vizinhanca;
  }

  /**
   * Bloco responsável por avaliar a qualidade da solução(vizinhos).
   * @param vizinhanca Vizinhança obtida pelo Pipe Line de geração de vizinhança.
   * @returns Vizinhos com a propriedade `.avaliacao` preenchidos.
   */
  async evaluateNeighbors(vizinhanca: Vizinho[]): Promise<Vizinho[]> {
    for (const vizinho of vizinhanca) {
      let avaliacao = 0;

      /**
       * Aplicar as penalizações na função objetivo
       */
      for (const constraint of this.constraints.soft.values()) {
        avaliacao += constraint.soft(
          vizinho.atribuicoes,
          this.context.docentes,
          this.context.turmas
        );
      }

      /**
       * Aplica o Custo da função objetivo
       * Posteriormente essa parte também pode ser subistituída por um pipe line
       */
      avaliacao += this.objectiveFunction.calculate(
        vizinho.atribuicoes,
        this.context.prioridades,
        this.context.docentes,
        this.context.turmas
      );

      // Atualiza o valor da avaliação do vizinho.
      vizinho.avaliacao = avaliacao;
    }

    return vizinhanca;
  }

  /**
   * Bloco responsável por verificar se o(s) movimento(s) realizado(s) é/são tabu. Essa verificação
   * deve alterar a propriedade `.isTabu` da interface `Vizinho`.
   *
   * O processo de verificação deve ser modularizado para que possa ser possível implementar
   * as variações da lista tabu.
   *
   * **Variações**:
   * - Soluções
   * - Atributos
   * - Movimentos
   */
  async verifyTabu(
    vizinhanca: Vizinho[],
    iteracaoAtual: number
  ): Promise<Vizinho[]> {
    for (const vizinho of vizinhanca) {
      vizinho.isTabu = this.tabuList.has(vizinho, iteracaoAtual);
    }

    return vizinhanca;
  }

  /**
   * (Provisório) Método que define se o processo deve ser encerrado.
   */
  stop(
    iteracoes: number,
    melhorVizinhoGerado: Vizinho,
    interrompe?: () => boolean
  ): boolean {
    if (interrompe && interrompe()) return true;

    for (const process of this.stopPipe.values()) {
      if (process.stop(iteracoes, this.incumbente, melhorVizinhoGerado)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Esse método tem como objetivo encontrar, e atualizar, o melhor vizinho entre os elementos
   * da vizinhança gerada e a melhor solução encontrada até o momento.
   * O método aplicará o `Pipeline` referente aos critéios de aspiração, dessa forma, caso uma nova melhor
   * solução seja encontrada pelas aspirações, o elemento deve ser removido da lista tabu para ser
   * adicionado novamente pelo loop principal do algoritmo.
   * @param vizinhanca Vizinhança gerada pelo método `generateNeighborhood`.
   * @returns Retorna o melhor vizinho e o indice na vizinhança.
   */
  async findBestSolution(
    vizinhanca: Vizinho[],
    iteracoes: number
  ): Promise<{
    vizinho: Vizinho;
    index: number | undefined;
    forceAcceptance: boolean;
  }> {
    for (let i = 0; i < vizinhanca.length; i++) {
      if (!vizinhanca[i].isTabu) {
        return { vizinho: vizinhanca[i], index: i, forceAcceptance: false };
      } else {
        let fullfils = false;

        for (const aspiration of this.aspirationPipe.values()) {
          fullfils =
            fullfils ||
            aspiration.fulfills(vizinhanca[i], this.incumbente, iteracoes);
        }

        if (fullfils) {
          return { vizinho: vizinhanca[i], index: i, forceAcceptance: true };
        }
      }
    }

    return {
      vizinho: this.bestSolution,
      index: undefined,
      forceAcceptance: false,
    };
  }

  /**
   *
   * @param interrompe Função que pode ser informada ao método run com o intuito de interromper a execução do algoritmo.
   * @returns
   */
  async execute(
    interrompe?: () => boolean,
    atualizaQuantidadeAlocacoes?: (qtd: number) => void,
    atualizaEstatisticas?: OpcoesMonitoramento
  ): Promise<Vizinho> {
    let iteracoes = 0;
    let vizinhanca: Vizinho[] = [];
    /**
     * Variáveis para o controle do tempo de execução. Também serão utilizados nas estatisticas.
     */
    let tempoInicial: number; // Por iteração
    // let tempoFinal: number; // Por iteração

    let tempoInicialTabu: number; // Por iteração
    let tempoFinalTabu: number; // Por iteração

    if (!this.bestSolution.avaliacao) {
      this.bestSolution = (
        await this.evaluateNeighbors([this.bestSolution])
      )[0];

      this.incumbente = structuredClone(this.bestSolution);
    }

    /**
     * Inicializa o primeiro item da lista de tempo por iteração com 0
     */
    // this.statistics.tempoPorIteracao.set(iteracoes, 0);
    // Inicia o tempo inicial total
    const tempoInicialTotal = performance.now();

    while (!this.stop(iteracoes, vizinhanca[0], interrompe)) {
      // console.log("Iteração: " + iteracoes); // Apenas para o script

      await delay(0);

      /**
       * Atualizar as estatisticas
       */

      // this.statistics.addIteracaoData(
      //   iteracoes,
      //   this.bestSolution.avaliacao,
      //   performance.now() - tempoInicial
      // );

      /**
       * Captura o tempo de inicio da iteração
       */
      tempoInicial = performance.now();

      /**********************************************************************************************/

      vizinhanca = await this.generateNeighborhood();

      vizinhanca = await this.evaluateNeighbors(vizinhanca);

      // Verificar tempo Tabu
      tempoInicialTabu = performance.now();
      vizinhanca = await this.verifyTabu(vizinhanca, iteracoes);
      tempoFinalTabu = performance.now();

      vizinhanca = vizinhanca.sort((a, b) => b.avaliacao - a.avaliacao);

      /**
       * Processo de encontrar o melhor vizinho.
       */
      const localBestSolution = await this.findBestSolution(
        vizinhanca,
        iteracoes
      );

      /**
       * Verifica se a propriedade `index` está definida, representando uma nova solução encontrada.
       */
      if (localBestSolution.index !== undefined) {
        /**
         * Verifica se a nova solução encontrada é tabu. Se for, implica-se que algum critério
         * de aspiração foi atendido.
         * A solução deve ser rmeovida da lista tabu, melhor solução global atualizada e inserida
         * novamente na lista tabu.
         *
         * Caso contrário, a solução encontrada não é tabu e deve-se apenas ser atualizado o melhor
         * vizinho e inseri-lo na lista tabu.
         */
        if (
          localBestSolution.vizinho.isTabu &&
          localBestSolution.forceAcceptance
        ) {
          this.tabuList.remove(localBestSolution.vizinho);
          localBestSolution.vizinho.isTabu = false;
        }

        /**
         * !!@@@!! Adicionar um Map para armazenar quando a solução incumbente é alterada
         */
        this.bestSolution = localBestSolution.vizinho;
        this.tabuList.add(localBestSolution.vizinho, iteracoes);
        if (this.bestSolution.avaliacao >= this.incumbente.avaliacao) {
          this.incumbente = structuredClone(this.bestSolution);
        }
      }

      /**
       * Atualiza o tempo por iteração
       */
      this.statistics.addIteracaoData(
        iteracoes,
        this.bestSolution.avaliacao,
        performance.now() - tempoInicial
      );
      /**
       * Captura o tempo final de execução da iteração, como também atualiza o map com as novas informações
       */
      // tempoFinal = performance.now();
      this.statistics.tempoPorIteracaoTabu.set(
        iteracoes,
        tempoFinalTabu - tempoInicialTabu
      );

      /**
       * Atualiza um contador para ser utilizado como status de alocação
       */
      if (atualizaQuantidadeAlocacoes) {
        atualizaQuantidadeAlocacoes(
          this.incumbente.atribuicoes.filter(
            (atribuicao) => atribuicao.docentes.length > 0
          ).length
        );
      }

      if (atualizaEstatisticas) {
        // Objeto que enviaremos, contendo apenas o que mudou NESTA iteração
        const dadosParaEnviar: Partial<Estatisticas> = {};
        let algoParaEnviar = false;

        // Base para o cálculo da frequência (ex: iteração 1, 2, 3...)
        const iteracaoAtual = this.statistics.iteracoes;

        // Itera sobre o Map de campos e suas frequências
        for (const [
          campo,
          frequencia,
        ] of atualizaEstatisticas.campos.entries()) {
          // Evita divisão por zero ou frequências inválidas
          if (frequencia <= 0) continue;

          // Verifica se a iteração atual é um múltiplo da frequência
          if (iteracaoAtual % frequencia === 0) {
            // Adiciona o valor atualizado ao pacote de envio
            (dadosParaEnviar as any)[campo] = this.statistics[campo];
            algoParaEnviar = true;
          }
        }

        // Se pelo menos um campo atingiu sua frequência, envia o pacote
        if (algoParaEnviar) {
          atualizaEstatisticas.onUpdate(dadosParaEnviar);
        }
      }

      /**
       * Incrementar o contador de iterações
       */
      iteracoes += 1;
      this.statistics.iteracoes = iteracoes;
    }

    /**
     * Atualizar a lista com as avaliações por iteração (devido ao while o último ficará de fora da lista)
     */
    this.statistics.avaliacaoPorIteracao.set(
      iteracoes,
      this.bestSolution.avaliacao
    );

    /**
     * Finalizar a atualização das estatísticas
     */
    this.statistics.iteracoes = iteracoes;
    this.statistics.interrupcao = (interrompe && interrompe()) || false; // Ajustado
    this.statistics.tempoExecucao = performance.now() - tempoInicialTotal; // Ajustado

    this.statistics.generateFinalStatistics(
      this.incumbente.atribuicoes,
      this.context,
      this.constraints
    );
    this.bestSolution = this.incumbente;

    /**
     * Aproveitando que já temos o processo executado, a última vizinhança gerada será salva nas estatísticas
     * para podermos verificar a quantidade de soluções semelhantes estão presentes na última iteração
     * e ainda fora do tabu (observação para aumentarmos o tamanho do tabu).
     */
    // this.statistics.ultimaVizinhanca = vizinhanca;

    return this.incumbente;
  }
}
