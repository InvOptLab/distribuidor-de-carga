"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DownloadIcon from "@mui/icons-material/Download";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import DensitySmallIcon from "@mui/icons-material/DensitySmall";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import { useTranslations } from "next-intl";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";
import { useTimetable } from "../../context/TimetableContext";
import type { Density } from "../../state/useDensity";

interface GridToolbarProps {
  onExecute: () => void;
  onClean: () => void;
  onDownload: () => void;
  onSave: () => void;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  density: Density;
  onDensityChange: (density: Density) => void;
  semDocenteActive: boolean;
  conflitosActive: boolean;
  onToggleSemDocente: () => void;
  onToggleConflitos: () => void;
  canFilter: boolean;
}

/**
 * Toolbar da grade (5.2, U7): ações primárias, menu "Mais" com as ações secundárias e a destrutiva
 * separada, modo trava com estado claro, densidade e resumo clicável (U6).
 */
export default function GridToolbar({
  onExecute,
  onClean,
  onDownload,
  onSave,
  onToggleFilters,
  hasActiveFilters,
  density,
  onDensityChange,
  semDocenteActive,
  conflitosActive,
  onToggleSemDocente,
  onToggleConflitos,
  canFilter,
}: GridToolbarProps) {
  const { model, disciplinas, isLockMode, setIsLockMode } = useTimetable();
  const { solucaoAtual } = useSolutionHistory();
  const t = useTranslations("Pages.Assignment.Toolbar");
  const tAction = useTranslations("Pages.Assignment.ActionBar");
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const turmasAtivas = useMemo(
    () => disciplinas.filter((d) => d.ativo).length,
    [disciplinas],
  );
  const alreadySaved = solucaoAtual.idHistorico !== undefined;
  const { turmasSemDocente, conflitos, travas } = model.stats;

  const summaryButton = (
    label: string,
    tooltip: string,
    activeState: boolean,
    onClick: () => void,
    color: "warning" | "error",
  ) => (
    <Tooltip title={canFilter ? tooltip : ""}>
      <span>
        <Button
          size="small"
          variant={activeState ? "contained" : "text"}
          color={color}
          aria-pressed={activeState}
          onClick={onClick}
          disabled={!canFilter}
          sx={{ minWidth: 0, px: 1, py: 0, textTransform: "none", fontWeight: 600 }}
        >
          {label}
        </Button>
      </span>
    </Tooltip>
  );

  return (
    <Paper elevation={1} square sx={{ flexShrink: 0 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          px: 2,
          pt: 1,
        }}
      >
        <Typography variant="h6" component="h1" sx={{ flexGrow: 1, minWidth: 180 }}>
          {tAction("allocationGrid")}
        </Typography>

        <Tooltip title={tAction("runAlgorithm")}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={onExecute}
          >
            {tAction("run")}
          </Button>
        </Tooltip>

        <Tooltip
          title={alreadySaved ? tAction("solutionAlreadySaved") : tAction("saveToHistory")}
        >
          <span>
            <Button
              variant="outlined"
              startIcon={<SaveAltIcon />}
              onClick={onSave}
              disabled={alreadySaved}
            >
              {tAction("save")}
            </Button>
          </span>
        </Tooltip>

        <Tooltip title={tAction("toggleLockMode") + " (T)"}>
          <ToggleButton
            value="lock"
            size="small"
            selected={isLockMode}
            onChange={() => setIsLockMode(!isLockMode)}
            color="warning"
            sx={{ gap: 0.5, px: 1.25, textTransform: "none" }}
          >
            {isLockMode ? <LockOutlinedIcon fontSize="small" /> : <LockOpenOutlinedIcon fontSize="small" />}
            {tAction("lockMode")}
          </ToggleButton>
        </Tooltip>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={density}
          onChange={(_, value) => value && onDensityChange(value)}
          aria-label={t("density")}
        >
          <ToggleButton value="compact" aria-label={t("compact")}>
            <Tooltip title={t("compact")}>
              <DensitySmallIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="comfortable" aria-label={t("comfortable")}>
            <Tooltip title={t("comfortable")}>
              <DensityMediumIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title={tAction("filters")}>
          <IconButton onClick={onToggleFilters} aria-label={tAction("filters")}>
            <Badge color="primary" variant="dot" invisible={!hasActiveFilters}>
              <FilterListIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip
          title={
            <Box component="span" sx={{ whiteSpace: "pre-line" }}>
              {t("shortcutsList").split(" · ").join("\n")}
            </Box>
          }
        >
          <IconButton aria-label={t("shortcuts")}>
            <KeyboardIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={t("more")}>
          <IconButton
            aria-label={t("more")}
            aria-haspopup="menu"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
          >
            <MoreHorizIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={menuAnchor}
          open={!!menuAnchor}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              onDownload();
            }}
          >
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{tAction("downloadJson")}</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              onClean();
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <CleaningServicesIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>{tAction("clearAllocations")}</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          columnGap: 0.5,
          px: 2,
          pb: 0.75,
          color: "text.secondary",
        }}
        aria-live="polite"
      >
        <Typography variant="body2" sx={{ px: 1 }}>
          {t("summaryTurmas", { count: turmasAtivas })}
        </Typography>
        ·
        {summaryButton(
          t("summarySemDocente", { count: turmasSemDocente }),
          t("filterBySemDocente"),
          semDocenteActive,
          onToggleSemDocente,
          "warning",
        )}
        ·
        {summaryButton(
          t("summaryConflitos", { count: conflitos }),
          t("filterByConflitos"),
          conflitosActive,
          onToggleConflitos,
          "error",
        )}
        ·
        <Typography variant="body2" sx={{ px: 1 }}>
          {t("summaryTravas", { count: travas })}
        </Typography>
      </Box>

      {isLockMode && (
        <Alert
          severity="warning"
          icon={<LockOutlinedIcon fontSize="small" />}
          onClose={() => setIsLockMode(false)}
          sx={{ borderRadius: 0, py: 0 }}
        >
          {t("lockModeBanner")}
        </Alert>
      )}
    </Paper>
  );
}
