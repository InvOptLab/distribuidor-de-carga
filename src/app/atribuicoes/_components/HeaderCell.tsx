import React, { useState } from "react";
import { Typography, Stack, styled } from "@mui/material";
import { Disciplina } from "@/context/Global/utils";

interface HeaderCellProps {
  disciplina: Disciplina;
  setHeaderCollor: (id_disciplina: string) => string;
  setParentHoveredCourse?: React.Dispatch<
    React.SetStateAction<Disciplina | null>
  >;
}

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

  // Funções de hover
  const handleMouseEnter = (id: string) => {
    if (hoverEnabled) {
      setHoveredCellId(id);
    }
    setParentHoveredCourse?.(disciplina); // Se `setParentHoveredCourse` estiver definido, executa
  };

  const handleMouseLeave = () => {
    if (hoverEnabled) {
      setHoveredCellId(null);
    }
    // NÃO chamamos setParentHoveredCourse?.(null) aqui.
    // O onMouseLeave do <TableCell> no TimetableGrid vai cuidar disso. (30/10/2025)
    // setParentHoveredCourse?.(null); // Reseta o estado no componente pai, se aplicável
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
        Horário:
        {horarios.length > 0 ? (
          horarios.map((horario, index) =>
            horario ? (
              <span key={`${disciplina.nome}-${index}`}>
                <br />
                &emsp;{horario.dia} {horario.inicio}/{horario.fim}
              </span>
            ) : null
          )
        ) : (
          <span>
            <br />
            &emsp;A definir
          </span>
        )}
      </Typography>
    );
  };

  // Estilo condicional com base no hover e ID da disciplina
  const getTypographyStyle = (id: string) => ({
    whiteSpace: "nowrap", // Quebra a linha apenas no hover
    overflow: "hidden", // Mostra o texto completo no hover
    textOverflow: "ellipsis", // Elipses se o texto for muito longo
    fontSize: hoveredCellId === id ? "14px" : "12px", // Aumenta a fonte no hover
    transition: "all 0.3s ease", // Transição suave
    paddingTop: "2px", // Padding adicional no hover
  });

  // StyledStack com hover opcional
  const StyledStack = styled(Stack)<{ id: string }>(({ id }) => ({
    position: "relative",
    zIndex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: "12rem",
    maxWidth: "12rem",
    height: "8rem",
    backgroundColor: setHeaderCollor(id),
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

  return (
    <StyledStack
      id={disciplina.id}
      spacing={1}
      className="stack-style"
      onMouseEnter={() => handleMouseEnter(disciplina.id)} // Ativa o hover
      onMouseLeave={handleMouseLeave} // Desativa o hover
    >
      <Typography
        align="left"
        variant="body1"
        style={{ fontWeight: "bold", ...getTypographyStyle(disciplina.id) }}
        dangerouslySetInnerHTML={{
          __html: disciplina.cursos
            .replace(/^[^;]*;/, "")
            .replace(/<br\s*\/?>/gi, "")
            .replace(/&emsp;/gi, " "),
        }}
      />

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
