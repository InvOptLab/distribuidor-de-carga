import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  hslToRgb,
  priorityLightness,
  priorityRampColor,
  relativeLuminance,
} from "../../theme/priorityRamp";
import { hasQuickRule, toggleQuickRule, applyDocenteFilters } from "../filters";
import { docente } from "./fixtures";

const lum = (rgb: string) =>
  relativeLuminance(rgb.match(/\d+/g)!.map(Number) as [number, number, number]);

describe("rampa de prioridade (D10, 10.1)", () => {
  it("1 = mais preferida = mais escura no tema claro, e é monotônica", () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((p) => lum(priorityRampColor(p, 9).bg));
    for (let i = 1; i < values.length; i++) expect(values[i]).toBeGreaterThan(values[i - 1]);
  });

  it("no tema escuro a escala é invertida", () => {
    expect(lum(priorityRampColor(1, 5, "dark").bg)).toBeGreaterThan(
      lum(priorityRampColor(5, 5, "dark").bg),
    );
  });

  it("não satura nem divide por zero", () => {
    expect(priorityLightness(1, 1, "light")).toBe(30);
    expect(priorityLightness(99, 5, "light")).toBe(92);
    expect(priorityRampColor(1, 0).bg).toMatch(/^rgb\(/);
  });

  it("texto da célula com contraste AA (>= 4.5)", () => {
    for (const mode of ["light", "dark"] as const) {
      for (let p = 1; p <= 10; p++) {
        const { bg, fg } = priorityRampColor(p, 10, mode);
        const ratio = contrastRatio(lum(bg), fg === "#FFFFFF" ? 1 : 0);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("hslToRgb", () => {
    expect(hslToRgb(0, 100, 50)).toEqual([255, 0, 0]);
    expect(hslToRgb(0, 0, 100)).toEqual([255, 255, 255]);
  });
});

describe("filtros rápidos e conflito", () => {
  it("toggleQuickRule liga e desliga", () => {
    const on = toggleQuickRule({ search: "", rules: [] }, "semDocente", "Sem docente");
    expect(hasQuickRule(on, "semDocente")).toBe(true);
    expect(hasQuickRule(toggleQuickRule(on, "semDocente", "x"), "semDocente")).toBe(false);
  });

  it("comConflito usa o conjunto de conflitos", () => {
    const filters = toggleQuickRule({ search: "", rules: [] }, "comConflito", "c");
    const out = applyDocenteFilters([docente("Ana"), docente("Bruno")], filters, [], new Set(["Bruno"]));
    expect(out.map((d) => d.nome)).toEqual(["Bruno"]);
  });
});
