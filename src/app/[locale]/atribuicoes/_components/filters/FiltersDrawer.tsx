"use client";

import { useState } from "react";
import {
  Typography,
  TextField,
  Chip,
  Box,
  Button,
  IconButton,
  Grid,
  Divider,
  Tooltip,
} from "@mui/material";
import { Clear, Add, Close } from "@mui/icons-material";
import type { FilterRule } from "../../types/types";
import type { DisciplinaFilters, DocenteFilters } from "../../types/types";
import { hasActiveFilters as computeHasActiveFilters } from "../../model/filters";
import { useTranslations } from "next-intl";
import { FilterDialog } from "./FilterRuleForm";
import { useCanFilter, useFilterFields } from "./useFilterFields";

interface FiltersDrawerProps {
  docenteFilters: DocenteFilters;
  disciplinaFilters: DisciplinaFilters;
  onDocenteFiltersChange: (filters: DocenteFilters) => void;
  onDisciplinaFiltersChange: (filters: DisciplinaFilters) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

/**
 * Visão completa dos filtros (B19), no drawer lateral. A barra de filtros cobre o uso rápido.
 */
export default function FiltersDrawer({
  docenteFilters,
  disciplinaFilters,
  onDocenteFiltersChange,
  onDisciplinaFiltersChange,
  onClearFilters,
  onClose,
}: FiltersDrawerProps) {
  const [openDocenteDialog, setOpenDocenteDialog] = useState(false);
  const [openDisciplinaDialog, setOpenDisciplinaDialog] = useState(false);
  const { docenteFields, disciplinaFields, describeRule } = useFilterFields();
  const canFilter = useCanFilter();
  const t = useTranslations("Pages.Assignment.Filters");
  const tBar = useTranslations("Pages.Assignment.FilterBar");

  const addDocenteRule = (rule: FilterRule) => {
    onDocenteFiltersChange({
      ...docenteFilters,
      rules: [...docenteFilters.rules, { ...rule, id: Date.now().toString() }],
    });
    setOpenDocenteDialog(false);
  };

  const addDisciplinaRule = (rule: FilterRule) => {
    onDisciplinaFiltersChange({
      ...disciplinaFilters,
      rules: [...disciplinaFilters.rules, { ...rule, id: Date.now().toString() }],
    });
    setOpenDisciplinaDialog(false);
  };

  const removeDocenteRule = (ruleId: string) =>
    onDocenteFiltersChange({
      ...docenteFilters,
      rules: docenteFilters.rules.filter((rule) => rule.id !== ruleId),
    });

  const removeDisciplinaRule = (ruleId: string) =>
    onDisciplinaFiltersChange({
      ...disciplinaFilters,
      rules: disciplinaFilters.rules.filter((rule) => rule.id !== ruleId),
    });

  const hasActiveFilters = computeHasActiveFilters(docenteFilters, disciplinaFilters);

  const renderFilterRule = (rule: FilterRule, onRemove: (id: string) => void) => (
    <Chip
      key={rule.id}
      label={describeRule(rule)}
      onDelete={canFilter ? () => onRemove(rule.id) : undefined}
      color="primary"
      variant="outlined"
      size="small"
    />
  );

  const section = (
    title: string,
    searchLabel: string,
    search: string,
    onSearch: (value: string) => void,
    onAdd: () => void,
    rules: FilterRule[],
    onRemove: (id: string) => void,
  ) => (
    <Grid size={{ xs: 12 }}>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        {title}
      </Typography>
      <TextField
        fullWidth
        size="small"
        label={searchLabel}
        value={search}
        disabled={!canFilter}
        onChange={(e) => onSearch(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="body2">{t("advancedFiltersLabel")}</Typography>
        <Button
          size="small"
          startIcon={<Add />}
          onClick={onAdd}
          variant="outlined"
          disabled={!canFilter}
        >
          {t("add")}
        </Button>
      </Box>
      <Box display="flex" flexWrap="wrap" gap={1}>
        {rules.map((rule) => renderFilterRule(rule, onRemove))}
      </Box>
    </Grid>
  );

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{t("gridFilters")}</Typography>
        <IconButton onClick={onClose} aria-label={t("cancel")}>
          <Close />
        </IconButton>
      </Box>

      {!canFilter && (
        <Typography variant="body2" color="warning.main" mb={2}>
          {tBar("guestsCannotFilter")}
        </Typography>
      )}

      <Divider sx={{ mb: 2 }} />

      {hasActiveFilters && (
        <Tooltip title={canFilter ? "" : tBar("guestsCannotFilter")}>
          <span>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Clear />}
              onClick={onClearFilters}
              disabled={!canFilter}
              fullWidth
              sx={{ mb: 2 }}
            >
              {t("clearAllFilters")}
            </Button>
          </span>
        </Tooltip>
      )}

      {hasActiveFilters && (
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            {t("activeFilters")}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {docenteFilters.search && (
              <Chip
                label={t("professorSearch", { search: docenteFilters.search })}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
            {disciplinaFilters.search && (
              <Chip
                label={t("classSearch", { search: disciplinaFilters.search })}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
            {docenteFilters.rules.map((rule) => renderFilterRule(rule, removeDocenteRule))}
            {disciplinaFilters.rules.map((rule) =>
              renderFilterRule(rule, removeDisciplinaRule),
            )}
          </Box>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        <Grid container spacing={3}>
          {section(
            t("rowsTeacherFilters"),
            t("searchProfessorByName"),
            docenteFilters.search,
            (search) => onDocenteFiltersChange({ ...docenteFilters, search }),
            () => setOpenDocenteDialog(true),
            docenteFilters.rules,
            removeDocenteRule,
          )}
          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>
          {section(
            t("classFiltersColumns"),
            t("searchClassByNameCodeId"),
            disciplinaFilters.search,
            (search) => onDisciplinaFiltersChange({ ...disciplinaFilters, search }),
            () => setOpenDisciplinaDialog(true),
            disciplinaFilters.rules,
            removeDisciplinaRule,
          )}
        </Grid>
      </Box>

      <FilterDialog
        open={openDocenteDialog}
        onClose={() => setOpenDocenteDialog(false)}
        onAdd={addDocenteRule}
        title={t("addProfessorFilter")}
        fields={docenteFields}
      />
      <FilterDialog
        open={openDisciplinaDialog}
        onClose={() => setOpenDisciplinaDialog(false)}
        onAdd={addDisciplinaRule}
        title={t("addClassFilter")}
        fields={disciplinaFields}
      />
    </Box>
  );
}
