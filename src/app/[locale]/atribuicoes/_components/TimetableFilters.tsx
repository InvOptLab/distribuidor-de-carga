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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { Clear, Add, Close, Search } from "@mui/icons-material";
import type { FilterRule } from "../types/types";
import { useTimetable } from "../context/TimetableContext";
import { useTranslations } from "next-intl";

interface TimetableFiltersProps {
  docenteFilters: {
    search: string;
    rules: FilterRule[];
  };
  disciplinaFilters: {
    search: string;
    rules: FilterRule[];
  };
  onDocenteFiltersChange: (filters: any) => void;
  onDisciplinaFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

export default function TimetableFilters({
  docenteFilters,
  disciplinaFilters,
  onDocenteFiltersChange,
  onDisciplinaFiltersChange,
  onClearFilters,
  onClose,
}: TimetableFiltersProps) {
  const { disciplinas } = useTimetable();
  const [openDocenteDialog, setOpenDocenteDialog] = useState(false);
  const [openDisciplinaDialog, setOpenDisciplinaDialog] = useState(false);

  const t = useTranslations("Pages.Assignment.Filters");

  const uniqueGroups = Array.from(
    new Set(disciplinas.filter((d) => d.ativo && d.grupo).map((d) => d.grupo)),
  ).filter(Boolean);
  const uniqueLevels = Array.from(
    new Set(disciplinas.filter((d) => d.ativo).map((d) => d.nivel)),
  ).filter(Boolean);
  // TODO: Ajustar depois a exibição e o funcionamento dos filtros para serem iguais aos da página de Seleção.
  const diasSemana = [
    t("WeekDays.mon"),
    t("WeekDays.tue"),
    t("WeekDays.wed"),
    t("WeekDays.thu"),
    t("WeekDays.fri"),
    t("WeekDays.sat"),
  ];

  const handleDocenteSearchChange = (value: string) => {
    onDocenteFiltersChange({
      ...docenteFilters,
      search: value,
    });
  };

  const handleDisciplinaSearchChange = (value: string) => {
    onDisciplinaFiltersChange({
      ...disciplinaFilters,
      search: value,
    });
  };

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
      rules: [
        ...disciplinaFilters.rules,
        { ...rule, id: Date.now().toString() },
      ],
    });
    setOpenDisciplinaDialog(false);
  };

  const removeDocenteRule = (ruleId: string) => {
    onDocenteFiltersChange({
      ...docenteFilters,
      rules: docenteFilters.rules.filter((rule) => rule.id !== ruleId),
    });
  };

  const removeDisciplinaRule = (ruleId: string) => {
    onDisciplinaFiltersChange({
      ...disciplinaFilters,
      rules: disciplinaFilters.rules.filter((rule) => rule.id !== ruleId),
    });
  };

  const hasActiveFilters =
    docenteFilters.search ||
    docenteFilters.rules.length > 0 ||
    disciplinaFilters.search ||
    disciplinaFilters.rules.length > 0;

  const renderFilterRule = (
    rule: FilterRule,
    onRemove: (id: string) => void,
  ) => {
    let displayValue = "";
    if (rule.type === "chips" && Array.isArray(rule.value)) {
      displayValue = rule.value.join(", ");
    } else if (rule.type === "timeRange") {
      const start = rule.value.start || "00:00";
      const end = rule.value.end || "23:59";
      if (rule.value.start && rule.value.end) {
        displayValue = `${start} - ${end}`;
      } else if (rule.value.start) {
        displayValue = t("fromStart", { start: start });
      } else if (rule.value.end) {
        displayValue = t("toEnd", { end: end });
      }
    } else if (rule.type === "boolean") {
      displayValue = rule.value ? t("yes") : t("no");
    } else {
      displayValue = rule.value.toString();
    }

    return (
      <Chip
        key={rule.id}
        label={`${rule.field}: ${displayValue}`}
        onDelete={() => onRemove(rule.id)}
        color="primary"
        variant="outlined"
        size="small"
      />
    );
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">{t("gridFilters")}</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {hasActiveFilters && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<Clear />}
          onClick={onClearFilters}
          fullWidth
          sx={{ mb: 2 }}
        >
          {t("clearAllFilters")}
        </Button>
      )}

      {hasActiveFilters && (
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            {t("activeFilters")}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {docenteFilters.search && (
              <Chip
                label={t("professorSearch", { Search: docenteFilters.search })}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
            {disciplinaFilters.search && (
              <Chip
                label={t("classSearch", { Search: disciplinaFilters.search })}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
            {docenteFilters.rules.map((rule) =>
              renderFilterRule(rule, removeDocenteRule),
            )}
            {disciplinaFilters.rules.map((rule) =>
              renderFilterRule(rule, removeDisciplinaRule),
            )}
          </Box>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        <Grid container spacing={3}>
          {/* Filtros de Docentes */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              {t("rowsTeacherFilters")}
            </Typography>

            <TextField
              fullWidth
              size="small"
              label={t("searchProfessorByName")}
              value={docenteFilters.search}
              onChange={(e) => handleDocenteSearchChange(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography variant="body2">
                {t("advancedFiltersLabel")}
              </Typography>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={() => setOpenDocenteDialog(true)}
                variant="outlined"
              >
                {t("add")}
              </Button>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={1}>
              {docenteFilters.rules.map((rule) =>
                renderFilterRule(rule, removeDocenteRule),
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          {/* Filtros de Disciplinas */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              {t("classFiltersColumns")}
            </Typography>

            <TextField
              fullWidth
              size="small"
              label={t("searchClassByNameCodeId")}
              value={disciplinaFilters.search}
              onChange={(e) => handleDisciplinaSearchChange(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="body2">
                {t("advancedFiltersLabel")}
              </Typography>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={() => setOpenDisciplinaDialog(true)}
                variant="outlined"
              >
                Adicionar
              </Button>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={1}>
              {disciplinaFilters.rules.map((rule) =>
                renderFilterRule(rule, removeDisciplinaRule),
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Docente Filter Dialog */}
      <FilterDialog
        open={openDocenteDialog}
        onClose={() => setOpenDocenteDialog(false)}
        onAdd={addDocenteRule}
        title={t("addProfessorFilter")}
        fields={[
          { key: "nome", label: t("name"), type: "text" },
          { key: "ativo", label: t("active"), type: "boolean" },
          { key: "comentario", label: t("comment"), type: "text" },
          {
            key: "agrupar",
            label: t("groupPreference"),
            type: "select",
            options: [
              t("groupPreference"),
              t("indifferent"),
              t("spreadPreference"),
            ],
          },
        ]}
      />

      {/* Disciplina Filter Dialog */}
      <FilterDialog
        open={openDisciplinaDialog}
        onClose={() => setOpenDisciplinaDialog(false)}
        onAdd={addDisciplinaRule}
        title={t("addClassFilter")}
        fields={[
          { key: "nome", label: t("name"), type: "text" },
          { key: "codigo", label: t("code"), type: "text" },
          {
            key: "nivel",
            label: t("level"),
            type: "chips",
            options: uniqueLevels,
          },
          {
            key: "grupo",
            label: t("group"),
            type: "chips",
            options: uniqueGroups,
          },
          { key: "noturna", label: t("evening"), type: "boolean" },
          { key: "ingles", label: t("english"), type: "boolean" },
          {
            key: "horarios_dias",
            label: t("weekDays"),
            type: "chips",
            options: diasSemana,
          },
          {
            key: "horarios_tempo",
            label: t("scheduleRange"),
            type: "timeRange",
          },
        ]}
      />
    </Box>
  );
}

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (rule: FilterRule) => void;
  title: string;
  fields: Array<{
    key: string;
    label: string;
    type: "text" | "number" | "boolean" | "chips" | "timeRange" | "select";
    options?: string[];
  }>;
}

function FilterDialog({
  open,
  onClose,
  onAdd,
  title,
  fields,
}: FilterDialogProps) {
  const [selectedField, setSelectedField] = useState("");
  const [filterType, setFilterType] = useState<
    | "exact"
    | "contains"
    | "chips"
    | "boolean"
    | "timeRange"
    | "number"
    | "select"
  >("contains");
  const [textValue, setTextValue] = useState("");
  const [numberValue, setNumberValue] = useState("");
  const [booleanValue, setBooleanValue] = useState(false);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [selectValue, setSelectValue] = useState("");

  const selectedFieldConfig = fields.find((f) => f.key === selectedField);

  const handleAdd = () => {
    if (!selectedField) return;

    let value: any;
    let type: FilterRule["type"];

    if (selectedFieldConfig?.type === "chips") {
      value = selectedChips;
      type = "chips";
    } else if (selectedFieldConfig?.type === "boolean") {
      value = booleanValue;
      type = "boolean";
    } else if (selectedFieldConfig?.type === "timeRange") {
      if (!timeStart && !timeEnd) return;
      value = {
        start: timeStart || null,
        end: timeEnd || null,
      };
      type = "timeRange";
    } else if (selectedFieldConfig?.type === "number") {
      value = Number.parseFloat(numberValue);
      type = "number";
    } else if (selectedFieldConfig?.type === "select") {
      value = selectValue;
      type = "exact";
    } else {
      value = textValue;
      type = filterType as "exact" | "contains";
    }

    onAdd({
      id: "",
      field: selectedFieldConfig?.label || selectedField,
      fieldKey: selectedField,
      type,
      value,
    });

    setSelectedField("");
    setTextValue("");
    setNumberValue("");
    setBooleanValue(false);
    setSelectedChips([]);
    setTimeStart("");
    setTimeEnd("");
    setSelectValue("");
    setFilterType("contains");
  };

  const handleChipToggle = (chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip],
    );
  };

  const isAddDisabled = () => {
    if (!selectedField) return true;

    if (selectedFieldConfig?.type === "timeRange") {
      return !timeStart && !timeEnd;
    }

    if (selectedFieldConfig?.type === "chips") {
      return selectedChips.length === 0;
    }

    if (selectedFieldConfig?.type === "text") {
      return !textValue.trim();
    }

    if (selectedFieldConfig?.type === "number") {
      return !numberValue || isNaN(Number(numberValue));
    }

    if (selectedFieldConfig?.type === "select") {
      return !selectValue;
    }

    return false;
  };

  const t = useTranslations("Pages.Assignment.Filters");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          <FormControl fullWidth>
            <InputLabel>{t("field")}</InputLabel>
            <Select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              label={t("field")}
            >
              {fields.map((field) => (
                <MenuItem key={field.key} value={field.key}>
                  {field.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedFieldConfig && (
            <>
              {selectedFieldConfig.type === "text" && (
                <>
                  <FormControl fullWidth>
                    <InputLabel>{t("filterType")}</InputLabel>
                    <Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      label="Tipo de Filtro"
                    >
                      <MenuItem value="contains">{t("contains")}</MenuItem>
                      <MenuItem value="exact">{t("exact")}</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label={t("value")}
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                  />
                </>
              )}

              {selectedFieldConfig.type === "number" && (
                <TextField
                  fullWidth
                  label={t("value")}
                  type="number"
                  value={numberValue}
                  onChange={(e) => setNumberValue(e.target.value)}
                />
              )}

              {selectedFieldConfig.type === "boolean" && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={booleanValue}
                      onChange={(e) => setBooleanValue(e.target.checked)}
                    />
                  }
                  label={booleanValue ? t("yes") : t("no")}
                />
              )}

              {selectedFieldConfig.type === "chips" &&
                selectedFieldConfig.options && (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      {t("selectOneOrMoreOptions")}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {selectedFieldConfig.options.map((option) => (
                        <Chip
                          key={option}
                          label={option}
                          clickable
                          color={
                            selectedChips.includes(option)
                              ? "primary"
                              : "default"
                          }
                          onClick={() => handleChipToggle(option)}
                        />
                      ))}
                    </Box>
                    {selectedChips.length > 0 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {t("optionsSelected", { count: selectedChips.length })}
                      </Typography>
                    )}
                  </Box>
                )}

              {selectedFieldConfig.type === "select" &&
                selectedFieldConfig.options && (
                  <FormControl fullWidth>
                    <InputLabel>{selectedFieldConfig.label}</InputLabel>
                    <Select
                      value={selectValue}
                      onChange={(e) => setSelectValue(e.target.value)}
                      label={selectedFieldConfig.label}
                    >
                      {selectedFieldConfig.options.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

              {selectedFieldConfig.type === "timeRange" && (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    {t("selectTimeRangeOptional")}
                  </Typography>
                  <Box display="flex" gap={2}>
                    <TextField
                      label={t("startTimeOptional")}
                      type="time"
                      value={timeStart}
                      onChange={(e) => setTimeStart(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                      fullWidth
                    />
                    <TextField
                      label={t("endTimeOptional")}
                      type="time"
                      value={timeEnd}
                      onChange={(e) => setTimeEnd(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                      fullWidth
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    • {t("onlyStartHelp")}
                    <br />• {t("onlyEndHelp")}
                    <br />• {t("bothHelp")}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("cancel")}</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={isAddDisabled()}
        >
          {t("add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
