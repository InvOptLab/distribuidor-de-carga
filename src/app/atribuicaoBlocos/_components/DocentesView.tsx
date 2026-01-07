import { useState, useRef, useEffect } from "react";
import { Stack, Box, Button, IconButton, Tooltip } from "@mui/material";
import { LayoutGroup } from "framer-motion";
import DocenteRow from "./DocenteRow";
import { Disciplina } from "@/context/Global/utils";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import { Docente } from "@/algoritmo/communs/interfaces/interfaces";

interface Props {
  docentes: Docente[];
  atribuicoesMap: Map<string, Disciplina[]>;
  naoAtribuidasMap: Map<string, Disciplina[]>;
  cargaDidaticaMap: Map<string, number>;
  maxCarga: number;
  onDeleteAtribuicao: (nome: string, id: string) => void;
  onAddAtribuicao: (nome: string, id: string) => void;
  onHoveredDocente: (nome: string | null) => void;
}

export default function DocentesView({
  docentes,
  atribuicoesMap,
  naoAtribuidasMap,
  cargaDidaticaMap,
  maxCarga,
  onDeleteAtribuicao,
  onAddAtribuicao,
  onHoveredDocente,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const total = docentes.length;

  // Referência para os elementos da lista para permitir scroll automático
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const scrollToDocente = (nome: string) => {
    const element = itemRefs.current.get(nome);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    // O scroll ocorre via useEffect quando selectedIndex muda,
    // ou podemos chamar diretamente aqui se preferir.
  };

  const next = () => {
    setSelectedIndex((prev) => (prev + 1) % total);
  };

  const prev = () => {
    setSelectedIndex((prev) => (prev - 1 + total) % total);
  };

  // Efeito para scrollar sempre que o índice mudar via botões
  useEffect(() => {
    const docente = docentes[selectedIndex];
    if (docente) {
      scrollToDocente(docente.nome);
    }
  }, [selectedIndex, docentes]);

  console.log(maxCarga);

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      {/* Botão Anterior (Sticky ou fixo acima da lista para fácil acesso) */}
      <Box display="flex" justifyContent="center" mb={2}>
        <Button
          variant="contained"
          onClick={prev}
          startIcon={<KeyboardArrowUp />}
          sx={{ borderRadius: 8, textTransform: "none", px: 4 }}
        >
          Docente Anterior
        </Button>
      </Box>

      <Stack
        spacing={2}
        sx={{
          maxHeight: "75vh",
          overflowY: "auto",
          scrollBehavior: "smooth",
          px: 1,
          pb: 10, // Espaço extra no final para não esconder atrás de FABs ou rodapés
          // Custom Scrollbar
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
          {docentes.map((docente, i) => {
            const isSelected = i === selectedIndex;
            return (
              <div
                key={docente.nome}
                ref={(el) => {
                  if (el) itemRefs.current.set(docente.nome, el);
                  else itemRefs.current.delete(docente.nome);
                }}
              >
                <DocenteRow
                  nome={docente.nome}
                  turmas={atribuicoesMap.get(docente.nome) || []}
                  turmasNaoAtribuidas={naoAtribuidasMap.get(docente.nome) || []}
                  cargaDidatica={cargaDidaticaMap.get(docente.nome) || 0}
                  maxCarga={maxCarga}
                  saldo={docente.saldo || 0}
                  selecionado={isSelected}
                  onClick={() => handleSelect(i)}
                  onDeleteAtribuicao={onDeleteAtribuicao}
                  onAddAtribuicao={onAddAtribuicao}
                  onHoveredDocente={onHoveredDocente}
                />
              </div>
            );
          })}
        </LayoutGroup>
      </Stack>

      {/* Botão Próximo (Abaixo da lista) */}
      <Box display="flex" justifyContent="center" mt={2}>
        <Button
          variant="contained"
          onClick={next}
          endIcon={<KeyboardArrowDown />}
          sx={{ borderRadius: 8, textTransform: "none", px: 4 }}
        >
          Próximo Docente
        </Button>
      </Box>
    </Box>
  );
}
