"use client";
import { useRef, useEffect } from "react";
import { Stack, Box, Button, IconButton, Tooltip } from "@mui/material";
import { LayoutGroup } from "framer-motion";
import TurmaRow, { DocenteInfo } from "./TurmaRow";
import {
  KeyboardArrowUp,
  KeyboardArrowDown,
  ArrowBack,
} from "@mui/icons-material";
import { Celula } from "@/algoritmo/communs/interfaces/interfaces";
import { useTranslations } from "next-intl";

export interface TurmaData {
  id: string;
  nome: string;
  codigo: string;
  turma: number;
  horarios: { dia: string; inicio: string; fim: string }[];
  curso: string;
  nivel: string;
  noturna: boolean;
  ingles: boolean;
  carga: number;
  docentesAtribuidos: DocenteInfo[];
  docentesComPrioridade: DocenteInfo[];
}

interface Props {
  turmas: TurmaData[];
  maxCarga: number;
  onDeleteAtribuicao: (nomeDocente: string, idDisciplina: string) => void;
  onAddAtribuicao: (nomeDocente: string, idDisciplina: string) => void;
  onDocenteClick?: (nomeDocente: string) => void;
  onTravar?: (nome_docente: string, id_disciplina: string) => void;
  selectedIndex: number;
  onChangeIndex: (index: number) => void;
  canNavigate: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
  travas?: Celula[];
}

export default function TurmasView({
  turmas,
  maxCarga,
  onDeleteAtribuicao,
  onAddAtribuicao,
  onDocenteClick,
  onTravar,
  selectedIndex,
  onChangeIndex,
  canNavigate,
  onBack,
  showBackButton = false,
  travas = [],
}: Props) {
  const total = turmas.length;
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const t = useTranslations("Pages.AllocationBlocks.TurmasView");

  const scrollToTurma = (id: string) => {
    const element = itemRefs.current.get(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleSelect = (index: number) => {
    if (canNavigate) {
      onChangeIndex(index);
    }
  };

  const next = () => {
    if (canNavigate && total > 0) {
      onChangeIndex((selectedIndex + 1) % total);
    }
  };

  const prev = () => {
    if (canNavigate && total > 0) {
      onChangeIndex((selectedIndex - 1 + total) % total);
    }
  };

  useEffect(() => {
    const turma = turmas[selectedIndex];
    if (turma) {
      scrollToTurma(turma.id);
    }
  }, [selectedIndex, turmas]);

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header com Voltar e Navegação */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        mb={2}
        gap={2}
      >
        {showBackButton && (
          <Tooltip title="Voltar">
            <IconButton
              onClick={onBack}
              sx={{
                bgcolor: "grey.100",
                "&:hover": { bgcolor: "grey.200" },
              }}
            >
              <ArrowBack />
            </IconButton>
          </Tooltip>
        )}
        <Button
          variant="contained"
          onClick={prev}
          disabled={!canNavigate || total === 0}
          startIcon={<KeyboardArrowUp />}
          sx={{ borderRadius: 8, textTransform: "none", px: 4 }}
        >
          {t("previousClass")}
        </Button>
      </Box>

      <Stack
        spacing={2}
        sx={{
          maxHeight: "75vh",
          overflowY: "auto",
          scrollBehavior: "smooth",
          px: 1,
          pb: 10,
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: 4,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c1c1c1",
            borderRadius: 4,
          },
          "&::-webkit-scrollbar-thumb:hover": { background: "#a8a8a8" },
        }}
      >
        <LayoutGroup>
          {turmas.map((turma, i) => {
            const isSelected = i === selectedIndex;
            return (
              <div
                key={turma.id}
                ref={(el) => {
                  if (el) itemRefs.current.set(turma.id, el);
                  else itemRefs.current.delete(turma.id);
                }}
              >
                <TurmaRow
                  {...turma}
                  maxCarga={maxCarga}
                  selecionado={isSelected}
                  onClick={() => handleSelect(i)}
                  onDeleteAtribuicao={onDeleteAtribuicao}
                  onAddAtribuicao={onAddAtribuicao}
                  onDocenteClick={onDocenteClick}
                  onTravar={onTravar}
                  travas={travas}
                  canNavigate={canNavigate}
                />
              </div>
            );
          })}
        </LayoutGroup>
      </Stack>

      <Box display="flex" justifyContent="center" mt={2}>
        <Button
          variant="contained"
          onClick={next}
          disabled={!canNavigate || total === 0}
          endIcon={<KeyboardArrowDown />}
          sx={{ borderRadius: 8, textTransform: "none", px: 4 }}
        >
          {t("nextClass")}
        </Button>
      </Box>
    </Box>
  );
}
