import { describe, expect, it } from "vitest";
import { TipoTrava } from "@/algoritmo/communs/interfaces/interfaces";
import {
  isCellLocked,
  setCellLock,
  toggleCellLock,
  toggleColumnLock,
  toggleRowLock,
} from "../locks";
import { docente, turma } from "./fixtures";

const docentes = [docente("Ana"), docente("Bruno", { ativo: false })];
const turmas = [turma("T1"), turma("T2", { ativo: false })];

describe("travas de célula (B9)", () => {
  it("alterna uma trava Cell", () => {
    const on = toggleCellLock([], "Ana", "T1");
    expect(on).toEqual([
      { id_disciplina: "T1", nome_docente: "Ana", tipo_trava: TipoTrava.Cell },
    ]);
    expect(toggleCellLock(on, "Ana", "T1")).toEqual([]);
  });

  it("coexiste com trava de outro tipo na mesma célula", () => {
    const travas = toggleColumnLock([], "T1", docentes);
    const comCell = toggleCellLock(travas, "Ana", "T1");
    expect(comCell.length).toBe(travas.length + 1);
    expect(toggleCellLock(comCell, "Ana", "T1")).toEqual(travas);
  });

  it("setCellLock é idempotente", () => {
    const on = setCellLock([], "Ana", "T1", true);
    expect(setCellLock(on, "Ana", "T1", true)).toBe(on);
    expect(setCellLock([], "Ana", "T1", false)).toEqual([]);
  });
});

describe("travas de coluna e linha (B9, B10)", () => {
  it("coluna trava todos os docentes, inclusive inativos", () => {
    const travas = toggleColumnLock([], "T1", docentes);
    expect(travas).toContainEqual({ id_disciplina: "T1", tipo_trava: TipoTrava.Column });
    expect(isCellLocked(travas, "Ana", "T1")).toBe(true);
    expect(isCellLocked(travas, "Bruno", "T1")).toBe(true);
  });

  it("destravar coluna mantém travas Cell individuais", () => {
    let travas = toggleCellLock([], "Ana", "T1");
    travas = toggleColumnLock(travas, "T1", docentes);
    travas = toggleColumnLock(travas, "T1", docentes);
    expect(travas).toEqual([
      { id_disciplina: "T1", nome_docente: "Ana", tipo_trava: TipoTrava.Cell },
    ]);
  });

  it("linha trava todas as turmas, inclusive inativas, e destravar mantém Cell", () => {
    let travas = toggleCellLock([], "Ana", "T2");
    travas = toggleRowLock(travas, "Ana", turmas);
    expect(travas).toContainEqual({ nome_docente: "Ana", tipo_trava: TipoTrava.Row });
    expect(isCellLocked(travas, "Ana", "T1")).toBe(true);
    expect(travas.filter((t) => t.tipo_trava === TipoTrava.RowCell)).toHaveLength(2);
    travas = toggleRowLock(travas, "Ana", turmas);
    expect(travas).toEqual([
      { id_disciplina: "T2", nome_docente: "Ana", tipo_trava: TipoTrava.Cell },
    ]);
  });

  it("destravar uma coluna não afeta outra coluna", () => {
    let travas = toggleColumnLock([], "T1", docentes);
    travas = toggleColumnLock(travas, "T2", docentes);
    travas = toggleColumnLock(travas, "T1", docentes);
    expect(travas.every((t) => t.id_disciplina === "T2")).toBe(true);
    expect(travas).toHaveLength(3);
  });
});
