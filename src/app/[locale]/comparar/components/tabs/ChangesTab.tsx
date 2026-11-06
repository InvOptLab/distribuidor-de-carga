"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  DataGrid,
  type GridColDef,
  type GridColumnVisibilityModel,
} from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import { PRIORITY_DIRECTION } from "@/app/[locale]/history/model/solutionSummary";
import {
  priorityTrend,
  turmaLabel,
  TURMA_STATUSES,
  type PriorityTrend,
  type TurmaDiff,
  type TurmaStatus,
} from "../../model/comparison";
import { formatNumber } from "../../model/metrics";
import { useCompare } from "../../state/CompareContext";
import {
  DeltaChip,
  DocenteList,
  downloadText,
  StatusChip,
  toCsv,
} from "../shared";

export const DEFAULT_STATUSES: TurmaStatus[] = ["modified", "added", "removed"];

interface Row extends TurmaDiff {
  label: string;
  trend: PriorityTrend | null;
  deltaCarga: number;
  deltaSaldo: number | null;
  obs: string[];
}

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase();
}

/**
 * Aba Mudanças: uma tabela por turma que cobre as 4 abas de C-B10 e a "Análise detalhada"
 * (colunas de Δ, ordenação por impacto e filtro de prioridade com ±0,1).
 */
