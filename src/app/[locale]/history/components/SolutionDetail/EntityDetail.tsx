"use client";

import type React from "react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslations } from "next-intl";
import { useAccessibility } from "@/context/Accessibility";
import { gridTokens } from "@/app/[locale]/atribuicoes/theme/gridTokens";
import { formatCursos } from "@/app/[locale]/atribuicoes/model/text";
import {
  relationsOf,
  type RelationRow,
  type SolutionDetail,
} from "../../model/solutionDetail";
import { EMPTY_VALUE, formatSaldo } from "../../model/format";
import type { EntityRef } from "../../state/useHistoryList";

type RelationFilter = "all" | "filled" | "assigned";

/** Atraso para o inspetor acompanhar o foco do teclado. */
export const INSPECT_FOLLOW_DELAY_MS = 150;

export function PriorityChip({
  value,
  maxPriority,
}: {
  value: number | null;
  maxPriority: number;
}) {
  const theme = useTheme();
  const { isHighContrast } = useAccessibility();
  const tokens = useMemo(
    () => gridTokens(theme, isHighContrast),
    [theme, isHighContrast],
  );
  if (value === null) {
    return (
      <Typography variant="body2" color="text.secondary" component="span">
        {EMPTY_VALUE}
      </Typography>
    );
  }
  // Rampa da grade com o maxPriority do contexto da entrada
  const { bg, fg } = tokens.ramp(value, Math.max(maxPriority, value));
  return (
    <Chip
      size="small"
      label={value}
      sx={{
        backgroundColor: bg,
        color: fg,
        fontWeight: 600,
        minWidth: 32,
        ...(tokens.highContrast
          ? { border: `2px solid ${tokens.border}` }
          : null),
      }}
    />
  );
}

export function turmaLabelOf(detail: SolutionDetail, id: string) {
  const turma = detail.turmas.get(id)?.turma;
  return turma ? `${turma.codigo} · ${turma.nome}` : id;
}

export function turmaCodeOf(detail: SolutionDetail, id: string) {
  return detail.turmas.get(id)?.turma.codigo ?? id;
}

/** Ref da entidade relacionada a uma linha: turmas de um docente, docentes de uma turma. */
export function relatedRef(entity: EntityRef, row: RelationRow): EntityRef {
  return { kind: entity.kind === "docente" ? "turma" : "docente", id: row.id };
}

interface EntityDetailProps {
  detail: SolutionDetail;
  entity: EntityRef | null;
  locale: string;
  /** Id da entidade relacionada aberta no inspetor (linha destacada). */
  inspectedId?: string;
  /**
   * Abre a entidade relacionada no inspetor. `explicit`: clique ou Espaço; `follow`: o inspetor
   * acompanhando o foco do teclado (não muda o nível da pilha nem abre o sobreposto).
   */
  onInspect: (ref: EntityRef, source: "explicit" | "follow") => void;
  /** Pivô: a entidade relacionada passa a ser a selecionada (duplo clique, Enter). */
  onFocusEntity: (ref: EntityRef) => void;
}

/**
 * Relações (formulários × atribuições) da entidade selecionada. Nada é inserido entre as
 * linhas: clicar numa linha abre a entidade relacionada no inspetor.
 */
