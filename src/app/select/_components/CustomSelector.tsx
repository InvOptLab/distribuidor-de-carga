"use client";

import type React from "react";
import { useState } from "react";
import {
  Card,
  CardHeader,
  Checkbox,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Grid,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  type SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import {
  type Disciplina,
  type Docente,
  isDisciplina,
} from "@/context/Global/utils";

interface FilterRule {
  id: string;
  field: string;
  fieldKey: string;
  type: "text" | "boolean" | "chips" | "timeRange";
  value: any;
}

interface CustomSelectorInterface {
  title: React.ReactNode;
  items: readonly (Disciplina | Docente)[];
  handleToggle: (value: Disciplina | Docente) => void;
  handleToggleAll: (items: readonly (Disciplina | Docente)[]) => () => void;
  numberOfChecked: (items: readonly (Disciplina | Docente)[]) => number;
  checked: readonly (Disciplina | Docente)[];
}

export default function CustomSelector({
  title,
  items,
  handleToggle,
  handleToggleAll,
  numberOfChecked,
  checked,
}: CustomSelectorInterface) {
  const [searchFilter, setSearchFilter] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<FilterRule[]>([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Determinar se estamos lidando com docentes ou disciplinas
  const isDocenteList = items.length > 0 && !isDisciplina(items[0]);

  // Campos disponíveis para filtros
  const docenteFields = [
    { key: "nome", label: "Nome", type: "text" },
    { key: "ativo", label: "Ativo", type: "boolean" },
    { key: "comentario", label: "Comentário", type: "text" },
    {
      key: "agrupar",
      label: "Agrupar",
      type: "chips",
      options: ["Agrupar", "Indiferente", "Espalhar"],
    },
  ];

  const disciplinaFields = [
    { key: "nome", label: "Nome", type: "text" },
    { key: "codigo", label: "Código", type: "text" },
    { key: "id", label: "ID", type: "text" },
    { key: "nivel", label: "Nível", type: "chips", options: [] }, // Será preenchido dinamicamente
    { key: "grupo", label: "Grupo", type: "chips", options: [] }, // Será preenchido dinamicamente
    { key: "noturna", label: "Noturna", type: "boolean" },
    { key: "ingles", label: "Inglês", type: "boolean" },
    { key: "ativo", label: "Ativo", type: "boolean" },
    {
      key: "horarios_dias",
      label: "Dias da Semana",
      type: "chips",
      options: ["Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."],
    },
    { key: "horarios_tempo", label: "Horário", type: "timeRange" },
  ];

  // Obter opções únicas para campos de chips
  const getUniqueOptions = (fieldKey: string) => {
    if (isDocenteList) return [];

    const disciplinas = items as readonly Disciplina[];
    switch (fieldKey) {
      case "nivel":
        return Array.from(
          new Set(disciplinas.map((d) => d.nivel).filter(Boolean))
        );
      case "grupo":
        return Array.from(
          new Set(disciplinas.map((d) => d.grupo).filter(Boolean))
        );
      default:
        return [];
    }
  };

  const availableFields = isDocenteList ? docenteFields : disciplinaFields;

  // Função para converter tempo em minutos
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr || typeof timeStr !== "string") return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Função para verificar se um valor corresponde a uma regra de filtro
  const matchesRule = (item: any, rule: FilterRule): boolean => {
    if (
      rule.fieldKey === "horarios_tempo" ||
      rule.fieldKey === "horarios_dias"
    ) {
      rule.fieldKey = "horarios";
    }
    const value = item[rule.fieldKey];

    switch (rule.type) {
      case "text":
        if (!value) return false;
        return value
          .toString()
          .toLowerCase()
          .includes(rule.value.toLowerCase());

      case "boolean":
        return value === rule.value;

      case "chips":
        if (rule.fieldKey === "horarios") {
          if (!Array.isArray(value)) return false;
          return value.some((horario: any) => rule.value.includes(horario.dia));
        }
        return rule.value.includes(value);

      case "timeRange":
        if (rule.fieldKey === "horarios" && Array.isArray(value)) {
          // Se não há horário de início nem fim especificado, mostrar disciplinas sem horários
          if (!rule.value.start && !rule.value.end) {
            return (
              value.length === 0 ||
              value.every((horario: any) => !horario.inicio && !horario.fim)
            );
          }

          const ruleStartMinutes = rule.value.start
            ? timeToMinutes(rule.value.start)
            : 0;
          const ruleEndMinutes = rule.value.end
            ? timeToMinutes(rule.value.end)
            : 24 * 60;

          return value.some((horario: any) => {
            const horarioStartMinutes = timeToMinutes(horario.inicio);
            const horarioEndMinutes = timeToMinutes(horario.fim);
            return (
              horarioStartMinutes < ruleEndMinutes &&
              horarioEndMinutes > ruleStartMinutes
            );
          });
        }
        // Para disciplinas sem horários definidos (array vazio ou undefined)
        if (
          rule.fieldKey === "horarios_tempo" &&
          !rule.value.start &&
          !rule.value.end
        ) {
          return !value || (Array.isArray(value) && value.length === 0);
        }
        return false;

      default:
        return true;
    }
  };

  // Aplicar filtros
  const filteredItems = items.filter((item) => {
    // Filtro de busca simples
    const searchText = isDocenteList
      ? (item as Docente).nome
      : `${(item as Disciplina).id} - ${(item as Disciplina).nome} - ${
          (item as Disciplina).codigo
        }`;

    const matchesSearch = searchText
      .toLowerCase()
      .includes(searchFilter.toLowerCase());

    // Filtros avançados
    const matchesAdvanced = advancedFilters.every((rule) =>
      matchesRule(item, rule)
    );

    return matchesSearch && matchesAdvanced;
  });

  // CORREÇÃO: Calcular selecionados apenas dos itens filtrados
  const filteredCheckedCount = numberOfChecked(filteredItems);
  const isAllFilteredSelected =
    filteredCheckedCount === filteredItems.length && filteredItems.length !== 0;
  const isIndeterminate =
    filteredCheckedCount !== filteredItems.length && filteredCheckedCount !== 0;

  // Adicionar filtro avançado
  const addAdvancedFilter = (field: any, value: any, type: string) => {
    const newFilter: FilterRule = {
      id: Date.now().toString(),
      field: field.label,
      fieldKey: field.key,
      type: type as any,
      value: value,
    };
    setAdvancedFilters([...advancedFilters, newFilter]);
  };

  // Remover filtro avançado
  const removeAdvancedFilter = (filterId: string) => {
    setAdvancedFilters(advancedFilters.filter((f) => f.id !== filterId));
  };

  // Limpar todos os filtros
  const clearAllFilters = () => {
    setSearchFilter("");
    setAdvancedFilters([]);
  };

  // Renderizar chip do filtro
  const renderFilterChip = (filter: FilterRule) => {
    let displayValue = "";
    if (filter.type === "chips" && Array.isArray(filter.value)) {
      displayValue = filter.value.join(", ");
    } else if (filter.type === "timeRange") {
      const start = filter.value.start || "";
      const end = filter.value.end || "";

      if (!start && !end) {
        displayValue = "sem horários definidos";
      } else if (start && end) {
        displayValue = `${start} - ${end}`;
      } else if (start) {
        displayValue = `a partir de ${start}`;
      } else if (end) {
        displayValue = `até ${end}`;
      }
    } else if (filter.type === "boolean") {
      displayValue = filter.value ? "Sim" : "Não";
    } else {
      displayValue = filter.value.toString();
    }

    return (
      <Chip
        key={filter.id}
        label={`${filter.field}: ${displayValue}`}
        onDelete={() => removeAdvancedFilter(filter.id)}
        color="primary"
        variant="outlined"
        size="small"
        sx={{ m: 0.5 }}
      />
    );
  };

  const hasActiveFilters = searchFilter || advancedFilters.length > 0;

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
      <CardHeader
        sx={{ px: 2, py: 1 }}
        avatar={
          <Checkbox
            onClick={handleToggleAll(filteredItems)} // CORREÇÃO: Usar filteredItems
            checked={isAllFilteredSelected} // CORREÇÃO: Usar estado calculado dos filtrados
            indeterminate={isIndeterminate} // CORREÇÃO: Usar estado calculado dos filtrados
            disabled={filteredItems.length === 0}
            inputProps={{
              "aria-label": "all items selected",
            }}
          />
        }
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {title}
            {hasActiveFilters && (
              <Tooltip title="Filtros ativos">
                <FilterListIcon color="primary" fontSize="small" />
              </Tooltip>
            )}
          </Box>
        }
        subheader={
          // CORREÇÃO: Mostrar contadores baseados nos itens filtrados
          <>
            {`${filteredCheckedCount}/${filteredItems.length} selecionados`}
            {filteredItems.length !== items.length && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                {`(${
                  items.length - filteredItems.length
                } itens ocultos pelos filtros)`}
              </Typography>
            )}
          </>
        }
      />
      <Divider />

      {/* Campo de busca simples */}
      <Box sx={{ paddingX: 2, paddingY: 1 }}>
        <TextField
          variant="outlined"
          placeholder={`Buscar ${isDocenteList ? "docente" : "disciplina"}...`}
          fullWidth
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          sx={{
            borderRadius: "4px",
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#f0f0f0",
              borderRadius: 2,
              "& fieldset": {
                borderColor: "#ddd",
              },
              "&:hover fieldset": {
                borderColor: "#bbb",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#1976d2",
              },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: hasActiveFilters && (
                <InputAdornment position="end">
                  <Tooltip title="Limpar todos os filtros">
                    <Button
                      size="small"
                      onClick={clearAllFilters}
                      startIcon={<ClearIcon />}
                      sx={{ minWidth: "auto", px: 1 }}
                    >
                      Limpar
                    </Button>
                  </Tooltip>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Filtros avançados */}
      <Box sx={{ px: 2 }} p={1}>
        <Accordion
          expanded={filtersExpanded}
          onChange={(_, expanded) => setFiltersExpanded(expanded)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <FilterListIcon fontSize="small" />
              Filtros Avançados
              {advancedFilters.length > 0 && (
                <Chip
                  label={advancedFilters.length}
                  size="small"
                  color="primary"
                />
              )}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <AdvancedFilterForm
              fields={availableFields}
              onAddFilter={addAdvancedFilter}
              getUniqueOptions={getUniqueOptions}
            />
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Chips dos filtros ativos */}
      {advancedFilters.length > 0 && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Filtros Ativos:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {advancedFilters.map(renderFilterChip)}
          </Box>
        </Box>
      )}

      <List
        sx={{
          width: 400,
          height: 500,
          bgcolor: "background.paper",
          overflowY: "auto",
        }}
        dense
        component="div"
        role="list"
      >
        {filteredItems.map((value: Docente | Disciplina) => {
          const labelId = `transfer-list-all-item-${
            isDisciplina(value) ? value.id : value.nome
          }-label`;

          return (
            <ListItemButton
              key={isDisciplina(value) ? `${value.id}` : value.nome}
              role="listitem"
              onClick={() => handleToggle(value)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    "aria-labelledby": labelId,
                  }}
                />
              </ListItemIcon>
              <ListItemText
                id={labelId}
                primary={
                  isDisciplina(value)
                    ? `${value.id} - ${value.nome}`
                    : value.nome
                }
                secondary={
                  isDisciplina(value) && (value as Disciplina).codigo
                    ? `Código: ${(value as Disciplina).codigo}`
                    : undefined
                }
              />
            </ListItemButton>
          );
        })}
        {filteredItems.length === 0 && (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {hasActiveFilters
                ? "Nenhum item corresponde aos filtros aplicados"
                : "Nenhum item disponível"}
            </Typography>
          </Box>
        )}
      </List>
    </Card>
  );
}

