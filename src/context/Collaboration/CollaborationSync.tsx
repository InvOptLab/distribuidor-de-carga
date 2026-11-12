"use client";

import { useEffect, useRef } from "react";
import { useGlobalContext } from "@/context/Global";
import { jsonReviver } from "@/context/Global/utils";
import { useCollaboration } from ".";
import { applyAssignmentDelta } from "./sync";

/** Atraso para agrupar várias mudanças locais seguidas num único envio. */
const AUTO_BROADCAST_DELAY_MS = 400;

/**
 * Mantém os dados globais sincronizados com a sala em QUALQUER página.
 *
 * Antes, só a Tabela, os Blocos e a Planilha escutavam a sala: quem estivesse
 * em outra tela perdia as mudanças, e o líder só respondia a quem entrava se
 * estivesse na Tabela. Montado no layout, este componente:
 *  - aplica FULL_DATA e deltas de atribuição recebidos;
 *  - responde (líder) ao pedido de dados de quem entra;
 *  - envia mudanças locais de docentes, turmas e formulários feitas em
 *    qualquer tela (cadastro, seleção, importação...) por quem pode editar.
 */
export default function CollaborationSync() {
  const {
    isInRoom,
    isOwner,
    canEdit,
    onDataUpdate,
    onAssignmentChange,
    onDataRequest,
    broadcastDataUpdate,
  } = useCollaboration();

  const {
    docentes,
    disciplinas,
    atribuicoes,
    formularios,
    travas,
    setDocentes,
    setDisciplinas,
    setAtribuicoes,
    setFormularios,
    setTravas,
  } = useGlobalContext();

  // Estado mais recente, para responder pedidos sem re-registrar ouvintes
  const latest = useRef({ docentes, disciplinas, atribuicoes, formularios, travas });
  latest.current = { docentes, disciplinas, atribuicoes, formularios, travas };

  // Referências recebidas da sala: mudanças com essas referências não são reenviadas
  const remote = useRef<{ docentes?: unknown; disciplinas?: unknown; formularios?: unknown }>({});

  // Já temos o estado da sala? (líder sempre; convidado após o 1º FULL_DATA)
  const synced = useRef(false);
  useEffect(() => {
    synced.current = isInRoom && isOwner;
    pending.current = {};
  }, [isInRoom, isOwner]);

  // Recebimento
  useEffect(() => {
    if (!isInRoom) return;

    const offData = onDataUpdate((payload) => {
      if (payload.type !== "FULL_DATA" || !payload.data) return;
      const data = JSON.parse(payload.data, jsonReviver);
      if (data.docentes || data.disciplinas) synced.current = true;

      if (data.docentes) {
        remote.current.docentes = data.docentes;
        setDocentes(data.docentes);
      }
      if (data.disciplinas) {
        remote.current.disciplinas = data.disciplinas;
        setDisciplinas(data.disciplinas);
      }
      if (data.formularios) {
        remote.current.formularios = data.formularios;
        setFormularios(data.formularios);
      }
      if (data.atribuicoes) setAtribuicoes(data.atribuicoes);
      if (data.travas) setTravas(data.travas);
    });

    const offAssignment = onAssignmentChange((payload) => {
      if (!payload.assignment) return;
      const change = JSON.parse(payload.assignment, jsonReviver);
      setAtribuicoes((prev) => applyAssignmentDelta(prev, change));
    });

    return () => {
      offData();
      offAssignment();
    };
  }, [
    isInRoom,
    onDataUpdate,
    onAssignmentChange,
    setDocentes,
    setDisciplinas,
    setAtribuicoes,
    setFormularios,
    setTravas,
  ]);

  // Líder responde a quem entra / pede sincronização, em qualquer página
  useEffect(() => {
    if (!isInRoom || !isOwner) return;
    return onDataRequest(() => {
      broadcastDataUpdate({ ...latest.current }, "FULL_DATA");
    });
  }, [isInRoom, isOwner, onDataRequest, broadcastDataUpdate]);

  // Envio automático de mudanças locais (cadastro, seleção, importação...)
  const previous = useRef({ docentes, disciplinas, formularios });
  const pending = useRef<Record<string, unknown>>({});
  useEffect(() => {
    const prev = previous.current;
    previous.current = { docentes, disciplinas, formularios };
    // Convidado só envia depois de receber o estado do líder, para não
    // espalhar dados locais antigos ao entrar ou ao recarregar a página
    if (!isInRoom || !canEdit || !synced.current) return;

    if (docentes !== prev.docentes && docentes !== remote.current.docentes) {
      pending.current.docentes = docentes;
    }
    if (
      disciplinas !== prev.disciplinas &&
      disciplinas !== remote.current.disciplinas
    ) {
      pending.current.disciplinas = disciplinas;
    }
    if (
      formularios !== prev.formularios &&
      formularios !== remote.current.formularios
    ) {
      pending.current.formularios = formularios;
    }
    if (Object.keys(pending.current).length === 0) return;

    const id = setTimeout(() => {
      broadcastDataUpdate(pending.current, "FULL_DATA");
      pending.current = {};
    }, AUTO_BROADCAST_DELAY_MS);
    return () => clearTimeout(id);
  }, [docentes, disciplinas, formularios, isInRoom, canEdit, broadcastDataUpdate]);

  return null;
}
