"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { GridSortModel } from "@mui/x-data-grid";
import { TipoInsercao, type HistoricoSolucao } from "@/context/Global/utils";
import { bestEvaluation, type SolutionSummary } from "../model/solutionSummary";
import { chronologicalKey } from "../model/sort";
import { getSolutionDetail, getSolutionSummary } from "./summaryCache";
import {
  invalidParamChanges,
  navigationChanges,
  neighborId,
  parseEntityRef,
  serializeEntityRef,
  type EntityRef,
} from "./detailNavigation";

export type { EntityRef } from "./detailNavigation";

export interface HistoryRow extends SolutionSummary {
  /** Posição no Map (ordem de inserção, H-B1). */
  order: number;
  /** Chave cronológica (data + ordem de inserção como desempate). */
  chrono: number;
  isCurrent: boolean;
  isBest: boolean;
  /** Diferença para a melhor avaliação (≤ 0). */
  deltaFromBest?: number;
  /** Cobertura 0..1, para ordenar a coluna. */
  coverage: number;
}


export const ALL_ORIGINS: TipoInsercao[] = [
  TipoInsercao.Algoritmo,
  TipoInsercao.Manual,
  TipoInsercao.Importação,
];

export const SORT_FIELDS = ["chrono", "avaliacao", "coverage", "conflitos", "tempoExecucaoMs", "origin"] as const;
export const DEFAULT_SORT: GridSortModel = [{ field: "chrono", sort: "desc" }];

function parseSort(raw: string | null): GridSortModel {
  if (!raw) return DEFAULT_SORT;
  const [field, dir] = raw.split(":");
  if (!(SORT_FIELDS as readonly string[]).includes(field)) return DEFAULT_SORT;
  return [{ field, sort: dir === "asc" ? "asc" : "desc" }];
}

function serializeSort(model: GridSortModel): string | null {
  const first = model[0];
  if (!first?.sort) return null;
  const value = `${first.field}:${first.sort}`;
  return value === "chrono:desc" ? null : value;
}

