import { BipartiteGraph } from "../core/BipartiteGraph";
import { ResilienceSimulation, ResiliencePoint, NetworkNode } from "../domain/types";
import { CentralityService } from "./CentralityService";

export class ResilienceService {
  private graph: BipartiteGraph;

  constructor(graph: BipartiteGraph) {
    this.graph = graph;
  }

  /**
   * Simula um ataque aleatório removendo professores passo a passo.
   */
  public simulateRandomAttack(steps: number = 20): ResilienceSimulation {
    return this.runSimulation("RANDOM", steps);
  }

  /**
   * Simula um ataque direcionado removendo os professores mais importantes primeiro.
   */
  public simulateTargetedAttack(steps: number = 20): ResilienceSimulation {
    return this.runSimulation("TARGETED", steps);
  }

  private runSimulation(type: "RANDOM" | "TARGETED", steps: number): ResilienceSimulation {
    // Trabalharemos na projeção de docentes para ver a conectividade da rede de professores
    let currentGraph = this.graph.projectToDocentes();
    let availableNodes = currentGraph.getAllNodes();
    
    const points: ResiliencePoint[] = [];

    // Step 0: Grafo Completo
    points.push({
      step: 0,
      removedNodes: [],
      remainingNodes: availableNodes.length,
      largestComponentSize: this.getLargestComponentSize(availableNodes, currentGraph)
    });

    const nodesToRemovePerStep = Math.max(1, Math.floor(availableNodes.length / steps));
    let removedSoFar: string[] = [];

    for (let i = 1; i <= steps && availableNodes.length > 0; i++) {
      let toRemove: NetworkNode[] = [];

      if (type === "RANDOM") {
        // Embaralha e tira
        const shuffled = [...availableNodes].sort(() => 0.5 - Math.random());
        toRemove = shuffled.slice(0, nodesToRemovePerStep);
      } else {
        // Ataque direcionado: Recalcula centralidade no grafo atual e remove os piores (maior betweenness/degree)
        const centrality = new CentralityService(currentGraph).analyze();
        // Os nós já vêm ordenados por betweenness no CentralityService
        const topIds = centrality.nodes.slice(0, nodesToRemovePerStep).map(n => n.nodeId);
        toRemove = availableNodes.filter(n => topIds.includes(n.id));
      }

      const toRemoveIds = toRemove.map(n => n.id);
      removedSoFar = [...removedSoFar, ...toRemoveIds];

      // Filtra os nós disponiveis
      availableNodes = availableNodes.filter(n => !toRemoveIds.includes(n.id));

      // Reconstrói o subgrafo (O jeito mais limpo é recriar o grafo unipartido filtrando as arestas originais)
      // Como é uma simulação, vamos apenas calcular o componente com os nós disponíveis.
      const largestComp = this.getLargestComponentSize(availableNodes, currentGraph);

      points.push({
        step: i,
        removedNodes: [...toRemoveIds],
        remainingNodes: availableNodes.length,
        largestComponentSize: largestComp
      });
    }

    return { type, points };
  }

  /**
   * Calcula o tamanho do maior componente conectado usando BFS
   */
  private getLargestComponentSize(nodes: NetworkNode[], fullGraph: any): number {
    if (nodes.length === 0) return 0;
    
    const visited = new Set<string>();
    const nodeIds = new Set(nodes.map(n => n.id));
    let maxSize = 0;

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        let size = 0;
        const queue = [node.id];
        visited.add(node.id);

        while (queue.length > 0) {
          const current = queue.shift()!;
          size++;

          const neighbors = fullGraph.getNeighbors(current);
          for (const neighbor of neighbors) {
            // Só caminha por vizinhos que ainda estão "vivos" na rede
            if (nodeIds.has(neighbor) && !visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push(neighbor);
            }
          }
        }
        if (size > maxSize) maxSize = size;
      }
    }

    return maxSize;
  }
}
