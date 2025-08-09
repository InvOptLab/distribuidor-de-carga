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
