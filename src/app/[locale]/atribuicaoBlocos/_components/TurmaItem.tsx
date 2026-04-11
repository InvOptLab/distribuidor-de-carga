import { Horario } from "@/algoritmo/communs/interfaces/interfaces";
import { Box, Typography, Chip, Stack } from "@mui/material";

type Props = {
  nome: string;
  codigo: string;
  turma: number;
  horarios: Horario[];
  destaque: boolean;
  //prioridade: number;
};

export default function TurmaItem({
  nome,
  codigo,
  turma,
  horarios,
  destaque,
}: //prioridade,
Props) {
  return (
    <Box
      sx={{
        width: 220,
        //height: 140,
        p: 1,
        borderRadius: 1,
        boxShadow: 1,
        bgcolor: destaque ? "primary.light" : "grey.100",
        border: `1px solid ${destaque ? "#1976d2" : "#ccc"}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      <Box>
        <Typography
          variant="body2"
          fontWeight="bold"
          noWrap
          title={nome}
          sx={{ lineHeight: 1.2 }}
        >
          {nome}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {codigo} — T{turma}
        </Typography>

        <Stack
          spacing={0.5}
          sx={{
            mt: 1,
            maxHeight: 48,
            overflowY: "auto",
            pr: 0.5,
            "&::-webkit-scrollbar": {
              width: "0.3em",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#ccc",
              borderRadius: "1em",
            },
          }}
        >
          {horarios.length > 0 ? (
            horarios.map((h, idx) => (
              <Chip
                key={idx}
                label={`${h.dia}: ${h.inicio}-${h.fim}`}
                size="small"
                color="info"
              />
            ))
          ) : (
            <Chip label="Sem horário" size="small" color="default" />
          )}
        </Stack>
      </Box>

      {/* <Box display="flex" justifyContent="flex-end">
        <Chip
          label={`P: ${prioridade}`}
          size="small"
          color="secondary"
          sx={{ fontSize: "0.7rem" }}
        />
      </Box> */}
    </Box>
  );
}
