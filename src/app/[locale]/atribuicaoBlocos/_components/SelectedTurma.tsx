"use client";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  Link,
} from "@mui/material";
import { useTranslations } from "next-intl";

interface SelectedTurmaProps {
  id: string;
  nome: string;
  turma: number;
  horarios: { dia: string; inicio: string; fim: string }[];
  curso: string;
  ementa: string;
  nivel: string;
  onRemove?: (id: string) => void;
  onAdd?: (id: string) => void;
  //horariosConflito: Set<string>;
  noturna: boolean;
  codigo: string;
  grupo?: string;
  // carga: number;
  prioridade: number;
  atribuida: boolean;
  docentes?: string[];
}

const SelectedTurma = ({
  id,
  nome,
  turma,
  horarios,
  curso,
  ementa,
  nivel,
  onRemove,
  onAdd,
  //horariosConflito,
  noturna,
  codigo,
  grupo,
  // carga,
  prioridade,
  atribuida,
  docentes,
}: SelectedTurmaProps) => {
  const handleRemove = () => {
    onRemove(id);
  };

  const handleAdd = () => {
    onAdd(id);
  };

  const t = useTranslations("Pages.AllocationBlocks.SelectedTurma");

  return (
    <Card
      sx={{
        mb: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignContent: "space-around",
        // height: "100%",
        width: "21em",
      }}
      elevation={3}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignContent: "space-around",
          height: "100%",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          flexDirection="row"
          flexWrap="wrap"
        >
          <Typography variant="body1" fontWeight="bold">
            {codigo}
          </Typography>
          {/* <Typography variant="body1" fontWeight="bold">
            Carga:{" "}
            {carga.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </Typography> */}
          {/* <TextField
            id="show-prioridade"
            label="Prioridade"
            variant="outlined"
            value={1}
            
            sx={{ width: "30%", textAlign: "center", justifyContent: "center" }}
          /> */}
          <Typography variant="body1" fontWeight="bold">
            {t("priority")}: {prioridade}
          </Typography>
        </Box>

        <Typography variant="h6">{nome}</Typography>
        <Typography variant="h6">({t("class")} {turma})</Typography>
        <Typography variant="body2" color="text.secondary">
          {t("course")}: {curso}
        </Typography>

        <Box mt={1}>
          <Typography variant="subtitle2">{t("schedules")}:</Typography>
          <Stack spacing={0.5}>
            {horarios.map((horario, idx) => (
              <Chip
                key={idx}
                label={`${horario.dia}: ${horario.inicio} - ${horario.fim}`}
                size="small"
                color={"info"}
              />
            ))}
            {horarios.length === 0 && (
              <Chip
                key={id}
                label={`${t("toBeDefined")}.`}
                size="small"
                color="default"
              />
            )}
          </Stack>
        </Box>

        <Box mt={1}>
          <Typography variant="body2">
            {t("syllabus")}{" "}
            <Link href={ementa} target="_blank" rel="noopener">
              {t("view")}
            </Link>
          </Typography>
        </Box>

        <Box
          mt={1}
          display="flex"
          justifyContent="space-evenly"
          flexDirection="row"
          flexWrap="wrap"
        >
          {noturna && (
            <Chip
              label={t("evening")}
              sx={{ backgroundColor: "#131862", color: "#ffffff" }}
              size="small"
            />
          )}
          {nivel === "g" ? (
            <Chip label={t("undergraduate")} color="primary" size="small" />
          ) : (
            <Chip label={t("postgraduate")} color="secondary" size="small" />
          )}

          {grupo && (
            <Chip
              label={grupo}
              sx={{ backgroundColor: "#853C00", color: "#ffffff" }}
              size="small"
            />
          )}
        </Box>

        {atribuida && (
          <Box
            mt={2}
            display="flex"
            alignItems="center"
            justifyContent="end"
            gap={2}
          >
            <Button variant="contained" onClick={handleRemove} color="error">
              {t("remove")}
            </Button>
          </Box>
        )}
        {!atribuida && (
          <Box mt={2}>
            <Typography variant="subtitle2" color="textPrimary" gutterBottom>
              {t("currentProfessor")}:
            </Typography>
            <Box
              display="flex"
              alignItems="center"
              flexWrap="wrap"
              gap={1}
              pl={1}
            >
              {docentes.map((docente) => (
                <Typography
                  key={"docente_atual" + id + "_" + docente}
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {docente}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {!atribuida && (
          <Box
            mt={2}
            display="flex"
            alignItems="center"
            justifyContent="start"
            gap={2}
          >
            <Button variant="contained" onClick={handleAdd} color="info">
              {t("add")}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SelectedTurma;
