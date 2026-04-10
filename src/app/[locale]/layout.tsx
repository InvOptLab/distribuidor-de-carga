import Navbar from "@/components/Navbar";
import { VLibras } from "@/components/VLibras";
import { AlertsWrapper } from "@/context/Alerts";
import { AlgorithmWrapper } from "@/context/Algorithm";
import { GlobalWrapper } from "@/context/Global";
import { AvatarChatProvider } from "@/context/AvatarChat/AvatarChatContext";
import { AvatarChatWidget } from "@/components/AvatarChat/AvatarChatWidget";

import { CssBaseline } from "@mui/material";

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
      <body style={{ margin: 0 }}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AccessibilityProvider>
            <AccessibilityBar />
            <CssBaseline />
            <AvatarChatProvider>
              <CollaborationProvider>
                <Navbar />
                <GlobalWrapper>
                  <AlgorithmWrapper>
                    <AlertsWrapper>
                      <HistorySolutionProvider>
                        <div id="main-content" style={{ padding: "15px" }}>
                          <ClearStorageModal />
                          {children}
                        </div>
                        <AvatarChatWidget />
                      </HistorySolutionProvider>
                    </AlertsWrapper>
                  </AlgorithmWrapper>
                </GlobalWrapper>
              </CollaborationProvider>
            </AvatarChatProvider>

            <VLibras forceOnload />
          </AccessibilityProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
