"use client";

import { useMemo, useState } from "react";
import {
  Box,
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
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  DataGrid,
  type GridColDef,
  type GridSortModel,
} from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import { formatSaldo } from "@/app/[locale]/history/model/format";
import { PRIORITY_DIRECTION } from "@/app/[locale]/history/model/solutionSummary";
import type { DocenteDiff } from "../../model/comparison";
import { roundCarga, workloadBand } from "../../model/distributions";
import { formatMetric, formatNumber } from "../../model/metrics";
import {
  useCompare,
  type DocenteFilter,
  type WorkloadFilter,
} from "../../state/CompareContext";
import { DeltaChip, EntityLink } from "../shared";

const FILTERS: DocenteFilter[] = [
  "affected",
  "all",
  "lostAll",
  "unassigned",
  "conflict",
  "gainedConflict",
  "resolvedConflict",
];

export function matchesDocenteFilter(
  d: DocenteDiff,
  filter: DocenteFilter,
): boolean {
  switch (filter) {
    case "affected":
      return d.afetado;
    case "lostAll":
      return d.turmasA.length > 0 && d.turmasB.length === 0;
    case "unassigned":
      return d.turmasA.length === 0 || d.turmasB.length === 0;
    case "conflict":
      return d.conflitoA || d.conflitoB;
    case "gainedConflict":
      return !d.conflitoA && d.conflitoB;
    case "resolvedConflict":
      return d.conflitoA && !d.conflitoB;
    default:
      return true;
  }
}

export function matchesWorkload(d: DocenteDiff, w: WorkloadFilter): boolean {
  const cargas =
    w.side === "a"
      ? [d.cargaA]
      : w.side === "b"
        ? [d.cargaB]
        : [d.cargaA, d.cargaB];
  // Só docentes ativos do lado filtrado contam no histograma
  if (w.side === "a" && !d.inA) return false;
  if (w.side === "b" && !d.inB) return false;
  if (w.carga !== undefined)
    return cargas.some((c) => roundCarga(c) === w.carga);
  if (w.band !== undefined)
    return cargas.some((c) => workloadBand(c) === w.band);
  return true;
}

function TurmaChips({
  ids,
  mark,
}: {
  ids: string[];
  mark: "added" | "removed";
}) {
  const { comparison } = useCompare();
  if (ids.length === 0)
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      columnGap={1}
      rowGap={0.25}
      sx={{ py: 0.5 }}
    >
      {ids.map((id) => {
        const t =
          comparison.turmaIndex.get(id)?.turma ??
          comparison.detailB.turmas.get(id)?.turma ??
          comparison.detailA.turmas.get(id)?.turma;
        return (
          <EntityLink key={id} kind="turma" id={id} mark={mark}>
            {t?.codigo ?? id}
          </EntityLink>
        );
      })}
    </Stack>
  );
}

