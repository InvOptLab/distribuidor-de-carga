"use client";

import type React from "react";
import { memo, useMemo } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslations } from "next-intl";
import HoveredCourse from "@/app/[locale]/atribuicoes/_components/HoveredCourse";
import HoveredDocente from "@/app/[locale]/atribuicoes/_components/HoveredDocente";
import { relationsOf, type SolutionDetail } from "../../model/solutionDetail";
import type { EntityRef } from "../../state/useHistoryList";
import { PriorityChip, turmaCodeOf, turmaLabelOf } from "./EntityDetail";

export function entityName(detail: SolutionDetail, ref: EntityRef): string {
  return ref.kind === "turma" ? turmaLabelOf(detail, ref.id) : ref.id;
}

interface EntityInspectorProps {
  detail: SolutionDetail;
  /** Entidade selecionada na coluna central. */
  entity: EntityRef | null;
  /** Entidade relacionada aberta a partir de uma linha; ausente = a própria `entity`. */
  inspect: EntityRef | null;
  onBack: () => void;
  onFocusEntity: (ref: EntityRef) => void;
  /** Recolher (coluna) ou fechar (sobreposto). */
  onDismiss?: () => void;
  dismissKind?: "collapse" | "close";
}

/** Bloco "Ana Silva × MAT205: prioridade [4] · atribuída · ⚠ choca com MAT101". */
function RelationContext({
  detail,
  entity,
  inspect,
}: {
  detail: SolutionDetail;
  entity: EntityRef;
  inspect: EntityRef;
}) {
  const t = useTranslations("Pages.History.detail");
  const row = useMemo(
    () => relationsOf(detail, entity).find((r) => r.id === inspect.id),
    [detail, entity, inspect],
  );
  if (!row) return null;
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "action.hover",
      }}
      aria-label={t("inspector.relation")}
    >
      <Typography variant="caption" color="text.secondary" component="div">
        {entityName(detail, entity)} × {entityName(detail, inspect)}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ flexWrap: "wrap", rowGap: 0.5, mt: 0.5 }}
      >
        <Typography variant="body2">{t("columns.priority")}</Typography>
        <PriorityChip value={row.prioridade} maxPriority={detail.maxPriority} />
        <Typography variant="body2" color="text.secondary">
          ·
        </Typography>
        {row.atribuida ? (
          <Stack direction="row" spacing={0.25} alignItems="center">
            <CheckIcon fontSize="small" color="primary" aria-hidden />
            <Typography variant="body2">{t("inspector.assigned")}</Typography>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t("notAssigned")}
          </Typography>
        )}
        {row.atribuida && row.prioridade === null && (
          <Typography variant="body2" color="warning.main">
            · {t("notes.noForm")}
          </Typography>
        )}
        {row.chocaCom.length > 0 && (
          <Stack
            direction="row"
            spacing={0.25}
            alignItems="center"
            sx={{ color: "error.main" }}
          >
            <WarningAmberIcon fontSize="small" aria-hidden />
            <Typography variant="body2">
              {t("notes.clashWith", {
                turmas: row.chocaCom
                  .map((id) => turmaCodeOf(detail, id))
                  .join(", "),
              })}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

/**
 * Inspetor (coluna direita): detalhe completo da entidade relacionada ou, sem relação
 * aberta, da própria entidade selecionada. Turma → `HoveredCourse`; docente → `HoveredDocente`,
 * sempre com os dados da ENTRADA do histórico.
 */
function EntityInspector({
  detail,
  entity,
  inspect,
  onBack,
  onFocusEntity,
  onDismiss,
  dismissKind = "collapse",
}: EntityInspectorProps) {
  const t = useTranslations("Pages.History.detail");
  const target = inspect ?? entity;

  const docentes = useMemo(
    () => Array.from(detail.docentes.values(), (d) => d.docente),
    [detail],
  );
  const turmas = useMemo(
    () => Array.from(detail.turmas.values(), (d) => d.turma),
    [detail],
  );

  const title = target ? entityName(detail, target) : t("inspector.title");
  const backLabel = entity
    ? t("inspector.back", { name: entityName(detail, entity) })
    : "";

  let content: React.ReactNode = (
    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
      {t("inspector.empty")}
    </Typography>
  );
  if (target?.kind === "turma") {
    const turma = detail.turmas.get(target.id)?.turma;
    if (turma) {
      content = (
        <HoveredCourse
          variant="panel"
          disciplina={turma}
          formularios={detail.formularios}
          docentes={docentes}
          atribuicoes={detail.atribuicoes}
        />
      );
    }
  } else if (target?.kind === "docente") {
    const docente = detail.docentes.get(target.id)?.docente;
    if (docente) {
      content = (
        <HoveredDocente
          variant="panel"
          docente={docente}
          disciplinas={turmas}
          formularios={detail.formularios}
          atribuicoes={detail.atribuicoes.filter((a) =>
            a.docentes.includes(docente.nome),
          )}
        />
      );
    }
  }

  return (
    <Box
      component="aside"
      aria-label={t("inspector.label", { name: title })}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{
          px: 1,
          py: 0.75,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        {inspect && entity && (
          <Tooltip title={backLabel}>
            <IconButton size="small" onClick={onBack} aria-label={backLabel}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Typography
          variant="subtitle2"
          noWrap
          sx={{ flex: 1, minWidth: 0 }}
          title={title}
        >
          {title}
        </Typography>
        {inspect && (
          <Button
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => onFocusEntity(inspect)}
            sx={{ flexShrink: 0 }}
          >
            {t("inspector.focus")}
          </Button>
        )}
        {onDismiss && (
          <Tooltip
            title={
              dismissKind === "close" ? t("close") : t("inspector.collapse")
            }
          >
            <IconButton
              size="small"
              onClick={onDismiss}
              aria-label={
                dismissKind === "close" ? t("close") : t("inspector.collapse")
              }
            >
              {dismissKind === "close" ? (
                <CloseIcon fontSize="small" />
              ) : (
                <ChevronRightIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {inspect && entity && inspect.kind !== entity.kind && (
          <RelationContext detail={detail} entity={entity} inspect={inspect} />
        )}
        {content}
      </Box>
    </Box>
  );
}

export default memo(EntityInspector);
