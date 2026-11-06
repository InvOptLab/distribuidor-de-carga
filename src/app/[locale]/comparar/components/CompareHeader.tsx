"use client";

import { useState } from "react";
import {
  Badge,
  Box,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestoreIcon from "@mui/icons-material/Restore";
import HistoryIcon from "@mui/icons-material/History";
import BarChartIcon from "@mui/icons-material/BarChart";
import DownloadIcon from "@mui/icons-material/Download";
import { useTranslations } from "next-intl";
import type { HistoryLabels } from "@/app/[locale]/history/components/useHistoryLabels";
import type { Side } from "../model/comparison";
import { COMPARE_TABS, type CompareTab } from "../state/compareParams";
import type { SolutionOption } from "../state/useSolutionOptions";
import type { CompareTokens } from "../theme/compareTokens";
import SolutionPicker from "./SolutionPicker";

export interface SideActions {
  restore: (id: string) => void;
  openInHistory: (id: string) => void;
  openStatistics: (id: string) => void;
  download: (id: string) => void;
  currentId: string | undefined;
}

interface CompareHeaderProps {
  options: SolutionOption[];
  a: string | null;
  b: string | null;
  onChangeA: (id: string | null) => void;
  onChangeB: (id: string | null) => void;
  onSwap: () => void;
  tab: CompareTab;
  onTab: (tab: CompareTab) => void;
  /** Contagens nos rótulos das abas; `null` desabilita as abas (B vazio). */
  counts: { changes: number; docentes: number } | null;
  labels: HistoryLabels;
  tokens: CompareTokens;
  actions: SideActions;
  /** Para medir a altura do cabeçalho fixo (posição do inspetor). */
  headerRef?: React.Ref<HTMLDivElement>;
}

/** Altura da barra de navegação do app, que também é sticky. */
export const NAV_HEIGHT = { xs: 56, sm: 64 };

function SideMenu({
  side,
  id,
  actions,
}: {
  side: Side;
  id: string | null;
  actions: SideActions;
}) {
  const t = useTranslations("Pages.Compare.menu");
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (!id) return <Box sx={{ width: 40 }} />;
  const close = () => setAnchor(null);
  const run = (fn: (id: string) => void) => () => {
    close();
    fn(id);
  };
  const isCurrent = id === actions.currentId;
  return (
    <>
      <Tooltip title={t("more", { side: side.toUpperCase() })}>
        <IconButton
          aria-label={t("more", { side: side.toUpperCase() })}
          aria-haspopup="menu"
          onClick={(e) => setAnchor(e.currentTarget)}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={!!anchor} onClose={close}>
        <MenuItem onClick={run(actions.restore)} disabled={isCurrent}>
          <ListItemIcon>
            <RestoreIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={isCurrent ? t("alreadyCurrent") : t("restore")}
          />
        </MenuItem>
        <MenuItem onClick={run(actions.openInHistory)}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("openInHistory")} />
        </MenuItem>
        <MenuItem onClick={run(actions.openStatistics)}>
          <ListItemIcon>
            <BarChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("statistics")} />
        </MenuItem>
        <MenuItem onClick={run(actions.download)}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("download")} />
        </MenuItem>
      </Menu>
    </>
  );
}

/** Sugestões de um clique para B, só quando existem e diferem de A. */
function suggestionsFor(
  options: SolutionOption[],
  a: string | null,
  b: string | null,
) {
  const out: { key: "previous" | "best" | "current"; id: string }[] = [];
  if (!a) return out;
  const index = options.findIndex((o) => o.id === a);
  const previous = index >= 0 ? options[index + 1] : undefined; // lista em ordem decrescente
  const best = options.find((o) => o.isBest && o.id !== a);
  const current = options.find((o) => o.isCurrent && o.id !== a);
  for (const [key, option] of [
    ["previous", previous],
    ["best", best],
    ["current", current],
  ] as const) {
    if (
      option &&
      option.id !== a &&
      option.id !== b &&
      !out.some((s) => s.id === option.id)
    )
      out.push({ key, id: option.id });
  }
  return out;
}

