"use client";

import { memo, useCallback, useEffect, useId, useMemo, useState } from "react";
import { Box, Dialog, useMediaQuery, useTheme } from "@mui/material";
import { useTranslations } from "next-intl";
import type { HistoricoSolucao } from "@/context/Global/utils";
import { getSolutionDetail } from "../../state/summaryCache";
import type { EntityRef, HistoryRow } from "../../state/useHistoryList";
import type { EscapeAction, EscapeLayer } from "../../state/detailNavigation";
import type { HistoryLabels } from "../useHistoryLabels";
import type { RowHandlers } from "../HistoryTable";
import KpiStrip from "./KpiStrip";
import EntityList from "./EntityList";
import EntityDetail from "./EntityDetail";
import EntityInspector, { entityName } from "./EntityInspector";
import DetailHeader from "./DetailHeader";
import DetailLayout, { type LayoutMode, type StackLevel } from "./DetailLayout";
import { useDetailKeyboard } from "./useDetailKeyboard";

const PREFS_KEY = "history.detailDialog";
const LEGACY_PANEL_KEY = "history.detailPanel";

let legacyCleaned = false;
/** A chave do painel lateral antigo é apagada uma vez (2). */
function cleanLegacyPrefs() {
  if (legacyCleaned) return;
  legacyCleaned = true;
  try {
    window.localStorage.removeItem(LEGACY_PANEL_KEY);
  } catch {
    // storage indisponível
  }
}

/**
 * Altura de barras fixas do app que ficam acima dos modais (a barra de acessibilidade usa
 * z-index 2000). No modo tela cheia o diálogo começa abaixo delas para o cabeçalho não sumir.
 */
function useTopOverlayInset(active: boolean): number {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    if (!active) {
      setInset(0);
      return;
    }
    const measure = () => {
      let el = document.elementFromPoint(
        window.innerWidth / 2,
        1,
      ) as HTMLElement | null;
      let bottom = 0;
      while (el && el !== document.body) {
        const z = Number(getComputedStyle(el).zIndex);
        if (Number.isFinite(z) && z > 1300 && !el.closest(".MuiDialog-root")) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 0) bottom = Math.max(bottom, rect.bottom);
        }
        el = el.parentElement;
      }
      setInset(Math.round(bottom));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);
  return inset;
}

function readCollapsed(): boolean {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    return raw ? !!JSON.parse(raw).collapsed : false;
  } catch {
    return false;
  }
}

function saveCollapsed(collapsed: boolean) {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify({ collapsed }));
  } catch {
    // storage indisponível
  }
}

export interface SolutionDetailDialogProps extends RowHandlers {
  entry: HistoricoSolucao;
  row: HistoryRow;
  labels: HistoryLabels;
  currentId?: string;
  entity: EntityRef | null;
  inspect: EntityRef | null;
  onEntityChange: (entity: EntityRef | null) => void;
  onInspectChange: (inspect: EntityRef | null) => void;
  onNavigate: (delta: number) => void;
  position: { index: number; total: number } | null;
  onClose: () => void;
}

/**
 * Detalhe da solução em diálogo amplo: lista à esquerda,
 * relações no centro e inspetor à direita. Substitui o painel lateral.
 */
