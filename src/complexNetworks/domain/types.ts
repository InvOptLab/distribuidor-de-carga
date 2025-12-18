import { Docente, Disciplina } from "@/algoritmo/communs/interfaces/interfaces";

export enum NodeType {
  DOCENTE = "DOCENTE",
  TURMA = "TURMA",
}

export interface NetworkNode {
  id: string;
  label: string;
  type: NodeType;
  originalData: Docente | Disciplina;
}

export interface NetworkEdge {
  sourceId: string; // ID do Docente
  targetId: string; // ID da Turma
  weight: number; // Pode representar a prioridade (ex: 1 = Alta, 2 = Média)
}

export interface RobustnessReport {
  totalDocentes: number;
  totalTurmas: number;
  networkDensity: number; // Conectividade geral
  orphanClasses: string[]; // Turmas sem nenhum docente possível
  criticalTeachers: CriticalTeacherMetric[]; // Docentes cuja saída gera órfãos
  leafNodes: string[]; // Turmas com apenas 1 opção de docente (risco alto)
  communities: CommunityMetric[];
  nodeCommunities: Map<string, string>; // Mapa rápido: NodeID -> CommunityID
}

export interface CriticalTeacherMetric {
  docenteId: string;
  docenteName: string;
  impactScore: number; // Quantas turmas ficam órfãs se ele sair
  affectedClasses: string[]; // IDs das turmas afetadas
}

export interface CommunityMetric {
  id: string;
  color: string;
  size: number;
  label?: string; // Ex: "Grupo da Matemática" (pode ser inferido depois)
  nodes: string[]; // IDs dos membros
}

export interface SimulationResult {
  sourceTeacherId: string;
  targetClassId: string;
  isSafe: boolean; // Se true, o impacto é baixo/nulo
  impactScore: number; // Um score de 0 a 100 da gravidade
  affectedNodes: AffectedNode[]; // Lista detalhada dos prejudicados
}

export interface AffectedNode {
  id: string;
  label: string;
  previousDegree: number;
  newDegree: number;
  status: "ORPHAN" | "CRITICAL" | "SAFE"; // ORPHAN = 0 opções, CRITICAL = 1 opção
}
