import { NetworkNode, NetworkEdge } from "../domain/types";

export class Graph {
  public nodes: Map<string, NetworkNode> = new Map();
  public adjacencyList: Map<string, string[]> = new Map();
  public edges: NetworkEdge[] = [];

  public addNode(node: NetworkNode) {
    if (!this.nodes.has(node.id)) {
      this.nodes.set(node.id, node);
      this.adjacencyList.set(node.id, []);
    }
  }

  public addEdge(edge: NetworkEdge) {
    this.edges.push(edge);
    this.adjacencyList.get(edge.sourceId)?.push(edge.targetId);
    this.adjacencyList.get(edge.targetId)?.push(edge.sourceId);
  }

  public getNeighbors(nodeId: string): string[] {
    return this.adjacencyList.get(nodeId) || [];
  }

  public getNode(id: string): NetworkNode | undefined {
    return this.nodes.get(id);
  }

  public getAllNodes(): NetworkNode[] {
    return Array.from(this.nodes.values());
  }

  public getDegree(nodeId: string): number {
    return this.getNeighbors(nodeId).length;
  }
}
