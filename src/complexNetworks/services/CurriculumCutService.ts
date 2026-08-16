import { BipartiteGraph } from "../core/BipartiteGraph";
import { CurriculumCutSimulationResult } from "../domain/types";

export class CurriculumCutService {
  constructor(private graph: BipartiteGraph) {}

  public simulateCourseCut(cutClassId: string): CurriculumCutSimulationResult {
    // 1. Identificar professores que dão essa disciplina/turma
    const affectedDocentesIds = this.graph.getNeighbors(cutClassId);

    const affectedTeachers = affectedDocentesIds.map((docenteId) => {
      const previousDegree = this.graph.getDegree(docenteId);
      const newDegree = previousDegree - 1; // Eles perdem essa turma

      return {
        docenteId,
        previousDegree,
        newDegree,
        isZeroed: newDegree === 0,
      };
    });

    // Ordenar pelo impacto: quem zerou primeiro
    affectedTeachers.sort((a, b) => {
      if (a.isZeroed === b.isZeroed) {
        return a.newDegree - b.newDegree;
      }
      return a.isZeroed ? -1 : 1;
    });

    return {
      cutClassId,
      affectedTeachers,
    };
  }
}
