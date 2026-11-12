"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Popover,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useCompare } from "../state/CompareContext";
import { turmaLabel } from "../model/comparison";

const LIMIT = 50;

/** Aviso de dados diferentes entre as soluções (resolve a comparação errada em silêncio). */
export default function CompatibilityBanner() {
  const t = useTranslations("Pages.Compare.compat");
  const { comparison } = useCompare();
  const { compat, detailA, detailB } = comparison;
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (compat.identical) return null;

  const parts: string[] = [];
  if (compat.turmasSoA.length)
    parts.push(t("turmasSoA", { count: compat.turmasSoA.length }));
  if (compat.turmasSoB.length)
    parts.push(t("turmasSoB", { count: compat.turmasSoB.length }));
  if (compat.docentesSoA.length)
    parts.push(t("docentesSoA", { count: compat.docentesSoA.length }));
  if (compat.docentesSoB.length)
    parts.push(t("docentesSoB", { count: compat.docentesSoB.length }));
  if (compat.formulariosDiferentes.length)
    parts.push(t("forms", { count: compat.formulariosDiferentes.length }));
  if (compat.maxPriorityA !== compat.maxPriorityB)
    parts.push(
      t("maxPriority", { a: compat.maxPriorityA, b: compat.maxPriorityB }),
    );

  const turma = (id: string, side: "a" | "b") => {
    const tt = (side === "a" ? detailA : detailB).turmas.get(id)?.turma;
    return tt ? turmaLabel(tt) : id;
  };

  const section = (title: string, items: string[]) =>
    items.length === 0 ? null : (
      <li key={title}>
        <ul style={{ padding: 0 }}>
          <ListSubheader sx={{ lineHeight: "32px" }}>
            {title} ({items.length})
          </ListSubheader>
          {items.slice(0, LIMIT).map((item) => (
            <ListItem key={item} dense sx={{ py: 0 }}>
              <ListItemText
                primary={item}
                slotProps={{ primary: { variant: "body2" } }}
              />
            </ListItem>
          ))}
          {items.length > LIMIT && (
            <ListItem dense>
              <ListItemText
                secondary={t("more", { count: items.length - LIMIT })}
              />
            </ListItem>
          )}
        </ul>
      </li>
    );

  return (
    <Alert
      severity="warning"
      sx={{ mb: 2 }}
      action={
        <Button
          color="inherit"
          size="small"
          onClick={(e) => setAnchor(e.currentTarget)}
        >
          {t("details")}
        </Button>
      }
    >
      {t("body", { parts: parts.join(", ") })}
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ width: 420, maxHeight: 480, overflow: "auto" }}>
          <List dense subheader={<li />} aria-label={t("details")}>
            {section(
              t("lists.turmasSoA"),
              compat.turmasSoA.map((id) => turma(id, "a")),
            )}
            {section(
              t("lists.turmasSoB"),
              compat.turmasSoB.map((id) => turma(id, "b")),
            )}
            {section(t("lists.docentesSoA"), compat.docentesSoA)}
            {section(t("lists.docentesSoB"), compat.docentesSoB)}
            {section(
              t("lists.forms"),
              compat.formulariosDiferentes.map(
                (f) =>
                  `${f.docente} · ${turma(f.turma, "b")}: ${f.a ?? "—"} → ${f.b ?? "—"}`,
              ),
            )}
          </List>
        </Box>
      </Popover>
    </Alert>
  );
}