function SolutionDetailDialog({
  entry,
  row,
  labels,
  currentId,
  entity,
  inspect,
  onEntityChange,
  onInspectChange,
  onNavigate,
  position,
  onClose,
  ...handlers
}: SolutionDetailDialogProps) {
  const t = useTranslations("Pages.History.detail");
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up(1200));
  const narrow = useMediaQuery(theme.breakpoints.down(900));
  const mode: LayoutMode = wide ? "wide" : narrow ? "narrow" : "medium";
  const detail = getSolutionDetail(entry);
  const titleId = useId();
  const topInset = useTopOverlayInset(mode === "narrow");
  const kpiId = useId();

  // Aba da lista segue a entidade selecionada
  const [kind, setKind] = useState<EntityRef["kind"]>(
    entity?.kind ?? "docente",
  );
  useEffect(() => {
    if (entity) setKind(entity.kind);
  }, [entity]);

  // Desktop: inspetor recolhível, lembrado entre sessões
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    cleanLegacyPrefs();
    setCollapsed(readCollapsed());
  }, []);
  const setCollapsedSaved = useCallback((next: boolean) => {
    setCollapsed(next);
    saveCollapsed(next);
  }, []);

  // Médio: inspetor sobreposto, aberto por gesto explícito
  const [overlayOpen, setOverlayOpen] = useState(!!inspect);

  // Estreito: pilha Lista → Relações → Inspetor
  const [stackLevel, setStackLevel] = useState<StackLevel>(
    inspect ? "inspector" : entity ? "relations" : "list",
  );

  const selectEntity = useCallback(
    (ref: EntityRef | null) => {
      onEntityChange(ref);
      if (ref) setStackLevel("relations");
    },
    [onEntityChange],
  );

  const inspectRelated = useCallback(
    (ref: EntityRef, source: "explicit" | "follow") => {
      onInspectChange(ref);
      if (source === "explicit") {
        setOverlayOpen(true);
        setStackLevel("inspector");
        if (collapsed) setCollapsedSaved(false);
      }
    },
    [onInspectChange, collapsed, setCollapsedSaved],
  );

  /** Pivô (Focar →): a entidade inspecionada vira a selecionada. */
  const focusEntity = useCallback(
    (ref: EntityRef) => {
      setKind(ref.kind);
      onEntityChange(ref); // limpa `insp`
      setOverlayOpen(false);
      setStackLevel("relations");
    },
    [onEntityChange],
  );

  const backToEntity = useCallback(
    () => onInspectChange(null),
    [onInspectChange],
  );

  const onStackLevel = useCallback(
    (level: StackLevel) => {
      if (level !== "inspector" && inspect) onInspectChange(null);
      setStackLevel(level);
    },
    [inspect, onInspectChange],
  );

  const escapeLayer: EscapeLayer | null =
    mode === "medium" && overlayOpen
      ? { kind: "overlay" }
      : mode === "narrow" && stackLevel !== "list"
        ? { kind: "stack", level: stackLevel }
        : null;

  const onEscape = useCallback(
    (action: EscapeAction) => {
      if (action === "closeOverlay") {
        setOverlayOpen(false);
        if (inspect) onInspectChange(null);
      } else if (action === "stackBack") {
        onStackLevel(stackLevel === "inspector" ? "relations" : "list");
      } else {
        onClose();
      }
    },
    [inspect, onInspectChange, onStackLevel, stackLevel, onClose],
  );

  const { handleClose, onKeyDown } = useDetailKeyboard({
    escapeLayer,
    onEscape,
    onNavigate,
    onRestore: () => {
      if (!row.isCurrent) handlers.onRestore(row.id);
    },
  });

  const target = inspect ?? entity;
  const liveText = target
    ? t("inspector.live", { name: entityName(detail, target) })
    : "";

  const crumbs = useMemo(() => {
    const list: { level: StackLevel; label: string }[] = [
      {
        level: "list",
        label:
          kind === "docente"
            ? t("breadcrumb.docentes")
            : t("breadcrumb.turmas"),
      },
    ];
    if (entity)
      list.push({ level: "relations", label: entityName(detail, entity) });
    list.push({
      level: "inspector",
      label: inspect ? entityName(detail, inspect) : t("inspector.title"),
    });
    return list;
  }, [kind, entity, inspect, detail, t]);

  const listNode = (
    <EntityList
      detail={detail}
      kind={kind}
      selectedId={entity?.kind === kind ? entity.id : undefined}
      locale={labels.locale}
      onKindChange={setKind}
      onSelect={selectEntity}
    />
  );

  const relationsNode = (
    <EntityDetail
      key={entity ? `${entity.kind}:${entity.id}` : "none"}
      detail={detail}
      entity={entity}
      locale={labels.locale}
      inspectedId={inspect?.id}
      onInspect={inspectRelated}
      onFocusEntity={focusEntity}
    />
  );

  const inspectorNode = (
    <EntityInspector
      detail={detail}
      entity={entity}
      inspect={inspect}
      onBack={backToEntity}
      onFocusEntity={focusEntity}
      onDismiss={
        mode === "wide"
          ? () => setCollapsedSaved(true)
          : mode === "medium"
            ? () => onEscape("closeOverlay")
            : undefined
      }
      dismissKind={mode === "medium" ? "close" : "collapse"}
    />
  );

  return (
    <Dialog
      open
      onClose={handleClose}
      fullScreen={mode === "narrow"}
      maxWidth={false}
      aria-labelledby={titleId}
      aria-describedby={kpiId}
      disableRestoreFocus
      slotProps={{
        paper: {
          sx:
            mode === "narrow"
              ? {
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  mt: `${topInset}px`,
                  height: `calc(100% - ${topInset}px)`,
                }
              : {
                  width: mode === "wide" ? "min(1440px, 94vw)" : "96vw",
                  maxWidth: "none",
                  height: "90vh",
                  maxHeight: "none",
                  m: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                },
          onKeyDown,
        } as never,
      }}
    >
      <DetailHeader
        titleId={titleId}
        row={row}
        labels={labels}
        currentId={currentId}
        position={position}
        compact={mode === "narrow"}
        onNavigate={onNavigate}
        onClose={onClose}
        {...handlers}
      />
      <Box
        id={kpiId}
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <KpiStrip
          row={row}
          locale={labels.locale}
          singleLine={mode === "narrow"}
        />
      </Box>
      <DetailLayout
        mode={mode}
        list={listNode}
        relations={relationsNode}
        inspector={inspectorNode}
        collapsed={collapsed}
        onExpand={() => setCollapsedSaved(false)}
        overlayOpen={overlayOpen}
        onOpenOverlay={() => setOverlayOpen(true)}
        stackLevel={stackLevel}
        crumbs={crumbs}
        onStackLevel={onStackLevel}
      />
      <Box
        aria-live="polite"
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
        }}
      >
        {liveText}
      </Box>
    </Dialog>
  );
}

export default memo(SolutionDetailDialog);
