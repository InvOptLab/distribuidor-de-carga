import { useEffect, useRef, useCallback } from "react";
import {
  Solucao,
  Estatisticas,
} from "@/algoritmo/communs/interfaces/interfaces";

interface UseTabuWorkerProps {
  onProgressAllocation: (qtd: number) => void;
  onProgressStats: (stats: Partial<Estatisticas>) => void;
  onSuccess: (solucao: Solucao) => void;
  onError: (error: string) => void;
}

export const useTabuWorker = ({
  onProgressAllocation,
  onProgressStats,
  onSuccess,
  onError,
}: UseTabuWorkerProps) => {
  const workerRef = useRef<Worker | null>(null);

  // Refs sempre atualizadas, mas que não disparam o efeito
  const callbacksRef = useRef({
    onProgressAllocation,
    onProgressStats,
    onSuccess,
    onError,
  });
  useEffect(() => {
    callbacksRef.current = {
      onProgressAllocation,
      onProgressStats,
      onSuccess,
      onError,
    };
  }, [onProgressAllocation, onProgressStats, onSuccess, onError]);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../workers/tabu.worker.ts", import.meta.url),
      { type: "module" },
    );

    workerRef.current.onmessage = (event) => {
      const { type, payload } = event.data;
      const cb = callbacksRef.current;
      switch (type) {
        case "PROGRESS_ALLOCATION":
          cb.onProgressAllocation(payload);
          break;
        case "PROGRESS_STATS":
          cb.onProgressStats(payload);
          break;
        case "SUCCESS":
          cb.onSuccess(payload);
          break;
        case "ERROR":
          cb.onError(payload);
          break;
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const startWorker = useCallback(
    (contextData: any, configData: any, activeComponents: any) => {
      try {
        workerRef.current?.postMessage({
          type: "START_TABU",
          payload: { contextData, configData, activeComponents },
        });
      } catch (err) {
        console.error("[useTabuWorker] Falha ao enviar START_TABU:", err);
      }
    },
    [],
  );

  const interruptWorker = useCallback(() => {
    // Solicita uma parada suave (graceful stop) para retornar a melhor solução encontrada
    workerRef.current?.postMessage({ type: "STOP_TABU" });
  }, []);

  const terminateWorker = useCallback(() => {
    // Mata a thread imediatamente
    workerRef.current?.terminate();
  }, []);

  return { startWorker, interruptWorker, terminateWorker };
};
