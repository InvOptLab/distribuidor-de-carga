"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type React from "react";
import { styled, useTheme } from "@mui/material";
import { useTranslations } from "next-intl";
import { useAccessibility } from "@/context/Accessibility";
import { useTimetable } from "../../context/TimetableContext";
import { cellKey } from "../../model/gridModel";
import {
  createHoverStore,
  type HoverStore,
  useHoverState,
} from "../../state/interactionStore";
import type { DetailsTarget } from "../../state/detailsTarget";
import type { Density } from "../../state/useDensity";
import { gridTokens, type GridTokens } from "../../theme/gridTokens";
import {
  computeWindow,
  type GridMetrics,
  type GridWindow,
  sameWindow,
  scrollToReveal,
} from "../../state/gridWindow";
import GridCell from "./GridCell";
import TurmaHeader from "./TurmaHeader";
import DocenteRowHeader from "./DocenteRowHeader";

interface AssignmentGridProps {
  density: Density;
  /** Pré-visualização no hover (B14). */
  onPreview: (target: DetailsTarget) => void;
  onLeave: () => void;
  /** Clique no cabeçalho/nome fora do modo trava, ou tecla I: fixa o painel. */
  onPin: (target: DetailsTarget) => void;
  onUnpin: () => void;
}

const NO_HOVER = { r: -1, c: -1 };

// Medidas esperadas por densidade (as reais são lidas do DOM depois do primeiro render)
const DEFAULT_METRICS: Record<Density, GridMetrics> = {
  compact: { rowHeaderWidth: 144, headerHeight: 85, colWidth: 92, rowHeight: 29 },
  comfortable: { rowHeaderWidth: 176, headerHeight: 117, colWidth: 128, rowHeight: 37 },
};

// Cursor de cadeado para o modo trava (U10)
const LOCK_CURSOR = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#ed6c02" stroke="#fff" stroke-width="1.2" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/></svg>',
)}") 10 10, pointer`;

