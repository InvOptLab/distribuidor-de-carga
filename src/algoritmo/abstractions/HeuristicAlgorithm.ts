import { Context, Solucao, Vizinho } from "../communs/interfaces/interfaces";
import Algorithm from "./Algorithm";
import Constraint from "./Constraint";
import { NeighborhoodFunction } from "./NeighborhoodFunction";
import { ObjectiveComponent } from "./ObjectiveComponent";
import { StopCriteria } from "./StopCriteria";

export abstract class HeuristicAlgorithm extends Algorithm<Vizinho> {
  public neighborhoodPipe: Map<string, NeighborhoodFunction>;
  public stopPipe: Map<string, StopCriteria>;
  public currentSolution: Vizinho;

  constructor(
    name: string,
    context: Context,
    constraints: Constraint<any>[],
    solution: Solucao | undefined,
    objectiveType: "min" | "max",
    objectiveComponentes: ObjectiveComponent[],
    maiorPrioridade: number | undefined,
    enableStatistics: boolean,
    neighborhoodFunctions: NeighborhoodFunction[],
    stopFunctions: StopCriteria[]
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

    // Configuração dos Pipes
    this.neighborhoodPipe = new Map();
    neighborhoodFunctions.forEach((f) => this.neighborhoodPipe.set(f.name, f));

    this.stopPipe = new Map();
    stopFunctions.forEach((f) => this.stopPipe.set(f.name, f));

    // Inicializa currentSolution
    this.currentSolution = solution
      ? { atribuicoes: solution.atribuicoes }
      : { atribuicoes: context.atribuicoes };
  }
}
