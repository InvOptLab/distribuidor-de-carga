import { BipartiteGraph } from "../core/BipartiteGraph";
import { SpreadingSimulationResult } from "../domain/types";

export class SpreadingService {
  constructor(private graph: BipartiteGraph) {}

  public simulateSIR(
    initialInfectedId: string,
    maxSteps: number = 10,
    transmissionProbability: number = 1.0 // 1.0 = Deterministic BFS
  ): SpreadingSimulationResult {
    const projectedGraph = this.graph.projectToDocentes();
    const allNodes = projectedGraph.getAllNodes().map(n => n.id);

    const steps = [];
    const infected = new Set<string>();
    infected.add(initialInfectedId);

    steps.push({
      step: 0,
      newlyInfected: [initialInfectedId],
      totalInfected: 1,
    });

    let newlyInfectedInLastStep = [initialInfectedId];

    for (let s = 1; s <= maxSteps; s++) {
      if (infected.size === allNodes.length || newlyInfectedInLastStep.length === 0) {
        break; // Todos infectados ou a propagação parou
      }

      const newlyInfectedThisStep: string[] = [];

      for (const node of newlyInfectedInLastStep) {
        const neighbors = projectedGraph.getNeighbors(node);
        for (const neighbor of neighbors) {
          if (!infected.has(neighbor)) {
            // Rolar probabilidade
            if (Math.random() <= transmissionProbability) {
              infected.add(neighbor);
              newlyInfectedThisStep.push(neighbor);
            }
          }
        }
      }

      steps.push({
        step: s,
        newlyInfected: newlyInfectedThisStep,
        totalInfected: infected.size,
      });

      newlyInfectedInLastStep = newlyInfectedThisStep;
    }

    // Calcular os "Top Spreaders" baseando-se no grau projetado como heurística simples
    // Nós com maior grau na projeção atingem mais colegas diretamente.
    const topSpreaders = allNodes
      .map(id => ({ docenteId: id, score: projectedGraph.getDegree(id) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      initialNodeId: initialInfectedId,
      steps,
      topSpreaders,
    };
  }
}
