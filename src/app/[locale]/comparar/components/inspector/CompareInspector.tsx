"use client";

import {
  Box,
  Chip,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslations } from "next-intl";
import { formatCursos } from "@/app/[locale]/atribuicoes/model/text";
import { formatSaldo } from "@/app/[locale]/history/model/format";
import {
  pairKey,
  type SolutionDetail,
} from "@/app/[locale]/history/model/solutionDetail";
import type { EntityRef } from "@/app/[locale]/history/state/detailNavigation";
import type { Disciplina } from "@/context/Global/utils";
import { turmaLabel, type Side } from "../../model/comparison";
import { formatNumber } from "../../model/metrics";
import { useCompare } from "../../state/CompareContext";
import { EntityLink, PriorityPill, SideBadge, StatusChip } from "../shared";

function horarios(turma: Disciplina): string {
  const list = turma.horarios ?? [];
  if (list.length === 0) return "";
  return list.map((h) => `${h.dia} ${h.inicio}–${h.fim}`.trim()).join(", ");
}

function SideColumn({
  side,
  children,
}: {
  side: Side;
  children: React.ReactNode;
}) {
  const { tokens } = useCompare();
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        p: 1,
        borderRadius: 1,
        border: 1,
        borderColor: tokens.side[side].main,
        bgcolor: tokens.side[side].soft,
      }}
    >
      <Box sx={{ mb: 0.5 }}>
        <SideBadge side={side} tokens={tokens} size={18} />
      </Box>
      {children}
    </Box>
  );
}

