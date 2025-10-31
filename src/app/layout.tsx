"use client";

//import AccessibilityBar from "@/components/AccessibilityBar";
//import { AccessibilityProvider } from "@/context/Accessibility";
import Navbar from "@/components/Navbar";
// import { VLibras } from "@/components/VLibras";
import { AlertsWrapper } from "@/context/Alerts";
import { AlgorithmWrapper } from "@/context/Algorithm";
import { GlobalWrapper } from "@/context/Global";
import { ProcessWrapper } from "@/context/Process";
import { HistorySolutionProvider } from "./history/context/history.context";
import { AvatarChatProvider } from "@/context/AvatarChat/AvatarChatContext";
import { AvatarChatWidget } from "@/components/AvatarChat/AvatarChatWidget";
import {
  ColorModeContext,
  IColorModeContext,
} from "@/context/ColorModeContext";
import { getDesignTokens } from "@/theme/palette";
import { useMemo, useState } from "react";
import {
  createTheme,
  CssBaseline,
  PaletteMode,
  ThemeProvider,
} from "@mui/material";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mode, setMode] = useState<PaletteMode>("light");
  const colorMode = useMemo<IColorModeContext>(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <html lang="pt-br">
      <body style={{ margin: 0 }}>
        {/* <AccessibilityProvider>
          <AccessibilityBar /> */}
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline normaliza o CSS e aplica o 'background.default' 
              da sua paleta ao <body> automaticamente!
             */}
            <CssBaseline />
            <AvatarChatProvider>
              <Navbar />
              <GlobalWrapper>
                <ProcessWrapper>
                  <AlgorithmWrapper>
                    <AlertsWrapper>
                      <HistorySolutionProvider>
                        <div style={{ padding: "15px" }}>{children}</div>
                        <AvatarChatWidget />
                      </HistorySolutionProvider>
                    </AlertsWrapper>
                  </AlgorithmWrapper>
                </ProcessWrapper>
              </GlobalWrapper>
            </AvatarChatProvider>
          </ThemeProvider>
        </ColorModeContext.Provider>
        {/* <VLibras forceOnload /> */}
        {/* </AccessibilityProvider> */}
      </body>
    </html>
  );
}
