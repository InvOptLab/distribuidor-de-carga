import { BipartiteGraph } from "../core/BipartiteGraph";
import {
  CriticalTeacherMetric,
  RobustnessReport,
  NodeType,
} from "../domain/types";

export class RobustnessService {
  private graph: BipartiteGraph;

  constructor(graph: BipartiteGraph) {
    this.graph = graph;
  }

  /**
   * Gera um relatório completo sobre a saúde estrutural da grade.
   */
  public analyzeStability(): RobustnessReport {
    const turmas = this.graph.getAllTurmas();
    const docentes = this.graph.getAllDocentes();

    // 1. Identificar Turmas "Folha" (Grau 1) e Órfãs (Grau 0)
    // Leaf Nodes: Turmas que só têm 1 professor possível. Risco Crítico.
    const leafNodes: string[] = [];
    const orphanClasses: string[] = [];

    turmas.forEach((turma) => {
      const degree = this.graph.getDegree(turma.id);
      if (degree === 0) orphanClasses.push(turma.id);
      if (degree === 1) leafNodes.push(turma.id);
    });

    // 2. Análise de Densidade (Conectividade Real vs Possível)
    // Density = Edges / (Docentes * Turmas)
    const maxEdges = turmas.length * docentes.length;
    const density = maxEdges > 0 ? this.graph.getEdgeCount() / maxEdges : 0;

    // 3. Identificar Docentes Críticos (Percolação Simulada)
    // Removemos virtualmente cada docente e vemos se surgem novas turmas órfãs.
    const criticalTeachers = this.identifyCriticalTeachers(
      docentes.map((d) => d.id),
      turmas.map((t) => t.id)
    );

    return {
      totalDocentes: docentes.length,
      totalTurmas: turmas.length,
      networkDensity: density,
      orphanClasses,
      leafNodes,
      criticalTeachers,
    };
  }

  /**
   * Simula a remoção de cada docente para ver o impacto sistêmico.
   */
  private identifyCriticalTeachers(
    docenteIds: string[],
    turmaIds: string[]
  ): CriticalTeacherMetric[] {
    const criticalList: CriticalTeacherMetric[] = [];

    docenteIds.forEach((docenteId) => {
      // Pega as turmas que esse docente pode dar aula
      const vizinhos = this.graph.getNeighbors(docenteId);

      const turmasAfetadas: string[] = [];

      // Para cada turma que ele "sustenta", verificamos se ele é o ÚNICO sustento.
      vizinhos.forEach((turmaId) => {
        // Se o grau da turma for 1, significa que só este docente conecta a ela.
        // Se ele sair, a turma vira órfã.
        if (this.graph.getDegree(turmaId) === 1) {
          turmasAfetadas.push(turmaId);
        }
      });

      if (turmasAfetadas.length > 0) {
        criticalList.push({
          docenteId: docenteId,
          docenteName: this.graph.getNode(docenteId)?.label || docenteId,
          impactScore: turmasAfetadas.length,
          affectedClasses: turmasAfetadas,
        });
      }
    });

    // Ordenar do mais crítico para o menos crítico
    return criticalList.sort((a, b) => b.impactScore - a.impactScore);
  }
}
