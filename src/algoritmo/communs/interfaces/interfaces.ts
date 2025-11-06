import Algorithm from "@/algoritmo/abstractions/Algorithm";
import Constraint from "../../abstractions/Constraint";
import { Statistics } from "@/algoritmo/classes/Statistics";

export enum MovimentType {
  Add /** Movimento de adicionar um docente */,
  Drop /** Movimento de remover */,
}

export interface Movimentos {
  add: Movimento[];
  drop: Movimento[];
}

export interface Movimento {
  turmaId: string;
  docente: string;
}

export interface Context {
  atribuicoes: Atribuicao[];
  docentes: Docente[];
  turmas: Disciplina[];
  travas: Celula[];
  prioridades: Formulario[];
  maiorPrioridade?: number;
}

export interface Vizinho {
  atribuicoes: Atribuicao[];
  movimentos?: Movimentos;
  isTabu?: boolean;
  avaliacao?: number;
}

export interface ConstraintInterface {
  name: string;
  tipo: "Hard" | "Soft";
  penalidade: string;
  descricao: string;
  constraint: new (...args: any[]) => Constraint<any>;
}

export interface Estatisticas {
  tempoExecucao: number;
  iteracoes: number;
  interrupcao: boolean;
  avaliacaoPorIteracao: Map<number, number>;
  tempoPorIteracao: Map<number, number>;
  docentesPrioridade?: Map<number, number>; // Quantidade de docentes por prioridade (histograma)
  qtdOcorrenciasRestricoes?: Map<string, { label: string; qtd: number }[]>;
}

/** Interfaces vindas do Sistema mas que posterioemente devem vir do algoritmo */
export interface Docente {
  nome: string;
  saldo?: number;
  ativo: boolean;
  formularios: Map<string, number>; // id_disciplina, prioridade
  trava: boolean; //flag trava: boolean, que será alterada quando uma linha inteira for travada.
  // Pensar se faz sentido colocar um Set com as Disciplinas que o docente foi alocado
  comentario?: string;
  agrupar?: string; //"Indiferente" | "Agrupar" | "Espalhar" | "";
}

export interface DisciplinaETL {
  codigo: string;
  turma: number;
  nome: string;
  horario: string;
  cursos: string;
  ementa: string;
  id: string;
  nivel: string;
  prioridade: number;
  noturna: boolean;
  ingles: boolean;
  docentes?: string[];
  ativo: boolean;
  horarios?: Horario[];
  grupo?: string;
  carga?: number;
}

export interface Disciplina {
  id: string;
  codigo: string;
  turma: number;
  nome: string;
  horario: string;
  horarios: Horario[];
  cursos: string;
  ementa: string;
  nivel: string;
  prioridade: number;
  noturna: boolean;
  ingles: boolean;
  docentes?: string[];
  ativo: boolean;
  conflitos: Set<string>; // Ids das disciplinas que apresentam choque de horário
  trava: boolean; // flag trava: boolean, que será alterada quando uma coluna inteira for travada.
  // Pensar se faz sentido colocar um Set com os Docentes alocados para a Disciplina
  grupo: string; // Caso não tenha deve ser ums string vazia
  carga?: number;
}

export interface Atribuicao {
  id_disciplina: string;
  docentes: string[];
}

export interface Formulario {
  id_disciplina: string;
  nome_docente: string;
  prioridade: number;
}

export enum TipoTrava {
  NotTrava, //
  Column,
  Row,
  Cell,
  ColumnCell, // Identificar se, após a coluna ser destravada, a célula deve continuar travada
  RowCell, // Identificar se, após a linha ser destravada, a célula deve continuar travada
}

export interface Celula {
  id_disciplina?: string;
  nome_docente?: string;
  tipo_trava?: TipoTrava;
  trava?: boolean;
}

// Ver se o melhor lugar para essa interface é aqui
export interface Horario {
  dia: "Seg." | "Ter." | "Qua." | "Qui." | "Sex." | "Sáb." | "";
  inicio: string;
  fim: string;
}

