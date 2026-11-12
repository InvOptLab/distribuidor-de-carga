"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import {
  Box,
  Chip,
  InputAdornment,
  List,
  ListItemButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslations } from "next-intl";
import { formatCursos } from "@/app/[locale]/atribuicoes/model/text";
import { textoBuscaEspelho } from "@/context/Global/utils";
import type { SolutionDetail } from "../../model/solutionDetail";
import { formatSaldo } from "../../model/format";
import type { EntityRef } from "../../state/useHistoryList";

type Kind = EntityRef["kind"];
type QuickFilter = "conflicts" | "unassigned" | null;

interface Item {
  id: string;
  primary: string;
  secondary?: string;
  saldo?: number;
  count: number;
  conflito: boolean;
  semAtribuicao: boolean;
  search: string;
}

function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase();
}

function SaldoText({ saldo, locale }: { saldo?: number; locale: string }) {
  const color =
    saldo === undefined ? "text.secondary" : saldo < 0 ? "error.main" : "success.main";
  return (
    <Typography
      variant="body2"
      fontFamily="monospace"
      sx={{ color, minWidth: 44, textAlign: "right" }}
    >
      {formatSaldo(saldo, locale)}
    </Typography>
  );
}

/**
 * Lista de docentes OU turmas da solução (substitui as duas árvores, H-B10, H-B11), com busca local,
 * filtros rápidos e navegação por ↑/↓.
 */
export default function EntityList({
  detail,
  kind,
  selectedId,
  locale,
  onKindChange,
  onSelect,
}: {
  detail: SolutionDetail;
  kind: Kind;
  selectedId?: string;
  locale: string;
  onKindChange: (kind: Kind) => void;
  onSelect: (entity: EntityRef) => void;
}) {
  const t = useTranslations("Pages.History.detail");
  const [query, setQuery] = useState("");
  const [quick, setQuick] = useState<QuickFilter>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const items = useMemo<Item[]>(() => {
    if (kind === "docente") {
      return Array.from(detail.docentes.values(), (d) => ({
        id: d.docente.nome,
        primary: d.docente.nome,
        saldo: typeof d.docente.saldo === "number" ? d.docente.saldo : undefined,
        count: d.turmas.length,
        conflito: d.conflitos.size > 0,
        semAtribuicao: d.turmas.length === 0,
        search: normalize(d.docente.nome),
      }));
    }
    return Array.from(detail.turmas.values(), (tt) => {
      const cursos = formatCursos(tt.turma.cursos);
      return {
        id: tt.turma.id,
        primary: `${tt.turma.codigo} · ${tt.turma.nome}`,
        secondary: cursos || undefined,
        count: tt.docentes.length,
        conflito: tt.conflito,
        semAtribuicao: tt.docentes.length === 0,
        // Inclui a turma espelho (pós): buscar por ela encontra a graduação
        search: normalize(
          `${tt.turma.id} ${tt.turma.codigo} ${tt.turma.nome} ${cursos} ${textoBuscaEspelho(tt.turma)}`,
        ),
      };
    });
  }, [detail, kind]);

  const visible = useMemo(() => {
    const needle = normalize(query.trim());
    return items.filter((item) => {
      if (quick === "conflicts" && !item.conflito) return false;
      if (quick === "unassigned" && !item.semAtribuicao) return false;
      return !needle || item.search.includes(needle);
    });
  }, [items, query, quick]);

  // Pivô vindo do inspetor: rolar o item selecionado até ficar visível (4.2)
  useEffect(() => {
    if (!selectedId) return;
    const index = visible.findIndex((i) => i.id === selectedId);
    if (index === -1) {
      // Escondido pela busca/filtro local: limpa para o item aparecer
      if (items.some((i) => i.id === selectedId)) {
        setQuery("");
        setQuick(null);
      }
      return;
    }
    listRef.current
      ?.querySelector<HTMLElement>(`[data-entity-index="${index}"]`)
      ?.scrollIntoView({ block: "nearest" });
    // só quando a seleção ou a aba mudam
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, kind, visible.length]);

  const moveSelection = (delta: number) => {
    if (visible.length === 0) return;
    const index = visible.findIndex((i) => i.id === selectedId);
    const nextIndex =
      index === -1 ? (delta > 0 ? 0 : visible.length - 1) : Math.min(visible.length - 1, Math.max(0, index + delta));
    const next = visible[nextIndex];
    onSelect({ kind, id: next.id });
    const el = listRef.current?.querySelector<HTMLElement>(`[data-entity-index="${nextIndex}"]`);
    el?.focus();
    el?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      moveSelection(event.key === "ArrowDown" ? 1 : -1);
    }
  };

  return (
    <Stack spacing={1} sx={{ minHeight: 0, height: "100%" }}>
      <ToggleButtonGroup
        size="small"
        exclusive
        fullWidth
        value={kind}
        onChange={(_, value: Kind | null) => value && onKindChange(value)}
        aria-label={t("entityKind")}
      >
        <ToggleButton value="docente">{t("tabs.docentes", { count: detail.docentes.size })}</ToggleButton>
        <ToggleButton value="turma">{t("tabs.turmas", { count: detail.turmas.size })}</ToggleButton>
      </ToggleButtonGroup>
      <TextField
        size="small"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={t("filter")}
        inputProps={{ "aria-label": t("filter") }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <Stack direction="row" spacing={0.75}>
        <Chip
          size="small"
          icon={<WarningAmberIcon />}
          label={t("onlyConflicts")}
          color={quick === "conflicts" ? "error" : "default"}
          variant={quick === "conflicts" ? "filled" : "outlined"}
          onClick={() => setQuick(quick === "conflicts" ? null : "conflicts")}
          aria-pressed={quick === "conflicts"}
        />
        <Chip
          size="small"
          label={t("onlyUnassigned")}
          color={quick === "unassigned" ? "primary" : "default"}
          variant={quick === "unassigned" ? "filled" : "outlined"}
          onClick={() => setQuick(quick === "unassigned" ? null : "unassigned")}
          aria-pressed={quick === "unassigned"}
        />
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", border: 1, borderColor: "divider", borderRadius: 1 }}>
        {visible.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            {t("emptyList")}
          </Typography>
        ) : (
          <List dense disablePadding ref={listRef} onKeyDown={onKeyDown} aria-label={t(`tabs.${kind === "docente" ? "docentes" : "turmas"}`, { count: visible.length })}>
            {visible.map((item, index) => (
              <ListItemButton
                key={item.id}
                data-entity-index={index}
                selected={item.id === selectedId}
                onClick={() => onSelect({ kind, id: item.id })}
                sx={{ gap: 1, alignItems: "center" }}
              >
                <Box sx={{ width: 20, display: "flex", color: "error.main" }}>
                  {item.conflito && (
                    <WarningAmberIcon fontSize="small" titleAccess={t("conflict")} />
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap title={item.primary}>
                    {item.primary}
                  </Typography>
                  {item.secondary && (
                    <Typography variant="caption" color="text.secondary" noWrap component="div" title={item.secondary}>
                      {item.secondary}
                    </Typography>
                  )}
                </Box>
                {kind === "docente" && <SaldoText saldo={item.saldo} locale={locale} />}
                <Typography
                  variant="body2"
                  fontFamily="monospace"
                  color="text.secondary"
                  sx={{ minWidth: 24, textAlign: "right" }}
                  title={kind === "docente" ? t("assignmentsCount", { count: item.count }) : t("docentesCount", { count: item.count })}
                >
                  {item.count}
                </Typography>
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
    </Stack>
  );
}
