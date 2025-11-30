import Algorithm from "./Algorithm";
import { OptimizationModel } from "../metodos/MILP/optimization_model";
import {
  Context,
  HighsSolverResult,
  Solucao,
} from "../communs/interfaces/interfaces";
import Constraint from "./Constraint";
import ObjectiveComponent from "./ObjectiveComponent";
import { Statistics } from "../classes/Statistics";
import { reconstruirAtribuicoes } from "@/app/atribuicoes/hooks/useAlgorithm";

export abstract class ExactAlgorithm extends Algorithm<HighsSolverResult> {
  public model: OptimizationModel;

  public statistics: Statistics;

  constructor(
    name: string,
    context: Context,
    constraints: Constraint<any>[],
    solution: Solucao | undefined,
    objectiveType: "min" | "max",
    objectiveComponentes: ObjectiveComponent<any>[],
    maiorPrioridade: number | undefined,
    enableStatistics: boolean
  ) {
    super(
      name,
      context,
      constraints,
      solution,
      objectiveType,
      objectiveComponentes,
      maiorPrioridade,
      enableStatistics
    );

    this.model = new OptimizationModel(this.name);
  }

  /**
   * Métodos abstratos específicos para a construção e execução do modelo.
   */
  protected abstract buildModel(): void;
  protected abstract runSolver(): Promise<any>; // Retorno genérico do solver

  /**
   * Implementação do método de execução principal para solvers exatos.
   */
  async execute(): Promise<HighsSolverResult> {
    const startTime = performance.now();

    this.buildModel();

    const solverResult = await this.runSolver();

    this.statistics.tempoExecucao = performance.now() - startTime;
    this.statistics.iteracoes = 1; // Algoritmos exatos têm 1 "iteração"
    this.statistics.interrupcao = false; // Ou baseado no status do solver

    this.solution.atribuicoes = reconstruirAtribuicoes(
      solverResult.Columns,
      this.context.docentes,
      this.context.turmas
    );

    /**
     * Algoritmos exatos também devem gerar os histogramas.
     * Os gráficos iterativos (tempo, avaliação) ficarão vazios,
     * o que está correto.
     */
    if (this.solution) {
      // Garanta que a solução foi parseada
      this.statistics.generateFinalStatistics(
        this.solution.atribuicoes,
        this.context,
        this.constraints
      );
    }

    return solverResult;
  }
}
