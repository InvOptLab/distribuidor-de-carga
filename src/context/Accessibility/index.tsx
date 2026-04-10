"use client";
import React, { createContext, useContext, useState, useMemo } from "react";
import {
  createTheme,
  CssBaseline,
  GlobalStyles,
  ThemeOptions,
  ThemeProvider,
} from "@mui/material";

interface AccessibilityContextType {
  fontScale: number;
  isHighContrast: boolean;
  increaseFont: () => void;
  decreaseFont: () => void;
  toggleContrast: () => void;
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fontScale, setFontScale] = useState(1);
  const [isHighContrast, setIsHighContrast] = useState(false);

  const increaseFont = () => setFontScale((prev) => Math.min(prev + 0.1, 1.5));
  const decreaseFont = () => setFontScale((prev) => Math.max(prev - 0.1, 0.8));
  const toggleContrast = () => setIsHighContrast((prev) => !prev);

  const theme = useMemo(() => {
    const baseTheme: ThemeOptions = {
      typography: {
        fontSize: 14 * fontScale,
      },
    };

    if (isHighContrast) {
      // Paleta Extrema de Alto Contraste (Preto, Branco e Amarelo)
      baseTheme.palette = {
        mode: "dark",
        background: {
          default: "#000000",
          paper: "#000000",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#FFFF00", // Amarelo ajuda a diferenciar textos secundários
        },
        primary: {
          main: "#FFFF00", // Botões e destaques principais em Amarelo
          contrastText: "#000000",
        },
        secondary: {
          main: "#00FFFF", // Ciano para ações secundárias
          contrastText: "#000000",
        },
        divider: "#FFFFFF",
        action: {
          active: "#FFFF00",
          hover: "rgba(255, 255, 255, 0.2)",
          selected: "rgba(255, 255, 255, 0.3)",
        },
      };

      // Sobrescrita de Componentes Nativos do MUI
      baseTheme.components = {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: "#000000 !important",
              color: "#FFFFFF !important",
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundColor: "#000000 !important",
              backgroundImage: "none", // Remove o brilho padrão do Dark Mode do MUI
              border: "1px solid #FFFFFF", // Garante limite visual nos "quadros"
              boxShadow: "none !important", // Remove sombras
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              border: "2px solid #FFFFFF",
              backgroundColor: "#000000 !important",
              boxShadow: "none !important",
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              border: "2px solid #FFFFFF",
              borderRadius: "4px",
              fontWeight: "bold",
              textTransform: "none",
            },
            contained: {
              backgroundColor: "#FFFF00",
              color: "#000000",
              borderColor: "#FFFF00",
              "&:hover": {
                backgroundColor: "#FFFFFF",
                color: "#000000",
                borderColor: "#FFFFFF",
              },
            },
            outlined: {
              color: "#FFFF00",
              borderColor: "#FFFF00",
              "&:hover": {
                backgroundColor: "#FFFF00",
                color: "#000000",
              },
            },
          },
        },
        MuiLink: {
          styleOverrides: {
            root: {
              color: "#FFFF00 !important",
              textDecoration: "underline !important",
              textDecorationThickness: "2px !important",
              "&:hover": {
                color: "#FFFFFF !important",
              },
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            notchedOutline: {
              borderColor: "#FFFFFF",
              borderWidth: "2px",
            },
            root: {
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#FFFF00 !important",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#FFFF00 !important",
              },
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderBottom: "1px solid #FFFFFF",
              color: "#FFFFFF",
            },
            head: {
              fontWeight: "bold",
              color: "#FFFF00",
              borderBottom: "2px solid #FFFFFF",
            },
          },
        },
      };
    }

    return createTheme(baseTheme);
  }, [fontScale, isHighContrast]);

  return (
    <AccessibilityContext.Provider
      value={{
        fontScale,
        isHighContrast,
        increaseFont,
        decreaseFont,
        toggleContrast,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {isHighContrast && (
          <GlobalStyles
            styles={{
              'div[class*="MuiBox-root"], section, article, main': {
                backgroundColor: "#000000 !important",
                color: "#FFFFFF !important",
              },
              // Força bordas a aparecerem em elementos não tratados pelo Theme
              "*": {
                borderColor: "#FFFFFF !important",
                boxShadow: "none !important", // Sombras atrapalham contraste
              },
              "a, a *": {
                color: "#FFFF00 !important",
                textDecoration: "underline !important",
              },
              svg: {
                // Herda a cor do texto onde o SVG está embutido (ex: branco ou amarelo)
                fill: "currentColor !important",
                color: "inherit !important",
              },
            }}
          />
        )}
        {children}
      </ThemeProvider>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context)
    throw new Error(
      "useAccessibility must be used within AccessibilityProvider",
    );
  return context;
};
