import { Docente } from "@/context/Global/utils";
import { Paper, Stack, Typography, Divider, Grid2 } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

interface HoveredCourseProps {
  docente: Docente;
  children?: React.ReactNode;
  setHoveredDocente: Dispatch<SetStateAction<Docente | null>>;
}

export default function HoveredDocente({
  docente,
  children,
  setHoveredDocente,
}: HoveredCourseProps) {
  return (
    <Paper
      elevation={8}
      onMouseLeave={() => setHoveredDocente(null)}
      sx={{
        position: "fixed",
        zIndex: 99,
        bottom: "10vh",
        right: "2vw",
        maxWidth: 320,
        borderRadius: 2,
        overflow: "hidden",
      }}
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
        {/* Nome */}
        <Typography variant="h6" fontWeight="bold">
          {docente.nome}
        </Typography>

        {/* Comentário */}
        {docente.comentario && (
          <Typography variant="body2" color="text.secondary">
            {docente.comentario}
          </Typography>
        )}

        {/* Agrupamento */}
        {docente.agrupar && (
          <Typography variant="body2" color="text.secondary">
            Agrupar: {docente.agrupar}
          </Typography>
        )}

        {/* Saldo */}
        <Typography
          variant="body2"
          color={docente.saldo < 0 ? "error.main" : "success.main"}
        >
          Saldo: {docente.saldo}
        </Typography>

        {/* Divider */}
        {docente.formularios?.size > 0 && <Divider />}

        {/* Formulários */}
        {docente.formularios?.size > 0 && (
          <Grid2 container spacing={1}>
            {[...docente.formularios.entries()].map(([key, value]) => (
              <Grid2
                size={{ xs: 6 }}
                key={key}
                display="flex"
                alignItems="center"
              >
                <Typography variant="body2" color="text.secondary">
                  {key}:
                </Typography>
                <Typography variant="body2">{value}</Typography>
              </Grid2>
            ))}
          </Grid2>
        )}

        {/* Conteúdo extra (botões, ações, etc) */}
        {children}
      </Stack>
    </Paper>
  );
}
