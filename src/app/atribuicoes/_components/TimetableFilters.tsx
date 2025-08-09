"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Chip,
  Box,
  Button,
  Collapse,
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
} from "@mui/material";
import { ExpandMore, ExpandLess, Clear, Add } from "@mui/icons-material";
import { FilterRule } from "../types/types";
import { useTimetable } from "../context/TimetableContext";

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
}

export default function TimetableFilters({
  docenteFilters,
  disciplinaFilters,
  onDocenteFiltersChange,
  onDisciplinaFiltersChange,
  onClearFilters,
}: TimetableFiltersProps) {
  const { disciplinas } = useTimetable();
  const [expanded, setExpanded] = useState(false);
  const [openDocenteDialog, setOpenDocenteDialog] = useState(false);
  const [openDisciplinaDialog, setOpenDisciplinaDialog] = useState(false);

  // Get unique values for chips
  const uniqueGroups = Array.from(
    new Set(disciplinas.filter((d) => d.ativo && d.grupo).map((d) => d.grupo))
  ).filter(Boolean);
  const uniqueLevels = Array.from(
    new Set(disciplinas.filter((d) => d.ativo).map((d) => d.nivel))
  ).filter(Boolean);
  const diasSemana = ["Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."];

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
    onRemove: (id: string) => void
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
        displayValue = `a partir de ${start}`;
      } else if (rule.value.end) {
        displayValue = `até ${end}`;
      }
    } else if (rule.type === "boolean") {
      displayValue = rule.value ? "Sim" : "Não";
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
    <Card>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="h6">Filtros da Grade</Typography>
          <Box display="flex" gap={1}>
            {hasActiveFilters && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Clear />}
                onClick={onClearFilters}
              >
                Limpar Filtros
              </Button>
            )}
            <IconButton onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <Box mb={1}>
            <Typography variant="subtitle2" gutterBottom>
              Filtros Ativos:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {docenteFilters.search && (
                <Chip
                  label={`Busca Docente: "${docenteFilters.search}"`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              )}
              {disciplinaFilters.search && (
                <Chip
                  label={`Busca Disciplina: "${disciplinaFilters.search}"`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              )}
              {docenteFilters.rules.map((rule) =>
                renderFilterRule(rule, removeDocenteRule)
              )}
              {disciplinaFilters.rules.map((rule) =>
                renderFilterRule(rule, removeDisciplinaRule)
              )}
            </Box>
          </Box>
        )}

        <Collapse in={expanded}>
          <Grid container spacing={3}>
            {/* Filtros de Docentes */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Filtros de Docentes (Linhas)
              </Typography>

              <TextField
                fullWidth
                size="small"
                label="Buscar docente por nome"
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
                <Typography variant="body2">Filtros Avançados:</Typography>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setOpenDocenteDialog(true)}
                  variant="outlined"
                >
                  Adicionar Filtro
                </Button>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1}>
                {docenteFilters.rules.map((rule) =>
                  renderFilterRule(rule, removeDocenteRule)
                )}
              </Box>
            </Grid>

            {/* Filtros de Disciplinas */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Filtros de Disciplinas (Colunas)
              </Typography>

              <TextField
                fullWidth
                size="small"
                label="Buscar disciplina por nome, código ou ID"
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
                <Typography variant="body2">Filtros Avançados:</Typography>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setOpenDisciplinaDialog(true)}
                  variant="outlined"
                >
                  Adicionar Filtro
                </Button>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1}>
                {disciplinaFilters.rules.map((rule) =>
                  renderFilterRule(rule, removeDisciplinaRule)
                )}
              </Box>
            </Grid>
          </Grid>
        </Collapse>
      </CardContent>

      {/* Docente Filter Dialog */}
      <FilterDialog
        open={openDocenteDialog}
        onClose={() => setOpenDocenteDialog(false)}
        onAdd={addDocenteRule}
        title="Adicionar Filtro de Docente"
        fields={[
          { key: "nome", label: "Nome", type: "text" },
          { key: "ativo", label: "Ativo", type: "boolean" },
          { key: "comentario", label: "Comentário", type: "text" },
          {
            key: "agrupar",
            label: "Agrupar",
            type: "select",
            options: ["Agrupar", "Indiferente", "Espalhar"],
          },
        ]}
      />

      {/* Disciplina Filter Dialog */}
      <FilterDialog
        open={openDisciplinaDialog}
        onClose={() => setOpenDisciplinaDialog(false)}
        onAdd={addDisciplinaRule}
        title="Adicionar Filtro de Disciplina"
        fields={[
          { key: "nome", label: "Nome", type: "text" },
          { key: "codigo", label: "Código", type: "text" },
          {
            key: "nivel",
            label: "Nível",
            type: "chips",
            options: uniqueLevels,
          },
          {
            key: "grupo",
            label: "Grupo",
            type: "chips",
            options: uniqueGroups,
          },
          { key: "noturna", label: "Noturna", type: "boolean" },
          { key: "ingles", label: "Inglês", type: "boolean" },
          {
            key: "horarios_dias",
            label: "Dias da Semana",
            type: "chips",
            options: diasSemana,
          },
          {
            key: "horarios_tempo",
            label: "Horário (Range)",
            type: "timeRange",
          },
          // { key: "prioridade", label: "Prioridade", type: "number" },
        ]}
      />
    </Card>
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
      // Allow partial time ranges
      if (!timeStart && !timeEnd) return; // At least one must be specified
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

    // Reset form
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
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const isAddDisabled = () => {
    if (!selectedField) return true;

    if (selectedFieldConfig?.type === "timeRange") {
      return !timeStart && !timeEnd; // At least one must be specified
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          <FormControl fullWidth>
            <InputLabel>Campo</InputLabel>
            <Select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              label="Campo"
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
                    <InputLabel>Tipo de Filtro</InputLabel>
                    <Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      label="Tipo de Filtro"
                    >
                      <MenuItem value="contains">Contém</MenuItem>
                      <MenuItem value="exact">Exato</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Valor"
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                  />
                </>
              )}

              {selectedFieldConfig.type === "number" && (
                <TextField
                  fullWidth
                  label="Valor"
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
                  label={booleanValue ? "Sim" : "Não"}
                />
              )}

              {selectedFieldConfig.type === "chips" &&
                selectedFieldConfig.options && (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Selecione uma ou mais opções:
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
                        {selectedChips.length} opção(ões) selecionada(s)
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
                    Selecione o intervalo de horário (opcional preencher apenas
                    um):
                  </Typography>
                  <Box display="flex" gap={2}>
                    <TextField
                      label="Horário Início (opcional)"
                      type="time"
                      value={timeStart}
                      onChange={(e) => setTimeStart(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      label="Horário Fim (opcional)"
                      type="time"
                      value={timeEnd}
                      onChange={(e) => setTimeEnd(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    • Apenas início: disciplinas que começam a partir desse
                    horário
                    <br />• Apenas fim: disciplinas que terminam até esse
                    horário
                    <br />• Ambos: disciplinas que se sobrepõem ao intervalo
                    especificado
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={isAddDisabled()}
        >
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
