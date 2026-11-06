"use client";

import type React from "react";
import { useCallback } from "react";
import { resolveEscape, type EscapeAction, type EscapeLayer } from "../../state/detailNavigation";

export function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el || typeof el.tagName !== "string") return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

interface DetailKeyboardParams {
  /** Camada interna aberta (inspetor sobreposto, nível da pilha) ou null. */
  escapeLayer: EscapeLayer | null;
  onEscape: (action: EscapeAction) => void;
  onNavigate: (delta: number) => void;
  onRestore: () => void;
}

/**
 * Teclado do diálogo (4.4): Esc em camadas (via `onClose` do Dialog), Alt+←/→ entre soluções e
 * R para restaurar fora de campos de texto.
 */
export function useDetailKeyboard({ escapeLayer, onEscape, onNavigate, onRestore }: DetailKeyboardParams) {
  /** Para o `onClose` do Dialog: Esc fecha o nível mais interno primeiro. */
  const handleClose = useCallback(
    (_event: unknown, reason?: "backdropClick" | "escapeKeyDown") => {
      if (reason === "escapeKeyDown") onEscape(resolveEscape(escapeLayer));
      else onEscape("closeDialog");
    },
    [escapeLayer, onEscape],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Eventos de menus em portal também sobem pela árvore React: ignorar o que não é do diálogo
      if (!(event.currentTarget as Node).contains(event.target as Node)) return;
      if (event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        onNavigate(event.key === "ArrowLeft" ? -1 : 1);
        return;
      }
      if (
        (event.key === "r" || event.key === "R") &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !isTypingTarget(event.target)
      ) {
        event.preventDefault();
        onRestore();
      }
    },
    [onNavigate, onRestore],
  );

  return { handleClose, onKeyDown };
}
