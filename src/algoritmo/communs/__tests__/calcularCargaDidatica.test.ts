import { describe, expect, it } from "vitest";
import { calcularCargaDidatica } from "../utils";
import {
  docente,
  turma,
} from "@/app/[locale]/atribuicoes/model/__tests__/fixtures";

describe("calcularCargaDidatica", () => {
  const ana = docente("Ana");

  it("soma a carga das turmas atribuídas", () => {
    const turmas = [turma("T1", { carga: 1.5 }), turma("T2", { carga: 1 })];
    const atribuicoes = [
      { id_disciplina: "T1", docentes: ["Ana"] },
      { id_disciplina: "T2", docentes: ["Ana", "Bia"] },
    ];
    expect(calcularCargaDidatica(ana, atribuicoes, turmas)).toBe(2.5);
  });

  it("ignora atribuições de turmas fora da lista (ex.: desativadas)", () => {
    // Antes: TypeError "reading 'carga'" e a tela de Blocos quebrava
    const ativas = [turma("T1", { carga: 1 })];
    const atribuicoes = [
      { id_disciplina: "T1", docentes: ["Ana"] },
      { id_disciplina: "T2-inativa", docentes: ["Ana"] },
    ];
    expect(calcularCargaDidatica(ana, atribuicoes, ativas)).toBe(1);
  });

  it("turma sem carga conta como zero", () => {
    const turmas = [turma("T1")];
    const atribuicoes = [{ id_disciplina: "T1", docentes: ["Ana"] }];
    expect(calcularCargaDidatica(ana, atribuicoes, turmas)).toBe(0);
  });
});
