"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { HistoricoSolucao } from "@/context/Global/utils";
import {
  serializeEntityRef,
  type EntityRef,
} from "@/app/[locale]/history/state/detailNavigation";
import { resolveCompareParams, type CompareTab } from "./compareParams";

/**
 * Estado da tela na URL: `?a=&b=&tab=&ent=`. Aceita `?ids=a,b` (link do histórico) e o
 * converte com `replace`. Tudo usa `replace`: o voltar do navegador sai da comparação.
 */
export function useCompareParams(
  history: Map<string, HistoricoSolucao>,
  currentId: string | undefined,
) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const raw = {
    a: params.get("a"),
    b: params.get("b"),
    ids: params.get("ids"),
    tab: params.get("tab"),
    ent: params.get("ent"),
  };
  const resolved = useMemo(
    () => resolveCompareParams(raw, history, currentId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [raw.a, raw.b, raw.ids, raw.tab, raw.ent, history, currentId],
  );

  const update = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(paramsRef.current.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      if (qs === paramsRef.current.toString()) return;
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  // Ids além dos dois primeiros: guardados para o aviso, já que `?ids=` sai da URL
  const [ignored, setIgnored] = useState<string[]>([]);
  useEffect(() => {
    if (resolved.ignored.length > 0) setIgnored(resolved.ignored);
  }, [resolved.ignored]);

  const { changes } = resolved;
  useEffect(() => {
    if (changes) update(changes);
  }, [changes, update]);

  const setA = useCallback(
    (id: string | null) =>
      update({
        a: id,
        ...(id && id === paramsRef.current.get("b") ? { b: null } : {}),
      }),
    [update],
  );
  const setB = useCallback(
    (id: string | null) =>
      update({
        b: id,
        ...(id && id === paramsRef.current.get("a") ? { a: null } : {}),
      }),
    [update],
  );
  const { a, b } = resolved;
  const swap = useCallback(() => {
    if (a && b) update({ a: b, b: a });
  }, [a, b, update]);
  const setTab = useCallback(
    (tab: CompareTab) => update({ tab: tab === "overview" ? null : tab }),
    [update],
  );
  const setEntity = useCallback(
    (ref: EntityRef | null) => update({ ent: serializeEntityRef(ref) }),
    [update],
  );

  return {
    ...resolved,
    ignored,
    dismissIgnored: () => setIgnored([]),
    setA,
    setB,
    swap,
    setTab,
    setEntity,
  };
}
