import { useSyncExternalStore } from "react";

/** Índices da linha/coluna sob o mouse; -1 = nenhuma. */
export interface HoverState {
  r: number;
  c: number;
}

export interface HoverStore {
  get: () => HoverState;
  set: (next: HoverState) => void;
  subscribe: (listener: () => void) => () => void;
}

const NONE: HoverState = { r: -1, c: -1 };

/**
 * Store mínimo fora do React state da grade: mudar o hover não re-renderiza células (P1).
 */
export function createHoverStore(): HoverStore {
  let state = NONE;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (next) => {
      if (next.r === state.r && next.c === state.c) return;
      state = next.r === -1 && next.c === -1 ? NONE : next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function useHoverState(store: HoverStore): HoverState {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
