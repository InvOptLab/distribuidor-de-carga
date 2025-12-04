// src/theme/palette.ts
import { PaletteMode } from "@mui/material";

// --- DEFINIÇÕES DO MODO CLARO ---
const primaryLight = {
  main: "#1976d2",
  light: "#42a5f5",
  dark: "#1565c0",
  contrastText: "#ffffff",
};

const secondaryLight = {
  main: "#ed6c02",
  light: "#ff9800",
  dark: "#e65100",
  contrastText: "#ffffff",
};

// --- MODO DARK ---
const primaryDark = {
  main: "#3399FF",
  light: "#66B2FF",
  dark: "#007BFF",
  contrastText: "#0A1929", // Texto escuro para contrastar com o azul claro
  // Contraste (main vs contrastText): 7.5:1 (Excelente)
};

const secondaryDark = {
  main: "#FFA726",
  light: "#FFB74D",
  dark: "#FB8C00",
  contrastText: "#0A1929", // Texto escuro para contrastar
  // Contraste (main vs contrastText): 9.5:1 (Excelente)
};

// --- FUNÇÃO PRINCIPAL DO TEMA ---

export const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,

    // As paletas de erro, info, etc
    error: {
      main: "#F44336",
    },
    success: {
      main: "#4CAF50",
    },

    ...(mode === "light"
      ? {
          // --- MODO CLARO ---
          primary: primaryLight,
          secondary: secondaryLight,
          text: {
            primary: "#212121",
            secondary: "#5f6368",
          },
          background: {
            default: "#f5f5f5",
            paper: "#ffffff",
          },
          divider: "#e0e0e0",
          info: {
            main: "#0288d1",
          },
          warning: {
            main: secondaryLight.main,
          },
        }
      : {
          // --- MODO DARK  ---
          primary: primaryDark,
          secondary: secondaryDark,
          text: {
            primary: "#E0E6F1",
            secondary: "#94A3B8", // Cinza-médio azulado (Slate 400)
          },
          background: {
            default: "#0A1929", // "Midnight Blue" (Muito escuro)
            paper: "#14253E", // "Azul-Ardósia" (Cor de elevação)
          },
          divider: "rgba(148, 163, 184, 0.2)", // Um divisor semitransparente
          info: {
            main: primaryDark.main, // Reutiliza o primário vibrante
          },
          warning: {
            main: secondaryDark.main, // Reutiliza o secundário vibrante
          },
        }),
  },

  // Aqui também pode ajustar outros aspectos para o modo dark
  // por exemplo, a aparência dos componentes
  components: {
    // Deixar o Paper (Cards) com menos sombra e mais borda no dark mode
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          ...(theme.palette.mode === "dark" && {
            // No modo dark, usamos uma borda sutil ao invés de muita sombra
            backgroundImage: "none", // Remove gradientes (se houver)
            border: `1px solid ${theme.palette.divider}`,
          }),
        }),
      },
    },
  },
});
