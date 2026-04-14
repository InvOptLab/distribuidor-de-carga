import Navbar from "@/components/Navbar";
import { VLibras } from "@/components/VLibras";
import { AlertsWrapper } from "@/context/Alerts";
import { AlgorithmWrapper } from "@/context/Algorithm";
import { GlobalWrapper } from "@/context/Global";
import { AvatarChatProvider } from "@/context/AvatarChat/AvatarChatContext";
import { AvatarChatWidget } from "@/components/AvatarChat/AvatarChatWidget";

import { Box, CssBaseline } from "@mui/material";

import "katex/dist/katex.min.css";
import { CollaborationProvider } from "@/context/Collaboration";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { HistorySolutionProvider } from "./history/context/history.context";
import { getMessages } from "next-intl/server";
import { AccessibilityProvider } from "@/context/Accessibility";
import AccessibilityBar from "@/components/AccessibilityBar";
import ClearStorageModal from "@/components/ClearStorageModal";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // const [mode, setMode] = useState<PaletteMode>("light");
  // const colorMode = useMemo<IColorModeContext>(
  //   () => ({
  //     toggleColorMode: () => {
  //       setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  //     },
  //     mode,
  //   }),
  //   [mode]
  // );

  // const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  // 3. Faça o await para extrair o locale
  const { locale } = await params;

  // 4. Carrega as mensagens do idioma
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        style={{
          margin: 0,
          padding: 0,
          height: "100vh", // Trava a altura para ser exatamente o tamanho da janela
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // Proíbe o navegador de ter sua própria barra de rolagem
        }}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AccessibilityProvider>
            <AccessibilityBar />
            <CssBaseline />

            {/* Descomentado o PageHeaderProvider para ativar o Contexto Global */}
            {/* <PageHeaderProvider> */}
            <AvatarChatProvider>
              <CollaborationProvider>
                {/* Container para proteger as barras de serem "amassadas" pelo flexbox */}
                <Box sx={{ flexShrink: 0 }}>
                  <Navbar />
                  {/* <CollapsibleHeader /> */}
                </Box>

                <GlobalWrapper>
                  <AlgorithmWrapper>
                    <AlertsWrapper>
                      <HistorySolutionProvider>
                        {/* Substituímos a <div> nativa pelo Box do MUI para controlar o scroll */}
                        <Box
                          component="main"
                          id="main-content"
                          sx={{
                            flexGrow: 1, // Faz este bloco crescer para preencher a tela restante
                            overflowY: "auto", // O scroll VAI ACONTECER AQUI!
                            overflowX: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative", // Evita bugs com modais/tooltips internas
                          }}
                        >
                          <ClearStorageModal />
                          {children}
                        </Box>

                        <AvatarChatWidget />
                      </HistorySolutionProvider>
                    </AlertsWrapper>
                  </AlgorithmWrapper>
                </GlobalWrapper>
              </CollaborationProvider>
            </AvatarChatProvider>
            {/* </PageHeaderProvider> */}

            <VLibras forceOnload />
          </AccessibilityProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
