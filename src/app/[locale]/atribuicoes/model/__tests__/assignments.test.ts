import { describe, expect, it } from "vitest";
import { TipoTrava } from "@/algoritmo/communs/interfaces/interfaces";
import {
  clearAssignments,
  setAssignment,
  toggleAssignment,
} from "../assignments";
import { computeConflictDocentes } from "../conflicts";
import { buildGridModel, cellKey, getCellState } from "../gridModel";
import { docente, form, turma } from "./fixtures";

describe("toggleAssignment (B6)", () => {
  it("cria a atribuição quando a turma não existe", () => {
    const r = toggleAssignment([], "Ana", "T1");
    expect(r.atribuicoes).toEqual([{ id_disciplina: "T1", docentes: ["Ana"] }]);
    expect(r.changed).toEqual({ id_disciplina: "T1", docentes: ["Ana"] });
  });

  it("permite vários docentes e remove quando já presente", () => {
    const a = toggleAssignment([], "Ana", "T1").atribuicoes;
    const b = toggleAssignment(a, "Bruno", "T1").atribuicoes;
    expect(b).toEqual([{ id_disciplina: "T1", docentes: ["Ana", "Bruno"] }]);
    const c = toggleAssignment(b, "Ana", "T1");
    expect(c.atribuicoes).toEqual([{ id_disciplina: "T1", docentes: ["Bruno"] }]);
    expect(c.changed).toEqual({ id_disciplina: "T1", docentes: ["Bruno"] });
  });

  it("não muta a entrada", () => {
    const original = [{ id_disciplina: "T1", docentes: ["Ana"] }];
    const snapshot = JSON.stringify(original);
    toggleAssignment(original, "Ana", "T1");
    toggleAssignment(original, "Bruno", "T1");
    expect(JSON.stringify(original)).toBe(snapshot);
  });

  it("setAssignment é idempotente (seguro como updater funcional, D11)", () => {
    const a = setAssignment([], "Ana", "T1", true).atribuicoes;
    const again = setAssignment(a, "Ana", "T1", true);
    expect(again.atribuicoes).toBe(a);
    expect(again.changed).toBeNull();
  });
});

describe("clearAssignments (B16, D12)", () => {
  const docentes = [docente("Ana"), docente("Bruno"), docente("Inativo", { ativo: false })];
  const turmas = [turma("T1"), turma("T2"), turma("T3", { ativo: false })];

  it("mantém só travados e inativos nas turmas ativas", () => {
    const atribuicoes = [
      { id_disciplina: "T1", docentes: ["Ana", "Bruno", "Inativo"] },
      { id_disciplina: "T2", docentes: ["Ana"] },
    ];
    const travas = [
      { id_disciplina: "T1", nome_docente: "Bruno", tipo_trava: TipoTrava.Cell },
    ];
    expect(clearAssignments(atribuicoes, travas, docentes, turmas)).toEqual([
      { id_disciplina: "T1", docentes: ["Bruno", "Inativo"] },
      { id_disciplina: "T2", docentes: [] },
    ]);
  });

  it("considera travas de linha/coluna (RowCell, ColumnCell)", () => {
    const atribuicoes = [{ id_disciplina: "T1", docentes: ["Ana", "Bruno"] }];
    const travas = [
      { id_disciplina: "T1", nome_docente: "Ana", tipo_trava: TipoTrava.RowCell },
    ];
    expect(clearAssignments(atribuicoes, travas, docentes, turmas)).toEqual([
      { id_disciplina: "T1", docentes: ["Ana"] },
    ]);
  });

  it("não remove docentes de turmas inativas (D12)", () => {
    const atribuicoes = [{ id_disciplina: "T3", docentes: ["Ana", "Bruno"] }];
    expect(clearAssignments(atribuicoes, [], docentes, turmas)).toEqual([
      { id_disciplina: "T3", docentes: ["Ana", "Bruno"] },
    ]);
  });
});

describe("conflitos (B12, D9)", () => {
  const t1 = turma("T1", { conflitos: new Set(["T2"]) });
  const t2 = turma("T2", { conflitos: new Set(["T1"]) });
  const t3 = turma("T3");

  it("detecta choque entre turmas atribuídas, independente de filtro", () => {
    const atribuicoes = [
      { id_disciplina: "T1", docentes: ["Ana"] },
      { id_disciplina: "T2", docentes: ["Ana", "Bruno"] },
      { id_disciplina: "T3", docentes: ["Bruno"] },
    ];
    expect([...computeConflictDocentes(atribuicoes, [t1, t2, t3])]).toEqual(["Ana"]);
  });

  it("ignora turmas inativas", () => {
    const atribuicoes = [
      { id_disciplina: "T1", docentes: ["Ana"] },
      { id_disciplina: "T2", docentes: ["Ana"] },
    ];
    const t2Inativa = { ...t2, ativo: false };
    expect(computeConflictDocentes(atribuicoes, [t1, t2Inativa]).size).toBe(0);
  });
});

describe("buildGridModel", () => {
  const docentes = [docente("Ana"), docente("Bruno"), docente("X", { ativo: false })];
  const turmas = [turma("T1", { carga: 2 }), turma("T2"), turma("T3", { ativo: false })];
  const formularios = [form("Ana", "T1", 3), form("Ana", "T1", 1), form("Bruno", "T2", 5), form("X", "T1", 9)];
  const atribuicoes = [
    { id_disciplina: "T1", docentes: ["Ana"] },
    { id_disciplina: "T2", docentes: [] },
  ];
  const travas = [
    { id_disciplina: "T2", nome_docente: "Bruno", tipo_trava: TipoTrava.Cell },
    { id_disciplina: "T1", tipo_trava: TipoTrava.Column },
    { nome_docente: "Ana", tipo_trava: TipoTrava.Row },
  ];
  const model = buildGridModel(docentes, turmas, formularios, atribuicoes, travas);

  it("indexa prioridade (primeiro formulário) e maxPriority só de ativos", () => {
    expect(model.priority.get(cellKey("Ana", "T1"))).toBe(3);
    expect(model.maxPriority).toBe(5);
  });

  it("estados de célula", () => {
    expect(getCellState(model, "Ana", "T1")).toBe("assigned");
    expect(getCellState(model, "Bruno", "T2")).toBe("locked");
    expect(getCellState(model, "Bruno", "T1")).toBe("empty");
    const m2 = buildGridModel(docentes, turmas, formularios, atribuicoes, [
      ...travas,
      { id_disciplina: "T1", nome_docente: "Ana", tipo_trava: TipoTrava.Cell },
    ]);
    expect(getCellState(m2, "Ana", "T1")).toBe("lockedAssigned");
    const m3 = buildGridModel(docentes, turmas, formularios, [], []);
    expect(getCellState(m3, "Bruno", "T2")).toBe("pref");
  });

  it("travas de linha/coluna, carga e estatísticas", () => {
    expect(model.rowLocked.has("Ana")).toBe(true);
    expect(model.colLocked.has("T1")).toBe(true);
    expect(model.cargaByDocente.get("Ana")).toBe(2);
    expect(model.stats).toEqual({
      turmasSemDocente: 1,
      docentesSemAtribuicao: 1,
      conflitos: 0,
      travas: 1,
    });
  });
});
