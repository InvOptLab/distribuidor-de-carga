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
import { HeuristicAlgorithm } from "@/algoritmo/abstractions/HeuristicAlgorithm";
import { SimulatedAnnealingStatistics } from "./SimulatedAnnealingStatistics";

export class SimulatedAnnealing extends HeuristicAlgorithm {
  public initialTemperature: number;
  public coolingRate: number;
  public iterationsPerTemperature: number;

  public bestSolution: Vizinho;
  public incumbente: Vizinho;

  public statistics: SimulatedAnnealingStatistics;

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
    maiorPrioridade: number | undefined,
    objectiveType: "min" | "max",
    objectiveComponentes: ObjectiveComponent<any>[],
    initialTemperature: number,
    coolingRate: number,
    iterationsPerTemperature: number
  ) {
    super(
      "simulated-annealing",
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
      true, // enableStatistics
      neighborhoodFunctions,
      stopFunctions
    );

    this.initialTemperature = initialTemperature;
    this.coolingRate = coolingRate;
    this.iterationsPerTemperature = iterationsPerTemperature;

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
    this.statistics = new SimulatedAnnealingStatistics();
  }

  /**
   * Avalia a qualidade de um candidato específico aplicando soft constraints e função objetivo.
   */
  async evaluateCandidate(vizinho: Vizinho): Promise<number> {
    let avaliacao = 0;
    for (const constraint of this.constraints.soft.values()) {
      avaliacao += constraint.soft(
        vizinho.atribuicoes,
        this.context.docentes,
        this.context.turmas
      );
    }
    avaliacao += this.objectiveFunction.calculate(
      vizinho.atribuicoes,
      this.context.prioridades,
      this.context.docentes,
      this.context.turmas
    );
    vizinho.avaliacao = avaliacao;
    return avaliacao;
  }

  /**
   * Compara se solucaoA é estritamente melhor que solucaoB
   */
  private isBetter(solucaoA: Vizinho, solucaoB: Vizinho): boolean {
    if (solucaoA.avaliacao === undefined) return false;
    if (solucaoB.avaliacao === undefined) return true;
    if (this.objectiveFunction.type === "max") {
      return solucaoA.avaliacao > solucaoB.avaliacao;
    }
    return solucaoA.avaliacao < solucaoB.avaliacao;
  }

  async execute(
    interrompe?: () => boolean,
    atualizaQuantidadeAlocacoes?: (qtd: number) => void,
    atualizaEstatisticas?: OpcoesMonitoramento
  ): Promise<Vizinho> {
    // Avalia solução inicial
    await this.evaluateCandidate(this.incumbente);
    this.bestSolution = structuredClone(this.incumbente);
    
    // Inicia as estatísticas
    const tempoInicialTotal = performance.now();

    let stop = false;
    let temperaturaAtual = this.initialTemperature;
    
    // Inicia variáveis para delay opcional e monitoramento
    let lastYieldTime = performance.now();

    while (!stop && temperaturaAtual > 0.0001) {
      for (let i = 0; i < this.iterationsPerTemperature && !stop; i++) {
        const iteracaoAtual = this.statistics.iteracoes + 1;
        const tempoLocalInicio = performance.now();
        this.statistics.customStatistics.temperaturaPorIteracao.set(iteracaoAtual, temperaturaAtual);

        // 1. Gera Vizinhos
        const vizinhanca: Vizinho[] = [];
        for (const _process of this.neighborhoodPipe.keys()) {
          const vizinhancaProcess = await this.neighborhoodPipe
            .get(_process)!
            .generate(this.context, this.constraints.hard, this.incumbente);
          if (vizinhancaProcess.length > 0) {
            vizinhanca.push(...vizinhancaProcess);
          }
        }

        // Se não houver vizinhos viáveis gerados, o algoritmo deve parar
        if (vizinhanca.length === 0) {
          stop = true;
          break;
        }

        // 2. Seleciona um candidato aleatoriamente
        const candidatoIndex = Math.floor(Math.random() * vizinhanca.length);
        const candidato = vizinhanca[candidatoIndex];

        // 3. Avalia o candidato
        await this.evaluateCandidate(candidato);
        
        // 4. Critério de Aceitação do Simulated Annealing
        const currentScore = this.incumbente.avaliacao || 0;
        const candidateScore = candidato.avaliacao!;
        
        let accepted = false;

        if (this.objectiveFunction.type === "min") {
          const delta = candidateScore - currentScore;
          if (delta < 0) {
            accepted = true; // Custo menor (melhor)
          } else {
            const probability = Math.exp(-delta / temperaturaAtual);
            if (Math.random() < probability) {
              accepted = true; // Aceita solução pior com probabilidade p
              this.statistics.customStatistics.aceitacoesPiores++;
            }
          }
        } else {
          // MAXIMIZATION
          const delta = candidateScore - currentScore;
          if (delta > 0) {
            accepted = true; // Custo maior (melhor)
          } else {
            // Delta é negativo (piora). Queremos e^(delta/T)
            const probability = Math.exp(delta / temperaturaAtual);
            if (Math.random() < probability) {
              accepted = true;
              this.statistics.customStatistics.aceitacoesPiores++;
            }
          }
        }

        if (accepted) {
          this.incumbente = candidato;
        }

        // 5. Verifica Best Global
        let isNewBest = false;
        if (this.isBetter(this.incumbente, this.bestSolution)) {
          this.bestSolution = structuredClone(this.incumbente);
          isNewBest = true;
          if (atualizaQuantidadeAlocacoes) {
            atualizaQuantidadeAlocacoes(this.bestSolution.atribuicoes.length);
          }
        }

        // 6. Atualização de Parada
        for (const process of this.stopPipe.values()) {
          if (process.stop(iteracaoAtual, this.incumbente, candidato)) {
            stop = true;
            break;
          }
        }

        if (interrompe && interrompe()) {
          stop = true;
        }

        // 7. Atualização das Estatísticas Globais
        const tempoMs = performance.now() - tempoLocalInicio;
        this.statistics.addIteracaoData(
          iteracaoAtual,
          this.incumbente.avaliacao!,
          tempoMs
        );
        this.statistics.customStatistics.tempoPorIteracaoSA.set(iteracaoAtual, tempoMs);
        if (atualizaEstatisticas) {
          const dadosParaEnviar: any = {};
          let algoParaEnviar = false;
          
          for (const [campo, frequencia] of atualizaEstatisticas.campos.entries()) {
            if (frequencia <= 0) continue;
            if (iteracaoAtual % frequencia === 0) {
              dadosParaEnviar[campo] = (this.statistics as any)[campo] ?? (this.statistics.customStatistics as any)[campo];
              algoParaEnviar = true;
            }
          }
          
          if (algoParaEnviar) {
            atualizaEstatisticas.onUpdate(dadosParaEnviar);
          }
        }

        // 8. Prevent freezing the event loop (similar to tabu search approach)
        if (performance.now() - lastYieldTime > 16) {
          await delay(0);
          lastYieldTime = performance.now();
        }
      }

      // 9. Resfriamento (Cooling)
      temperaturaAtual *= this.coolingRate;
    }

    this.statistics.generateFinalStatistics(
      this.bestSolution.atribuicoes,
      this.context,
      this.constraints
    );

    return this.bestSolution;
  }
}