function parseList(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const parseEntity = parseEntityRef;

/** A entidade existe (ativa) na solução? */
export function entityExistsIn(entry: HistoricoSolucao | undefined, ref: EntityRef): boolean {
  if (!entry) return false;
  const detail = getSolutionDetail(entry);
  return ref.kind === "docente" ? detail.docentes.has(ref.id) : detail.turmas.has(ref.id);
}

function sortRows(rows: HistoryRow[], model: GridSortModel): HistoryRow[] {
  const first = model[0];
  if (!first?.sort) return rows;
  const dir = first.sort === "asc" ? 1 : -1;
  const field = first.field as keyof HistoryRow;
  return [...rows].sort((a, b) => {
    const va = a[field] as number | string | undefined;
    const vb = b[field] as number | string | undefined;
    // Valores ausentes sempre no fim
    if (va === undefined && vb === undefined) return b.chrono - a.chrono;
    if (va === undefined) return 1;
    if (vb === undefined) return -1;
    if (va < vb) return -dir;
    if (va > vb) return dir;
    return b.chrono - a.chrono;
  });
}

/**
 * Estado da lista (5.2): ordenação, filtro de origem, busca, seleção e painel aberto, todos em
 * search params (`?sort=…&origem=…&q=…&sel=…&detalhe=…&ent=…&insp=…`), para o voltar do navegador
 * funcionar e o link poder ser colado. Abrir o detalhe usa `push`; trocar `ent`/`insp` e navegar
 * entre soluções usa `replace`, então voltar no navegador fecha o diálogo de uma vez.
 */
export function useHistoryList(
  historicoSolucoes: Map<string, HistoricoSolucao>,
  currentId: string | undefined,
  searchTextOf: (row: HistoryRow) => string,
) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Memos por string: mudar só o painel (`detalhe`/`ent`) não recria o estado da lista (seção 6)
  const sortParam = params.get("sort");
  const sortModel = useMemo(() => parseSort(sortParam), [sortParam]);
  const originsParam = params.get("origem");
  const origins = useMemo(() => {
    const list = parseList(originsParam).filter((o) =>
      (ALL_ORIGINS as string[]).includes(o),
    ) as TipoInsercao[];
    return list;
  }, [originsParam]);
  const query = params.get("q") ?? "";
  const selParam = params.get("sel");
  const selection = useMemo(() => {
    const ids = parseList(selParam);
    return ids.filter((id) => historicoSolucoes.has(id));
  }, [selParam, historicoSolucoes]);
  const detailParam = params.get("detalhe");
  const detailId = detailParam && historicoSolucoes.has(detailParam) ? detailParam : null;
  const entParam = params.get("ent");
  const entity = useMemo(() => parseEntityRef(entParam), [entParam]);
  const inspParam = params.get("insp");
  const inspect = useMemo(() => parseEntityRef(inspParam), [inspParam]);

  const paramsRef = useRef(params);
  paramsRef.current = params;
  const detailRef = useRef(detailId);
  detailRef.current = detailId;

  // Navegação em andamento: a URL ainda não refletiu a última mudança
  const pending = useRef<{ qs: string; at: number } | null>(null);

  const update = useCallback(
    (changes: Record<string, string | null>, mode: "push" | "replace" = "replace") => {
      const next = new URLSearchParams(paramsRef.current.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      pending.current = { qs, at: Date.now() };
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (mode === "push") router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [pathname, router],
  );

  const allRows = useMemo<HistoryRow[]>(() => {
    const summaries: HistoryRow[] = [];
    let order = 0;
    historicoSolucoes.forEach((entry, key) => {
      const summary = getSolutionSummary(entry, key);
      summaries.push({
        ...summary,
        order,
        chrono: chronologicalKey(summary.createdAt, order),
        isCurrent: currentId === key,
        isBest: false,
        coverage: summary.turmasAtivas > 0 ? summary.turmasAtendidas / summary.turmasAtivas : 0,
      });
      order++;
    });
    const best = bestEvaluation(summaries);
    if (best !== undefined) {
      for (const row of summaries) {
        if (row.avaliacao === undefined) continue;
        row.isBest = row.avaliacao === best;
        row.deltaFromBest = row.avaliacao - best;
      }
    }
    return summaries;
  }, [historicoSolucoes, currentId]);

  const rows = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    const filtered = allRows.filter((row) => {
      if (origins.length > 0 && !origins.includes(row.origin)) return false;
      if (needle && !searchTextOf(row).toLocaleLowerCase().includes(needle)) return false;
      return true;
    });
    return sortRows(filtered, sortModel);
  }, [allRows, origins, query, sortModel, searchTextOf]);

  const setSortModel = useCallback(
    (model: GridSortModel) => update({ sort: serializeSort(model) }, "push"),
    [update],
  );
  const setOrigins = useCallback(
    (next: TipoInsercao[]) => update({ origem: next.length ? next.join(",") : null }, "push"),
    [update],
  );
  const setQuery = useCallback((next: string) => update({ q: next || null }), [update]);
  const setSelection = useCallback(
    (ids: string[]) => update({ sel: ids.length ? ids.join(",") : null }),
    [update],
  );
  const historyRef = useRef(historicoSolucoes);
  historyRef.current = historicoSolucoes;
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const existsInRef = useCallback(
    (id: string) => (ref: EntityRef) => entityExistsIn(historyRef.current.get(id), ref),
    [],
  );

  // Parâmetros inválidos (link antigo, solução excluída): limpos sem erro, com replace (5)
  const detalheRaw = params.get("detalhe");
  useEffect(() => {
    if (pending.current) {
      const caughtUp = paramsRef.current.toString() === pending.current.qs;
      const stale = Date.now() - pending.current.at > 1000;
      if (!caughtUp && !stale) return;
      pending.current = null;
    }
    const changes = invalidParamChanges(
      { detalhe: detalheRaw, ent: entParam, insp: inspParam },
      (id) => historicoSolucoes.has(id),
      existsInRef(detalheRaw ?? ""),
    );
    if (changes) update(changes);
  }, [detalheRaw, entParam, inspParam, historicoSolucoes, existsInRef, update]);

  // Se o diálogo foi aberto com push nesta sessão, fechar volta no histórico do navegador
  const openedByPush = useRef(false);
  useEffect(() => {
    if (!detailId) openedByPush.current = false;
  }, [detailId]);

  const openDetail = useCallback(
    (id: string) => {
      if (id === detailRef.current) return;
      const current = parseEntityRef(paramsRef.current.get("ent"));
      openedByPush.current = true;
      update(
        navigationChanges(id, current, existsInRef(id)),
        "push",
      );
    },
    [update, existsInRef],
  );
  const closeDetail = useCallback(() => {
    if (openedByPush.current) {
      openedByPush.current = false;
      router.back();
    } else {
      update({ detalhe: null, ent: null, insp: null });
    }
  }, [update, router]);
  /** Troca a solução aberta sem fechar (‹ ›, exclusão da aberta). `null` fecha. */
  const showDetail = useCallback(
    (id: string | null) => {
      if (!id) {
        closeDetail();
        return;
      }
      const current = parseEntityRef(paramsRef.current.get("ent"));
      update(navigationChanges(id, current, existsInRef(id)));
    },
    [update, closeDetail, existsInRef],
  );
  const navigateDetail = useCallback(
    (delta: number) => {
      const next = neighborId(rowsRef.current, detailRef.current, delta);
      if (next) showDetail(next);
    },
    [showDetail],
  );
  const setEntity = useCallback(
    (next: EntityRef | null) => update({ ent: serializeEntityRef(next), insp: null }),
    [update],
  );
  const setInspect = useCallback(
    (next: EntityRef | null) => update({ insp: serializeEntityRef(next) }),
    [update],
  );

  return {
    allRows,
    rows,
    sortModel,
    setSortModel,
    origins,
    setOrigins,
    query,
    setQuery,
    selection,
    setSelection,
    detailId,
    entity: detailId ? entity : null,
    inspect: detailId ? inspect : null,
    openDetail,
    closeDetail,
    showDetail,
    navigateDetail,
    setEntity,
    setInspect,
  };
}
