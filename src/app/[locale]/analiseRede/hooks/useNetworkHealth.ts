import { useCallback, useMemo } from "react";
import { useGlobalContext } from "@/context/Global";
import { BipartiteGraph } from "@/complexNetworks/core/BipartiteGraph";
import { RobustnessService } from "@/complexNetworks/services/RobustnessService";
import { CommunityDetectionService } from "@/complexNetworks/services/CommunityDetectionService";
import { RobustnessReport } from "@/complexNetworks/domain/types";
import { CascadingFailureService } from "@/complexNetworks/services/CascadingFailureService";
import { CentralityService } from "@/complexNetworks/services/CentralityService";
import { ResilienceService } from "@/complexNetworks/services/ResilienceService";
import { HealingService } from "@/complexNetworks/services/HealingService";
import { SpreadingService } from "@/complexNetworks/services/SpreadingService";
import { CurriculumCutService } from "@/complexNetworks/services/CurriculumCutService";
import { CentralityReport } from "@/complexNetworks/domain/types";
export function useNetworkHealth() {
  const { docentes, disciplinas } = useGlobalContext();

  const { graph, report } = useMemo(() => {
    if (docentes.length === 0 || disciplinas.length === 0) {
      return { graph: null, report: null };
    }
    const graphInstance = new BipartiteGraph(docentes, disciplinas);

    // 1. Análise de Robustez
    const robustnessService = new RobustnessService(graphInstance);
    const robustnessData = robustnessService.analyzeStability();

    // 2. Detecção de Comunidades (NOVO)
    const communityService = new CommunityDetectionService(graphInstance);
    const { metrics, map } = communityService.detectCommunities();

    // Mesclar resultados
    const fullReport: RobustnessReport = {
      ...robustnessData,
      communities: metrics,
      nodeCommunities: map,
    };

    return { graph: graphInstance, report: fullReport };
  }, [docentes, disciplinas]);

  // Centralidades
  const centrality = useMemo<CentralityReport | null>(() => {
    if (!graph) return null;
    return new CentralityService(graph.projectToDocentes()).analyze(); // Usa a rede de docentes por padrão
  }, [graph]);

  const simulateCascadingFailure = useCallback(
    (teacherId: string, classId: string) => {
      if (!graph) return null;
      const simulator = new CascadingFailureService(graph);
      return simulator.simulateAssignment(teacherId, classId);
    },
    [graph]
  );

  const simulateCapacityCascade = useCallback(
    (teacherId: string, maxWorkload?: number) => {
      if (!graph) return null;
      const simulator = new CascadingFailureService(graph);
      return simulator.simulateCapacityCascade(teacherId, maxWorkload);
    },
    [graph]
  );

  const runResilienceSimulation = useCallback(
    (type: "RANDOM" | "TARGETED", steps: number = 20) => {
      if (!graph) return null;
      const simulator = new ResilienceService(graph);
      return type === "RANDOM" 
        ? simulator.simulateRandomAttack(steps)
        : simulator.simulateTargetedAttack(steps);
    },
    [graph]
  );

  const runHealing = useCallback(
    (failedTeachers: string[], maxClassesPerSubstitute: number = 4) => {
      if (!graph) return null;
      const simulator = new HealingService(graph);
      return simulator.simulateRecovery(failedTeachers, maxClassesPerSubstitute);
    },
    [graph]
  );

  const runSpreading = useCallback(
    (initialInfectedId: string, steps: number = 10, prob: number = 1.0) => {
      if (!graph) return null;
      const simulator = new SpreadingService(graph);
      return simulator.simulateSIR(initialInfectedId, steps, prob);
    },
    [graph]
  );

  const runCurriculumCut = useCallback(
    (classId: string) => {
      if (!graph) return null;
      const simulator = new CurriculumCutService(graph);
      return simulator.simulateCourseCut(classId);
    },
    [graph]
  );

  return {
    graph,
    report,
    centrality,
    simulateCascadingFailure,
    simulateCapacityCascade,
    runResilienceSimulation,
    runHealing,
    runSpreading,
    runCurriculumCut,
    isLoading: !report && docentes.length > 0,
    hasData: docentes.length > 0 && disciplinas.length > 0,
  };
}
