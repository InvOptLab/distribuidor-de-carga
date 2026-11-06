"use client";

import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTranslations } from "next-intl";
import type { HistoryRow } from "../../state/useHistoryList";
import type { HistoryLabels } from "../useHistoryLabels";
import type { RowHandlers } from "../HistoryTable";
import { CurrentBadge } from "../cells";
import RowActions from "../RowActions";

interface DetailHeaderProps extends RowHandlers {
  titleId: string;
  row: HistoryRow;
  labels: HistoryLabels;
  currentId?: string;
  position: { index: number; total: number } | null;
  /** Tela estreita: Restaurar só com ícone e sem o nome do algoritmo. */
  compact?: boolean;
  onNavigate: (delta: number) => void;
  onClose: () => void;
}

/** ‹ ›, título, "n de N", Restaurar, RowActions e ✕. */
export default function DetailHeader({
  titleId,
  row,
  labels,
  currentId,
  position,
  compact,
  onNavigate,
  onClose,
  ...handlers
}: DetailHeaderProps) {
  const t = useTranslations("Pages.History.detail");
  const tActions = useTranslations("Pages.History.actions");
  const algorithm = labels.algorithmLabel(row);
  const label = labels.dateLabel(row);
  const hasPrev = !!position && position.index > 0;
  const hasNext = !!position && position.index < position.total - 1;

  return (
    <Stack
      direction="row"
      spacing={compact ? 0.25 : 1}
      alignItems="center"
      sx={{
        px: compact ? 0.5 : 1.5,
        py: 1,
        borderBottom: 1,
        borderColor: "divider",
        flexShrink: 0,
      }}
    >
      <Tooltip title={`${t("prevSolution")} (Alt+←)`}>
        <span>
          <IconButton
            size="small"
            disabled={!hasPrev}
            onClick={() => onNavigate(-1)}
            aria-label={t("prevSolution")}
          >
            <ChevronLeftIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={`${t("nextSolution")} (Alt+→)`}>
        <span>
          <IconButton
            size="small"
            disabled={!hasNext}
            onClick={() => onNavigate(1)}
            aria-label={t("nextSolution")}
          >
            <ChevronRightIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          <Tooltip title={labels.fullDateLabel(row)}>
            <Typography
              id={titleId}
              variant="subtitle1"
              fontWeight={600}
              noWrap
              component="h2"
            >
              {label}
            </Typography>
          </Tooltip>
          {!compact && (
            <Typography variant="body2" color="text.secondary" noWrap>
              · {algorithm ?? labels.originLabel(row.origin)}
            </Typography>
          )}
          {row.isCurrent && <CurrentBadge />}
        </Stack>
      </Box>
      {position && (
        <Typography
          variant="body2"
          color="text.secondary"
          noWrap
          sx={{ display: { xs: "none", sm: "block" } }}
        >
          {t("position", { index: position.index + 1, total: position.total })}
        </Typography>
      )}
      <Tooltip
        title={
          row.isCurrent
            ? tActions("alreadyCurrent")
            : `${tActions("restore")} (R)`
        }
      >
        <span>
          {compact ? (
            <IconButton
              size="small"
              color="primary"
              disabled={row.isCurrent}
              onClick={() => handlers.onRestore(row.id)}
              aria-label={tActions("restore")}
            >
              <RestoreIcon fontSize="small" />
            </IconButton>
          ) : (
            <Button
              size="small"
              variant="contained"
              startIcon={<RestoreIcon />}
              disabled={row.isCurrent}
              onClick={() => handlers.onRestore(row.id)}
            >
              {tActions("restore")}
            </Button>
          )}
        </span>
      </Tooltip>
      <RowActions
        id={row.id}
        label={label}
        isCurrent={row.isCurrent}
        currentId={currentId}
        hideRestore
        {...handlers}
      />
      <Tooltip title={`${t("close")} (Esc)`}>
        <IconButton size="small" onClick={onClose} aria-label={t("close")}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
