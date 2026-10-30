"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  Popover,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useTranslations } from "next-intl";
import { useTimetable } from "../../context/TimetableContext";
import type { FilterRule } from "../../types/types";
import {
  hasActiveFilters as computeHasActiveFilters,
  hasQuickRule,
  quickRuleId,
  toggleQuickRule,
} from "../../model/filters";
import { FilterRuleForm } from "../filters/FilterRuleForm";
import { useCanFilter, useFilterFields } from "../filters/useFilterFields";

const DEBOUNCE_MS = 150;

/**
 * Busca com debounce: o valor local responde na hora e o filtro (e o broadcast da sala)
 * só muda depois de 150 ms sem digitação. Atualizações remotas sobrescrevem o valor local.
 */
function DebouncedSearch({
  value,
  onChange,
  placeholder,
  disabled,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <TextField
      size="small"
      value={local}
      placeholder={placeholder}
      disabled={disabled}
      inputRef={inputRef}
      onChange={(e) => {
        const next = e.target.value;
        setLocal(next);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => onChange(next), DEBOUNCE_MS);
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        },
        htmlInput: { "aria-label": placeholder },
      }}
      sx={{ width: { xs: "100%", sm: 220 } }}
    />
  );
}

type Target = "docente" | "turma";

/**
 * Barra de filtros sempre visível (5.3): buscas, filtros rápidos, chips ativos e "+ Filtro" em popover.
 */
export default function FilterBar() {
  const {
    docenteFilters,
    disciplinaFilters,
    setDocenteFilters,
    setDisciplinaFilters,
    clearFilters,
  } = useTimetable();
  const { docenteFields, disciplinaFields, describeRule } = useFilterFields();
  const canFilter = useCanFilter();
  const t = useTranslations("Pages.Assignment.FilterBar");

  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [popoverTarget, setPopoverTarget] = useState<Target>("turma");
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" foca a busca (5.8), fora de campos de texto
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
      const el = event.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const quick: { key: string; target: Target; label: string }[] = [
    { key: "semDocente", target: "turma", label: t("quickWithoutTeacher") },
    { key: "semAtribuicao", target: "docente", label: t("quickWithoutAssignment") },
    { key: "noturna", target: "turma", label: t("quickEvening") },
    { key: "ingles", target: "turma", label: t("quickEnglish") },
    { key: "comConflito", target: "docente", label: t("quickConflicts") },
  ];

  const isQuickActive = (key: string, target: Target) =>
    hasQuickRule(target === "docente" ? docenteFilters : disciplinaFilters, key);

  const toggleQuick = (key: string, target: Target, label: string) => {
    if (target === "docente") setDocenteFilters(toggleQuickRule(docenteFilters, key, label));
    else setDisciplinaFilters(toggleQuickRule(disciplinaFilters, key, label));
  };

  // Chips só das regras que não são filtros rápidos (esses já aparecem como toggles)
  const isQuickRule = (rule: FilterRule) =>
    rule.value === true && quick.some((q) => q.key === rule.fieldKey);
  const advanced = [
    ...docenteFilters.rules
      .filter((r) => !isQuickRule(r))
      .map((rule) => ({ rule, target: "docente" as Target })),
    ...disciplinaFilters.rules
      .filter((r) => !isQuickRule(r))
      .map((rule) => ({ rule, target: "turma" as Target })),
  ];

  const removeRule = (id: string, target: Target) => {
    if (target === "docente") {
      setDocenteFilters({
        ...docenteFilters,
        rules: docenteFilters.rules.filter((r) => r.id !== id),
      });
    } else {
      setDisciplinaFilters({
        ...disciplinaFilters,
        rules: disciplinaFilters.rules.filter((r) => r.id !== id),
      });
    }
  };

  const addRule = (rule: FilterRule) => {
    const withId = { ...rule, id: Date.now().toString() };
    if (popoverTarget === "docente") {
      setDocenteFilters({ ...docenteFilters, rules: [...docenteFilters.rules, withId] });
    } else {
      setDisciplinaFilters({
        ...disciplinaFilters,
        rules: [...disciplinaFilters.rules, withId],
      });
    }
    setPopoverAnchor(null);
  };

  const active = computeHasActiveFilters(docenteFilters, disciplinaFilters);

  return (
    <Tooltip
      title={canFilter ? "" : t("guestsCannotFilter")}
      placement="bottom-start"
      followCursor
    >
      <Box
        role="search"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <DebouncedSearch
          value={docenteFilters.search}
          onChange={(search) => setDocenteFilters((prev) => ({ ...prev, search }))}
          placeholder={t("searchProfessor")}
          disabled={!canFilter}
          inputRef={searchRef}
        />
        <DebouncedSearch
          value={disciplinaFilters.search}
          onChange={(search) => setDisciplinaFilters((prev) => ({ ...prev, search }))}
          placeholder={t("searchClass")}
          disabled={!canFilter}
        />

        {quick.map((q) => {
          const on = isQuickActive(q.key, q.target);
          return (
            <Chip
              key={quickRuleId(q.key)}
              label={q.label}
              size="small"
              clickable
              disabled={!canFilter}
              color={on ? "primary" : "default"}
              variant={on ? "filled" : "outlined"}
              aria-pressed={on}
              onClick={() => toggleQuick(q.key, q.target, q.label)}
            />
          );
        })}

        <Button
          size="small"
          startIcon={<AddIcon />}
          disabled={!canFilter}
          onClick={(e) => setPopoverAnchor(e.currentTarget)}
          aria-haspopup="dialog"
        >
          {t("addFilter")}
        </Button>

        {advanced.map(({ rule, target }) => (
          <Chip
            key={`${target}-${rule.id}`}
            size="small"
            color="primary"
            variant="outlined"
            label={describeRule(rule)}
            onDelete={canFilter ? () => removeRule(rule.id, target) : undefined}
          />
        ))}

        {active && (
          <Button size="small" color="inherit" onClick={clearFilters} disabled={!canFilter}>
            {t("clearAll")}
          </Button>
        )}

        <Popover
          open={!!popoverAnchor}
          anchorEl={popoverAnchor}
          onClose={() => setPopoverAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          slotProps={{ paper: { sx: { p: 2, width: 380, maxWidth: "95vw" } } }}
        >
          <ToggleButtonGroup
            size="small"
            exclusive
            fullWidth
            value={popoverTarget}
            onChange={(_, value) => value && setPopoverTarget(value)}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="docente">{t("professor")}</ToggleButton>
            <ToggleButton value="turma">{t("class")}</ToggleButton>
          </ToggleButtonGroup>
          <FilterRuleForm
            key={popoverTarget}
            fields={popoverTarget === "docente" ? docenteFields : disciplinaFields}
            onAdd={addRule}
            onCancel={() => setPopoverAnchor(null)}
          />
        </Popover>
      </Box>
    </Tooltip>
  );
}