// Componente para formulário de filtros avançados
interface AdvancedFilterFormProps {
  fields: any[];
  onAddFilter: (field: any, value: any, type: string) => void;
  getUniqueOptions: (fieldKey: string) => string[];
}

function AdvancedFilterForm({
  fields,
  onAddFilter,
  getUniqueOptions,
}: AdvancedFilterFormProps) {
  const [selectedField, setSelectedField] = useState("");
  const [textValue, setTextValue] = useState("");
  const [booleanValue, setBooleanValue] = useState(false);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedFieldConfig = fields.find((f) => f.key === selectedField);

  const handleAddFilter = () => {
    if (!selectedField || !selectedFieldConfig) return;

    let value: any;
    const type = selectedFieldConfig.type;

    switch (type) {
      case "text":
        if (!textValue.trim()) return;
        value = textValue;
        break;
      case "boolean":
        value = booleanValue;
        break;
      case "chips":
        if (selectedChips.length === 0) return;
        value = selectedChips;
        break;
      case "timeRange":
        // Permite adicionar filtro mesmo sem horários para buscar disciplinas sem horários
        value = {
          start: timeStart || null,
          end: timeEnd || null,
        };
        break;
      default:
        return;
    }

    onAddFilter(selectedFieldConfig, value, type);

    // Reset form
    setSelectedField("");
    setTextValue("");
    setBooleanValue(false);
    setSelectedChips([]);
    setTimeStart("");
    setTimeEnd("");
    setDialogOpen(false);
  };

  const handleChipToggle = (chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const isAddDisabled = () => {
    if (!selectedField) return true;

    switch (selectedFieldConfig?.type) {
      case "text":
        return !textValue.trim();
      case "chips":
        return selectedChips.length === 0;
      case "timeRange":
        // Permite adicionar filtro mesmo sem horários para buscar disciplinas sem horários
        return false;
      default:
        return false;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Button variant="outlined" onClick={() => setDialogOpen(true)}>
        Adicionar Filtro Avançado
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Adicionar Filtro Avançado</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Campo</InputLabel>
              <Select
                value={selectedField}
                onChange={(event: SelectChangeEvent) =>
                  setSelectedField(event.target.value)
                }
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
                  <TextField
                    fullWidth
                    label="Valor"
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
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

                {selectedFieldConfig.type === "chips" && (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Selecione uma ou mais opções:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {(selectedFieldConfig.options?.length > 0
                        ? selectedFieldConfig.options
                        : getUniqueOptions(selectedFieldConfig.key)
                      ).map((option: string) => (
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
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {selectedFieldConfig.type === "timeRange" && (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Selecione o intervalo de horário:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Início (opcional)"
                          type="time"
                          value={timeStart}
                          onChange={(e) => setTimeStart(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Fim (opcional)"
                          type="time"
                          value={timeEnd}
                          onChange={(e) => setTimeEnd(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      • Deixe ambos vazios para encontrar disciplinas sem
                      horários definidos
                      <br />• Apenas início: disciplinas que começam a partir
                      desse horário
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
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleAddFilter}
            variant="contained"
            disabled={isAddDisabled()}
          >
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
