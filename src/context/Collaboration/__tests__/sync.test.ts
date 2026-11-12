import { describe, expect, it } from "vitest";
import { applyAssignmentDelta, diffDocentes, isEmptyDelta } from "../sync";

describe("diffDocentes", () => {
  it("calcula quem entrou e quem saiu", () => {
    expect(diffDocentes("T1", ["Ana", "Bia"], ["Bia", "Caio"])).toEqual({
      id_disciplina: "T1",
      add: ["Caio"],
      remove: ["Ana"],
    });
  });

  it("delta vazio quando nada muda", () => {
    expect(isEmptyDelta(diffDocentes("T1", ["Ana"], ["Ana"]))).toBe(true);
  });
});

describe("applyAssignmentDelta", () => {
  const base = [
    { id_disciplina: "T1", docentes: ["Bia"] },
    { id_disciplina: "T2", docentes: [] },
  ];

  it("aplica adição e remoção", () => {
    const out = applyAssignmentDelta(base, {
      id_disciplina: "T1",
      add: ["Ana"],
      remove: ["Bia"],
    });
    expect(out[0].docentes).toEqual(["Ana"]);
    expect(out[1]).toBe(base[1]);
  });

  it("cria a atribuição quando a turma não existe", () => {
    const out = applyAssignmentDelta(base, {
      id_disciplina: "T3",
      add: ["Ana"],
      remove: [],
    });
    expect(out.at(-1)).toEqual({ id_disciplina: "T3", docentes: ["Ana"] });
  });

  it("devolve o mesmo array quando nada muda", () => {
    expect(
      applyAssignmentDelta(base, { id_disciplina: "T1", add: ["Bia"], remove: [] }),
    ).toBe(base);
  });

  it("aceita o formato antigo (lista inteira)", () => {
    const out = applyAssignmentDelta(base, {
      id_disciplina: "T1",
      docentes: ["Caio"],
    });
    expect(out[0].docentes).toEqual(["Caio"]);
  });

  it("edições simultâneas na mesma turma convergem", () => {
    // Líder adiciona Ana; convidado remove Bia, ao mesmo tempo, a partir de [Bia]
    const doLider = diffDocentes("T1", ["Bia"], ["Bia", "Ana"]);
    const doConvidado = diffDocentes("T1", ["Bia"], []);

    // Cada um aplica a própria mudança e depois recebe a do outro
    const lider = applyAssignmentDelta(
      applyAssignmentDelta(base, doLider),
      doConvidado,
    );
    const convidado = applyAssignmentDelta(
      applyAssignmentDelta(base, doConvidado),
      doLider,
    );

    expect(lider[0].docentes).toEqual(["Ana"]);
    expect(convidado[0].docentes).toEqual(["Ana"]);
  });
});
