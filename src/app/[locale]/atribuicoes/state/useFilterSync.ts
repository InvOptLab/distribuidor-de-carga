"use client";

import { useEffect, useRef } from "react";
import type React from "react";
import type {
  Atribuicao,
  Celula,
  Disciplina,
  Docente,
} from "@/algoritmo/communs/interfaces/interfaces";
import { jsonReviver } from "@/context/Global/utils";
import { useCollaboration } from "@/context/Collaboration";
import type { DisciplinaFilters, DocenteFilters } from "../types/types";

interface FilterSyncParams {
  docenteFilters: DocenteFilters;
  disciplinaFilters: DisciplinaFilters;
  setDocenteFilters: React.Dispatch<React.SetStateAction<DocenteFilters>>;
  setDisciplinaFilters: React.Dispatch<React.SetStateAction<DisciplinaFilters>>;
  docentes: Docente[];
  disciplinas: Disciplina[];
  atribuicoes: Atribuicao[];
  formularios: any[];
  travas: Celula[];
}

/**
 * Sincronização dos filtros com a sala colaborativa. Protocolo inalterado: FULL_DATA.
 */
export function useFilterSync({
  docenteFilters,
  disciplinaFilters,
  setDocenteFilters,
  setDisciplinaFilters,
  docentes,
  disciplinas,
  atribuicoes,
  formularios,
  travas,
}: FilterSyncParams) {
  const {
    broadcastDataUpdate,
    onDataUpdate,
    onDataRequest,
    isInRoom,
    config,
    isOwner,
  } = useCollaboration();

  // Escutar atualizações remotas (incluindo filtros) e responder pedidos de dados (líder)
  useEffect(() => {
    if (!isInRoom) return;

    const unsubscribe = onDataUpdate((payload) => {
      if (payload.type === "FULL_DATA" && payload.data) {
        const hydrated = JSON.parse(payload.data, jsonReviver);

        // Compara antes de aplicar para evitar loop de re-render/re-broadcast
        if (hydrated.docenteFilters) {
          setDocenteFilters((prev) =>
            JSON.stringify(prev) !== JSON.stringify(hydrated.docenteFilters)
              ? hydrated.docenteFilters
              : prev,
          );
        }
        if (hydrated.disciplinaFilters) {
          setDisciplinaFilters((prev) =>
            JSON.stringify(prev) !== JSON.stringify(hydrated.disciplinaFilters)
              ? hydrated.disciplinaFilters
              : prev,
          );
        }
      }
    });

    // Os dados globais são enviados pelo CollaborationSync (em qualquer página);
    // aqui só os filtros, que existem apenas na grade.
    const unsubscribeReq = onDataRequest(() => {
      if (isOwner) {
        broadcastDataUpdate({ docenteFilters, disciplinaFilters }, "FULL_DATA");
      }
    });

    return () => {
      unsubscribe();
      unsubscribeReq();
    };
  }, [
    isInRoom,
    isOwner,
    broadcastDataUpdate,
    onDataUpdate,
    onDataRequest,
    docenteFilters,
    disciplinaFilters,
    setDocenteFilters,
    setDisciplinaFilters,
  ]);

  // Broadcast dos filtros quando mudam localmente (dono, ou convidados com guestsCanFilter)
  const lastBroadcastedFiltersRef = useRef("");

  useEffect(() => {
    if (!isInRoom) return;
    if (!(isOwner || config.guestsCanFilter)) return;

    const currentString = JSON.stringify({
      d: docenteFilters,
      di: disciplinaFilters,
    });

    if (currentString !== lastBroadcastedFiltersRef.current) {
      broadcastDataUpdate({ docenteFilters, disciplinaFilters }, "FULL_DATA");
      lastBroadcastedFiltersRef.current = currentString;
    }
  }, [
    docenteFilters,
    disciplinaFilters,
    isInRoom,
    isOwner,
    config.guestsCanFilter,
    broadcastDataUpdate,
  ]);
}
