"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import {
  Box,
  Drawer,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslations } from "next-intl";
import { useTimetable } from "../../context/TimetableContext";
import type { DetailsTarget } from "../../state/detailsTarget";
import HoveredCourse from "../HoveredCourse";
import HoveredDocente from "../HoveredDocente";

interface DetailsPanelProps {
  target: DetailsTarget | null;
  pinned: boolean;
  onPin: (target: DetailsTarget) => void;
  onUnpin: () => void;
}

const MIN_WIDTH = 300;
const MAX_WIDTH = 720;
const DEFAULT_WIDTH = 380;
const STORAGE_KEY = "atribuicoes.detailsPanel";

function readPrefs(): { width: number; collapsed: boolean } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        width: Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Number(parsed.width) || DEFAULT_WIDTH)),
        collapsed: !!parsed.collapsed,
      };
    }
  } catch {
    // storage indisponível
  }
  return { width: DEFAULT_WIDTH, collapsed: false };
}

/**
 * Conteúdo de `HoveredCourse` / `HoveredDocente` (nada removido), sem a rolagem forçada (D7).
 */
function DetailsContent({ target }: { target: DetailsTarget }) {
  const { docentes, disciplinas, formularios, atribuicoes } = useTimetable();

  if (target.kind === "turma") {
    const disciplina = disciplinas.find((d) => d.id === target.id);
    if (!disciplina) return null;
    return (
      <HoveredCourse
        variant="panel"
        disciplina={disciplina}
        formularios={formularios}
        docentes={docentes}
      />
    );
  }

  const docente = docentes.find((d) => d.nome === target.nome);
  if (!docente) return null;
  return (
    <HoveredDocente
      variant="panel"
      docente={docente}
      disciplinas={disciplinas}
      formularios={formularios}
      atribuicoes={atribuicoes.filter((a) => a.docentes.includes(docente.nome))}
    />
  );
}

/**
 * Painel lateral de detalhes (5.7): pré-visualização no hover e fixação por clique/tecla I.
 * Redimensionável e recolhível; abaixo de 1200 px vira um drawer sobreposto que abre só ao fixar.
 */
export default function DetailsPanel({
  target,
  pinned,
  onPin,
  onUnpin,
}: DetailsPanelProps) {
  const theme = useTheme();
  const narrow = useMediaQuery(theme.breakpoints.down(1200));
  const t = useTranslations("Pages.Assignment.Details");

  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [collapsed, setCollapsed] = useState(false);
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    const prefs = readPrefs();
    setWidth(prefs.width);
    setCollapsed(prefs.collapsed);
  }, []);

  const savePrefs = (next: { width: number; collapsed: boolean }) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage indisponível
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
    savePrefs({ width, collapsed: !collapsed });
  };

  const onResizeStart = (event: React.PointerEvent) => {
    drag.current = { startX: event.clientX, startWidth: width };
    (event.target as Element).setPointerCapture(event.pointerId);
  };
  const onResizeMove = (event: React.PointerEvent) => {
    if (!drag.current) return;
    const next = drag.current.startWidth + (drag.current.startX - event.clientX);
    setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, next)));
  };
  const onResizeEnd = () => {
    if (!drag.current) return;
    drag.current = null;
    savePrefs({ width, collapsed });
  };
  const onResizeKey = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 48 : 16;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = Math.min(
      MAX_WIDTH,
      Math.max(MIN_WIDTH, width + (event.key === "ArrowLeft" ? step : -step)),
    );
    setWidth(next);
    savePrefs({ width: next, collapsed });
  };

  const header = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.5,
        borderBottom: 1,
        borderColor: "divider",
        flexShrink: 0,
      }}
    >
      <InfoOutlinedIcon fontSize="small" color="action" />
      <Typography variant="subtitle2" sx={{ flex: 1 }}>
        {t("title")}
        {pinned && (
          <Typography component="span" variant="caption" color="text.secondary">
            {" · "}
            {t("pinned")}
          </Typography>
        )}
      </Typography>
      {target && (
        <Tooltip title={pinned ? t("unpin") : t("pin")}>
          <IconButton
            size="small"
            aria-pressed={pinned}
            aria-label={pinned ? t("unpin") : t("pin")}
            onClick={() => (pinned ? onUnpin() : onPin(target))}
          >
            {pinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      )}
      {narrow ? (
        <Tooltip title={t("close")}>
          <IconButton size="small" aria-label={t("close")} onClick={onUnpin}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title={t("collapse")}>
          <IconButton size="small" aria-label={t("collapse")} onClick={toggleCollapsed}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  const body = (
    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
      {target ? (
        <DetailsContent target={target} />
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          {t("empty")}
        </Typography>
      )}
    </Box>
  );

  if (narrow) {
    return (
      <Drawer
        anchor="right"
        open={pinned && !!target}
        onClose={onUnpin}
        sx={{ "& .MuiDrawer-paper": { width: { xs: "100%", sm: 420 } } }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {header}
          {body}
        </Box>
      </Drawer>
    );
  }

  if (collapsed) {
    return (
      <Paper
        component="aside"
        aria-label={t("title")}
        sx={{
          width: 40,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 0.5,
        }}
      >
        <Tooltip title={t("expand")} placement="left">
          <IconButton size="small" aria-label={t("expand")} onClick={toggleCollapsed}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {pinned && <PushPinIcon fontSize="small" color="action" sx={{ mt: 1 }} />}
      </Paper>
    );
  }

  return (
    <Paper
      component="aside"
      aria-label={t("title")}
      sx={{
        position: "relative",
        width,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        role="separator"
        aria-orientation="vertical"
        aria-label={t("resize")}
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={MAX_WIDTH}
        aria-valuenow={width}
        tabIndex={0}
        onPointerDown={onResizeStart}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeEnd}
        onKeyDown={onResizeKey}
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          cursor: "col-resize",
          zIndex: 1,
          "&:hover, &:focus-visible": { backgroundColor: "action.hover" },
          outline: "none",
        }}
      />
      {header}
      {body}
    </Paper>
  );
}
