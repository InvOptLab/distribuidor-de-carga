"use client";

import type React from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  IconButton,
  Link,
  Paper,
  Slide,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslations } from "next-intl";

export type LayoutMode = "wide" | "medium" | "narrow";
export type StackLevel = "list" | "relations" | "inspector";

export const LIST_WIDTH = 280;
export const INSPECTOR_WIDTH = 400;
export const COLLAPSED_WIDTH = 40;

interface Crumb {
  label: string;
  level: StackLevel;
}

interface DetailLayoutProps {
  mode: LayoutMode;
  list: React.ReactNode;
  relations: React.ReactNode;
  inspector: React.ReactNode;
  /** Desktop: inspetor recolhido em faixa de 40 px. */
  collapsed: boolean;
  onExpand: () => void;
  /** Médio: inspetor sobreposto aberto. */
  overlayOpen: boolean;
  onOpenOverlay: () => void;
  /** Estreito: nível da pilha e breadcrumb. */
  stackLevel: StackLevel;
  crumbs: Crumb[];
  onStackLevel: (level: StackLevel) => void;
}

const column = {
  minHeight: 0,
  minWidth: 0,
  height: "100%",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
} as const;

/**
 * Três colunas fixas (≥ 1200 px), inspetor sobreposto (900–1199 px) ou pilha com breadcrumb
 * (< 900 px). Cada coluna rola sozinha; nada é inserido na tabela (3).
 */
export default function DetailLayout({
  mode,
  list,
  relations,
  inspector,
  collapsed,
  onExpand,
  overlayOpen,
  onOpenOverlay,
  stackLevel,
  crumbs,
  onStackLevel,
}: DetailLayoutProps) {
  const t = useTranslations("Pages.History.detail");

  if (mode === "narrow") {
    const index = crumbs.findIndex((c) => c.level === stackLevel);
    const parent = index > 0 ? crumbs[index - 1] : null;
    return (
      <Box sx={{ ...column, flex: 1 }}>
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
          <IconButton
            size="small"
            disabled={!parent}
            onClick={() => parent && onStackLevel(parent.level)}
            aria-label={t("breadcrumb.back")}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Breadcrumbs
            aria-label={t("breadcrumb.label")}
            sx={{ minWidth: 0, "& ol": { flexWrap: "nowrap" } }}
          >
            {crumbs.slice(0, index + 1).map((crumb, i) =>
              i === index ? (
                <Typography
                  key={crumb.level}
                  variant="body2"
                  color="text.primary"
                  noWrap
                  aria-current="page"
                >
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={crumb.level}
                  component="button"
                  type="button"
                  variant="body2"
                  underline="hover"
                  noWrap
                  onClick={() => onStackLevel(crumb.level)}
                >
                  {crumb.label}
                </Link>
              ),
            )}
          </Breadcrumbs>
        </Box>
        <Box sx={{ ...column, flex: 1, p: 1.5 }}>
          {stackLevel === "list"
            ? list
            : stackLevel === "relations"
              ? relations
              : inspector}
        </Box>
      </Box>
    );
  }

  if (mode === "medium") {
    return (
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: `${LIST_WIDTH}px minmax(0, 1fr)`,
        }}
      >
        <Box sx={{ ...column, p: 1.5, borderRight: 1, borderColor: "divider" }}>
          {list}
        </Box>
        <Box sx={{ ...column, p: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              flexShrink: 0,
              mt: -0.5,
            }}
          >
            <Button
              size="small"
              startIcon={<InfoOutlinedIcon />}
              onClick={onOpenOverlay}
              disabled={overlayOpen}
            >
              {t("inspector.open")}
            </Button>
          </Box>
          {relations}
        </Box>
        <Slide in={overlayOpen} direction="left" mountOnEnter unmountOnExit>
          <Paper
            elevation={8}
            square
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: INSPECTOR_WIDTH,
              maxWidth: "90%",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {inspector}
          </Paper>
        </Slide>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "grid",
        gridTemplateColumns: `${LIST_WIDTH}px minmax(420px, 1fr) ${collapsed ? COLLAPSED_WIDTH : INSPECTOR_WIDTH}px`,
      }}
    >
      <Box sx={{ ...column, p: 1.5, borderRight: 1, borderColor: "divider" }}>
        {list}
      </Box>
      <Box sx={{ ...column, p: 1.5 }}>{relations}</Box>
      <Box sx={{ ...column, borderLeft: 1, borderColor: "divider" }}>
        {collapsed ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 0.75 }}>
            <Tooltip title={t("inspector.expand")} placement="left">
              <IconButton
                size="small"
                onClick={onExpand}
                aria-label={t("inspector.expand")}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          inspector
        )}
      </Box>
    </Box>
  );
}
