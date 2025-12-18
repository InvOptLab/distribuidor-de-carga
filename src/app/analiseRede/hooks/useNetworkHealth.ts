import { useCallback, useMemo } from "react";
import { useGlobalContext } from "@/context/Global";
import { BipartiteGraph } from "@/complexNetworks/core/BipartiteGraph";
import { RobustnessService } from "@/complexNetworks/services/RobustnessService";
import { CommunityDetectionService } from "@/complexNetworks/services/CommunityDetectionService";
import { RobustnessReport } from "@/complexNetworks/domain/types";
import { CascadingFailureService } from "@/complexNetworks/services/CascadingFailureService";

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

  const simulateCascadingFailure = useCallback(
    (teacherId: string, classId: string) => {
      if (!graph) return null;
      const simulator = new CascadingFailureService(graph);
      return simulator.simulateAssignment(teacherId, classId);
    },
    [graph]
  );

  return {
    graph,
    report,
    simulateCascadingFailure,
    isLoading: !report && docentes.length > 0,
    hasData: docentes.length > 0 && disciplinas.length > 0,
  };
}
