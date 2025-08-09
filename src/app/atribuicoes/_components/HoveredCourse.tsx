import { Disciplina } from "@/context/Global/utils";
import { Paper, Stack, Typography } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

interface HoveredCourseProps {
  disciplina: Disciplina;
  children?: React.ReactNode;
  setHoveredCourese: Dispatch<SetStateAction<Disciplina | null>>;
}

/**
 * Componente desenvolvido para exibir as turmas que forem "selecionadas" no cabeçalho da tabela da tela Timetabling,
 * com intuíto de exibir toadas as informações sem preocupação com o tamanho do componente.
 */
export default function HoveredCourse({
  disciplina,
  children,
  setHoveredCourese,
}: HoveredCourseProps) {
  /**
   * Cria o bloco referente aos horários de um adisicplina
   * @param disciplina Disciplina contendo os horários
   * @returns Componente React com os horários.
   */
  const createHorariosblock = (disciplina: Disciplina): React.ReactNode => {
    const horarios = disciplina.horarios ?? []; // Caso 'horarios' seja null ou undefined, usa um array vazio.

    return (
      <Typography
        align="left"
        variant="body1"
        style={{ fontSize: "18px", whiteSpace: "pre-wrap" }}
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

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        zIndex: 99,
        bottom: "10vh",
        right: "2vw",
        maxWidth: 320,
        borderRadius: 2,
        overflow: "hidden",
      }}
      onMouseLeave={() => setHoveredCourese(null)}
    >
      <Stack
        direction="column"
        spacing={1.5}
        sx={{
          p: 2,
          backgroundColor: "rgba(25, 118, 210, 0.12)",
          alignSelf: { xs: "flex-end", sm: "center" },
        }}
      >
        <Typography
          align="left"
          variant="body1"
          style={{ fontWeight: "bold", paddingTop: "2px", fontSize: "22px" }} // Aplica estilos dinâmicos
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
            fontSize: "20px",
            paddingTop: "2px",
          }} // Estilos dinâmicos
        >
          {disciplina.codigo + " " + disciplina.nome}
        </Typography>
        {createHorariosblock(disciplina)}
        {children}
      </Stack>
    </Paper>
  );
}
