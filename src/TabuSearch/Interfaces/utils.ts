import {
  Atribuicao,
  Celula,
  Disciplina,
  Docente,
  Formulario,
} from "@/context/Global/utils";
import Constraint from "../Classes/Constraint";
import { Movimentos } from "../TabuList/Moviment";

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
  constraint: new (...args: any[]) => Constraint;
}

export interface Statistics {
  tempoExecucao: number;
  iteracoes: number;
  interrupcao: boolean;
  avaliacaoPorIteracao: Map<number, number>;
  tempoPorIteracao: Map<number, number>;
  docentesPrioridade?: Map<number, number>; // Quantidade de docentes por prioridade (histograma)
  qtdOcorrenciasRestricoes?: Map<string, { label: string; qtd: number }[]>;
}