/** Aba Docentes: quem ganhou ou perdeu turmas e o Δ de carga individual. */
export default function DocentesTab({
  filter,
  onFilterChange,
  workload,
  onWorkloadChange,
}: {
  filter: DocenteFilter;
  onFilterChange: (f: DocenteFilter) => void;
  workload: WorkloadFilter | null;
  onWorkloadChange: (w: WorkloadFilter | null) => void;
}) {
  const t = useTranslations("Pages.Compare.docentes");
  const tCharts = useTranslations("Pages.Compare.charts");
  const { comparison: c, openEntity, locale } = useCompare();
  const [query, setQuery] = useState("");
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "deltaCarga", sort: "desc" },
  ]);

  const rows = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return c.docentes.filter((d) => {
      if (!matchesDocenteFilter(d, filter)) return false;
      if (workload && !matchesWorkload(d, workload)) return false;
      if (needle && !d.nome.toLocaleLowerCase().includes(needle)) return false;
      return true;
    });
  }, [c, filter, workload, query]);

  const counts = useMemo(() => {
    const out = {} as Record<DocenteFilter, number>;
    for (const f of FILTERS)
      out[f] = c.docentes.filter((d) => matchesDocenteFilter(d, f)).length;
    return out;
  }, [c]);

  const carga = (v: number) => formatNumber(v, locale, v % 1 === 0 ? 0 : 2);

  const columns = useMemo<GridColDef<DocenteDiff>[]>(
    () => [
      {
        field: "nome",
        headerName: t("columns.docente"),
        flex: 1.2,
        minWidth: 180,
        renderCell: ({ row }) => (
          <Typography variant="body2" fontWeight={600} noWrap title={row.nome}>
            {row.nome}
          </Typography>
        ),
      },
      {
        field: "saldoB",
        headerName: t("columns.saldo"),
        width: 120,
        sortComparator: (x?: number, y?: number) =>
          (x ?? -Infinity) - (y ?? -Infinity),
        renderCell: ({ row }) =>
          row.saldoA !== row.saldoB && row.inA && row.inB ? (
            <Tooltip title={t("saldoDiffers")}>
              <Typography variant="body2" color="warning.main">
                {formatSaldo(row.saldoA, locale)} →{" "}
                {formatSaldo(row.saldoB, locale)}
              </Typography>
            </Tooltip>
          ) : (
            <Typography variant="body2">
              {formatSaldo(row.saldoB ?? row.saldoA, locale)}
            </Typography>
          ),
      },
      {
        field: "cargaA",
        headerName: t("columns.cargaA"),
        type: "number",
        width: 90,
        valueFormatter: (v: number) => carga(v),
      },
      {
        field: "cargaB",
        headerName: t("columns.cargaB"),
        type: "number",
        width: 90,
        valueFormatter: (v: number) => carga(v),
      },
      {
        field: "deltaCarga",
        headerName: "Δ",
        description: t("columns.deltaHint"),
        type: "number",
        width: 100,
        // Ordena por |Δ| (5.5)
        sortComparator: (x: number, y: number) => Math.abs(x) - Math.abs(y),
        renderCell: ({ row }) => (
          <DeltaChip
            delta={row.deltaCarga}
            direction="neutral"
            format="decimal2"
          />
        ),
      },
      {
        field: "ganhou",
        headerName: t("columns.ganhou"),
        flex: 1,
        minWidth: 140,
        sortable: false,
        renderCell: ({ row }) => <TurmaChips ids={row.ganhou} mark="added" />,
      },
      {
        field: "perdeu",
        headerName: t("columns.perdeu"),
        flex: 1,
        minWidth: 140,
        sortable: false,
        renderCell: ({ row }) => <TurmaChips ids={row.perdeu} mark="removed" />,
      },
      {
        field: "prioMediaB",
        headerName: t("columns.prio"),
        width: 170,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Typography variant="body2">
              {formatMetric("decimal1", row.prioMediaA ?? undefined, locale)} →{" "}
              {formatMetric("decimal1", row.prioMediaB ?? undefined, locale)}
            </Typography>
            {row.prioMediaA !== null && row.prioMediaB !== null && (
              <DeltaChip
                delta={row.prioMediaB - row.prioMediaA}
                direction={PRIORITY_DIRECTION}
              />
            )}
          </Stack>
        ),
      },
      {
        field: "conflitoB",
        headerName: "⚠",
        description: t("columns.conflictHint"),
        width: 70,
        sortable: false,
        renderCell: ({ row }) =>
          !row.conflitoA && row.conflitoB ? (
            <Tooltip title={t("filters.gainedConflict")}>
              <WarningAmberIcon
                color="error"
                fontSize="small"
                aria-label={t("filters.gainedConflict")}
              />
            </Tooltip>
          ) : row.conflitoA && !row.conflitoB ? (
            <Tooltip title={t("filters.resolvedConflict")}>
              <CheckCircleOutlineIcon
                color="success"
                fontSize="small"
                aria-label={t("filters.resolvedConflict")}
              />
            </Tooltip>
          ) : row.conflitoA && row.conflitoB ? (
            <Tooltip title={t("bothConflict")}>
              <WarningAmberIcon
                color="warning"
                fontSize="small"
                aria-label={t("bothConflict")}
              />
            </Tooltip>
          ) : null,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, locale],
  );

  const workloadLabel = workload
    ? [
        workload.side ? workload.side.toUpperCase() : null,
        workload.carga !== undefined
          ? tCharts("cargaEquals", { carga: carga(workload.carga) })
          : workload.band !== undefined
            ? tCharts("bandFilter", { band: workload.band + 1 })
            : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

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
        <ToggleButtonGroup
          size="small"
          exclusive
          value={filter}
          onChange={(_, v: DocenteFilter | null) => v && onFilterChange(v)}
          aria-label={t("filterAria")}
          sx={{ flexWrap: "wrap" }}
        >
          {FILTERS.map((f) => (
            <ToggleButton
              key={f}
              value={f}
              sx={{ textTransform: "none", py: 0.25 }}
            >
              {t(`filters.${f}`)} ({counts[f]})
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {workloadLabel && (
          <Chip
            color="primary"
            label={t("workloadFilter", { label: workloadLabel })}
            onDelete={() => onWorkloadChange(null)}
          />
        )}
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
          sx={{ minWidth: 200, flex: 1, maxWidth: 320 }}
        />
      </Stack>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(r) => r.nome}
        getRowHeight={() => "auto"}
        density="compact"
        disableRowSelectionOnClick
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        onRowClick={({ row }) => openEntity({ kind: "docente", id: row.nome })}
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
