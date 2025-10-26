import { Disciplina } from "@/algoritmo/communs/interfaces/interfaces";

/**
 * Tipo de coluna na planilha
 */
export type ColumnType =
  | "id"
  | "codigo"
  | "turma"
  | "nome"
  | "horario"
  | "horarios"
  | "cursos"
  | "ementa"
  | "nivel"
  | "prioridade"
  | "noturna"
  | "ingles"
  | "docentes"
  | "ativo"
  | "grupo"
  | "carga";

/**
 * Configuração de uma coluna da planilha
 */
export interface ColumnConfig {
  id: string;
  label: string;
  type: ColumnType;
  visible: boolean;
  order: number;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  horarioIndex?: number; // Para colunas de horário dinâmicas
}

/**
 * Tipo de ordenação
 */
export type SortDirection = "asc" | "desc" | null;

/**
 * Estado de ordenação
 */
export interface SortState {
  columnId: string;
  direction: SortDirection;
}

/**
 * Estado de filtros
 */
export interface FilterState {
  [columnId: string]: string;
}

/**
 * Obtém o valor de uma célula baseado no tipo de coluna
 */
export function getCellValue(
  disciplina: Disciplina,
  column: ColumnConfig
): any {
  if (column.type === "horarios" && column.horarioIndex !== undefined) {
    return disciplina.horarios[column.horarioIndex] || null;
  }
  return disciplina[column.type as keyof Disciplina];
}

/**
 * Formata o valor de uma célula para exibição
 */
export function formatCellValue(value: any, column: ColumnConfig): string {
  if (value === null || value === undefined) {
    return "";
  }

  switch (column.type) {
    case "horarios":
      if (typeof value === "object" && value.dia) {
        return `${value.dia} ${value.inicio}-${value.fim}`;
      }
      return "";
    case "noturna":
    case "ingles":
    case "ativo":
      return value ? "Sim" : "Não";
    case "docentes":
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      return "";
    default:
      return String(value);
  }
}
