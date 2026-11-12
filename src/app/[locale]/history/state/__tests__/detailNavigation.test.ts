import { describe, expect, it } from "vitest";
import {
  detailPosition,
  invalidParamChanges,
  navigationChanges,
  neighborId,
  parseEntityRef,
  resolveEscape,
  successorAfterRemoval,
} from "../detailNavigation";

const rows = [{ id: "c" }, { id: "b" }, { id: "a" }];

describe("navegação entre soluções (4.1)", () => {
  it("posição e vizinhos seguem a lista visível, sem dar a volta", () => {
    expect(detailPosition(rows, "b")).toEqual({ index: 1, total: 3 });
    expect(detailPosition(rows, "x")).toBeNull();
    expect(neighborId(rows, "b", 1)).toBe("a");
    expect(neighborId(rows, "b", -1)).toBe("c");
    expect(neighborId(rows, "a", 1)).toBeNull();
    expect(neighborId(rows, "x", 1)).toBeNull();
  });

  it("mantém a entidade se existir na nova solução e limpa o inspetor", () => {
    const ana = { kind: "docente" as const, id: "Ana" };
    expect(navigationChanges("a", ana, () => true)).toEqual({
      detalhe: "a",
      ent: "docente:Ana",
      insp: null,
    });
    expect(navigationChanges("a", ana, () => false)).toEqual({ detalhe: "a", ent: null, insp: null });
    expect(navigationChanges("a", null, () => true)).toEqual({ detalhe: "a", ent: null, insp: null });
  });

  it("ao excluir a aberta vai para a próxima, ou a anterior, ou fecha (4.5)", () => {
    expect(successorAfterRemoval(rows, "c")).toBe("b");
    expect(successorAfterRemoval(rows, "a")).toBe("b");
    expect(successorAfterRemoval([{ id: "a" }], "a")).toBeNull();
  });
});

describe("parâmetros inválidos (5)", () => {
  const has = (id: string) => id === "s1";
  const exists = (ref: { kind: string; id: string }) => ref.id === "Ana";

  it("nada a fazer quando tudo é válido", () => {
    expect(
      invalidParamChanges({ detalhe: "s1", ent: "docente:Ana", insp: "docente:Ana" }, has, exists),
    ).toBeNull();
    expect(invalidParamChanges({ detalhe: null, ent: null, insp: null }, has, exists)).toBeNull();
  });

  it("solução inexistente limpa tudo", () => {
    expect(
      invalidParamChanges({ detalhe: "velha", ent: "docente:Ana", insp: null }, has, exists),
    ).toEqual({ detalhe: null, ent: null });
  });

  it("entidade ou inspetor inexistentes são removidos", () => {
    expect(
      invalidParamChanges({ detalhe: "s1", ent: "turma:X", insp: "lixo" }, has, exists),
    ).toEqual({ ent: null, insp: null });
  });

  it("parse de ent/insp", () => {
    expect(parseEntityRef("turma:SME0284-1")).toEqual({ kind: "turma", id: "SME0284-1" });
    expect(parseEntityRef("docente:Nome: com dois-pontos")).toEqual({
      kind: "docente",
      id: "Nome: com dois-pontos",
    });
    expect(parseEntityRef("outro:x")).toBeNull();
  });
});

describe("Esc em camadas (4.4)", () => {
  it("fecha o nível mais interno primeiro", () => {
    expect(resolveEscape({ kind: "overlay" })).toBe("closeOverlay");
    expect(resolveEscape({ kind: "stack", level: "inspector" })).toBe("stackBack");
    expect(resolveEscape({ kind: "stack", level: "relations" })).toBe("stackBack");
    expect(resolveEscape(null)).toBe("closeDialog");
  });
});
