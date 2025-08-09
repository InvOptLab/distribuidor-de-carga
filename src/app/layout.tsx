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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body style={{ margin: 0 }}>
        {/* <AccessibilityProvider>
          <AccessibilityBar /> */}
        <Navbar />
        <GlobalWrapper>
          <ProcessWrapper>
            <AlgorithmWrapper>
              <AlertsWrapper>
                <HistorySolutionProvider>
                  <div style={{ padding: "15px" }}>{children}</div>
                </HistorySolutionProvider>
              </AlertsWrapper>
            </AlgorithmWrapper>
          </ProcessWrapper>
        </GlobalWrapper>
        {/* <VLibras forceOnload /> */}
        {/* </AccessibilityProvider> */}
      </body>
    </html>
  );
}
