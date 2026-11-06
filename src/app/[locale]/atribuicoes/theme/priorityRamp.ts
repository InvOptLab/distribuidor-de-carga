/**
 * Rampa sequencial de 1 matiz para a prioridade (D10, decisão 10.1: 1 = mais preferida).
 * A luminosidade varia de forma linear em HSL entre a prioridade 1 e `maxPriority`, então a escala
 * é monotônica e não satura. No tema claro, mais preferida = mais escura; no escuro, mais clara.
 */

const HUE = 174;
const SATURATION = 52;
const LIGHT_RANGE: [number, number] = [30, 92]; // L da prioridade 1 → L da maior
const DARK_RANGE: [number, number] = [74, 22];

export type RampMode = "light" | "dark";

export interface RampColor {
  bg: string;
  /** Texto com o maior contraste sobre `bg` (preto ou branco). */
  fg: string;
  /** Posição na escala: 0 = prioridade 1, 1 = maior prioridade. */
  t: number;
}

export function priorityPosition(priority: number, maxPriority: number): number {
  if (!(maxPriority > 1)) return 0;
  const t = (priority - 1) / (maxPriority - 1);
  return Math.min(1, Math.max(0, t));
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sat = s / 100;
  const lig = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number) =>
    lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255)) as [number, number, number];
}

export function relativeLuminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(l1: number, l2: number): number {
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export function priorityLightness(
  priority: number,
  maxPriority: number,
  mode: RampMode,
): number {
  const [from, to] = mode === "dark" ? DARK_RANGE : LIGHT_RANGE;
  return from + priorityPosition(priority, maxPriority) * (to - from);
}

export function priorityRampColor(
  priority: number,
  maxPriority: number,
  mode: RampMode = "light",
): RampColor {
  const l = priorityLightness(priority, maxPriority, mode);
  const rgb = hslToRgb(HUE, SATURATION, l);
  const lum = relativeLuminance(rgb);
  const fg = contrastRatio(lum, 1) >= contrastRatio(lum, 0) ? "#FFFFFF" : "#000000";
  return {
    bg: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
    fg,
    t: priorityPosition(priority, maxPriority),
  };
}

/** Gradiente CSS da escala inteira (legenda). */
export function priorityRampGradient(mode: RampMode = "light"): string {
  const steps = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const [from, to] = mode === "dark" ? DARK_RANGE : LIGHT_RANGE;
    const [r, g, b] = hslToRgb(HUE, SATURATION, from + t * (to - from));
    return `rgb(${r}, ${g}, ${b}) ${t * 100}%`;
  });
  return `linear-gradient(90deg, ${steps.join(", ")})`;
}
