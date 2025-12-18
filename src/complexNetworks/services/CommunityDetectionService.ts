import { BipartiteGraph } from "../core/BipartiteGraph";
import { CommunityMetric } from "../domain/types";

export class CommunityDetectionService {
  private graph: BipartiteGraph;

  constructor(graph: BipartiteGraph) {
    this.graph = graph;
  }

  /**
   * Executa o algoritmo de Label Propagation Assíncrono.
   * Complexidade próxima de O(m), muito rápido.
   */
  public detectCommunities(maxIterations = 20): {
    metrics: CommunityMetric[];
    map: Map<string, string>;
  } {
    const allNodes = [
      ...this.graph.getAllDocentes(),
      ...this.graph.getAllTurmas(),
    ];
    const nodeIds = allNodes.map((n) => n.id);

    // 1. Inicialização: Cada nó começa em sua própria comunidade
    // Map<NodeID, CommunityID>
    let communities = new Map<string, string>();
    nodeIds.forEach((id) => communities.set(id, id));

    // Array embaralhado para evitar oscilações cíclicas (atualização assíncrona)
    let executionOrder = [...nodeIds];

    let hasChanged = true;
    let iter = 0;

    // 2. Loop de Dinâmica
    while (hasChanged && iter < maxIterations) {
      hasChanged = false;
      iter++;

      // Shuffle Fisher-Yates simples
      executionOrder.sort(() => Math.random() - 0.5);

      for (const nodeId of executionOrder) {
        const neighbors = this.graph.getNeighbors(nodeId);
        if (neighbors.length === 0) continue;

        // Contar comunidades vizinhas
        const neighborCommunities: Record<string, number> = {};

        for (const neighborId of neighbors) {
          const cId = communities.get(neighborId)!;
          neighborCommunities[cId] = (neighborCommunities[cId] || 0) + 1; // + peso da aresta se quiser
        }

        // Encontrar a(s) comunidade(s) dominante(s)
        let maxCount = -1;
        let bestCommunities: string[] = [];

        for (const [cId, count] of Object.entries(neighborCommunities)) {
          if (count > maxCount) {
            maxCount = count;
            bestCommunities = [cId];
          } else if (count === maxCount) {
            bestCommunities.push(cId);
          }
        }

        // Regra de desempate:
        // Se a comunidade atual já é uma das melhores, mantenha (evita oscilação).
        // Senão, escolha uma aleatória das melhores.
        const currentCommunity = communities.get(nodeId)!;

        let newCommunity = currentCommunity;
        if (!bestCommunities.includes(currentCommunity)) {
          const randomIndex = Math.floor(
            Math.random() * bestCommunities.length
          );
          newCommunity = bestCommunities[randomIndex];
          hasChanged = true;
        }

        communities.set(nodeId, newCommunity);
      }
    }

    // 3. Compilar Resultados
    return this.compileResults(communities);
  }

  private compileResults(nodeMap: Map<string, string>) {
    const groups: Record<string, string[]> = {};

    nodeMap.forEach((communityId, nodeId) => {
      if (!groups[communityId]) groups[communityId] = [];
      groups[communityId].push(nodeId);
    });

    // Filtrar comunidades muito pequenas (ex: < 3 nós) geralmente são ruídos ou isolados
    // Gerar cores deterministicas baseadas no ID da comunidade
    const metrics: CommunityMetric[] = Object.entries(groups)
      .sort((a, b) => b[1].length - a[1].length) // Ordena das maiores para as menores
      .map(([communityId, members], index) => ({
        id: communityId,
        color: this.generateDistinctColor(index),
        size: members.length,
        label: `Comunidade ${index + 1}`,
        nodes: members,
      }));

    return { metrics, map: nodeMap };
  }

  /**
   * Gera cores visualmente distintas usando o Ângulo Áureo (Golden Angle).
   * Isso garante que comunidades adjacentes no ranking tenham cores opostas no espectro.
   */
  private generateDistinctColor(index: number): string {
    // O ângulo áureo é aprox. 137.508°. Multiplicar o índice por ele espalha as cores
    // uniformemente pelo círculo cromático, evitando repetições próximas.
    const hue = (index * 137.508) % 360;

    // Saturation: 70% (Vibrante mas não "neon" demais)
    // Lightness: 50% (Bom contraste tanto no tema Dark quanto Light)
    return `hsl(${hue}, 70%, 50%)`;
  }
}
