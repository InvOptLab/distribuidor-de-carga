import { BipartiteGraph } from "../core/BipartiteGraph";
import { HealingSimulationResult } from "../domain/types";

export class HealingService {
  constructor(private graph: BipartiteGraph) {}

  public simulateRecovery(
    failedTeachers: string[],
    maxClassesPerSubstitute: number = 4
  ): HealingSimulationResult {
    // 1. Identificar todas as turmas que ficaram órfãs devido à ausência desses professores
    const orphanedClassesSet = new Set<string>();

    failedTeachers.forEach((teacherId) => {
      const classes = this.graph.getNeighbors(teacherId);
      classes.forEach((classId) => orphanedClassesSet.add(classId));
    });

    const orphanedClasses = Array.from(orphanedClassesSet);

    // 2. Alocar professores substitutos
    let substitutesNeeded = 0;
    const substituteAssignments: { substituteId: string; classesAssigned: string[] }[] = [];
    const unassignedClasses: string[] = [];

    let currentSubstituteClasses: string[] = [];

    for (let i = 0; i < orphanedClasses.length; i++) {
      currentSubstituteClasses.push(orphanedClasses[i]);

      if (currentSubstituteClasses.length >= maxClassesPerSubstitute || i === orphanedClasses.length - 1) {
        substitutesNeeded++;
        substituteAssignments.push({
          substituteId: `Substituto Temporário ${substitutesNeeded}`,
          classesAssigned: [...currentSubstituteClasses],
        });
        currentSubstituteClasses = [];
      }
    }

    return {
      failedTeachers,
      totalOrphanedClasses: orphanedClasses.length,
      substitutesNeeded,
      substituteAssignments,
      unassignedClasses,
    };
  }
}
