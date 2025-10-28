import Algorithm from "./Algorithm";
import { OptimizationModel } from "../metodos/MILP/optimization_model";
import {
  Context,
  HighsSolverResult,
  Solucao,
} from "../communs/interfaces/interfaces";
import Constraint from "./Constraint";
import { ObjectiveComponent } from "./ObjectiveComponent";

export abstract class ExactAlgorithm extends Algorithm<HighsSolverResult> {
  public model: OptimizationModel;

  constructor(
    name: string,
    context: Context,
    constraints: Constraint<any>[],
    solution: Solucao | undefined,
    objectiveType: "min" | "max",
    objectiveComponentes: ObjectiveComponent[],
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
  // protected abstract parseSolverSolution(solverResult: any): Solucao;

  /**
   * Implementação do método de execução principal para solvers exatos.
   */
  async execute(): Promise<any> {
    const startTime = performance.now();

    this.buildModel();

    const solverResult = await this.runSolver();

    // this.solution = this.parseSolverSolution(solverResult);

    this.statistics.tempoExecucao = performance.now() - startTime;
    // return this.solution;
    return solverResult;
  }
}
