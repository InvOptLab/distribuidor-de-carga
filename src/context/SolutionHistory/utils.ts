import type React from "react";
import { Solucao } from "@/algoritmo/communs/interfaces/interfaces";
import { getFormattedDate } from "@/app/[locale]/atribuicoes/io/exportJson";
import { nextFreeHistoryId } from "@/app/[locale]/history/model/sort";
import {
  ContextoExecucao,
  HistoricoSolucao,
  TipoInsercao,
} from "../Global/utils";

/**
 * Ids já emitidos nesta sessão. Cobre inserções no mesmo tick, antes de o Map do estado
 * refletir a anterior.
 */
const issuedIds = new Set<string>();

/**
 * Função que adiciona uma nova solução ao histórico
 * @param novaSolucao
 * @param setHistoricoSolucoes
 * @param historicoSolucoes
 * @returns {string} Identificador da solução no histórico
 */
export function addNewSolutionToHistory(
  novaSolucao: Solucao,
  setHistoricoSolucoes: React.Dispatch<
    React.SetStateAction<Map<string, HistoricoSolucao>>
  >,
  historicoSolucoes: Map<string, HistoricoSolucao>,
  tipoInsercao: TipoInsercao,
  contextoExecucao: ContextoExecucao,
): string {
  const date = new Date();
  // Mesmo formato legível de antes; `_2`, `_3`… só quando o segundo já foi usado
  const id = nextFreeHistoryId(
    getFormattedDate(date),
    (candidate) => historicoSolucoes.has(candidate) || issuedIds.has(candidate),
  );
  issuedIds.add(id);

  const entrada: HistoricoSolucao = {
    id: id,
    solucao: novaSolucao,
    datetime: date.toLocaleString(),
    tipoInsercao: tipoInsercao,
    contexto: contextoExecucao,
    algorithm: novaSolucao.algorithm,
  };

  // Updater funcional: inserções concorrentes não se sobrescrevem
  setHistoricoSolucoes((prev) => {
    const next = new Map(prev);
    next.set(id, entrada);
    return next;
  });
  return id;
}

/**
 * Função que irá atualizar o state solucaoAtual, que acabou de ser inserida no histórico, adicionando um identificador.
 * @param setSolucaoAtual Função que atribuí o state da solução atual
 * @param {string} id Identificador da solução no histórico
 */
export function updateSolutionId(
  setSolucaoAtual: React.Dispatch<React.SetStateAction<Solucao>>,
  id: string,
) {
  setSolucaoAtual((solucaoAtual) => ({
    ...solucaoAtual, // Copia as propriedades existentes de Solucao
    idHistorico: id, // Atualiza apenas o idHistorico
  }));
}

/** Remove entradas do Map (puro). */
export function withoutEntries(
  map: Map<string, HistoricoSolucao>,
  ids: Iterable<string>,
): Map<string, HistoricoSolucao> {
  const next = new Map(map);
  for (const id of ids) next.delete(id);
  return next;
}

/**
 * Reinsere entradas na posição original (puro). `positions` é o índice que cada id tinha no Map
 * antes da remoção; ids que já existem são ignorados.
 */
export function withEntriesAt(
  map: Map<string, HistoricoSolucao>,
  entries: { id: string; entry: HistoricoSolucao; position: number }[],
): Map<string, HistoricoSolucao> {
  const pending = entries
    .filter((e) => !map.has(e.id))
    .sort((a, b) => a.position - b.position);
  if (pending.length === 0) return map;

  const result: [string, HistoricoSolucao][] = Array.from(map.entries());
  for (const item of pending) {
    const index = Math.min(Math.max(0, item.position), result.length);
    result.splice(index, 0, [item.id, item.entry]);
  }
  return new Map(result);
}
