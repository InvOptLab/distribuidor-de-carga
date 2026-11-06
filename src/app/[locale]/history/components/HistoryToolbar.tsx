"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import type { GridSortModel } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import type { TipoInsercao } from "@/context/Global/utils";
import { ALL_ORIGINS } from "../state/useHistoryList";
import type { HistoryLabels } from "./useHistoryLabels";

const SORT_PRESETS = {
  recent: { field: "chrono", sort: "desc" },
  oldest: { field: "chrono", sort: "asc" },
  best: { field: "avaliacao", sort: "desc" },
  worst: { field: "avaliacao", sort: "asc" },
  coverage: { field: "coverage", sort: "desc" },
  conflicts: { field: "conflitos", sort: "asc" },
} as const;
type SortPreset = keyof typeof SORT_PRESETS;

function presetOf(model: GridSortModel): SortPreset | "" {
  const first = model[0];
  if (!first) return "";
  const found = (Object.keys(SORT_PRESETS) as SortPreset[]).find(
    (k) => SORT_PRESETS[k].field === first.field && SORT_PRESETS[k].sort === first.sort,
  );
  return found ?? "";
}

interface HistoryToolbarProps {
  total: number;
  labels: HistoryLabels;
  query: string;
  onQueryChange: (q: string) => void;
  origins: TipoInsercao[];
  onOriginsChange: (origins: TipoInsercao[]) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  selection: string[];
  onClearSelection: () => void;
  onCompare: () => void;
  onDeleteSelected: () => void;
}

/** Busca, filtro de origem, ordenação e ações em lote (5.2). */
export default function HistoryToolbar({
  total,
  labels,
  query,
  onQueryChange,
  origins,
  onOriginsChange,
  sortModel,
  onSortModelChange,
  selection,
  onClearSelection,
  onCompare,
  onDeleteSelected,
}: HistoryToolbarProps) {
  const t = useTranslations("Pages.History.toolbar");
  const tPage = useTranslations("Pages.History");

  // Busca local com atraso curto antes de ir para a URL
  const [text, setText] = useState(query);
  useEffect(() => setText(query), [query]);
  useEffect(() => {
    if (text === query) return;
    const timer = setTimeout(() => onQueryChange(text), 250);
    return () => clearTimeout(timer);
  }, [text, query, onQueryChange]);

  const toggleOrigin = (origin: TipoInsercao) => {
    onOriginsChange(
      origins.includes(origin) ? origins.filter((o) => o !== origin) : [...origins, origin],
    );
  };

  const preset = presetOf(sortModel);

  return (
    <Stack spacing={1.5} sx={{ mb: 1.5 }}>
      <Typography variant="h5" component="h1">
        {tPage("title", { count: total })}
      </Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
        <TextField
          size="small"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("search")}
          inputProps={{ "aria-label": t("search") }}
          sx={{ minWidth: 260, flex: { md: 1 }, maxWidth: { md: 420 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          role="group"
          aria-label={t("origin")}
          sx={{ flexWrap: "wrap", rowGap: 0.75 }}
        >
          <Typography variant="body2" color="text.secondary">
            {t("origin")}:
          </Typography>
          <Chip
            size="small"
            label={t("allOrigins")}
            color={origins.length === 0 ? "primary" : "default"}
            variant={origins.length === 0 ? "filled" : "outlined"}
            onClick={() => onOriginsChange([])}
            aria-pressed={origins.length === 0}
          />
          {ALL_ORIGINS.map((origin) => {
            const active = origins.includes(origin);
            return (
              <Chip
                key={origin}
                size="small"
                label={labels.originLabel(origin)}
                color={active ? "primary" : "default"}
                variant={active ? "filled" : "outlined"}
                onClick={() => toggleOrigin(origin)}
                aria-pressed={active}
              />
            );
          })}
        </Stack>
        <Box sx={{ flex: 1, display: { xs: "none", md: "block" } }} />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="history-sort-label">{t("sort")}</InputLabel>
          <Select
            labelId="history-sort-label"
            label={t("sort")}
            value={preset}
            onChange={(e) => {
              const key = e.target.value as SortPreset;
              if (SORT_PRESETS[key]) onSortModelChange([{ ...SORT_PRESETS[key] }]);
            }}
            renderValue={(value) => (value ? t(`sortOptions.${value}`) : t("sortCustom"))}
            displayEmpty
          >
            {(Object.keys(SORT_PRESETS) as SortPreset[]).map((key) => (
              <MenuItem key={key} value={key}>
                {t(`sortOptions.${key}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      {selection.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          role="region"
          aria-label={t("selected", { count: selection.length })}
          sx={{ px: 1.5, py: 0.75, borderRadius: 1, bgcolor: "action.hover", flexWrap: "wrap" }}
        >
          <Typography variant="body2" sx={{ flex: 1 }}>
            {t("selected", { count: selection.length })}
          </Typography>
          <Button
            size="small"
            startIcon={<CompareArrowsIcon />}
            disabled={selection.length < 2}
            onClick={onCompare}
          >
            {t("compare")}
          </Button>
          <Button size="small" color="error" startIcon={<DeleteOutlineIcon />} onClick={onDeleteSelected}>
            {t("delete")}
          </Button>
          <Button size="small" color="inherit" startIcon={<CloseIcon />} onClick={onClearSelection}>
            {t("clearSelection")}
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
