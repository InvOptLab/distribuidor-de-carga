export interface FilterRule {
  id: string;
  field: string; // Display name
  fieldKey: string; // Actual field key
  type:
    | "exact"
    | "contains"
    | "chips"
    | "boolean"
    | "timeRange"
    | "number"
    | "select";
  value: any;
}

export interface DocenteFilters {
  search: string;
  rules: FilterRule[];
}

export interface DisciplinaFilters {
  search: string;
  rules: FilterRule[];
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
