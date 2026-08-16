import { BipartiteGraph } from "../core/BipartiteGraph";
import { SimulationResult, AffectedNode, NodeType, CapacityCascadeResult } from "../domain/types";

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

  /**
   * Simula a falha em cascata baseada em capacidade de carga.
   * Se um professor sai, suas turmas são redistribuídas para vizinhos (na projeção de docentes).
   * Se um vizinho ultrapassar `maxWorkload`, ele também falha e repassa suas turmas originais + novas.
   */
  public simulateCapacityCascade(
    teacherId: string,
    maxWorkload: number = 4
  ): { initialCascadeSize: number; failedTeachers: string[]; orphanedClasses: string[] } {
    const failedTeachers = new Set<string>();
    const orphanedClasses = new Set<string>();
    
    // Fila de turmas que precisam ser reatribuídas
    const unassignedClasses: string[] = [...this.graph.getNeighbors(teacherId)];
    failedTeachers.add(teacherId);

    // Mapeia a carga atual de cada professor (considerando que grau = carga atual)
    const currentWorkload = new Map<string, number>();
    this.graph.getAllDocentes().forEach(d => {
      currentWorkload.set(d.id, this.graph.getDegree(d.id));
    });

    while (unassignedClasses.length > 0) {
      const classId = unassignedClasses.shift()!;
      
      // Quem pode pegar essa turma? (Vizinhos no grafo original que não falharam)
      const possibleTeachers = this.graph.getNeighbors(classId).filter(t => !failedTeachers.has(t));
      
      if (possibleTeachers.length === 0) {
        // Ninguém pode pegar, turma fica órfã
        orphanedClasses.add(classId);
        continue;
      }

      // Escolhe o professor que tem menor carga atualmente para assumir (Heurística Gulosa)
      possibleTeachers.sort((a, b) => (currentWorkload.get(a) || 0) - (currentWorkload.get(b) || 0));
      const chosenTeacher = possibleTeachers[0];

      // Aumenta a carga do professor escolhido
      const newLoad = (currentWorkload.get(chosenTeacher) || 0) + 1;
      currentWorkload.set(chosenTeacher, newLoad);

      // Verifica se ele colapsou com essa nova carga
      if (newLoad > maxWorkload) {
        failedTeachers.add(chosenTeacher);
        // Todas as turmas que ele estava segurando (originais + as que pegou agora) caem na fila
        const hisClasses = this.graph.getNeighbors(chosenTeacher);
        hisClasses.forEach(c => {
          // Só coloca na fila se já não estiver órfã ou na fila
          if (!orphanedClasses.has(c) && !unassignedClasses.includes(c)) {
            unassignedClasses.push(c);
          }
        });
      }
    }

    return {
      initialCascadeSize: failedTeachers.size - 1, // Excluindo o nó raiz removido
      failedTeachers: Array.from(failedTeachers),
      orphanedClasses: Array.from(orphanedClasses)
    };
  }
}
