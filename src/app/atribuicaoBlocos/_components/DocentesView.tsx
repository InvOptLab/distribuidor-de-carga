import { useRef, useEffect, useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import DocenteRow from "./DocenteRow";
import { Disciplina } from "@/context/Global/utils";

interface Props {
  docentes: { nome: string }[];
  atribuicoesMap: Map<string, Disciplina[]>;
  naoAtribuidasMap: Map<string, Disciplina[]>;
  onDeleteAtribuicao: (nome: string, id: string) => void;
  onAddAtribuicao: (nome: string, id: string) => void;
  onHoveredDocente: (nome: string | null) => void;
}

export default function DocentesView({
  docentes,
  atribuicoesMap,
  naoAtribuidasMap,
  onDeleteAtribuicao,
  onAddAtribuicao,
  onHoveredDocente,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const total = docentes.length;

  const selectedRef = useRef<HTMLDivElement | null>(null);

  const next = () => setSelectedIndex((prev) => (prev + 1) % total);
  const prev = () => setSelectedIndex((prev) => (prev - 1 + total) % total);

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedIndex]);

  return (
    <Stack spacing={2}>
      {/* Botão Anterior acima da lista, alinhado à esquerda */}
      <Box>
        <Button onClick={prev} variant="outlined">
          Anterior
        </Button>
      </Box>

      {/* Lista de docentes */}
      <Stack
        spacing={1}
        sx={{
          maxHeight: "70vh",
          overflowY: "auto",
          pr: 2,
          scrollbarWidth: "revert-layer",
          "&::-webkit-scrollbar": {
            width: "0.4em",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#555",
          },
        }}
      >
        {docentes.map((docente, i) => {
          const isSelected = i === selectedIndex;
          return (
            <div key={docente.nome} ref={isSelected ? selectedRef : null}>
              <DocenteRow
                nome={docente.nome}
                turmas={atribuicoesMap.get(docente.nome) || []}
                selecionado={isSelected}
                onClick={() => setSelectedIndex(i)}
                onDeleteAtribuicao={onDeleteAtribuicao}
                turmasNaoAtribuidas={naoAtribuidasMap.get(docente.nome) || []}
                onAddAtribuicao={onAddAtribuicao}
                onHoveredDocente={onHoveredDocente}
              />
            </div>
          );
        })}
      </Stack>

      {/* Botão Próximo abaixo da lista, alinhado à esquerda */}
      <Box>
        <Button onClick={next} variant="outlined">
          Próximo
        </Button>
      </Box>
    </Stack>
  );
}
