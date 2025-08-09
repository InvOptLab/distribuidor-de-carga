import React, { createContext, useContext, useState, useMemo } from "react";
import { createTheme, ThemeProvider, ThemeOptions } from "@mui/material/styles";
import { CssBaseline, GlobalStyles } from "@mui/material";

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
      baseTheme.palette = {
        mode: "dark",
        background: {
          default: "#000000",
          paper: "#000000",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#FFFFFF",
        },
        primary: {
          main: "#FFFFFF",
        },
        divider: "#FFFFFF",
      };
      baseTheme.components = {
        MuiLink: {
          styleOverrides: {
            root: {
              color: "#FFF333",
              textDecoration: "underline",
              "&:hover": {
                color: "#FFF333",
                textDecoration: "underline",
              },
              "&:active": {
                color: "#FFF333",
                textDecoration: "underline",
              },
            },
          },
        },
        MuiIcon: {
          styleOverrides: {
            root: {
              color: "#FFFFFF",
            },
          },
        },
        MuiSvgIcon: {
          styleOverrides: {
            root: {
              color: "#FFFFFF",
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            notchedOutline: {
              borderColor: "#FFFFFF",
            },
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            root: {
              color: "#FFFFFF",
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderColor: "#FFFFFF",
              color: "#FFFFFF",
            },
          },
        },
        MuiDivider: {
          styleOverrides: {
            root: {
              backgroundColor: "#FFFFFF",
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
        {/* Global styles adicionais */}
        {isHighContrast && (
          <GlobalStyles
            styles={{
              "*": {
                borderColor: "#FFFFFF !important",
              },
              a: {
                color: "#FFF333 !important",
                textDecoration: "underline !important",
              },
              svg: {
                fill: "#FFFFFF !important",
                color: "#FFFFFF !important",
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
      "useAccessibility must be used within AccessibilityProvider"
    );
  return context;
};
