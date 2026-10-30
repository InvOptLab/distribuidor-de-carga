import type {
  Atribuicao,
  Disciplina,
  Docente,
} from "@/algoritmo/communs/interfaces/interfaces";
import type {
  DisciplinaFilters,
  DocenteFilters,
  FilterRule,
} from "../types/types";

/**
 * Converte uma string de horário (hh:mm) para minutos.
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Verifica se um valor satisfaz uma regra de filtro.
 */
export function matchesRule(value: any, rule: FilterRule): boolean {
  switch (rule.type) {
    case "exact":
      return value === rule.value;
    case "contains":
      return value
        ?.toString()
        .toLowerCase()
        .includes(rule.value.toLowerCase());
    case "chips":
      if (rule.fieldKey === "horarios_dias") {
        // Basta um dos dias selecionados coincidir
        if (!Array.isArray(value)) return false;
        return value.some((horario) => rule.value.includes(horario?.dia));
      }
      return rule.value.includes(value);
    case "boolean":
      return value === rule.value;
    case "timeRange":
      if (rule.fieldKey === "horarios_tempo" && Array.isArray(value)) {
        const ruleStartMinutes = rule.value.start
          ? timeToMinutes(rule.value.start)
          : 0; // 00:00 se não especificado
        const ruleEndMinutes = rule.value.end
          ? timeToMinutes(rule.value.end)
          : 24 * 60; // 24:00 se não especificado

        // Sobreposição: o horário começa antes do fim da regra E termina depois do início
        return value.some((horario) => {
          if (!horario) return false;
          const horarioStartMinutes = timeToMinutes(horario.inicio);
          const horarioEndMinutes = timeToMinutes(horario.fim);
          return (
            horarioStartMinutes < ruleEndMinutes &&
            horarioEndMinutes > ruleStartMinutes
          );
        });
      }
      return false;
    case "number":
      return value === rule.value;
    default:
      return true;
  }
}

/**
 * Docentes ativos que passam na busca por nome e nas regras avançadas (B1, B19).
 */
export function applyDocenteFilters(
  docentes: Docente[],
  filters: DocenteFilters,
  atribuicoes: Atribuicao[],
  conflictDocentes: Set<string> = new Set(),
): Docente[] {
  const needsAssigned = filters.rules.some(
    (rule) => rule.fieldKey === "semAtribuicao",
  );
  const docentesComAtribuicao = new Set<string>();
  if (needsAssigned) {
    for (const atribuicao of atribuicoes) {
      for (const nome of atribuicao.docentes) docentesComAtribuicao.add(nome);
    }
  }
  const search = filters.search?.toLowerCase();

  return docentes.filter((docente) => {
    if (!docente.ativo) return false;

    if (search && !docente.nome.toLowerCase().includes(search)) return false;

    for (const rule of filters.rules) {
      if (rule.fieldKey === "semAtribuicao") {
        const isSemAtribuicao = !docentesComAtribuicao.has(docente.nome);
        if (isSemAtribuicao !== rule.value) return false;
        continue;
      }
      if (rule.fieldKey === "comConflito") {
        if (conflictDocentes.has(docente.nome) !== rule.value) return false;
        continue;
      }

      const value = (docente as any)[rule.fieldKey];
      if (!matchesRule(value, rule)) return false;
    }

    return true;
  });
}

/**
 * Turmas ativas que passam na busca (nome, código ou id) e nas regras avançadas (B1, B19).
 */
export function applyTurmaFilters(
  disciplinas: Disciplina[],
  filters: DisciplinaFilters,
  atribuicoes: Atribuicao[],
): Disciplina[] {
  const needsAssigned = filters.rules.some(
    (rule) => rule.fieldKey === "semDocente",
  );
  const turmasComDocente = new Set<string>();
  if (needsAssigned) {
    for (const atribuicao of atribuicoes) {
      if (atribuicao.docentes.length > 0) {
        turmasComDocente.add(atribuicao.id_disciplina);
      }
    }
  }
  const search = filters.search?.toLowerCase();

  return disciplinas.filter((disciplina) => {
    if (!disciplina.ativo) return false;

    if (
      search &&
      !disciplina.nome.toLowerCase().includes(search) &&
      !disciplina.codigo.toLowerCase().includes(search) &&
      !disciplina.id.toLowerCase().includes(search)
    ) {
      return false;
    }

    for (const rule of filters.rules) {
      if (rule.fieldKey === "semDocente") {
        const isSemDocente = !turmasComDocente.has(disciplina.id);
        if (isSemDocente !== rule.value) return false;
        continue;
      }

      const fieldKey =
        rule.fieldKey === "horarios_tempo" || rule.fieldKey === "horarios_dias"
          ? "horarios"
          : rule.fieldKey;
      const value = (disciplina as any)[fieldKey];
      if (!matchesRule(value, rule)) return false;
    }

    return true;
  });
}

export function hasActiveFilters(
  docenteFilters: DocenteFilters,
  disciplinaFilters: DisciplinaFilters,
): boolean {
  return Boolean(
    docenteFilters.search ||
      docenteFilters.rules.length > 0 ||
      disciplinaFilters.search ||
      disciplinaFilters.rules.length > 0,
  );
}

/** Filtros rápidos (U9): regras booleanas com id fixo, que a barra liga e desliga. */
export function quickRuleId(fieldKey: string) {
  return `quick:${fieldKey}`;
}

export function hasQuickRule(
  filters: DocenteFilters | DisciplinaFilters,
  fieldKey: string,
): boolean {
  return filters.rules.some(
    (rule) => rule.fieldKey === fieldKey && rule.value === true,
  );
}

export function toggleQuickRule<T extends DocenteFilters | DisciplinaFilters>(
  filters: T,
  fieldKey: string,
  label: string,
): T {
  if (hasQuickRule(filters, fieldKey)) {
    return {
      ...filters,
      rules: filters.rules.filter(
        (rule) => !(rule.fieldKey === fieldKey && rule.value === true),
      ),
    };
  }
  return {
    ...filters,
    rules: [
      ...filters.rules,
      {
        id: quickRuleId(fieldKey),
        field: label,
        fieldKey,
        type: "boolean",
        value: true,
      },
    ],
  };
}