export default function ChangesTab({
  statuses,
  onStatusesChange,
}: {
  statuses: TurmaStatus[];
  onStatusesChange: (next: TurmaStatus[]) => void;
}) {
  const t = useTranslations("Pages.Compare.changes");
  const tStatus = useTranslations("Pages.Compare.status");
  const { comparison: c, openEntity, locale } = useCompare();
  const [query, setQuery] = useState("");
  const [trend, setTrend] = useState<PriorityTrend | "all">("all");
  const [visibility, setVisibility] = useState<GridColumnVisibilityModel>({
    deltaSaldo: false,
  });

  const allRows = useMemo<Row[]>(
    () =>
      c.turmas.map((d) => {
        const obs: string[] = [];
        if (!d.inA) obs.push(t("obs.onlyB"));
        if (!d.inB) obs.push(t("obs.onlyA"));
        if (d.semFormularioA)
          obs.push(t("obs.noFormA", { count: d.semFormularioA }));
        if (d.semFormularioB)
          obs.push(t("obs.noFormB", { count: d.semFormularioB }));
        if (!d.conflitoA && d.conflitoB) obs.push(t("obs.conflictB"));
        if (d.conflitoA && !d.conflitoB) obs.push(t("obs.conflictResolved"));
        return {
          ...d,
          label: turmaLabel(d.turma),
          trend: priorityTrend(d),
          deltaCarga: d.cargaEnvolvidaB - d.cargaEnvolvidaA,
          deltaSaldo:
            d.saldoA !== null && d.saldoB !== null ? d.saldoB - d.saldoA : null,
          obs,
        };
      }),
    [c, t],
  );

  const rows = useMemo(() => {
    const needle = normalize(query.trim());
    return allRows.filter((r) => {
      if (!statuses.includes(r.status)) return false;
      if (trend !== "all" && r.trend !== trend) return false;
      if (needle) {
        const hay = normalize(
          [r.id, r.label, ...r.docentesA, ...r.docentesB].join(" "),
        );
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [allRows, statuses, trend, query]);

  const columns = useMemo<GridColDef<Row>[]>(
    () => [
      {
        field: "label",
        headerName: t("columns.turma"),
        flex: 1.4,
        minWidth: 200,
        renderCell: ({ row }) => (
          <Box sx={{ py: 0.75, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              noWrap
              title={row.label}
            >
              {row.label}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              component="div"
            >
              {row.id}
            </Typography>
          </Box>
        ),
      },
      {
        field: "status",
        headerName: t("columns.status"),
        width: 130,
        valueFormatter: (v: TurmaStatus) => tStatus(v),
        renderCell: ({ row }) => <StatusChip status={row.status} />,
      },
      {
        field: "docentesA",
        headerName: t("columns.a"),
        flex: 1,
        minWidth: 160,
        sortable: false,
        renderCell: ({ row }) => (
          <DocenteList
            nomes={row.docentesA}
            marked={row.sairam}
            mark="removed"
          />
        ),
      },
      {
        field: "docentesB",
        headerName: t("columns.b"),
        flex: 1,
        minWidth: 160,
        sortable: false,
        renderCell: ({ row }) => (
          <DocenteList
            nomes={row.docentesB}
            marked={row.entraram}
            mark="added"
          />
        ),
      },
      {
        field: "deltaPrio",
        headerName: t("columns.deltaPrio"),
        type: "number",
        width: 130,
        renderCell: ({ row }) => (
          <DeltaChip delta={row.deltaPrio} direction={PRIORITY_DIRECTION} />
        ),
      },
      {
        field: "deltaCarga",
        headerName: t("columns.deltaCarga"),
        description: t("columns.deltaCargaHint"),
        type: "number",
        width: 140,
        renderCell: ({ row }) => (
          <DeltaChip
            delta={row.deltaCarga}
            direction="neutral"
            format="decimal2"
          />
        ),
      },
      {
        field: "deltaSaldo",
        headerName: t("columns.deltaSaldo"),
        description: t("columns.deltaSaldoHint"),
        type: "number",
        width: 120,
        renderCell: ({ row }) => (
          <DeltaChip delta={row.deltaSaldo} direction="neutral" />
        ),
      },
      {
        field: "obs",
        headerName: t("columns.obs"),
        flex: 0.8,
        minWidth: 140,
        sortable: false,
        renderCell: ({ row }) =>
          row.obs.length === 0 ? null : (
            <Tooltip title={row.obs.join(" · ")}>
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{ minWidth: 0 }}
              >
                <WarningAmberIcon
                  fontSize="small"
                  color="warning"
                  aria-hidden
                />
                <Typography variant="caption" noWrap>
                  {row.obs.join(" · ")}
                </Typography>
              </Stack>
            </Tooltip>
          ),
      },
    ],
    [t, tStatus],
  );

  const exportCsv = () => {
    const fmt = (v: number | null) =>
      v === null ? "" : formatNumber(v, locale, 2);
    const content = toCsv([
      [
        t("columns.turma"),
        "id",
        t("columns.status"),
        t("columns.a"),
        t("columns.b"),
        t("csv.entered"),
        t("csv.left"),
        t("columns.deltaPrio"),
        t("columns.deltaCarga"),
        t("columns.deltaSaldo"),
        t("columns.obs"),
      ],
      ...rows.map((r) => [
        r.label,
        r.id,
        tStatus(r.status),
        r.docentesA.join(", "),
        r.docentesB.join(", "),
        r.entraram.join(", "),
        r.sairam.join(", "),
        fmt(r.deltaPrio),
        fmt(r.deltaCarga),
        fmt(r.deltaSaldo),
        r.obs.join(" · "),
      ]),
    ]);
    downloadText(`comparacao_${c.a.id}_${c.b.id}.csv`, content);
  };

  const toggleStatus = (status: TurmaStatus) =>
    onStatusesChange(
      statuses.includes(status)
        ? statuses.filter((s) => s !== status)
        : [...statuses, status],
    );

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 1.5 }}
      >
        <Box
          role="group"
          aria-label={t("statusFilter")}
          sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
        >
          {TURMA_STATUSES.map((status) => {
            const active = statuses.includes(status);
            return (
              <Chip
                key={status}
                clickable
                aria-pressed={active}
                color={active ? "primary" : "default"}
                variant={active ? "filled" : "outlined"}
                onClick={() => toggleStatus(status)}
                label={`${tStatus(status)} (${c.counts[status]})`}
              />
            );
          })}
        </Box>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={trend}
          onChange={(_, v) => v && setTrend(v)}
          aria-label={t("trendFilter")}
        >
          {(["all", "improved", "worsened", "same"] as const).map((v) => (
            <ToggleButton
              key={v}
              value={v}
              sx={{ textTransform: "none", py: 0.25 }}
            >
              {t(`trend.${v}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <TextField
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          aria-label={t("search")}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 220, flex: 1, maxWidth: 360 }}
        />
        <Button
          size="small"
          startIcon={<DownloadIcon />}
          onClick={exportCsv}
          disabled={rows.length === 0}
        >
          {t("exportCsv")}
        </Button>
      </Stack>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        getRowHeight={() => "auto"}
        density="compact"
        disableRowSelectionOnClick
        columnVisibilityModel={visibility}
        onColumnVisibilityModelChange={setVisibility}
        onRowClick={({ row }) => openEntity({ kind: "turma", id: row.id })}
        initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
        pageSizeOptions={[25, 50, 100]}
        localeText={{ noRowsLabel: t("empty") }}
        aria-label={t("tableAria")}
        sx={{
          "& .MuiDataGrid-row": { cursor: "pointer" },
          "& .MuiDataGrid-cell": { alignItems: "center", display: "flex" },
        }}
        autoHeight
      />
    </Box>
  );
}
