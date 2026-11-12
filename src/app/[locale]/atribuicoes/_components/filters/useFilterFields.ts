"use client";

import { useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useCollaboration } from "@/context/Collaboration";
import type { FilterRule } from "../../types/types";
import { useTimetable } from "../../context/TimetableContext";
import type { FilterField } from "./FilterRuleForm";
import { useNivelLabel } from "@/components/Turma/NivelChip";

/**
 * Campos de filtro de docente e de turma e o texto de cada regra ativa (chip).
 * Compartilhado entre o drawer completo e a barra de filtros.
 */
export function useFilterFields() {
  const { disciplinas } = useTimetable();
  const t = useTranslations("Pages.Assignment.Filters");
  const nivelLabel = useNivelLabel();

  const diasSemana = useMemo(
    () => [
      { label: t("WeekDays.mon"), value: "Seg." },
      { label: t("WeekDays.tue"), value: "Ter." },
      { label: t("WeekDays.wed"), value: "Qua." },
      { label: t("WeekDays.thu"), value: "Qui." },
      { label: t("WeekDays.fri"), value: "Sex." },
      { label: t("WeekDays.sat"), value: "Sáb." },
    ],
    [t],
  );

  // O valor salvo na regra é o dado bruto; só o rótulo é traduzido
  const agruparOptions = useMemo(
    () => [
      { label: t("groupPreference"), value: "Agrupar" },
      { label: t("indifferent"), value: "Indiferente" },
      { label: t("spreadPreference"), value: "Espalhar" },
    ],
    [t],
  );

  const docenteFields: FilterField[] = useMemo(
    () => [
      { key: "nome", label: t("name"), type: "text" },
      { key: "ativo", label: t("active"), type: "boolean" },
      { key: "comentario", label: t("comment"), type: "text" },
      { key: "semAtribuicao", label: t("withoutAssignment"), type: "boolean" },
      { key: "comConflito", label: t("withConflict"), type: "boolean" },
      {
        key: "agrupar",
        label: t("groupPreference"),
        type: "select",
        options: agruparOptions,
      },
    ],
    [t, agruparOptions],
  );

  const disciplinaFields: FilterField[] = useMemo(() => {
    const uniqueGroups = Array.from(
      new Set(
        disciplinas.filter((d) => d.ativo && d.grupo).map((d) => d.grupo),
      ),
    ).filter(Boolean);
    // Valor original do arquivo ("g", "p", "g+p"...), rótulo por extenso
    const uniqueLevels = Array.from(
      new Set(disciplinas.filter((d) => d.ativo).map((d) => d.nivel)),
    )
      .filter(Boolean)
      .map((nivel) => ({ value: nivel, label: nivelLabel({ nivel }).longo }));
    return [
      { key: "nome", label: t("name"), type: "text" },
      { key: "codigo", label: t("code"), type: "text" },
      { key: "semDocente", label: t("withoutTeacher"), type: "boolean" },
      { key: "nivel", label: t("level"), type: "chips", options: uniqueLevels },
      { key: "grupo", label: t("group"), type: "chips", options: uniqueGroups },
      { key: "noturna", label: t("evening"), type: "boolean" },
      { key: "ingles", label: t("english"), type: "boolean" },
      {
        key: "horarios_dias",
        label: t("weekDays"),
        type: "chips",
        options: diasSemana,
      },
      { key: "horarios_tempo", label: t("scheduleRange"), type: "timeRange" },
    ];
  }, [disciplinas, t, diasSemana, nivelLabel]);

  const describeRule = useCallback(
    (rule: FilterRule): string => {
      let displayValue = "";
      if (rule.type === "chips" && Array.isArray(rule.value)) {
        displayValue =
          rule.fieldKey === "horarios_dias"
            ? rule.value
                .map((v) => diasSemana.find((d) => d.value === v)?.label || v)
                .join(", ")
            : rule.fieldKey === "nivel"
              ? rule.value.map((v) => nivelLabel({ nivel: v }).longo).join(", ")
              : rule.value.join(", ");
      } else if (rule.type === "timeRange") {
        const start = rule.value.start || "00:00";
        const end = rule.value.end || "23:59";
        if (rule.value.start && rule.value.end)
          displayValue = `${start} - ${end}`;
        else if (rule.value.start) displayValue = t("fromStart", { start });
        else if (rule.value.end) displayValue = t("toEnd", { end });
      } else if (rule.type === "boolean") {
        displayValue = rule.value ? t("yes") : t("no");
      } else if (rule.fieldKey === "agrupar") {
        displayValue =
          agruparOptions.find((o) => o.value === rule.value)?.label ??
          String(rule.value);
      } else {
        displayValue = String(rule.value);
      }
      // Rótulo do campo traduzido no idioma atual (a regra pode ter vindo de outro participante)
      const field =
        [...docenteFields, ...disciplinaFields].find(
          (f) => f.key === rule.fieldKey,
        )?.label ?? rule.field;
      return `${field}: ${displayValue}`;
    },
    [diasSemana, agruparOptions, docenteFields, disciplinaFields, t, nivelLabel],
  );

  return { docenteFields, disciplinaFields, describeRule };
}

/** Convidado sem `guestsCanFilter` não altera filtros (5.3). */
export function useCanFilter() {
  const { isInRoom, isOwner, config } = useCollaboration();
  return !isInRoom || isOwner || !!config?.guestsCanFilter;
}
