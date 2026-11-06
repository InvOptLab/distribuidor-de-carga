import { alpha, type Theme } from "@mui/material";
import {
  hslToRgb,
  priorityRampColor,
  type RampColor,
} from "@/app/[locale]/atribuicoes/theme/priorityRamp";
import type { Side } from "../model/comparison";

export interface CompareTokens {
  /** A = primary e B = secondary em todos os lugares. */
  side: Record<Side, { main: string; soft: string; contrast: string }>;
  delta: { better: string; worse: string; neutral: string };
  /** Rampa de prioridade da grade. */
  priority: (priority: number, maxPriority: number) => RampColor;
  /** Rampa sequencial de um só matiz para as 5 faixas de carga. */
  workload: (band: number) => { bg: string; fg: string };
  added: string;
  removed: string;
}

const WORKLOAD_HUE = 215;

export function compareTokens(
  theme: Theme,
  isHighContrast: boolean,
): CompareTokens {
  const p = theme.palette;
  const dark = p.mode === "dark";
  if (isHighContrast) {
    return {
      side: {
        a: {
          main: "#FFFF00",
          soft: "rgba(255,255,0,0.2)",
          contrast: "#000000",
        },
        b: {
          main: "#00FFFF",
          soft: "rgba(0,255,255,0.2)",
          contrast: "#000000",
        },
      },
      delta: { better: "#00FF00", worse: "#FF6B6B", neutral: "#FFFFFF" },
      priority: (pr, max) => priorityRampColor(pr, max, "dark"),
      workload: (band) => {
        const l = 90 - band * 15;
        const [r, g, b] = hslToRgb(60, 100, l);
        return { bg: `rgb(${r}, ${g}, ${b})`, fg: "#000000" };
      },
      added: "#00FF00",
      removed: "#FF6B6B",
    };
  }
  return {
    side: {
      a: {
        main: p.primary.main,
        soft: alpha(p.primary.main, 0.12),
        contrast: p.primary.contrastText,
      },
      b: {
        main: p.secondary.main,
        soft: alpha(p.secondary.main, 0.12),
        contrast: p.secondary.contrastText,
      },
    },
    delta: {
      better: p.success.main,
      worse: p.error.main,
      neutral: p.text.secondary,
    },
    priority: (pr, max) => priorityRampColor(pr, max, dark ? "dark" : "light"),
    workload: (band) => {
      // Faixa 0 (sem carga) mais clara; as maiores mais escuras (inverte no escuro)
      const t = band / 4;
      const l = dark ? 25 + t * 50 : 90 - t * 58;
      const [r, g, b] = hslToRgb(WORKLOAD_HUE, 55, l);
      return {
        bg: `rgb(${r}, ${g}, ${b})`,
        fg: l > 55 ? "#000000" : "#FFFFFF",
      };
    },
    added: p.success.main,
    removed: p.error.main,
  };
}
