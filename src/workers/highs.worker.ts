// highs.worker.ts
import highsLoader from "highs";

self.onmessage = async (event: MessageEvent) => {
  const { lpString } = event.data;

  try {
    // Inicializa o Highs via importação estática
    const highs = await highsLoader({
      // O Next.js serve arquivos da pasta public/ a partir da raiz '/'
      locateFile: (file: string) => `/assets/${file}`,
    });

    // Executa o solver
    const sol = highs.solve(lpString, {
      log_to_console: true,
    });

    // Devolve o resultado para a thread principal
    self.postMessage({ success: true, solution: sol });
  } catch (error) {
    self.postMessage({ success: false, error: String(error) });
  }
};
