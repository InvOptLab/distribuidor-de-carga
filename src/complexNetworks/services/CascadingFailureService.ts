import { BipartiteGraph } from "../core/BipartiteGraph";
import { SimulationResult, AffectedNode, NodeType } from "../domain/types";

export class CascadingFailureService {
  private graph: BipartiteGraph;

  constructor(graph: BipartiteGraph) {
    this.graph = graph;
  }

  /**
   * Simula o cenário: "E se eu obrigar este professor a pegar esta turma?"
   */
  public simulateAssignment(
    teacherId: string,
    targetClassId: string
  ): SimulationResult {
    const affectedNodes: AffectedNode[] = [];

    // 1. Pegar todas as turmas que o professor PODERIA pegar, mas terá que abandonar
    const currentNeighbors = this.graph.getNeighbors(teacherId);

    // Filtramos para pegar apenas as turmas que NÃO são a alvo
    const abandonedClasses = currentNeighbors.filter(
      (id) => id !== targetClassId
    );

    let totalImpact = 0;

    // 2. Calcular o impacto em cada turma abandonada
    abandonedClasses.forEach((classId) => {
      const currentDegree = this.graph.getDegree(classId);
      const newDegree = currentDegree - 1; // Ele perdeu este professor

      let status: "ORPHAN" | "CRITICAL" | "SAFE" = "SAFE";

      if (newDegree === 0) {
        status = "ORPHAN";
        totalImpact += 10; // Penalidade alta
      } else if (newDegree === 1) {
        status = "CRITICAL";
        totalImpact += 3; // Penalidade média
      }

      // Só registramos se houver impacto negativo relevante (reduziu para perigo)
      if (status !== "SAFE") {
        const node = this.graph.getNode(classId);
        affectedNodes.push({
          id: classId,
          label: node?.label || classId,
          previousDegree: currentDegree,
          newDegree: newDegree,
          status,
        });
      }
    });

    // Ordenar por gravidade (Órfãos primeiro)
    affectedNodes.sort((a, b) => (a.status === "ORPHAN" ? -1 : 1));

    return {
      sourceTeacherId: teacherId,
      targetClassId: targetClassId,
      isSafe: affectedNodes.length === 0,
      impactScore: totalImpact,
      affectedNodes,
    };
  }
}