export interface Solucao {
  atribuicoes: Atribuicao[];
  avaliacao?: number;
  idHistorico?: string;
  estatisticas?: Statistics; //Estatisticas;
  isTabu?: boolean;
  algorithm?: Algorithm<any>;
}

/**
 * Adição de parâmetros genéricos nas restrições
 */
/**
 * Define a estrutura de um único parâmetro para uma restrição.
 * @template T - O tipo do valor do parâmetro (ex: number, string, boolean).
 */
export interface IParameter<T> {
  value: T;
  name: string;
  description: string;
}

/**
 * Define a forma base para o objeto de parâmetros de uma restrição.
 * É um dicionário de parâmetros.
 */
export type ConstraintParams = {
  [key: string]: IParameter<any>;
};

export type ObjectiveComponentParams = {
  [key: string]: IParameter<any>;
};

export // Tipo do Callback: recebe um objeto parcial
type EstatisticasCallback = (statsAtualizadas: Partial<Estatisticas>) => void;

// Interface para as opções de monitoramento
export interface OpcoesMonitoramento {
  /**
   * Um Map onde a chave é o campo a ser monitorado
   * e o valor é a frequência (a cada N iterações).
   * Ex: 'iteracoes' => 1 (a cada iteração)
   * 'avaliacaoPorIteracao' => 10 (a cada 10 iterações)
   */
  campos: Map<keyof Estatisticas, number>;

  /** A função que será chamada com os dados atualizados. */
  onUpdate: EstatisticasCallback;
}

/**
 * Interface auxiliar para representar a estrutura da solução do HiGHS
 * para uma única variável.
 */
export interface HighsVariableSolution {
  Index: number;
  Lower: number | null;
  Upper: number | null;
  Primal: number; // Este é o valor que nos interessa
  Type: string;
  Name: string;
}

/**
 * Tipo para representar o objeto completo da solução do HiGHS.
 */
export type HighsSolution = {
  [variableName: string]: HighsVariableSolution;
};

/**
 * Define o tipo de uma variável no modelo (coluna).
 */
export type HighsVariableType = "Continuous" | "Integer" | "Binary";

/**
 * Representa o estado de uma única coluna (variável) no resultado do solver.
 */
export interface HighsColumn {
  Index: number;
  Lower: number;
  /** O limite superior pode ser nulo, representando infinito. */
  Upper: number | null;
  Type: HighsVariableType;
  Name: string;
  /** Opcional: O valor da variável na solução (se houver). */
  Primal?: number;
}

/**
 * Representa o estado de uma única linha (restrição) no resultado do solver.
 */
export interface HighsRow {
  Index: number;
  /** O limite inferior pode ser nulo, representando -infinito. */
  Lower: number | null;
  /** O limite superior pode ser nulo, representando +infinito. */
  Upper: number | null;
  Name: string;
  /** Opcional: O valor da atividade da linha (LHS) na solução (se houver). */
  Primal?: number;
}

/**
 * Define o status da solução retornado pelo solver.
 * (Você pode adicionar mais status conforme a documentação da biblioteca).
 */
export type HighsSolverStatus =
  | "Not set"
  | "Load error"
  | "Model error"
  | "Presolve error"
  | "Solve error"
  | "Postsolve error"
  | "Empty"
  | "Infeasible"
  | "Primal infeasible or unbounded"
  | "Optimal"
  | "Feasible"
  | "Primal feasible"
  | "Dual feasible"
  | "Bounded"
  | "Unbounded"
  | "Time limit"
  | "Iteration limit"
  | "Unknown";

/**
 * Interface principal para o objeto de resultado retornado pela biblioteca Highs.
 */
export interface HighsSolverResult {
  Status: HighsSolverStatus;

  /** * Um objeto onde cada chave é o nome de uma variável
   * e o valor são os detalhes dessa coluna.
   */
  Columns: Record<string, HighsColumn>;

  /** Uma lista dos detalhes de cada linha (restrição). */
  Rows: HighsRow[];

  /** O valor final da função objetivo (pode ser nulo se não houver solução). */
  ObjectiveValue: number | null;
}
