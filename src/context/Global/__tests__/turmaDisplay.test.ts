import { describe, expect, it } from "vitest";
import { formatCarga, tipoNivel } from "../utils";
import { getCellValue } from "@/types/column-config";

describe("tipoNivel", () => {
  it("reconhece os valores usados nos arquivos", () => {
    expect(tipoNivel({ nivel: "g" })).toBe("graduacao");
    expect(tipoNivel({ nivel: "p" })).toBe("pos");
    expect(tipoNivel({ nivel: "pg" })).toBe("pos");
    expect(tipoNivel({ nivel: "g+p" })).toBe("ambos");
    expect(tipoNivel({ nivel: " G + P " })).toBe("ambos");
  });

  it("turma com espelho é graduação + pós, mesmo com nível 'g'", () => {
    expect(
      tipoNivel({ nivel: "g", espelho: { codigo: "X", id: "X,1", nome: "" } }),
    ).toBe("ambos");
  });

  it("valor desconhecido não vira pós por engano", () => {
    // Antes, toda turma diferente de "g" era exibida como pós-graduação
    expect(tipoNivel({ nivel: "extensão" })).toBe("outro");
    expect(tipoNivel({})).toBe("outro");
  });
});

describe("formatCarga", () => {
  it("arredonda para no máximo 2 casas", () => {
    expect(formatCarga(1.099609375)).toBe("1.1");
    expect(formatCarga(1.5)).toBe("1.5");
    expect(formatCarga(2)).toBe("2");
    expect(formatCarga(undefined)).toBe("");
  });
});

describe("planilha", () => {
  const base = {
    id: "SME0202,1",
    codigo: "SME0202",
    nivel: "g+p",
    espelho: { codigo: "SME5784", id: "SME5784,1", nome: "Métodos" },
  } as any;

  it("mostra o nível por extenso", () => {
    expect(
      getCellValue(base, { id: "nivel", type: "nivel" } as any),
    ).toBe("Graduação + Pós");
    expect(
      getCellValue({ ...base, nivel: "pg", espelho: undefined }, {
        id: "nivel",
        type: "nivel",
      } as any),
    ).toBe("Pós-graduação");
  });

  it("coluna do espelho", () => {
    expect(
      getCellValue(base, { id: "espelho", type: "espelho" } as any),
    ).toBe("SME5784 - T1 (Métodos)");
    expect(
      getCellValue({ ...base, espelho: undefined }, {
        id: "espelho",
        type: "espelho",
      } as any),
    ).toBe("");
  });
});
