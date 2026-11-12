import { describe, expect, it } from "vitest";
import {
  applyDocenteFilters,
  applyTurmaFilters,
  matchesRule,
  timeToMinutes,
} from "../filters";
import type { FilterRule } from "../../types/types";
import { docente, turma } from "./fixtures";

const rule = (r: Partial<FilterRule>): FilterRule => ({
  id: "r",
  field: "f",
  fieldKey: "nome",
  type: "exact",
  value: "",
  ...r,
});

describe("matchesRule", () => {
  it("exact / contains / boolean / number", () => {
    expect(matchesRule("Ana", rule({ type: "exact", value: "Ana" }))).toBe(
      true,
    );
    expect(matchesRule("Ana", rule({ type: "exact", value: "ana" }))).toBe(
      false,
    );
    expect(
      matchesRule("Ana Silva", rule({ type: "contains", value: "SIL" })),
    ).toBe(true);
    expect(
      matchesRule(undefined, rule({ type: "contains", value: "x" })),
    ).toBeFalsy();
    expect(matchesRule(true, rule({ type: "boolean", value: true }))).toBe(
      true,
    );
    expect(matchesRule(2, rule({ type: "number", value: 2 }))).toBe(true);
  });

  it("chips simples e por dia da semana", () => {
    expect(
      matchesRule("Grad", rule({ type: "chips", value: ["Grad", "Pós"] })),
    ).toBe(true);
    const horarios = [{ dia: "Seg.", inicio: "08:00", fim: "10:00" }];
    expect(
      matchesRule(
        horarios,
        rule({ type: "chips", fieldKey: "horarios_dias", value: ["Seg."] }),
      ),
    ).toBe(true);
    expect(
      matchesRule(
        horarios,
        rule({ type: "chips", fieldKey: "horarios_dias", value: ["Ter."] }),
      ),
    ).toBe(false);
    expect(
      matchesRule(
        null,
        rule({ type: "chips", fieldKey: "horarios_dias", value: ["Seg."] }),
      ),
    ).toBe(false);
  });

  it("timeRange usa sobreposição e limites abertos", () => {
    const horarios = [{ dia: "Seg.", inicio: "08:00", fim: "10:00" }];
    const tr = (start: string | null, end: string | null) =>
      rule({
        type: "timeRange",
        fieldKey: "horarios_tempo",
        value: { start, end },
      });
    expect(matchesRule(horarios, tr("09:00", "11:00"))).toBe(true);
    expect(matchesRule(horarios, tr("10:00", "12:00"))).toBe(false);
    expect(matchesRule(horarios, tr(null, "08:30"))).toBe(true);
    expect(matchesRule(horarios, tr("10:30", null))).toBe(false);
  });

  it("timeToMinutes", () => {
    expect(timeToMinutes("01:30")).toBe(90);
    expect(timeToMinutes("")).toBe(0);
  });
});

describe("applyDocenteFilters", () => {
  const docentes = [
    docente("Ana Silva", { agrupar: "Agrupar" }),
    docente("Bruno"),
    docente("Carla", { ativo: false }),
  ];

  it("exclui inativos e aplica a busca por nome", () => {
    expect(
      applyDocenteFilters(docentes, { search: "", rules: [] }, []).map(
        (d) => d.nome,
      ),
    ).toEqual(["Ana Silva", "Bruno"]);
    expect(
      applyDocenteFilters(docentes, { search: "sil", rules: [] }, []).map(
        (d) => d.nome,
      ),
    ).toEqual(["Ana Silva"]);
  });

  it("semAtribuicao reflete as atribuições recebidas", () => {
    const filters = {
      search: "",
      rules: [
        rule({ fieldKey: "semAtribuicao", type: "boolean", value: true }),
      ],
    };
    expect(
      applyDocenteFilters(docentes, filters, []).map((d) => d.nome),
    ).toEqual(["Ana Silva", "Bruno"]);
    const atribuicoes = [{ id_disciplina: "T1", docentes: ["Bruno"] }];
    expect(
      applyDocenteFilters(docentes, filters, atribuicoes).map((d) => d.nome),
    ).toEqual(["Ana Silva"]);
  });

  it("agrupar compara com o valor bruto do dado", () => {
    const filters = {
      search: "",
      rules: [rule({ fieldKey: "agrupar", type: "exact", value: "Agrupar" })],
    };
    expect(
      applyDocenteFilters(docentes, filters, []).map((d) => d.nome),
    ).toEqual(["Ana Silva"]);
  });
});

describe("applyTurmaFilters com turma espelho", () => {
  const turmas = [
    turma("SME0202,1", {
      codigo: "SME0202",
      nome: "Métodos Numéricos em Equações Diferenciais",
      espelho: {
        codigo: "SME5784",
        id: "SME5784,1",
        nome: "Métodos Numéricos para Equações Diferenciais",
      },
    }),
    turma("SME0300,2", { codigo: "SME0300", nome: "Cálculo Numérico" }),
  ];

  it("busca pelo código, id ou nome da pós encontra a graduação", () => {
    const f = (search: string) =>
      applyTurmaFilters(turmas, { search, rules: [] }, []).map((d) => d.id);
    expect(f("sme5784")).toEqual(["SME0202,1"]);
    expect(f("SME5784,1")).toEqual(["SME0202,1"]);
    expect(f("para equações")).toEqual(["SME0202,1"]);
    expect(f("numérico")).toEqual(["SME0202,1", "SME0300,2"]);
  });

  it("regra de texto em código/nome também casa com o espelho", () => {
    const f = (fieldKey: string, value: string) =>
      applyTurmaFilters(
        turmas,
        { search: "", rules: [rule({ fieldKey, type: "contains", value })] },
        [],
      ).map((d) => d.id);
    expect(f("codigo", "SME5784")).toEqual(["SME0202,1"]);
    expect(f("nome", "para Equações")).toEqual(["SME0202,1"]);
    expect(f("codigo", "SME0300")).toEqual(["SME0300,2"]);
    // Outros campos não olham o espelho
    expect(f("cursos", "SME5784")).toEqual([]);
  });
});

describe("applyTurmaFilters", () => {
  const turmas = [
    turma("MAT101-1", { nome: "Cálculo I", noturna: true }),
    turma("MAT102-1", { nome: "Álgebra" }),
    turma("MAT103-1", { ativo: false }),
  ];

  it("busca por nome, código ou id e ignora inativas", () => {
    const f = (search: string) =>
      applyTurmaFilters(turmas, { search, rules: [] }, []).map((d) => d.id);
    expect(f("")).toEqual(["MAT101-1", "MAT102-1"]);
    expect(f("cálculo")).toEqual(["MAT101-1"]);
    expect(f("mat102")).toEqual(["MAT102-1"]);
    expect(f("MAT103")).toEqual([]);
  });

  it("semDocente reflete as atribuições recebidas", () => {
    const filters = {
      search: "",
      rules: [rule({ fieldKey: "semDocente", type: "boolean", value: true })],
    };
    const atribuicoes = [
      { id_disciplina: "MAT101-1", docentes: ["Ana"] },
      { id_disciplina: "MAT102-1", docentes: [] },
    ];
    expect(
      applyTurmaFilters(turmas, filters, atribuicoes).map((d) => d.id),
    ).toEqual(["MAT102-1"]);
  });

  it("regras booleanas de campo", () => {
    const filters = {
      search: "",
      rules: [rule({ fieldKey: "noturna", type: "boolean", value: true })],
    };
    expect(applyTurmaFilters(turmas, filters, []).map((d) => d.id)).toEqual([
      "MAT101-1",
    ]);
  });
});