export default function CompareHeader({
  options,
  a,
  b,
  onChangeA,
  onChangeB,
  onSwap,
  tab,
  onTab,
  counts,
  labels,
  tokens,
  actions,
  headerRef,
}: CompareHeaderProps) {
  const t = useTranslations("Pages.Compare");
  const suggestions = suggestionsFor(options, a, b);
  const disabled = counts === null;

  return (
    <>
      <Typography variant="h5" component="h1" sx={{ mt: 2, mb: 1 }}>
        {t("title")}
      </Typography>
      <Paper
        ref={headerRef}
        component="header"
        elevation={0}
        sx={{
          // Em telas estreitas os pickers empilham e o cabeçalho ficaria alto demais para fixar
          position: { xs: "static", md: "sticky" },
          // Logo abaixo da barra de navegação (também sticky)
          top: NAV_HEIGHT,
          zIndex: (theme) => theme.zIndex.appBar - 1,
          borderBottom: 1,
          borderColor: "divider",
          px: { xs: 1.5, md: 2 },
          pt: 1.5,
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "grid",
            alignItems: "start",
            gap: 1,
            gridTemplateColumns: {
              xs: "1fr auto",
              md: "1fr auto auto 1fr auto",
            },
          }}
        >
          <SolutionPicker
            side="a"
            options={options}
            value={a}
            excludeId={b}
            onChange={onChangeA}
            labels={labels}
            tokens={tokens}
          />
          <SideMenu side="a" id={a} actions={actions} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gridColumn: { xs: "1 / -1", md: "auto" },
            }}
          >
            <Tooltip title={t("swap")}>
              <span>
                <IconButton
                  onClick={onSwap}
                  disabled={!a || !b}
                  aria-label={t("swap")}
                  aria-keyshortcuts="X"
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    transform: { xs: "rotate(90deg)", md: "none" },
                  }}
                >
                  <SwapHorizIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          <SolutionPicker
            side="b"
            options={options}
            value={b}
            excludeId={a}
            onChange={onChangeB}
            labels={labels}
            tokens={tokens}
          />
          <SideMenu side="b" id={b} actions={actions} />
        </Box>

        {suggestions.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{
              mt: 1,
              p: !b ? 1 : 0,
              borderRadius: 1,
              bgcolor: !b ? tokens.side.b.soft : undefined,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("suggestions.label")}
            </Typography>
            {suggestions.map((s) => {
              const option = options.find((o) => o.id === s.id)!;
              return (
                <Chip
                  key={s.key}
                  size="small"
                  clickable
                  variant={b ? "outlined" : "filled"}
                  onClick={() => onChangeB(s.id)}
                  label={`${t(`suggestions.${s.key}`)} · ${labels.dateLabel(option)}`}
                />
              );
            })}
          </Stack>
        )}

        <Tabs
          value={tab}
          onChange={(_, value: CompareTab) => onTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label={t("tabs.aria")}
          sx={{ mt: 1 }}
        >
          {COMPARE_TABS.map((key, i) => {
            const count =
              key === "changes"
                ? counts?.changes
                : key === "docentes"
                  ? counts?.docentes
                  : undefined;
            return (
              <Tab
                key={key}
                value={key}
                disabled={disabled && key !== "overview"}
                id={`compare-tab-${key}`}
                aria-controls={`compare-panel-${key}`}
                aria-keyshortcuts={String(i + 1)}
                label={
                  count !== undefined ? (
                    <Badge
                      badgeContent={count}
                      color="default"
                      max={999}
                      showZero
                      sx={{
                        "& .MuiBadge-badge": {
                          position: "static",
                          transform: "none",
                          ml: 1,
                          bgcolor: "action.selected",
                        },
                      }}
                    >
                      {t(`tabs.${key}`)}
                    </Badge>
                  ) : (
                    t(`tabs.${key}`)
                  )
                }
              />
            );
          })}
        </Tabs>
      </Paper>
    </>
  );
}
