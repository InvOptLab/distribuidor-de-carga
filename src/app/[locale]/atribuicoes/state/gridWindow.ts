/**
 * Janela visível da grade virtualizada (Fase 6). Funções puras sobre medidas em px.
 */

export interface GridMetrics {
  /** Largura da coluna fixa de docentes. */
  rowHeaderWidth: number;
  /** Altura da linha de cabeçalho (fixa no topo). */
  headerHeight: number;
  colWidth: number;
  rowHeight: number;
}

export interface Viewport {
  scrollTop: number;
  scrollLeft: number;
  width: number;
  height: number;
}

export interface GridWindow {
  r0: number;
  r1: number; // exclusivo
  c0: number;
  c1: number; // exclusivo
}

export const OVERSCAN_ROWS = 4;
export const OVERSCAN_COLS = 2;

/** Janela usada antes da primeira medição (o container ainda não tem tamanho). */
export const INITIAL_WINDOW_ROWS = 30;
export const INITIAL_WINDOW_COLS = 20;

export function computeWindow(
  rows: number,
  cols: number,
  viewport: Viewport,
  metrics: GridMetrics,
): GridWindow {
  if (viewport.width <= 0 || viewport.height <= 0) {
    return {
      r0: 0,
      r1: Math.min(rows, INITIAL_WINDOW_ROWS),
      c0: 0,
      c1: Math.min(cols, INITIAL_WINDOW_COLS),
    };
  }
  const { rowHeaderWidth, headerHeight, colWidth, rowHeight } = metrics;
  const visibleW = Math.max(0, viewport.width - rowHeaderWidth);
  const visibleH = Math.max(0, viewport.height - headerHeight);

  const firstCol = Math.floor(viewport.scrollLeft / colWidth);
  const lastCol = Math.ceil((viewport.scrollLeft + visibleW) / colWidth);
  const firstRow = Math.floor(viewport.scrollTop / rowHeight);
  const lastRow = Math.ceil((viewport.scrollTop + visibleH) / rowHeight);

  const c0 = Math.max(0, Math.min(cols, firstCol - OVERSCAN_COLS));
  const c1 = Math.max(c0, Math.min(cols, lastCol + OVERSCAN_COLS));
  const r0 = Math.max(0, Math.min(rows, firstRow - OVERSCAN_ROWS));
  const r1 = Math.max(r0, Math.min(rows, lastRow + OVERSCAN_ROWS));
  return { r0, r1, c0, c1 };
}

export function sameWindow(a: GridWindow, b: GridWindow) {
  return a.r0 === b.r0 && a.r1 === b.r1 && a.c0 === b.c0 && a.c1 === b.c1;
}

/**
 * Scroll necessário para a posição (r, c) ficar visível fora das áreas fixas.
 * r = -1 / c = -1 são os cabeçalhos (sempre visíveis naquele eixo).
 */
export function scrollToReveal(
  r: number,
  c: number,
  viewport: Viewport,
  metrics: GridMetrics,
): { scrollTop: number; scrollLeft: number } {
  let { scrollTop, scrollLeft } = viewport;
  const { rowHeaderWidth, headerHeight, colWidth, rowHeight } = metrics;

  if (c >= 0) {
    const x = rowHeaderWidth + c * colWidth;
    if (x < scrollLeft + rowHeaderWidth) scrollLeft = x - rowHeaderWidth;
    else if (x + colWidth > scrollLeft + viewport.width) {
      scrollLeft = x + colWidth - viewport.width;
    }
  }
  if (r >= 0) {
    const y = headerHeight + r * rowHeight;
    if (y < scrollTop + headerHeight) scrollTop = y - headerHeight;
    else if (y + rowHeight > scrollTop + viewport.height) {
      scrollTop = y + rowHeight - viewport.height;
    }
  }
  return { scrollTop: Math.max(0, scrollTop), scrollLeft: Math.max(0, scrollLeft) };
}