function PairsTable({
  rows,
  kind,
  maxPriority,
  headerLabel,
}: {
  rows: {
    id: string;
    label: string;
    a: number | null;
    b: number | null;
    inA: boolean;
    inB: boolean;
  }[];
  kind: "docente" | "turma";
  maxPriority: number;
  headerLabel: string;
}) {
  const t = useTranslations("Pages.Compare.inspector");
  const { tokens } = useCompare();
  if (rows.length === 0)
    return (
      <Typography variant="body2" color="text.secondary">
        {t("noForms")}
      </Typography>
    );
  return (
    <Table size="small" aria-label={headerLabel}>
      <TableHead>
        <TableRow>
          <TableCell>{headerLabel}</TableCell>
          <TableCell align="center">
            <SideBadge side="a" tokens={tokens} size={16} />
          </TableCell>
          <TableCell align="center">
            <SideBadge side="b" tokens={tokens} size={16} />
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((r) => {
          const differs = r.a !== r.b;
          return (
            <TableRow
              key={r.id}
              sx={differs ? { bgcolor: "action.selected" } : undefined}
            >
              <TableCell sx={{ maxWidth: 200 }}>
                <EntityLink kind={kind} id={r.id}>
                  {r.label}
                </EntityLink>
                {differs && (
                  <Tooltip title={t("priorityDiffers")}>
                    <WarningAmberIcon
                      fontSize="inherit"
                      color="warning"
                      sx={{ ml: 0.5, verticalAlign: "middle" }}
                      aria-label={t("priorityDiffers")}
                    />
                  </Tooltip>
                )}
              </TableCell>
              <TableCell align="center">
                <Stack
                  direction="row"
                  spacing={0.5}
                  justifyContent="center"
                  alignItems="center"
                >
                  <PriorityPill value={r.a} max={maxPriority} />
                  {r.inA && (
                    <Tooltip title={t("assigned")}>
                      <Box component="span" aria-label={t("assigned")}>
                        ●
                      </Box>
                    </Tooltip>
                  )}
                </Stack>
              </TableCell>
              <TableCell align="center">
                <Stack
                  direction="row"
                  spacing={0.5}
                  justifyContent="center"
                  alignItems="center"
                >
                  <PriorityPill value={r.b} max={maxPriority} />
                  {r.inB && (
                    <Tooltip title={t("assigned")}>
                      <Box component="span" aria-label={t("assigned")}>
                        ●
                      </Box>
                    </Tooltip>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function TurmaInspector({ id }: { id: string }) {
  const t = useTranslations("Pages.Compare.inspector");
  const { comparison: c } = useCompare();
  const ta = c.detailA.turmas.get(id);
  const tb = c.detailB.turmas.get(id);
  const turma = (tb ?? ta)!.turma;
  const diff = c.turmaIndex.get(id);
  const max = Math.max(c.detailA.maxPriority, c.detailB.maxPriority, 1);

  const side = (
    s: Side,
    detail: SolutionDetail,
    docentes: string[],
    marked: string[],
    mark: "added" | "removed",
  ) => (
    <SideColumn side={s}>
      {!detail.turmas.has(id) ? (
        <Typography variant="body2" color="text.secondary">
          {t("notInSide")}
        </Typography>
      ) : docentes.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t("noDocentes")}
        </Typography>
      ) : (
        <Stack spacing={0.5}>
          {docentes.map((nome) => (
            <Stack
              key={nome}
              direction="row"
              spacing={0.75}
              alignItems="center"
            >
              <EntityLink
                kind="docente"
                id={nome}
                mark={marked.includes(nome) ? mark : undefined}
              />
              <PriorityPill
                value={detail.prioridade.get(pairKey(nome, id)) ?? null}
                max={max}
              />
            </Stack>
          ))}
        </Stack>
      )}
    </SideColumn>
  );

  const nomes = new Set<string>([
    ...(ta?.formDocentes ?? []),
    ...(tb?.formDocentes ?? []),
    ...(ta?.docentes ?? []),
    ...(tb?.docentes ?? []),
  ]);
  const rows = [...nomes].map((nome) => ({
    id: nome,
    label: nome,
    a: c.detailA.prioridade.get(pairKey(nome, id)) ?? null,
    b: c.detailB.prioridade.get(pairKey(nome, id)) ?? null,
    inA: ta?.docentes.includes(nome) ?? false,
    inB: tb?.docentes.includes(nome) ?? false,
  }));
  rows.sort(
    (x, y) =>
      (x.b ?? x.a ?? 99) - (y.b ?? y.a ?? 99) || x.label.localeCompare(y.label),
  );

  const cursos = formatCursos(turma.cursos);
  const hor = horarios(turma);
  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {t("turma")}
        </Typography>
        <Typography variant="h6" component="h2" sx={{ lineHeight: 1.25 }}>
          {turmaLabel(turma)}
        </Typography>
        {(cursos || hor) && (
          <Typography variant="body2" color="text.secondary">
            {[cursos, hor].filter(Boolean).join(" · ")}
          </Typography>
        )}
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 0.5 }}
          flexWrap="wrap"
          useFlexGap
        >
          {diff && <StatusChip status={diff.status} />}
          {turma.carga !== undefined && (
            <Chip
              size="small"
              variant="outlined"
              label={t("carga", { value: turma.carga })}
            />
          )}
          {(ta?.conflito || tb?.conflito) && (
            <Chip
              size="small"
              color="error"
              variant="outlined"
              icon={<WarningAmberIcon />}
              label={t("conflict")}
            />
          )}
        </Stack>
      </Box>
      <Stack direction="row" spacing={1}>
        {side(
          "a",
          c.detailA,
          ta?.docentes ?? [],
          diff?.sairam ?? [],
          "removed",
        )}
        {side(
          "b",
          c.detailB,
          tb?.docentes ?? [],
          diff?.entraram ?? [],
          "added",
        )}
      </Stack>
      <Divider />
      <Typography variant="subtitle2">{t("interested")}</Typography>
      <PairsTable
        rows={rows}
        kind="docente"
        maxPriority={max}
        headerLabel={t("docente")}
      />
    </Stack>
  );
}

function DocenteInspector({ id }: { id: string }) {
  const t = useTranslations("Pages.Compare.inspector");
  const { comparison: c, locale } = useCompare();
  const diff = c.docenteIndex.get(id)!;
  const da = c.detailA.docentes.get(id);
  const db = c.detailB.docentes.get(id);
  const max = Math.max(c.detailA.maxPriority, c.detailB.maxPriority, 1);
  const turmaName = (tid: string) => {
    const tt =
      c.detailB.turmas.get(tid)?.turma ?? c.detailA.turmas.get(tid)?.turma;
    return tt ? turmaLabel(tt) : tid;
  };
  const carga = (v: number) => formatNumber(v, locale, v % 1 === 0 ? 0 : 2);

  const side = (
    s: Side,
    detail: SolutionDetail,
    present: boolean,
    turmas: string[],
    marked: string[],
    mark: "added" | "removed",
    saldo: number | undefined,
    cargaV: number,
    conflitos: number,
  ) => (
    <SideColumn side={s}>
      {!present ? (
        <Typography variant="body2" color="text.secondary">
          {t("notInSide")}
        </Typography>
      ) : (
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            {t("saldo")}: <strong>{formatSaldo(saldo, locale)}</strong> ·{" "}
            {t("cargaLabel")}: <strong>{carga(cargaV)}</strong>
          </Typography>
          {conflitos > 0 && (
            <Typography
              variant="caption"
              color="error.main"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <WarningAmberIcon fontSize="inherit" />{" "}
              {t("conflicts", { count: conflitos })}
            </Typography>
          )}
          {turmas.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("noTurmas")}
            </Typography>
          ) : (
            turmas.map((tid) => (
              <Stack
                key={tid}
                direction="row"
                spacing={0.75}
                alignItems="center"
              >
                <EntityLink
                  kind="turma"
                  id={tid}
                  mark={marked.includes(tid) ? mark : undefined}
                >
                  {turmaName(tid)}
                </EntityLink>
                <PriorityPill
                  value={detail.prioridade.get(pairKey(id, tid)) ?? null}
                  max={max}
                />
              </Stack>
            ))
          )}
        </Stack>
      )}
    </SideColumn>
  );

  const ids = new Set<string>([
    ...(da?.formTurmas ?? []),
    ...(db?.formTurmas ?? []),
    ...diff.turmasA,
    ...diff.turmasB,
  ]);
  const rows = [...ids].map((tid) => ({
    id: tid,
    label: turmaName(tid),
    a: c.detailA.prioridade.get(pairKey(id, tid)) ?? null,
    b: c.detailB.prioridade.get(pairKey(id, tid)) ?? null,
    inA: diff.turmasA.includes(tid),
    inB: diff.turmasB.includes(tid),
  }));
  rows.sort(
    (x, y) =>
      (x.b ?? x.a ?? 99) - (y.b ?? y.a ?? 99) || x.label.localeCompare(y.label),
  );

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {t("docente")}
        </Typography>
        <Typography variant="h6" component="h2" sx={{ lineHeight: 1.25 }}>
          {id}
        </Typography>
        {diff.afetado && (
          <Typography variant="body2" color="text.secondary">
            {t("summary", {
              gained: diff.ganhou.length,
              lost: diff.perdeu.length,
            })}
          </Typography>
        )}
      </Box>
      <Stack direction="row" spacing={1}>
        {side(
          "a",
          c.detailA,
          !!da,
          diff.turmasA,
          diff.perdeu,
          "removed",
          diff.saldoA,
          diff.cargaA,
          da?.conflitos.size ?? 0,
        )}
        {side(
          "b",
          c.detailB,
          !!db,
          diff.turmasB,
          diff.ganhou,
          "added",
          diff.saldoB,
          diff.cargaB,
          db?.conflitos.size ?? 0,
        )}
      </Stack>
      <Divider />
      <Typography variant="subtitle2">{t("preferences")}</Typography>
      <PairsTable
        rows={rows}
        kind="turma"
        maxPriority={max}
        headerLabel={t("turma")}
      />
    </Stack>
  );
}

/** A entidade existe em algum dos lados? */
export function entityInComparison(
  c: { detailA: SolutionDetail; detailB: SolutionDetail },
  ref: EntityRef,
): boolean {
  const has = (d: SolutionDetail) =>
    ref.kind === "turma" ? d.turmas.has(ref.id) : d.docentes.has(ref.id);
  return has(c.detailA) || has(c.detailB);
}

/**
 * Inspetor: turma ou docente com A e B lado a lado, sem modal. Clicar num nome dentro dele
 * troca o foco para aquela entidade (mesmo gesto do histórico). Substitui os diálogos de detalhe.
 */
export default function CompareInspector({
  entity,
  onClose,
}: {
  entity: EntityRef;
  onClose: () => void;
}) {
  const t = useTranslations("Pages.Compare.inspector");
  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: -4 }}>
        <Tooltip title={t("close")}>
          <IconButton
            onClick={onClose}
            aria-label={t("close")}
            aria-keyshortcuts="Escape"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      {entity.kind === "turma" ? (
        <TurmaInspector id={entity.id} />
      ) : (
        <DocenteInspector id={entity.id} />
      )}
    </Box>
  );
}
