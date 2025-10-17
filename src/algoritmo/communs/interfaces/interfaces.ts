import Constraint from "../../abstractions/Constraint";

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
  movimentos: Movimentos; // Depois será melhor acertar as tipagens
  isTabu: boolean;
  avaliacao?: number;
}

export interface ConstraintInterface {
  name: string;
  tipo: "Hard" | "Soft";
  penalidade: string;
  descricao: string;
  constraint: new (...args: any[]) => Constraint<any>;
}

// export interface Statistics {
//   tempoExecucao: number;
//   iteracoes: number;
//   interrupcao: boolean;
//   avaliacaoPorIteracao: Map<number, number>;
//   tempoPorIteracao: Map<number, number>;
//   docentesPrioridade?: Map<number, number>;
//   qtdOcorrenciasRestricoes?: Map<string, { label: string; qtd: number }[]>;
//   ultimaVizinhanca: Vizinho[];
//   tempoPorIteracaoTabu?: Map<number, number>;
// }

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
  // COLOCAR A PRIORIDADE AQUI
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
  dia: "Seg." | "Ter." | "Qua." | "Qui." | "Sex." | "Sáb.";
  inicio: string;
  fim: string;
}

export interface Solucao {
  atribuicoes: Atribuicao[];
  avaliacao?: number;
  idHistorico?: string;
  estatisticas?: Estatisticas;
  isTabu?: boolean;
  algorithm?: Algorithm;
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
