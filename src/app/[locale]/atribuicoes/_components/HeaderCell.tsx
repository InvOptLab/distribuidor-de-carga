import React, { useState } from "react";
import { Typography, Stack, styled } from "@mui/material";
import { Disciplina } from "@/context/Global/utils";
import { useTranslations } from "next-intl";
import { formatCursos } from "../model/text";

interface HeaderCellProps {
  disciplina: Disciplina;
  setHeaderCollor: (id_disciplina: string) => string;
  setParentHoveredCourse?: React.Dispatch<
    React.SetStateAction<Disciplina | null>
  >;
}

// Definido fora do render para não recriar o componente nem o CSS a cada render (P5)
const StyledStack = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "bg" && prop !== "hoverEnabled",
})<{ bg: string; hoverEnabled: boolean }>(({ bg, hoverEnabled }) => ({
  position: "relative",
  zIndex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: "12rem",
  maxWidth: "12rem",
  height: "8rem",
  backgroundColor: bg,
  transition: "max-width 0.3s ease, height 0.3s ease",
  padding: 0,
  margin: 0,

  ...(hoverEnabled && {
    "&:hover": {
      overflow: "visible",
      whiteSpace: "normal",
      maxWidth: "50rem", // Expande a largura no hover
    },
  }),
}));

/**
 * Componente para cada disciplina no cabeçalho da tabela.
 * O comportamento de hover é controlado pela presença de `setParentHoveredCourse`.
 */
const HeaderCell: React.FC<HeaderCellProps> = ({
  disciplina,
  setHeaderCollor,
  setParentHoveredCourse,
}) => {
  // Estado de hover, usado apenas se `setParentHoveredCourse` não for enviado
  const [hoveredCellId, setHoveredCellId] = useState<string | null>(null);

  // Verifica se o hover está habilitado
  const hoverEnabled = !setParentHoveredCourse;

  const t = useTranslations("Pages.Assignment.HeaderCell");

  const handleMouseEnter = (id: string) => {
    if (hoverEnabled) {
      setHoveredCellId(id);
    }
    setParentHoveredCourse?.(disciplina);
  };

  const handleMouseLeave = () => {
    if (hoverEnabled) {
      setHoveredCellId(null);
    }
    // O fechamento do card é responsabilidade do componente pai. (30/10/2025)
  };

  // Criação do bloco de horários da disciplina
  const createHorariosblock = (disciplina: Disciplina) => {
    const horarios = disciplina.horarios ?? []; // Usa um array vazio se `horarios` for nulo ou indefinido
    return (
      <Typography
        align="left"
        variant="body1"
        style={{
          fontSize: "small",
          whiteSpace: "pre-wrap",
          maxHeight: "6em",
          overflowY: "auto",
        }}
      >
        {t("schedule")}
        {horarios.length > 0 ? (
          horarios.map((horario, index) =>
            horario ? (
              <span key={`${disciplina.nome}-${index}`}>
                <br />
                &emsp;{horario.dia} {horario.inicio}/{horario.fim}
              </span>
            ) : null,
          )
        ) : (
          <span>
            <br />
            &emsp;{t("toBeDefined")}
          </span>
        )}
      </Typography>
    );
  };

  // Estilo condicional com base no hover e ID da disciplina
  const getTypographyStyle = (id: string) => ({
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: hoveredCellId === id ? "14px" : "12px", // Aumenta a fonte no hover
    transition: "all 0.3s ease",
    paddingTop: "2px",
  });

  return (
    <StyledStack
      id={disciplina.id}
      bg={setHeaderCollor(disciplina.id)}
      hoverEnabled={hoverEnabled}
      spacing={1}
      className="stack-style"
      onMouseEnter={() => handleMouseEnter(disciplina.id)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Texto puro: `cursos` pode vir de arquivo importado ou de outro participante da sala (D2) */}
      <Typography
        align="left"
        variant="body1"
        style={{ fontWeight: "bold", ...getTypographyStyle(disciplina.id) }}
      >
        {formatCursos(disciplina.cursos)}
      </Typography>

      <Typography
        align="left"
        variant="body1"
        style={{
          fontWeight: "bold",
          fontSize: "13px",
          ...getTypographyStyle(disciplina.id),
        }}
      >
        {disciplina.codigo + " " + disciplina.nome}
      </Typography>

      {createHorariosblock(disciplina)}
    </StyledStack>
  );
};

export default HeaderCell;
