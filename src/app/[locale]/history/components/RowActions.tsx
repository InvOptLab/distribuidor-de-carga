"use client";

import { useState } from "react";
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BarChartIcon from "@mui/icons-material/BarChart";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useTranslations } from "next-intl";

interface RowActionsProps {
  id: string;
  label: string;
  isCurrent: boolean;
  currentId?: string;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  onStatistics: (id: string) => void;
  onCompare: (ids: string[]) => void;
  /** Esconde o botão de restaurar (usado no cabeçalho do painel, que já tem o seu). */
  hideRestore?: boolean;
}

/** Restaurar visível; o resto no menu ⋯, com Excluir separado e em vermelho (5.1). */
export default function RowActions({
  id,
  label,
  isCurrent,
  currentId,
  onRestore,
  onDelete,
  onDownload,
  onStatistics,
  onCompare,
  hideRestore,
}: RowActionsProps) {
  const t = useTranslations("Pages.History.actions");
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const close = () => setAnchor(null);
  const run = (fn: () => void) => () => {
    close();
    fn();
  };

  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      // Ações não devem abrir o painel nem alternar a seleção da linha
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") e.stopPropagation();
      }}
    >
      {!hideRestore && (
        <Tooltip title={isCurrent ? t("alreadyCurrent") : t("restore")}>
          <span>
            <IconButton
              size="small"
              color="primary"
              disabled={isCurrent}
              onClick={() => onRestore(id)}
              aria-label={t("restoreAria", { label })}
            >
              <RestoreIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}
      <Tooltip title={t("more")}>
        <IconButton
          size="small"
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label={t("moreAria", { label })}
          aria-haspopup="menu"
          aria-expanded={anchor ? "true" : undefined}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={!!anchor} onClose={close}>
        <MenuItem onClick={run(() => onStatistics(id))}>
          <ListItemIcon>
            <BarChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("statistics")}</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={isCurrent || !currentId}
          onClick={run(() => currentId && onCompare([currentId, id]))}
        >
          <ListItemIcon>
            <CompareArrowsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("compareWithCurrent")}</ListItemText>
        </MenuItem>
        <MenuItem onClick={run(() => onDownload(id))}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("download")}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          disabled={isCurrent}
          onClick={run(() => onDelete(id))}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <DeleteOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t("delete")}
            secondary={isCurrent ? t("currentCannotDelete") : undefined}
          />
        </MenuItem>
      </Menu>
    </Stack>
  );
}
