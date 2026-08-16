import { Graph } from "../core/Graph";
import { CentralityReport, CentralityMetric, NetworkNode } from "../domain/types";

export class CentralityService {
  private graph: Graph;

  constructor(graph: Graph) {
    this.graph = graph;
  }

  public analyze(): CentralityReport {
    const nodes = this.graph.getAllNodes();
    
    // Calculate degrees
    const degrees = new Map<string, number>();
    nodes.forEach(n => degrees.set(n.id, this.graph.getDegree(n.id)));
    
    // Calculate Betweenness and Closeness
    const betweenness = this.calculateBetweenness(nodes);
    const closeness = this.calculateCloseness(nodes);

    const metrics: CentralityMetric[] = nodes.map(n => ({
      nodeId: n.id,
      label: n.label,
      type: n.type,
      degree: degrees.get(n.id) || 0,
      betweenness: betweenness.get(n.id) || 0,
      closeness: closeness.get(n.id) || 0,
    }));

    // Sort by betweenness descending
    metrics.sort((a, b) => b.betweenness - a.betweenness);

    return {
      nodes: metrics,
      assortativity: this.calculateAssortativity(degrees),
    };
  }

  private calculateBetweenness(nodes: NetworkNode[]): Map<string, number> {
    const cb = new Map<string, number>();
    nodes.forEach(n => cb.set(n.id, 0));

    // Brandes' Algorithm for unweighted graphs
    nodes.forEach(s => {
      const S: string[] = [];
      const P = new Map<string, string[]>();
      const sigma = new Map<string, number>();
      const d = new Map<string, number>();
      
      nodes.forEach(w => {
        P.set(w.id, []);
        sigma.set(w.id, 0);
        d.set(w.id, -1);
      });

      sigma.set(s.id, 1);
      d.set(s.id, 0);
      
      const Q: string[] = [s.id];

      while (Q.length > 0) {
        const v = Q.shift()!;
        S.push(v);
        
        const neighbors = this.graph.getNeighbors(v);
        neighbors.forEach(w => {
          if (d.get(w) === -1) {
            d.set(w, d.get(v)! + 1);
            Q.push(w);
          }
          if (d.get(w) === d.get(v)! + 1) {
            sigma.set(w, sigma.get(w)! + sigma.get(v)!);
            P.get(w)!.push(v);
          }
        });
      }

      const delta = new Map<string, number>();
      nodes.forEach(v => delta.set(v.id, 0));

      while (S.length > 0) {
        const w = S.pop()!;
        P.get(w)!.forEach(v => {
          delta.set(v, delta.get(v)! + (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!));
        });
        if (w !== s.id) {
          cb.set(w, cb.get(w)! + delta.get(w)!);
        }
      }
    });

    // Normalize for undirected graph
    nodes.forEach(n => cb.set(n.id, cb.get(n.id)! / 2));
    
    return cb;
  }

  private calculateCloseness(nodes: NetworkNode[]): Map<string, number> {
    const closeness = new Map<string, number>();
    
    nodes.forEach(s => {
      const distances = new Map<string, number>();
      nodes.forEach(n => distances.set(n.id, -1));
      distances.set(s.id, 0);
      
      const Q: string[] = [s.id];
      while(Q.length > 0) {
        const v = Q.shift()!;
        const d = distances.get(v)!;
        this.graph.getNeighbors(v).forEach(w => {
          if (distances.get(w) === -1) {
            distances.set(w, d + 1);
            Q.push(w);
          }
        });
      }
      
      let sumDist = 0;
      let reachable = 0;
      distances.forEach((d) => {
        if (d > 0) {
          sumDist += d;
          reachable++;
        }
      });
      
      if (sumDist > 0) {
        closeness.set(s.id, reachable / sumDist);
      } else {
        closeness.set(s.id, 0);
      }
    });

    return closeness;
  }

  private calculateAssortativity(degrees: Map<string, number>): number {
    let sumEdges = 0;
    let sumJk = 0;
    let sumJPlusK = 0;
    let sumJ2PlusK2 = 0;

    this.graph.edges.forEach(e => {
      const j = degrees.get(e.sourceId) || 0;
      const k = degrees.get(e.targetId) || 0;
      sumEdges++;
      sumJk += j * k;
      sumJPlusK += (j + k);
      sumJ2PlusK2 += (j * j + k * k);
    });

    if (sumEdges === 0) return 0;
    
    const num = (sumJk / sumEdges) - Math.pow(sumJPlusK / (2 * sumEdges), 2);
    const den = (sumJ2PlusK2 / (2 * sumEdges)) - Math.pow(sumJPlusK / (2 * sumEdges), 2);
    
    return den === 0 ? 0 : num / den;
  }
}
