import { Horario } from "@/algoritmo/communs/interfaces/interfaces";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  alpha,
  Avatar,
  AvatarGroup,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  AddCircleOutline as AddIcon,
  RemoveCircleOutline as RemoveIcon,
  NightsStay as NightIcon,
  School as SchoolIcon, // Para Nível
  Language as LangIcon, // Para Inglês
  HourglassEmpty as CargaIcon,
} from "@mui/icons-material";

type Props = {
  nome: string;
  codigo: string;
  turma: number;
  horarios: Horario[];
  prioridade: number;
  curso: string;
  carga: number;
  nivel: string;
  noturna: boolean;
  ingles: boolean;
  docentesAtribuidos?: string[];

  isAtribuida: boolean;
  hasConflict?: boolean;
  onAction: () => void;
};

export default function TurmaCard({
  nome,
  codigo,
  turma,
  horarios,
  prioridade,
  curso,
  carga,
  nivel,
  noturna,
  ingles,
  docentesAtribuidos = [],
  isAtribuida,
  hasConflict = false,
  onAction,
}: Props) {
  const bgColor = hasConflict
    ? alpha("#d32f2f", 0.05)
    : isAtribuida
    ? alpha("#1976d2", 0.05)
    : "#fff";

  const borderColor = hasConflict
    ? "#d32f2f"
    : isAtribuida
    ? "#1976d2"
    : "#e0e0e0";

  return (
    <Paper
      elevation={isAtribuida ? 2 : 1}
      sx={{
        width: 280, // Aumentei um pouco para caber as infos
        minWidth: 280,
        p: 1.5,
        borderRadius: 2,
        bgcolor: bgColor,
        border: `1px solid ${borderColor}`,
        borderLeftWidth: hasConflict ? 6 : isAtribuida ? 4 : 1,
        transition: "all 0.2s ease-in-out",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
        },
      }}
    >
      {/* Indicador de Conflito */}
      {hasConflict && (
        <Tooltip title="Choque de horário com outra disciplina">
          <Box position="absolute" top={8} right={8} color="error.main">
            <WarningIcon fontSize="small" />
          </Box>
        </Tooltip>
      )}

      <Box>
        {/* Título e Código */}
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          noWrap
          title={nome}
          sx={{ mr: 3, mb: 0.5 }}
        >
          {nome}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight="medium"
          >
            {codigo} — T{turma}
          </Typography>

          {/* Chips de Características */}
          <Stack direction="row" spacing={0.5}>
            {noturna && (
              <Tooltip title="Curso Noturno">
                <NightIcon
                  fontSize="inherit"
                  sx={{ fontSize: 14, color: "indigo" }}
                />
              </Tooltip>
            )}
            {ingles && (
              <Tooltip title="Ministrada em Inglês">
                <LangIcon
                  fontSize="inherit"
                  sx={{ fontSize: 14, color: "teal" }}
                />
              </Tooltip>
            )}
            {nivel && (
              <Tooltip title={nivel}>
                <Chip
                  label={nivel.substring(0, 4)}
                  size="small"
                  variant="filled"
                  sx={{ height: 16, fontSize: "0.6rem", px: 0 }}
                  color={nivel === "g" ? "primary" : "secondary"}
                />
              </Tooltip>
            )}
          </Stack>
        </Stack>

        <Typography
          variant="caption"
          display="block"
          color="text.secondary"
          noWrap
          gutterBottom
        >
          {curso}
        </Typography>

        {/* Informações de Carga e Prioridade */}
        <Stack direction="row" spacing={1} alignItems="center" my={1}>
          <Chip
            icon={<CargaIcon sx={{ fontSize: "0.8rem !important" }} />}
            label={`${carga}h`}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.7rem",
              bgcolor: alpha("#000", 0.05),
            }}
          />
          <Chip
            label={`Prioridade ${prioridade}`}
            size="small"
            color={prioridade > 0 ? "primary" : "default"}
            variant={prioridade > 0 ? "filled" : "outlined"}
            sx={{ height: 20, fontSize: "0.7rem" }}
          />
        </Stack>

        {/* Horários */}
        <Stack spacing={0.5} mt={1}>
          {horarios.length > 0 ? (
            horarios.map((h, i) => (
              <Chip
                key={i}
                icon={<TimeIcon sx={{ fontSize: "0.9rem !important" }} />}
                label={`${h.dia} ${h.inicio}-${h.fim}`}
                size="small"
                sx={{
                  justifyContent: "flex-start",
                  bgcolor: alpha("#000", 0.03),
                  height: 22,
                  fontSize: "0.75rem",
                }}
              />
            ))
          ) : (
            <Typography
              variant="caption"
              color="text.disabled"
              fontStyle="italic"
            >
              Sem horário definido
            </Typography>
          )}
        </Stack>
      </Box>

      {/* Footer: Docentes e Ação */}
      <Box
        mt={2}
        pt={1}
        borderTop="1px dashed #e0e0e0"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        {/* Docentes Atribuídos */}
        <Box display="flex" alignItems="center">
          {docentesAtribuidos.length > 0 ? (
            <AvatarGroup
              max={3}
              sx={{
                "& .MuiAvatar-root": {
                  width: 24,
                  height: 24,
                  fontSize: "0.7rem",
                },
              }}
            >
              {docentesAtribuidos.map((d) => (
                <Tooltip key={d} title={d}>
                  <Avatar alt={d}>{d.charAt(0)}</Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          ) : (
            <Typography variant="caption" color="text.disabled">
              Nenhum docente
            </Typography>
          )}
        </Box>

        <Tooltip
          title={isAtribuida ? "Remover atribuição" : "Atribuir ao docente"}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
            color={isAtribuida ? "error" : "primary"}
            sx={{ bgcolor: alpha(isAtribuida ? "#d32f2f" : "#1976d2", 0.1) }}
          >
            {isAtribuida ? (
              <RemoveIcon fontSize="small" />
            ) : (
              <AddIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
}
