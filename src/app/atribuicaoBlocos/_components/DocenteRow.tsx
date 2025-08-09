import { Box, Typography, Stack } from "@mui/material";
import { motion } from "framer-motion";
import TurmaItem from "./TurmaItem";
import SelectedTurma from "./SelectedTurma";
import { Disciplina } from "@/context/Global/utils";

type Props = {
  nome: string;
  turmas: Disciplina[];
  selecionado: boolean;
  onClick: () => void;
  onDeleteAtribuicao: (nome_docente: string, id_disciplina: string) => void;
  turmasNaoAtribuidas: Disciplina[];
  onAddAtribuicao: (nome_docente: string, id_disciplina: string) => void;
  onHoveredDocente: (nome: string | null) => void;
};

export default function DocenteRow({
  nome,
  turmas,
  selecionado,
  onClick,
  onDeleteAtribuicao,
  turmasNaoAtribuidas,
  onAddAtribuicao,
  onHoveredDocente,
}: Props) {
  return (
    <motion.div
      layout="size"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
      style={{
        padding: "8px",
        cursor: "pointer",
        backgroundColor: selecionado ? "#e3f2fd" : "transparent",
        borderLeft: selecionado
          ? "4px solid #1976d2"
          : "4px solid rgba(0, 0, 0, 0.5)",
        borderBottom: selecionado
          ? "1px solid #1976d2"
          : "1px solid rgba(0, 0, 0, 0.5)",
        borderRadius: "4px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "nowrap",
      }}
    >
      <Box
        mb={1}
        onMouseEnter={() => onHoveredDocente(nome)}
        onMouseLeave={() => onHoveredDocente(null)}
      >
        <Typography
          variant="body1"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          width="11rem"
        >
          {nome}
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" alignItems="flex-start">
        {/* Turmas atribuídas */}
        <Stack direction="row" spacing={1} overflow="auto" pb={1}>
          {turmas.map((turma) =>
            selecionado ? (
              <SelectedTurma
                key={turma.id + "_atribuida"}
                nome={turma.nome}
                codigo={turma.codigo}
                turma={Number(turma.turma)}
                horarios={turma.horarios}
                curso={turma.cursos}
                ementa="www.google.com"
                id={turma.id}
                nivel={turma.nivel}
                noturna={turma.noturna}
                onRemove={() => onDeleteAtribuicao(nome, turma.id)}
                grupo="SME"
                prioridade={turma.prioridade}
                atribuida={true}
              />
            ) : (
              <TurmaItem
                key={turma.id + "_naoselecionado"}
                nome={turma.nome}
                codigo={turma.codigo}
                turma={turma.turma}
                horarios={turma.horarios}
                destaque={false}
              />
            )
          )}
        </Stack>

        {/* Turmas não atribuídas (somente se selecionado) */}
        {selecionado && (
          <Stack direction="row" spacing={1} overflow="auto" pt={1}>
            {turmasNaoAtribuidas.map((turma) => (
              <SelectedTurma
                key={turma.id + "_naoatribuida" + turma.cursos}
                nome={turma.nome}
                codigo={turma.codigo}
                turma={Number(turma.turma)}
                horarios={turma.horarios}
                curso={turma.cursos}
                ementa="www.google.com"
                id={turma.id}
                nivel={turma.nivel}
                noturna={turma.noturna}
                onAdd={() => onAddAtribuicao(nome, turma.id)}
                grupo="SME"
                prioridade={turma.prioridade}
                atribuida={false}
                docentes={turma.docentes}
              />
            ))}
          </Stack>
        )}
      </Box>
    </motion.div>
  );
}
