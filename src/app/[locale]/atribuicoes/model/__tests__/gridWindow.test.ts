import { describe, expect, it } from "vitest";
import {
  computeWindow,
  OVERSCAN_COLS,
  OVERSCAN_ROWS,
  scrollToReveal,
} from "../../state/gridWindow";

const metrics = { rowHeaderWidth: 176, headerHeight: 117, colWidth: 128, rowHeight: 37 };

describe("virtualização 2D (Fase 6)", () => {
  it("janela inicial antes de medir", () => {
    expect(computeWindow(150, 300, { scrollTop: 0, scrollLeft: 0, width: 0, height: 0 }, metrics)).toEqual({
      r0: 0,
      r1: 30,
      c0: 0,
      c1: 20,
    });
  });

  it("cobre a área visível com overscan e respeita os limites", () => {
    const viewport = { scrollTop: 37 * 50, scrollLeft: 128 * 100, width: 176 + 128 * 8, height: 117 + 37 * 20 };
    const w = computeWindow(150, 300, viewport, metrics);
    expect(w).toEqual({
      r0: 50 - OVERSCAN_ROWS,
      r1: 70 + OVERSCAN_ROWS,
      c0: 100 - OVERSCAN_COLS,
      c1: 108 + OVERSCAN_COLS,
    });
    const end = computeWindow(150, 300, { ...viewport, scrollTop: 1e6, scrollLeft: 1e6 }, metrics);
    expect(end.r1).toBe(150);
    expect(end.c1).toBe(300);
    expect(end.r0).toBeLessThanOrEqual(end.r1);
  });

  it("grade pequena cabe inteira", () => {
    expect(computeWindow(3, 4, { scrollTop: 0, scrollLeft: 0, width: 2000, height: 1000 }, metrics)).toEqual({
      r0: 0,
      r1: 3,
      c0: 0,
      c1: 4,
    });
  });

  it("scrollToReveal leva em conta cabeçalho e coluna fixos", () => {
    const viewport = { scrollTop: 0, scrollLeft: 0, width: 800, height: 600 };
    const right = scrollToReveal(0, 20, viewport, metrics);
    expect(right.scrollLeft).toBe(176 + 21 * 128 - 800);
    const down = scrollToReveal(40, 0, viewport, metrics);
    expect(down.scrollTop).toBe(117 + 41 * 37 - 600);
    const back = scrollToReveal(2, 1, { ...viewport, scrollTop: 1000, scrollLeft: 1000 }, metrics);
    expect(back).toEqual({ scrollTop: 2 * 37, scrollLeft: 128 });
    expect(scrollToReveal(-1, -1, { ...viewport, scrollTop: 50, scrollLeft: 60 }, metrics)).toEqual({
      scrollTop: 50,
      scrollLeft: 60,
    });
  });
});
