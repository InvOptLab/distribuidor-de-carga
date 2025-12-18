import { Docente, Disciplina } from "@/algoritmo/communs/interfaces/interfaces";
import { NetworkNode, NetworkEdge, NodeType } from "../domain/types";

export class BipartiteGraph {
  private nodes: Map<string, NetworkNode> = new Map();
  private adjacencyList: Map<string, string[]> = new Map(); // NodeID -> NeighborsIDs
  private edges: NetworkEdge[] = [];

  constructor(docentes: Docente[], turmas: Disciplina[]) {
    this.buildGraph(docentes, turmas);
  }

  private buildGraph(docentes: Docente[], turmas: Disciplina[]) {
    // 1. Adicionar Nós de Turmas
    turmas.forEach((t) => {
      this.addNode({
        id: t.id,
        label: `${t.codigo} - ${t.nome} (T${t.turma})`,
        type: NodeType.TURMA,
        originalData: t,
      });
    });

    // 2. Adicionar Nós de Docentes e Arestas
    docentes.forEach((d) => {
      // Usamos o nome como ID único se necessário, ou geramos um hash.
      // Assumindo que o nome é único baseado nas interfaces anteriores,
      // mas idealmente deveríamos ter um ID. Usaremos o nome por enquanto.
      const docenteId = d.nome;

      this.addNode({
        id: docenteId,
        label: d.nome,
        type: NodeType.DOCENTE,
        originalData: d,
      });

      // Criar arestas baseadas nos formulários de preferência
      d.formularios.forEach((prioridade, disciplinaId) => {
        // Só cria aresta se a disciplina existir no conjunto atual
        if (this.nodes.has(disciplinaId)) {
          this.addEdge({
            sourceId: docenteId,
            targetId: disciplinaId,
            weight: prioridade,
          });
        }
      });
    });
  }

  private addNode(node: NetworkNode) {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

  private addEdge(edge: NetworkEdge) {
    this.edges.push(edge);

    // Grafo não direcionado para fins de navegação (Docente <-> Turma)
    this.adjacencyList.get(edge.sourceId)?.push(edge.targetId);
    this.adjacencyList.get(edge.targetId)?.push(edge.sourceId);
  }

  /**
   * Retorna os vizinhos de um nó.
   * Se for Docente, retorna as Turmas possíveis.
   * Se for Turma, retorna os Docentes aptos.
   */
  public getNeighbors(nodeId: string): string[] {
    return this.adjacencyList.get(nodeId) || [];
  }

  public getNode(id: string): NetworkNode | undefined {
    return this.nodes.get(id);
  }

  public getAllDocentes(): NetworkNode[] {
    return Array.from(this.nodes.values()).filter(
      (n) => n.type === NodeType.DOCENTE
    );
  }

  public getAllTurmas(): NetworkNode[] {
    return Array.from(this.nodes.values()).filter(
      (n) => n.type === NodeType.TURMA
    );
  }

  public getDegree(nodeId: string): number {
    return this.getNeighbors(nodeId).length;
  }

  public getEdgeCount(): number {
    return this.edges.length;
  }
}
