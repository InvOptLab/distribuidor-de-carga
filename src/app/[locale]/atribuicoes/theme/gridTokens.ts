import { alpha, type Theme } from "@mui/material";
import {
  priorityRampColor,
  priorityRampGradient,
  type RampColor,
  type RampMode,
} from "./priorityRamp";

export type BaseCellState = "empty" | "pref" | "assigned";

interface CellStyle {
  backgroundColor?: string;
  color?: string;
  border?: string;
}

export interface GridTokens {
  mode: RampMode;
  highContrast: boolean;
  border: string;
  paper: string;
  cell: Record<BaseCellState, CellStyle>;
  /** Hachura aplicada por cima do estado quando a célula está travada (A2: forma, não só cor). */
  lockedPattern: string;
  lockedBorder?: string;
  /** Realce leve de linha/coluna (overlay) e anel da célula sob o mouse/foco. */
  hoverLine: string;
  hoverCell: string;
  focusRing: string;
  header: { hover: string };
  conflict: { color: string; background: string };
  lockModeAccent: string;
  rampGradient: string;
  ramp: (priority: number, maxPriority: number) => RampColor;
}

/**
 * Tokens semânticos da grade (Fase 4): claro, escuro e alto contraste, derivados de `theme.palette`.
 * Vermelho fica exclusivo para conflito (U2); atribuído usa a cor primária.
 */
export function gridTokens(theme: Theme, isHighContrast: boolean): GridTokens {
  const palette = theme.palette;
  const mode: RampMode = palette.mode === "dark" ? "dark" : "light";
  const paper = palette.background.paper;
  const ramp = (priority: number, maxPriority: number) =>
    priorityRampColor(priority, maxPriority, mode);

  if (isHighContrast) {
    return {
      mode,
      highContrast: true,
      border: "#FFFFFF",
      paper,
      cell: {
        empty: { backgroundColor: "#000000", color: "#FFFFFF", border: "1px solid #FFFFFF" },
        pref: { backgroundColor: "transparent", color: "#FFFF00", border: "2px solid #FFFFFF" },
        assigned: { backgroundColor: "#FFFF00", color: "#000000", border: "3px solid #FFFF00" },
      },
      lockedPattern:
        "repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 2px, transparent 2px 7px)",
      lockedBorder: "3px dashed #FFFFFF",
      hoverLine: "inset 0 0 0 100px rgba(0, 255, 255, 0.18)",
      hoverCell: "inset 0 0 0 3px #00FFFF",
      focusRing: "3px solid #00FFFF",
      header: { hover: "rgba(0, 255, 255, 0.25)" },
      conflict: { color: "#FF6B6B", background: "rgba(255, 0, 0, 0.35)" },
      lockModeAccent: "#00FFFF",
      rampGradient: priorityRampGradient(mode),
      ramp,
    };
  }

  const hatch = mode === "dark" ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.22)";
  return {
    mode,
    highContrast: false,
    border: palette.divider,
    paper,
    cell: {
      empty: { backgroundColor: paper, color: palette.text.disabled },
      pref: { backgroundColor: "var(--cell-bg)", color: "var(--cell-fg)" },
      assigned: {
        backgroundColor: palette.primary.main,
        color: palette.primary.contrastText,
      },
    },
    lockedPattern: `repeating-linear-gradient(45deg, ${hatch} 0 2px, transparent 2px 7px)`,
    hoverLine: `inset 0 0 0 100px ${alpha(palette.primary.main, 0.08)}`,
    hoverCell: `inset 0 0 0 2px ${palette.primary.main}`,
    focusRing: `2px solid ${palette.primary.dark}`,
    header: { hover: alpha(palette.primary.main, 0.12) },
    conflict: {
      color: palette.error.main,
      background: alpha(palette.error.main, mode === "dark" ? 0.25 : 0.1),
    },
    lockModeAccent: palette.warning.main,
    rampGradient: priorityRampGradient(mode),
    ramp,
  };
}
