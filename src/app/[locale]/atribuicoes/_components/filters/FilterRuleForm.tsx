"use client";

import { useState } from "react";
import {
  Typography,
  TextField,
  Chip,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  Switch,
  FormControlLabel,
} from "@mui/material";
import type { FilterRule } from "../../types/types";
import { useTranslations } from "next-intl";

export interface FilterField {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "chips" | "timeRange" | "select";
  options?: (string | { label: string; value: string })[];
}

interface FilterRuleFormProps {
  onAdd: (rule: FilterRule) => void;
  onCancel: () => void;
  fields: FilterField[];
}

/**
 * Campo e valor de uma regra de filtro na mesma tela. Usado no diálogo do drawer e no popover
 * da barra de filtros (U9).
 */
export function FilterRuleForm({ onAdd, onCancel, fields }: FilterRuleFormProps) {
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
    <>
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
                      label={t("filterType")}
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
                      {selectedFieldConfig.options.map((option) => {
                        const optLabel =
                          typeof option === "string" ? option : option.label;
                        const optValue =
                          typeof option === "string" ? option : option.value;
                        return (
                          <Chip
                            key={optValue}
                            label={optLabel}
                            clickable
                            color={
                              selectedChips.includes(optValue)
                                ? "primary"
                                : "default"
                            }
                            onClick={() => handleChipToggle(optValue)}
                          />
                        );
                      })}
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
                      {selectedFieldConfig.options.map((option) => {
                        const optLabel =
                          typeof option === "string" ? option : option.label;
                        const optValue =
                          typeof option === "string" ? option : option.value;
                        return (
                          <MenuItem key={optValue} value={optValue}>
                            {optLabel}
                          </MenuItem>
                        );
                      })}
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
      <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
        <Button onClick={onCancel}>{t("cancel")}</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={isAddDisabled()}
        >
          {t("add")}
        </Button>
      </Box>
    </>
  );
}

interface FilterDialogProps extends Omit<FilterRuleFormProps, "onCancel"> {
  open: boolean;
  onClose: () => void;
  title: string;
}

export function FilterDialog({ open, onClose, title, ...props }: FilterDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <FilterRuleForm {...props} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}
