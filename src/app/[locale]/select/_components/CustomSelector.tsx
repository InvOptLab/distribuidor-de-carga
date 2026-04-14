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
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  type SelectChangeEvent,
  Grid,
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
import { useTranslations } from "next-intl";

// Mapa para relacionar a chave neutra com o dado em pt-br que vem do arquivo
const dayDataMapping: Record<string, string> = {
  mon: "Seg.",
  tue: "Ter.",
  wed: "Qua.",
  thu: "Qui.",
  fri: "Sex.",
  sat: "Sáb.",
};

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

  const t = useTranslations("Pages.Select.CustomSelector");

  // Determinar se estamos lidando com docentes ou disciplinas
  const isDocenteList = items.length > 0 && !isDisciplina(items[0]);

  // Campos disponíveis para filtros
  const docenteFields = [
    { key: "nome", label: t("name"), type: "text" },
    { key: "ativo", label: t("active"), type: "boolean" },
    { key: "comentario", label: t("comment"), type: "text" },
    {
      key: "agrupar",
      label: t("groupPreference"),
      type: "chips",
      options: [t("groupPreference"), t("indifferent"), t("spreadPreference")],
    },
  ];

  const disciplinaFields = [
    { key: "nome", label: t("name"), type: "text" },
    { key: "codigo", label: t("code"), type: "text" },
    { key: "id", label: "ID", type: "text" },
    { key: "nivel", label: t("level"), type: "chips", options: [] }, // Será preenchido dinamicamente
    { key: "grupo", label: t("group"), type: "chips", options: [] }, // Será preenchido dinamicamente
    { key: "noturna", label: t("evening"), type: "boolean" },
    { key: "ingles", label: t("english"), type: "boolean" },
    { key: "ativo", label: t("active"), type: "boolean" },
    {
      key: "horarios_dias",
      label: t("weekDaysLabel"),
      type: "chips",
      options: ["mon", "tue", "wed", "thu", "fri", "sat"],
    },
    { key: "horarios_tempo", label: t("schedule"), type: "timeRange" },
  ];

  // Obter opções únicas para campos de chips
  const getUniqueOptions = (fieldKey: string) => {
    if (isDocenteList) return [];

    const disciplinas = items as readonly Disciplina[];
    switch (fieldKey) {
      case "nivel":
        return Array.from(
          new Set(disciplinas.map((d) => d.nivel).filter(Boolean)),
        );
      case "grupo":
        return Array.from(
          new Set(disciplinas.map((d) => d.grupo).filter(Boolean)),
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

          // Mapeia as chaves neutras ("mon") para os valores do arquivo ("Seg.")
          const rawDaysToMatch = rule.value.map(
            (key: string) => dayDataMapping[key],
          );

          // Compara com horario.dia usando os valores mapeados
          return value.some((horario: any) =>
            rawDaysToMatch.includes(horario.dia),
          );
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
      matchesRule(item, rule),
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
      // Traduzir as chaves de dias da semana para a exibição no Chip
      if (
        filter.fieldKey === "horarios_dias" ||
        filter.fieldKey === "horarios"
      ) {
        displayValue = filter.value
          .map((key: string) => t(`WeekDays.${key}`)) // Busca "Seg.", "Mon.", etc, conforme o idioma
          .join(", ");
      } else {
        displayValue = filter.value.join(", ");
      }
    } else if (filter.type === "timeRange") {
      const start = filter.value.start || "";
      const end = filter.value.end || "";

      if (!start && !end) {
        displayValue = t("noDefinedSchedules");
      } else if (start && end) {
        displayValue = `${start} - ${end}`;
      } else if (start) {
        displayValue = t("fromStart", { start: start });
      } else if (end) {
        displayValue = t("toEnd", { start: end });
      }
    } else if (filter.type === "boolean") {
      displayValue = filter.value ? t("yes") : t("no");
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
            onClick={handleToggleAll(filteredItems)} // Usar filteredItems
            checked={isAllFilteredSelected} // Usar estado calculado dos filtrados
            indeterminate={isIndeterminate} // Usar estado calculado dos filtrados
            disabled={filteredItems.length === 0}
            slotProps={{
              input: { "aria-label": t("allItemsSelected") },
            }}
          />
        }
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {title}
            {hasActiveFilters && (
              <Tooltip title={t("activeFilters")}>
                <FilterListIcon color="primary" fontSize="small" />
              </Tooltip>
            )}
          </Box>
        }
        subheader={
          // Mostrar contadores baseados nos itens filtrados
          <>
            {`${filteredCheckedCount}/${filteredItems.length} ${t("selected")}`}
            {filteredItems.length !== items.length && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                {`(${
                  items.length - filteredItems.length
                } ${t("itemsHiddenByFilters")})`}
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
          placeholder={`${t("search")} ${isDocenteList ? t("professor") : t("class")}...`}
          fullWidth
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          sx={{
            borderRadius: "4px",
            "& .MuiOutlinedInput-root": {
              backgroundColor: "background.default", //"#f0f0f0",
              borderRadius: 2,
              color: "text.primary",
              "& fieldset": {
                borderColor: "#ddd",
              },
              "&:hover fieldset": {
                borderColor: "#bbb",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primaty.main",
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
                  <Tooltip title={t("clearAllFilters")}>
                    <Button
                      size="small"
                      onClick={clearAllFilters}
                      startIcon={<ClearIcon />}
                      sx={{ minWidth: "auto", px: 1 }}
                    >
                      {t("clear")}
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
              component="div"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <FilterListIcon fontSize="small" />
              {t("advancedFilters")}
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
            {t("activeFiltersLabel")}
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
                  slotProps={{ input: { "aria-labelledby": labelId } }}
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
                    ? `${t("codeLabel")} ${(value as Disciplina).codigo}`
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
                ? t("noItemsMatchFilters")
                : t("noItemsAvailable")}
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

  const t = useTranslations("Pages.Select.CustomSelector.AdvancedFilterForm");

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
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip],
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
        {t("addAdvancedFilter")}
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("addAdvancedFilter")}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>{t("field")}</InputLabel>
              <Select
                value={selectedField}
                onChange={(event: SelectChangeEvent) =>
                  setSelectedField(event.target.value)
                }
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
                  <TextField
                    fullWidth
                    label={t("value")}
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
                    label={booleanValue ? t("yes") : t("no")}
                  />
                )}

                {selectedFieldConfig.type === "chips" && (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      {t("selectOneOrMoreOptions")}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {(selectedFieldConfig.options?.length > 0
                        ? selectedFieldConfig.options
                        : getUniqueOptions(selectedFieldConfig.key)
                      ).map((option: string) => {
                        // Verifica se é o campo de dias para buscar a tradução
                        const displayLabel =
                          selectedFieldConfig.key === "horarios_dias"
                            ? t(`WeekDays.${option}`)
                            : option;

                        return (
                          <Chip
                            key={option}
                            label={displayLabel}
                            clickable
                            color={
                              selectedChips.includes(option)
                                ? "primary"
                                : "default"
                            }
                            onClick={() => handleChipToggle(option)}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {selectedFieldConfig.type === "timeRange" && (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      {t("selectTimeRange")}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label={t("startOptional")}
                          type="time"
                          value={timeStart}
                          onChange={(e) => setTimeStart(e.target.value)}
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label={t("endOptional")}
                          type="time"
                          value={timeEnd}
                          onChange={(e) => setTimeEnd(e.target.value)}
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      </Grid>
                    </Grid>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      • {t("leaveBothEmptyHelp")}
                      <br />• {t("onlyStartHelp")}
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
          <Button onClick={() => setDialogOpen(false)}>{t("cancel")}</Button>
          <Button
            onClick={handleAddFilter}
            variant="contained"
            disabled={isAddDisabled()}
          >
            {t("add")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