function EntityDetail({
  detail,
  entity,
  locale,
  inspectedId,
  onInspect,
  onFocusEntity,
}: EntityDetailProps) {
  const t = useTranslations("Pages.History.detail");
  const [filter, setFilter] = useState<RelationFilter>("all");
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const followTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rows = useMemo(
    () => (entity ? relationsOf(detail, entity) : []),
    [detail, entity],
  );
  const visible = rows.filter((r) =>
    filter === "filled"
      ? r.prioridade !== null
      : filter === "assigned"
        ? r.atribuida
        : true,
  );

  useEffect(
    () => () => {
      if (followTimer.current) clearTimeout(followTimer.current);
    },
    [],
  );

  if (!entity) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        {t("selectEntity")}
      </Typography>
    );
  }

  const inspectNow = (row: RelationRow) => {
    if (followTimer.current) clearTimeout(followTimer.current);
    onInspect(relatedRef(entity, row), "explicit");
  };
  const inspectLater = (row: RelationRow) => {
    if (followTimer.current) clearTimeout(followTimer.current);
    followTimer.current = setTimeout(
      () => onInspect(relatedRef(entity, row), "follow"),
      INSPECT_FOLLOW_DELAY_MS,
    );
  };
  const pivot = (row: RelationRow) => {
    if (followTimer.current) clearTimeout(followTimer.current);
    onFocusEntity(relatedRef(entity, row));
  };

  const moveFocus = (index: number) => {
    const next = Math.min(visible.length - 1, Math.max(0, index));
    setFocusIndex(next);
    rowRefs.current[next]?.focus();
    const row = visible[next];
    if (row) inspectLater(row);
  };

  const onRowKeyDown = (
    event: React.KeyboardEvent,
    index: number,
    row: RelationRow,
  ) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        event.stopPropagation();
        moveFocus(index + (event.key === "ArrowDown" ? 1 : -1));
        break;
      case "Home":
      case "End":
        event.preventDefault();
        moveFocus(event.key === "Home" ? 0 : visible.length - 1);
        break;
      case "Enter":
        event.preventDefault();
        event.stopPropagation();
        pivot(row);
        break;
      case " ":
        event.preventDefault();
        inspectNow(row);
        break;
    }
  };

  const notes = (row: RelationRow) => {
    const parts: React.ReactNode[] = [];
    if (row.atribuida && row.prioridade === null) {
      parts.push(
        <Chip
          key="noform"
          size="small"
          variant="outlined"
          color="warning"
          label={t("notes.noForm")}
        />,
      );
    }
    if (row.chocaCom.length > 0) {
      parts.push(
        <Stack
          key="clash"
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{ color: "error.main" }}
        >
          <WarningAmberIcon fontSize="small" aria-hidden />
          <Typography variant="caption">
            {t("notes.clashWith", {
              turmas: row.chocaCom
                .map((id) => turmaCodeOf(detail, id))
                .join(", "),
            })}
          </Typography>
        </Stack>,
      );
    }
    return parts.length ? <Stack spacing={0.5}>{parts}</Stack> : null;
  };

  let header: React.ReactNode;
  if (entity.kind === "docente") {
    const d = detail.docentes.get(entity.id);
    if (!d) return <Typography sx={{ p: 2 }}>{t("notFound")}</Typography>;
    header = (
      <Stack
        direction="row"
        spacing={1}
        alignItems="baseline"
        sx={{ flexWrap: "wrap" }}
      >
        <Typography variant="subtitle1" fontWeight={600} component="h3">
          {d.docente.nome}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("saldo", { saldo: formatSaldo(d.docente.saldo, locale) })} ·{" "}
          {t("carga", { carga: d.carga })}
        </Typography>
        {d.conflitos.size > 0 && (
          <Chip
            size="small"
            color="error"
            icon={<WarningAmberIcon />}
            label={t("conflict")}
          />
        )}
      </Stack>
    );
  } else {
    const tt = detail.turmas.get(entity.id);
    if (!tt) return <Typography sx={{ p: 2 }}>{t("notFound")}</Typography>;
    const cursos = formatCursos(tt.turma.cursos);
    header = (
      <Stack spacing={0.25}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="baseline"
          sx={{ flexWrap: "wrap" }}
        >
          <Typography variant="subtitle1" fontWeight={600} component="h3">
            {turmaLabelOf(detail, tt.turma.id)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("docentesCount", { count: tt.docentes.length })}
          </Typography>
          {tt.conflito && (
            <Chip
              size="small"
              color="error"
              icon={<WarningAmberIcon />}
              label={t("conflict")}
            />
          )}
        </Stack>
        {cursos && (
          <Typography variant="caption" color="text.secondary">
            {cursos}
          </Typography>
        )}
      </Stack>
    );
  }

  const columns = entity.kind === "docente" ? 4 : 5;
  const activeIndex = Math.min(focusIndex, Math.max(0, visible.length - 1));

  return (
    <Stack sx={{ minWidth: 0, height: "100%", minHeight: 0 }}>
      <Stack spacing={1} sx={{ pb: 1, flexShrink: 0 }}>
        {header}
        <Stack
          direction="row"
          spacing={0.75}
          role="group"
          aria-label={t("relationFilter")}
        >
          {(["all", "filled", "assigned"] as RelationFilter[]).map((key) => (
            <Chip
              key={key}
              size="small"
              label={t(`relations.${key}`)}
              color={filter === key ? "primary" : "default"}
              variant={filter === key ? "filled" : "outlined"}
              onClick={() => {
                setFilter(key);
                setFocusIndex(0);
              }}
              aria-pressed={filter === key}
            />
          ))}
        </Stack>
      </Stack>
      {/* Contêiner de rolagem próprio, com cabeçalho fixo (3.1) */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <Table size="small" stickyHeader aria-label={t("relationsTable")}>
          <TableHead>
            <TableRow>
              <TableCell>
                {entity.kind === "docente"
                  ? t("columns.turma")
                  : t("columns.docente")}
              </TableCell>
              {entity.kind === "turma" && (
                <TableCell align="right">{t("columns.saldo")}</TableCell>
              )}
              <TableCell align="center">{t("columns.priority")}</TableCell>
              <TableCell align="center">{t("columns.assigned")}</TableCell>
              <TableCell>{t("columns.notes")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns}>
                  <Typography variant="body2" color="text.secondary">
                    {t("noRelations")}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {visible.map((row, index) => {
              const inspected = row.id === inspectedId;
              const name =
                entity.kind === "docente"
                  ? turmaLabelOf(detail, row.id)
                  : row.id;
              return (
                <TableRow
                  key={row.id}
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  hover
                  selected={inspected}
                  tabIndex={index === activeIndex ? 0 : -1}
                  aria-selected={inspected}
                  data-testid={`relation-${row.id}`}
                  onClick={() => {
                    setFocusIndex(index);
                    inspectNow(row);
                  }}
                  onDoubleClick={() => pivot(row)}
                  onFocus={() => setFocusIndex(index)}
                  onKeyDown={(e) => onRowKeyDown(e, index, row)}
                  sx={{
                    cursor: "pointer",
                    outline: "none",
                    "&:focus-visible": {
                      boxShadow: (theme) =>
                        `inset 0 0 0 2px ${theme.palette.primary.main}`,
                    },
                    // Marcador ◀ ligando a linha ao inspetor (3.1)
                    ...(inspected
                      ? {
                          boxShadow: (theme) =>
                            `inset -4px 0 0 ${theme.palette.primary.main}`,
                        }
                      : null),
                  }}
                >
                  <TableCell sx={{ maxWidth: 260 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: row.chocaCom.length ? "error.main" : undefined,
                        fontWeight: inspected ? 600 : 400,
                      }}
                    >
                      {name}
                    </Typography>
                  </TableCell>
                  {entity.kind === "turma" && (
                    <TableCell align="right" sx={{ fontFamily: "monospace" }}>
                      {formatSaldo(
                        detail.docentes.get(row.id)?.docente.saldo,
                        locale,
                      )}
                    </TableCell>
                  )}
                  <TableCell align="center">
                    <PriorityChip
                      value={row.prioridade}
                      maxPriority={detail.maxPriority}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {row.atribuida ? (
                      <CheckIcon
                        fontSize="small"
                        color="primary"
                        titleAccess={t("columns.assigned")}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        aria-label={t("notAssigned")}
                      >
                        {EMPTY_VALUE}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{notes(row)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Stack>
  );
}

export default memo(EntityDetail);
