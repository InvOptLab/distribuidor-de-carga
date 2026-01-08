import { useRef, useEffect } from "react";
import { Stack, Box, Button } from "@mui/material";
import { LayoutGroup } from "framer-motion";
import DocenteRow from "./DocenteRow";
import { Disciplina } from "@/context/Global/utils";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";

interface Props {
  docentes: { nome: string; saldo?: number }[];
  atribuicoesMap: Map<string, Disciplina[]>;
  naoAtribuidasMap: Map<string, Disciplina[]>;
  cargaDidaticaMap: Map<string, number>;
  maxCarga: number;
  onDeleteAtribuicao: (nome: string, id: string) => void;
  onAddAtribuicao: (nome: string, id: string) => void;
  onHoveredDocente: (nome: string | null) => void;
  selectedIndex: number;
  onChangeIndex: (index: number) => void;
  canNavigate: boolean; // Controla se os botões funcionam
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
  selectedIndex,
  onChangeIndex,
  canNavigate,
}: Props) {
  const total = docentes.length;
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
    if (canNavigate) {
      onChangeIndex(index);
    }
  };

  const next = () => {
    if (canNavigate) {
      onChangeIndex((selectedIndex + 1) % total);
    }
  };

  const prev = () => {
    if (canNavigate) {
      onChangeIndex((selectedIndex - 1 + total) % total);
    }
  };

  // Sincroniza o scroll sempre que o selectedIndex mudar (seja local ou remoto)
  useEffect(() => {
    const docente = docentes[selectedIndex];
    if (docente) {
      scrollToDocente(docente.nome);
    }
  }, [selectedIndex, docentes]);

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      <Box display="flex" justifyContent="center" mb={2}>
        <Button
          variant="contained"
          onClick={prev}
          disabled={!canNavigate} // Desabilita se não tiver permissão
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
                  saldo={docente.saldo || 0}
                  turmas={atribuicoesMap.get(docente.nome) || []}
                  turmasNaoAtribuidas={naoAtribuidasMap.get(docente.nome) || []}
                  cargaDidatica={cargaDidaticaMap.get(docente.nome) || 0}
                  maxCarga={maxCarga}
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

      <Box display="flex" justifyContent="center" mt={2}>
        <Button
          variant="contained"
          onClick={next}
          disabled={!canNavigate} // Desabilita se não tiver permissão
          endIcon={<KeyboardArrowDown />}
          sx={{ borderRadius: 8, textTransform: "none", px: 4 }}
        >
          Próximo Docente
        </Button>
      </Box>
    </Box>
  );
}