// Estilos estáticos (fora do render, P5/P6). Só variam com tema, alto contraste, densidade e modo trava.
const GridRoot = styled("div", {
  shouldForwardProp: (prop) =>
    prop !== "hc" && prop !== "lockMode" && prop !== "density",
})<{ hc: boolean; lockMode: boolean; density: Density }>(
  ({ theme, hc, lockMode, density }) => {
    const tk = gridTokens(theme, hc);
    const compact = density === "compact";
    const cellStates = Object.fromEntries(
      Object.entries(tk.cell).map(([state, style]) => [
        `& td.c[data-s="${state}"]`,
        style,
      ]),
    );
    const pointer = lockMode ? LOCK_CURSOR : "pointer";

    return {
      // Tamanhos em px inteiros: os espaçadores da virtualização precisam compensar exatamente
      // as linhas/colunas fora da janela, senão a área de rolagem muda a cada troca de janela.
      "--col-w": compact ? "92px" : "128px",
      "--cell-h": compact ? "28px" : "36px",
      "--hdr-h": compact ? "84px" : "116px",
      "--row-w": compact ? "144px" : "176px",
      position: "relative",
      flex: 1,
      minHeight: 0,
      width: "100%",
      overflow: "auto",
      outline: "none",
      borderTop: lockMode
        ? `3px solid ${tk.lockModeAccent}`
        : `1px solid ${tk.border}`,
      color: theme.palette.text.primary,

      "& table": {
        borderCollapse: "separate",
        borderSpacing: 0,
        ...theme.typography.body2,
        fontSize: compact ? "0.8125rem" : "0.875rem",
      },
      "& th, & td": {
        borderRight: `1px solid ${tk.border}`,
        borderBottom: `1px solid ${tk.border}`,
        backgroundColor: tk.paper,
        padding: 0,
      },
      // Espaçadores da virtualização (Fase 6): ocupam a área das linhas/colunas fora da janela
      "& th.sp, & td.sp": {
        padding: 0,
        border: "none",
        background: "transparent",
        position: "static",
      },
      "& tr.sp-row td": { padding: 0, border: "none" },
      "& th:focus-visible, & td:focus-visible": {
        outline: tk.focusRing,
        outlineOffset: -3,
        zIndex: 4,
      },
      "& thead th": {
        position: "sticky",
        top: 0,
        zIndex: 2,
        verticalAlign: "top",
        textAlign: "left",
      },
      "& thead th.corner": {
        left: 0,
        zIndex: 3,
        width: "var(--row-w)",
        minWidth: "var(--row-w)",
        maxWidth: "var(--row-w)",
        textAlign: "center",
        verticalAlign: "middle",
        fontWeight: "bold",
      },

      // Cabeçalho de turma (compacto, sem expansão sobreposta: U4)
      "& th.col": { cursor: pointer },
      "& th.col[data-locked]": { backgroundImage: tk.lockedPattern },
      "& th.col .hdr": {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "var(--col-w)",
        height: "var(--hdr-h)",
        padding: compact ? "4px 4px" : "6px 6px",
        overflow: "hidden",
      },
      "& .hdr-top": { display: "flex", alignItems: "center", gap: 2 },
      "& .hdr-code": {
        fontWeight: 700,
        fontSize: compact ? "0.75rem" : "0.8125rem",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
      "& .hdr-badge": {
        marginLeft: "auto",
        minWidth: 18,
        height: 18,
        padding: "0 4px",
        borderRadius: 9,
        fontSize: "0.6875rem",
        fontWeight: 700,
        lineHeight: "18px",
        textAlign: "center",
        backgroundColor: hc ? "#FFFF00" : theme.palette.primary.main,
        color: hc ? "#000000" : theme.palette.primary.contrastText,
      },
      "& .hdr-badge.empty": {
        backgroundColor: hc ? "#FFFFFF" : theme.palette.warning.light,
        color: hc ? "#000000" : theme.palette.warning.contrastText,
      },
      "& .hdr-name": {
        fontSize: compact ? "0.6875rem" : "0.75rem",
        lineHeight: 1.25,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      },
      "& .hdr-cursos": {
        fontSize: "0.6875rem",
        color: theme.palette.text.secondary,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
      "& .hdr-days": {
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        overflow: "hidden",
      },
      "& .day": {
        fontSize: "0.625rem",
        lineHeight: "14px",
        padding: "0 4px",
        borderRadius: 7,
        whiteSpace: "nowrap",
        border: `1px solid ${tk.border}`,
        color: theme.palette.text.secondary,
        fontVariantNumeric: "tabular-nums",
      },
      "& .day.tbd": { fontStyle: "italic" },
      "& .ico": { fontSize: "0.875rem", flexShrink: 0 },
      "& .ico.warn": { color: tk.conflict.color },

      // Coluna fixa de docentes (B4)
      "& th.row": {
        position: "sticky",
        left: 0,
        zIndex: 1,
        width: "var(--row-w)",
        minWidth: "var(--row-w)",
        maxWidth: "var(--row-w)",
        textAlign: "left",
        cursor: pointer,
      },
      "& th.row[data-locked]": { backgroundImage: tk.lockedPattern },
      "& th.row[data-conflict]": {
        backgroundColor: tk.conflict.background,
        color: tk.conflict.color,
      },
      "& th.row .nm": {
        display: "flex",
        alignItems: "center",
        gap: 4,
        height: "var(--cell-h)",
        padding: "0 8px",
        fontWeight: 600,
      },
      "& .nm-txt": {
        flex: 1,
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
      "& .nm-carga": {
        fontSize: "0.75rem",
        fontWeight: 400,
        color: theme.palette.text.secondary,
        fontVariantNumeric: "tabular-nums",
      },

      // Células
      "& td.c": {
        position: "relative",
        width: "var(--col-w)",
        minWidth: "var(--col-w)",
        maxWidth: "var(--col-w)",
        height: "var(--cell-h)",
        textAlign: "center",
        verticalAlign: "middle",
        fontVariantNumeric: "tabular-nums",
        fontWeight: 600,
        cursor: pointer,
        transition: "background-color 120ms ease, box-shadow 120ms ease",
      },
      ...cellStates,
      "& td.c[data-locked]": {
        backgroundImage: tk.lockedPattern,
        ...(tk.lockedBorder && { border: tk.lockedBorder }),
      },
      "& td.c[data-r]:hover": { boxShadow: tk.hoverCell },
      "& td.c .ck": {
        position: "absolute",
        top: 1,
        right: 1,
        fontSize: "0.75rem",
      },
      "& td.c .lk": {
        position: "absolute",
        bottom: 1,
        right: 1,
        fontSize: "0.7rem",
        opacity: 0.85,
      },
      "@keyframes ag-shake": {
        "0%, 100%": { transform: "translateX(0)" },
        "25%": { transform: "translateX(-3px)" },
        "75%": { transform: "translateX(3px)" },
      },
      "& .shake": { animation: "ag-shake 240ms ease" },
      "@media (prefers-reduced-motion: reduce)": {
        "& td.c": { transition: "none" },
        "& .shake": { animation: "none" },
      },
    };
  },
);

const Tip = styled("div")(({ theme }) => ({
  position: "fixed",
  zIndex: theme.zIndex.tooltip,
  pointerEvents: "none",
  padding: "2px 8px",
  borderRadius: 4,
  fontSize: "0.75rem",
  backgroundColor: theme.palette.grey[800],
  color: theme.palette.common.white,
  opacity: 0,
  transition: "opacity 120ms ease",
  "&.show": { opacity: 1 },
}));

const VisuallyHidden = styled("div")({
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
});

/**
 * Realce de linha/coluna (B13) via CSS gerado a partir do store: nenhuma célula re-renderiza no hover.
 */
function HoverHighlight({
  store,
  scope,
  tokens,
}: {
  store: HoverStore;
  scope: string;
  tokens: GridTokens;
}) {
  const { r, c } = useHoverState(store);
  const s = `[data-grid="${scope}"]`;
  let css = "";
  if (r >= 0) {
    css +=
      `${s} td.c[data-r="${r}"]{box-shadow:${tokens.hoverLine}}` +
      `${s} th.row[data-r="${r}"]{box-shadow:inset 0 0 0 100px ${tokens.header.hover}}`;
  }
  if (c >= 0) {
    css +=
      `${s} td.c[data-c="${c}"]{box-shadow:${tokens.hoverLine}}` +
      `${s} th.col[data-c="${c}"]{box-shadow:inset 0 0 0 100px ${tokens.header.hover}}`;
  }
  return <style>{css}</style>;
}

const TARGETS = "td.c, th.col, th.row, th.corner";

interface Pos {
  r: number; // -1 = linha de cabeçalho
  c: number; // -1 = coluna de docentes
}

export default function AssignmentGrid({
  density,
  onPreview,
  onLeave,
  onPin,
  onUnpin,
}: AssignmentGridProps) {
  const {
    filteredDocentes,
    filteredDisciplinas,
    model,
    isLockMode,
    setIsLockMode,
    commands,
  } = useTimetable();
  const { isHighContrast } = useAccessibility();
  const theme = useTheme();
  const tokens = useMemo(
    () => gridTokens(theme, isHighContrast),
    [theme, isHighContrast],
  );
  const t = useTranslations("Pages.Assignment.Grid");
  const tGrid = useTranslations("Pages.Assignment.TimetableGrid");

  const scope = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [hoverStore] = useState(createHoverStore);
  const zoneRef = useRef("");
  const rootRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const tipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rows = filteredDocentes;
  const cols = filteredDisciplinas;

  // Roving tabindex (5.8)
  const [activePos, setActivePos] = useState<Pos>({ r: 0, c: 0 });
  const active: Pos = {
    r: Math.min(activePos.r, rows.length - 1),
    c: Math.min(activePos.c, cols.length - 1),
  };
  const focusPending = useRef(false);

  // Virtualização 2D (Fase 6): só a janela visível (+ overscan) vai para o DOM
  const [metrics, setMetrics] = useState<GridMetrics>(DEFAULT_METRICS[density]);
  const metricsRef = useRef(metrics);
  metricsRef.current = metrics;
  const countsRef = useRef({ rows: rows.length, cols: cols.length });
  countsRef.current = { rows: rows.length, cols: cols.length };
  const [win, setWin] = useState<GridWindow>(() =>
    computeWindow(rows.length, cols.length, { scrollTop: 0, scrollLeft: 0, width: 0, height: 0 }, metrics),
  );

  const readViewport = () => {
    const root = rootRef.current;
    return root
      ? {
          scrollTop: root.scrollTop,
          scrollLeft: root.scrollLeft,
          width: root.clientWidth,
          height: root.clientHeight,
        }
      : { scrollTop: 0, scrollLeft: 0, width: 0, height: 0 };
  };

  const updateWindow = useCallback(() => {
    const next = computeWindow(
      countsRef.current.rows,
      countsRef.current.cols,
      readViewport(),
      metricsRef.current,
    );
    setWin((prev) => (sameWindow(prev, next) ? prev : next));
  }, []);

  // Mede as dimensões reais só quando densidade, tema ou a existência de linhas/colunas mudam.
  // Não roda a cada render: medir depois de cada troca de janela realimentava o próprio cálculo.
  const hasCells = rows.length > 0 && cols.length > 0;
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const headerRow = root.querySelector<HTMLElement>("thead tr");
    const corner = root.querySelector<HTMLElement>("th.corner");
    const cell = root.querySelector<HTMLElement>("td.c");
    const bodyRow = cell?.parentElement;
    const next: GridMetrics = {
      rowHeaderWidth: corner?.offsetWidth || DEFAULT_METRICS[density].rowHeaderWidth,
      headerHeight: headerRow?.offsetHeight || DEFAULT_METRICS[density].headerHeight,
      colWidth: cell?.offsetWidth || DEFAULT_METRICS[density].colWidth,
      rowHeight: bodyRow?.offsetHeight || DEFAULT_METRICS[density].rowHeight,
    };
    const prev = metricsRef.current;
    if (
      Math.abs(prev.rowHeaderWidth - next.rowHeaderWidth) > 0.5 ||
      Math.abs(prev.headerHeight - next.headerHeight) > 0.5 ||
      Math.abs(prev.colWidth - next.colWidth) > 0.5 ||
      Math.abs(prev.rowHeight - next.rowHeight) > 0.5
    ) {
      metricsRef.current = next;
      setMetrics(next);
    }
  }, [density, theme, isHighContrast, hasCells]);

  // Recalcula a janela quando contagens ou medidas mudam (scroll e resize têm seus próprios gatilhos)
  useLayoutEffect(() => {
    updateWindow();
  }, [rows.length, cols.length, metrics, updateWindow]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => updateWindow());
    observer.observe(root);
    return () => observer.disconnect();
  }, [updateWindow]);

  const r0 = Math.min(win.r0, rows.length);
  const r1 = Math.min(win.r1, rows.length);
  const c0 = Math.min(win.c0, cols.length);
  const c1 = Math.min(win.c1, cols.length);
  const activeRendered =
    (active.r === -1 || (active.r >= r0 && active.r < r1)) &&
    (active.c === -1 || (active.c >= c0 && active.c < c1));

  // Cor por prioridade calculada uma vez por valor
  const priorityColor = useMemo(() => {
    const cache = new Map<number, { bg: string; fg: string }>();
    return (priority: number) => {
      let color = cache.get(priority);
      if (color === undefined) {
        color = tokens.ramp(priority, model.maxPriority);
        cache.set(priority, color);
      }
      return color;
    };
  }, [tokens, model.maxPriority]);

  const labels = useMemo(
    () => ({
      noForm: t("noForm"),
      assigned: t("assigned"),
      notAssigned: t("notAssigned"),
      locked: t("locked"),
      priority: (p: number) => t("priority", { priority: p }),
    }),
    [t],
  );

  const announce = (message: string) => {
    if (liveRef.current) liveRef.current.textContent = message;
  };

  const findEl = (pos: Pos): HTMLElement | null => {
    const root = rootRef.current;
    if (!root) return null;
    if (pos.r < 0 && pos.c < 0) return root.querySelector("th.corner");
    if (pos.r < 0) return root.querySelector(`th.col[data-c="${pos.c}"]`);
    if (pos.c < 0) return root.querySelector(`th.row[data-r="${pos.r}"]`);
    return root.querySelector(`td.c[data-r="${pos.r}"][data-c="${pos.c}"]`);
  };

  // Foca o destino assim que ele entrar na janela renderizada
  useEffect(() => {
    if (!focusPending.current) return;
    const el = findEl(active);
    if (!el) return;
    focusPending.current = false;
    el.focus({ preventScroll: true });
  });

  const moveTo = (pos: Pos) => {
    const next = {
      r: Math.max(-1, Math.min(rows.length - 1, pos.r)),
      c: Math.max(-1, Math.min(cols.length - 1, pos.c)),
    };
    const root = rootRef.current;
    if (root) {
      const { scrollTop, scrollLeft } = scrollToReveal(
        next.r,
        next.c,
        readViewport(),
        metricsRef.current,
      );
      root.scrollTop = scrollTop;
      root.scrollLeft = scrollLeft;
      updateWindow();
    }
    focusPending.current = true;
    setActivePos(next);
  };

  const showLockedFeedback = (el: HTMLElement) => {
    el.classList.remove("shake");
    void el.offsetWidth; // reinicia a animação
    el.classList.add("shake");
    el.addEventListener("animationend", () => el.classList.remove("shake"), {
      once: true,
    });
    const tip = tipRef.current;
    if (tip) {
      const rect = el.getBoundingClientRect();
      tip.textContent = t("lockedCell");
      tip.style.left = `${rect.left + rect.width / 2}px`;
      tip.style.top = `${rect.top - 24}px`;
      tip.style.transform = "translateX(-50%)";
      tip.classList.add("show");
      if (tipTimer.current) clearTimeout(tipTimer.current);
      tipTimer.current = setTimeout(() => tip.classList.remove("show"), 1200);
    }
    announce(t("lockedCell"));
  };

  /** Aplica a ação de uma célula (clique, Espaço/Enter, L) com anúncio e feedback. */
  const actOnCell = (r: number, c: number, lock: boolean, el?: HTMLElement | null) => {
    const docente = rows[r];
    const disciplina = cols[c];
    if (!docente || !disciplina) return;
    const key = cellKey(docente.nome, disciplina.id);
    const turmaLabel = disciplina.codigo;

    if (!lock && model.cellLocked.has(key)) {
      if (commands.canEdit && el) showLockedFeedback(el);
      commands.cellClick(docente.nome, disciplina.id, false);
      return;
    }
    if (!commands.canEdit) {
      commands.cellClick(docente.nome, disciplina.id, lock);
      return;
    }
    commands.cellClick(docente.nome, disciplina.id, lock);
    if (lock) {
      announce(t("announceCellLock", { docente: docente.nome, turma: turmaLabel }));
    } else {
      announce(
        t(model.assigned.has(key) ? "announceRemoved" : "announceAssigned", {
          docente: docente.nome,
          turma: turmaLabel,
        }),
      );
    }
  };

  const actOnHeader = (pos: Pos, lock: boolean) => {
    if (pos.r < 0 && pos.c >= 0) {
      const disciplina = cols[pos.c];
      if (!disciplina) return;
      if (lock) {
        commands.columnClick(disciplina.id, true);
        if (commands.canEdit) {
          announce(t("announceColumnLock", { turma: disciplina.codigo }));
        }
      } else {
        onPin({ kind: "turma", id: disciplina.id });
      }
    } else if (pos.c < 0 && pos.r >= 0) {
      const docente = rows[pos.r];
      if (!docente) return;
      if (lock) {
        commands.rowClick(docente.nome, true);
        if (commands.canEdit) {
          announce(t("announceRowLock", { docente: docente.nome }));
        }
      } else {
        onPin({ kind: "docente", nome: docente.nome });
      }
    }
  };

  const resolve = (target: EventTarget | null) =>
    (target as Element | null)?.closest?.(TARGETS) as HTMLElement | null;

  const posOf = (el: HTMLElement): Pos => ({
    r: el.dataset.r !== undefined ? Number(el.dataset.r) : -1,
    c: el.dataset.c !== undefined ? Number(el.dataset.c) : -1,
  });

  /** Troca de zona (célula, cabeçalho, nome) para a pré-visualização do painel (B14). */
  const enterZone = (key: string, enter?: () => void) => {
    if (zoneRef.current === key) return;
    zoneRef.current = key;
    if (enter) enter();
    else onLeave();
  };

  const handlePointerOver = (event: React.PointerEvent) => {
    const el = resolve(event.target);
    if (!el) return;
    const { r, c } = posOf(el);

    if (el.classList.contains("c")) {
      hoverStore.set({ r, c });
      enterZone("cell");
    } else if (el.classList.contains("row")) {
      hoverStore.set({ r, c: -1 });
      const docente = rows[r];
      enterZone(
        `r${r}`,
        docente && (() => onPreview({ kind: "docente", nome: docente.nome })),
      );
    } else if (el.classList.contains("col")) {
      hoverStore.set({ r: -1, c });
      const disciplina = cols[c];
      enterZone(
        `c${c}`,
        disciplina && (() => onPreview({ kind: "turma", id: disciplina.id })),
      );
    } else {
      hoverStore.set(NO_HOVER);
      enterZone("corner");
    }
  };

  const handlePointerLeave = () => {
    hoverStore.set(NO_HOVER);
    zoneRef.current = "";
    onLeave();
  };

  const handleClick = (event: React.MouseEvent) => {
    const el = resolve(event.target);
    if (!el) return;
    // Ctrl (ou ⌘ no macOS, D6) + clique trava/destrava
    const lock = isLockMode || event.ctrlKey || event.metaKey;
    const pos = posOf(el);
    if (el.classList.contains("c")) actOnCell(pos.r, pos.c, lock, el);
    else actOnHeader(pos, lock);
  };

  const handleFocus = (event: React.FocusEvent) => {
    const el = resolve(event.target);
    if (!el) return;
    const pos = posOf(el);
    if (pos.r !== activePos.r || pos.c !== activePos.c) setActivePos(pos);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const el = resolve(event.target);
    if (!el) return;
    const pos = posOf(el);
    const ctrl = event.ctrlKey || event.metaKey;
    const plain = !ctrl && !event.altKey;
    const isCell = pos.r >= 0 && pos.c >= 0;
    const key = event.key;

    let handled = true;
    if (key === "ArrowRight") moveTo({ ...pos, c: pos.c + 1 });
    else if (key === "ArrowLeft") moveTo({ ...pos, c: pos.c - 1 });
    else if (key === "ArrowDown") moveTo({ ...pos, r: pos.r + 1 });
    else if (key === "ArrowUp") moveTo({ ...pos, r: pos.r - 1 });
    else if (key === "Home") moveTo(ctrl ? { r: 0, c: 0 } : { ...pos, c: 0 });
    else if (key === "End")
      moveTo(
        ctrl
          ? { r: rows.length - 1, c: cols.length - 1 }
          : { ...pos, c: cols.length - 1 },
      );
    else if (key === " " && ctrl && isCell) actOnCell(pos.r, pos.c, true, el);
    else if ((key === " " || key === "Enter") && !ctrl) {
      if (isCell) actOnCell(pos.r, pos.c, isLockMode, el);
      else actOnHeader(pos, isLockMode);
    } else if ((key === "l" || key === "L") && plain && !event.shiftKey && isCell)
      actOnCell(pos.r, pos.c, true, el);
    else if ((key === "l" || key === "L") && plain && event.shiftKey && !isCell)
      actOnHeader(pos, true);
    else if ((key === "t" || key === "T") && plain) {
      setIsLockMode(!isLockMode);
      announce(t("announceLockMode", { state: isLockMode ? "off" : "on" }));
    } else if ((key === "i" || key === "I") && plain) {
      if (pos.c >= 0 && cols[pos.c]) onPin({ kind: "turma", id: cols[pos.c].id });
      else if (pos.r >= 0 && rows[pos.r])
        onPin({ kind: "docente", nome: rows[pos.r].nome });
    } else if (key === "Escape") {
      if (isLockMode) {
        setIsLockMode(false);
        announce(t("announceLockMode", { state: "off" }));
      } else onUnpin();
    } else handled = false;

    if (handled) event.preventDefault();
  };

  const visibleRows = rows.slice(r0, r1);
  const visibleCols = cols.slice(c0, c1);
  const renderedColSpan =
    1 + (c0 > 0 ? 1 : 0) + (c1 - c0) + (c1 < cols.length ? 1 : 0);
  const spacer = (Tag: "th" | "td", count: number) => {
    if (count <= 0) return null;
    const width = count * metrics.colWidth;
    return (
      <Tag
        className="sp"
        aria-hidden="true"
        style={{ width, minWidth: width, maxWidth: width }}
      />
    );
  };
  const leftSpacer = (Tag: "th" | "td") => spacer(Tag, c0);
  const rightSpacer = (Tag: "th" | "td") => spacer(Tag, cols.length - c1);

  return (
    <GridRoot
      ref={rootRef}
      hc={isHighContrast}
      lockMode={isLockMode}
      density={density}
      data-grid={scope}
      onPointerOver={handlePointerOver}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onScroll={updateWindow}
    >
      <HoverHighlight store={hoverStore} scope={scope} tokens={tokens} />
      <table
        role="grid"
        aria-label={t("gridLabel")}
        aria-rowcount={rows.length + 1}
        aria-colcount={cols.length + 1}
      >
        <thead>
          <tr role="row" aria-rowindex={1}>
            <th
              className="corner"
              role="columnheader"
              scope="col"
              aria-colindex={1}
              // Se o item ativo saiu da janela, o canto mantém a grade na ordem de tabulação
              tabIndex={
                (active.r === -1 && active.c === -1) || !activeRendered ? 0 : -1
              }
            >
              {tGrid("professors")}
            </th>
            {leftSpacer("th")}
            {visibleCols.map((disciplina, i) => {
              const c = c0 + i;
              return (
                <TurmaHeader
                  key={disciplina.id}
                  disciplina={disciplina}
                  c={c}
                  locked={model.colLocked.has(disciplina.id)}
                  assignedCount={model.assignedByTurma.get(disciplina.id)?.length ?? 0}
                  density={density}
                  active={active.r === -1 && active.c === c}
                />
              );
            })}
            {rightSpacer("th")}
          </tr>
        </thead>
        <tbody>
          {r0 > 0 && (
            <tr className="sp-row" aria-hidden="true" style={{ height: r0 * metrics.rowHeight }}>
              <td className="sp" colSpan={renderedColSpan} />
            </tr>
          )}
          {visibleRows.map((docente, i) => {
            const r = r0 + i;
            return (
            <tr key={docente.nome} role="row" aria-rowindex={r + 2}>
              <DocenteRowHeader
                nome={docente.nome}
                r={r}
                locked={model.rowLocked.has(docente.nome)}
                conflict={model.conflictDocentes.has(docente.nome)}
                carga={model.cargaByDocente.get(docente.nome) ?? 0}
                saldo={docente.saldo}
                active={active.r === r && active.c === -1}
              />
              {leftSpacer("td")}
              {visibleCols.map((disciplina, j) => {
                const c = c0 + j;
                const key = cellKey(docente.nome, disciplina.id);
                const priority = model.priority.get(key);
                const assigned = model.assigned.has(key);
                const locked = model.cellLocked.has(key);
                const base = assigned ? "assigned" : priority ? "pref" : "empty";
                const color = base === "pref" ? priorityColor(priority) : undefined;
                const label = [
                  docente.nome,
                  `${disciplina.codigo} ${disciplina.nome}`,
                  priority ? labels.priority(priority) : labels.noForm,
                  assigned ? labels.assigned : labels.notAssigned,
                  locked ? labels.locked : "",
                ]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <GridCell
                    key={disciplina.id}
                    r={r}
                    c={c}
                    base={base}
                    locked={locked}
                    priority={priority}
                    bg={color?.bg}
                    fg={color?.fg}
                    active={active.r === r && active.c === c}
                    label={label}
                  />
                );
              })}
              {rightSpacer("td")}
            </tr>
            );
          })}
          {r1 < rows.length && (
            <tr
              className="sp-row"
              aria-hidden="true"
              style={{ height: (rows.length - r1) * metrics.rowHeight }}
            >
              <td className="sp" colSpan={renderedColSpan} />
            </tr>
          )}
        </tbody>
      </table>
      <VisuallyHidden ref={liveRef} aria-live="polite" role="status" />
      <Tip ref={tipRef} aria-hidden="true" />
    </GridRoot>
  );
}
