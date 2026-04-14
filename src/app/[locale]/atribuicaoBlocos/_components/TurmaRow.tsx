"use client";
import {
  Box,
  Typography,
  Stack,
  Avatar,
  Collapse,
  Divider,
  Grid,
  Chip,
  AvatarGroup,
  Tooltip,
} from "@mui/material";
import { motion } from "framer-motion";
import DocenteCard from "./DocenteCard";
import {
  AccessTime as TimeIcon,
  NightsStay as NightIcon,
  Language as LangIcon,
} from "@mui/icons-material";
import { Celula, TipoTrava } from "@/algoritmo/communs/interfaces/interfaces";
import { useTranslations } from "next-intl";

export interface DocenteInfo {
  nome: string;
  saldo: number;
  prioridade: number;
  totalFormularios: number;
  cargaDidaticaAtribuida: number;
}

type Props = {
  id: string;
  nome: string;
  codigo: string;
  turma: number;
  horarios: { dia: string; inicio: string; fim: string }[];
  curso: string;
  nivel: string;
  noturna: boolean;
  ingles: boolean;
  carga: number;
  docentesAtribuidos: DocenteInfo[];
  docentesComPrioridade: DocenteInfo[];
  maxCarga: number;
  selecionado: boolean;
  onClick: () => void;
  onDeleteAtribuicao: (nomeDocente: string, idDisciplina: string) => void;
  onAddAtribuicao: (nomeDocente: string, idDisciplina: string) => void;
  onDocenteClick?: (nomeDocente: string) => void;
  onTravar?: (nome_docente: string, id_disciplina: string) => void;
  travas?: Celula[];
  canNavigate?: boolean;
};

export default function TurmaRow({
  id,
  nome,
  codigo,
  turma,
  horarios,
  curso,
  nivel,
  noturna,
  ingles,
  carga,
  docentesAtribuidos,
  docentesComPrioridade,
  maxCarga,
  selecionado,
  onClick,
  onDeleteAtribuicao,
  onAddAtribuicao,
  onDocenteClick,
  onTravar,
  travas = [],
  canNavigate = true,
}: Props) {
  // Função para verificar se um docente está travado nesta turma
  const isDocenteTravado = (nomeDocente: string): boolean => {
    // Se a combinação docente/disciplina existe no array, está travada.
    return travas.some(
      (c) => c.id_disciplina === id && c.nome_docente === nomeDocente,
    );
  };

  const handleTravar = (nomeDocente: string) => {
    onTravar?.(nomeDocente, id);
  };

  const t = useTranslations("Pages.AllocationBlocks.TurmaRow");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ marginBottom: "16px" }}
    >
      <Box
        onClick={onClick}
        sx={{
          p: 2,
          cursor: "pointer",
          bgcolor: selecionado ? "#fff" : "#f9fafb",
          border: selecionado ? "1px solid #1976d2" : "1px solid #e0e0e0",
          borderRadius: 3,
          boxShadow: selecionado
            ? "0 4px 12px rgba(25, 118, 210, 0.15)"
            : "none",
          transition: "all 0.3s ease",
          "&:hover": {
            bgcolor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          },
        }}
      >
        <Grid container alignItems="center" spacing={2}>
          <Grid>
            <Avatar
              sx={{
                bgcolor: selecionado ? "primary.main" : "grey.400",
                width: 48,
                height: 48,
              }}
            >
              T{turma}
            </Avatar>
          </Grid>

          <Grid sx={{ flex: 1 }}>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Typography
                variant="h6"
                color={selecionado ? "text.primary" : "text.secondary"}
                noWrap
                sx={{ maxWidth: 400 }}
                title={nome}
              >
                {nome}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {codigo} — T{turma}
              </Typography>

              {/* Chips de Características */}
              <Stack direction="row" spacing={0.5} alignItems="center">
                {noturna && (
                  <Tooltip title={t("eveningCourse")}>
                    <NightIcon
                      fontSize="small"
                      sx={{ fontSize: 16, color: "indigo" }}
                    />
                  </Tooltip>
                )}
                {ingles && (
                  <Tooltip title={t("taughtInEnglish")}>
                    <LangIcon
                      fontSize="small"
                      sx={{ fontSize: 16, color: "teal" }}
                    />
                  </Tooltip>
                )}
                <Tooltip
                  title={nivel === "g" ? t("graduate") : t("undergraduate")}
                >
                  <Chip
                    // TODO: ver como ficará a tradução
                    label={nivel === "g" ? "Grad" : "Pós"}
                    size="small"
                    variant="filled"
                    sx={{ height: 20, fontSize: "0.7rem" }}
                    color={nivel === "g" ? "primary" : "secondary"}
                  />
                </Tooltip>
                <Chip
                  label={t("workload", { carga })}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.7rem" }}
                />
              </Stack>
            </Box>

            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Typography variant="caption" color="text.secondary">
                {curso}
              </Typography>
            </Box>

            {/* Horários resumidos */}
            <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
              {horarios.slice(0, 3).map((h, i) => (
                <Chip
                  key={i}
                  icon={<TimeIcon sx={{ fontSize: "0.9rem !important" }} />}
                  label={`${h.dia} ${h.inicio}-${h.fim}`}
                  size="small"
                  sx={{ height: 22, fontSize: "0.75rem" }}
                />
              ))}
              {horarios.length > 3 && (
                <Chip
                  label={`+${horarios.length - 3}`}
                  size="small"
                  sx={{ height: 22, fontSize: "0.75rem" }}
                />
              )}
            </Stack>
          </Grid>

          {/* Docentes Atribuídos (preview) */}
          <Grid>
            {docentesAtribuidos.length > 0 ? (
              <AvatarGroup
                max={3}
                sx={{
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    fontSize: "0.8rem",
                  },
                }}
              >
                {docentesAtribuidos.map((d) => (
                  <Tooltip key={d.nome} title={d.nome}>
                    <Avatar alt={d.nome}>{d.nome.charAt(0)}</Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
            ) : (
              <Chip
                label={t("noProfessor")}
                size="small"
                variant="outlined"
                color="warning"
              />
            )}
          </Grid>
        </Grid>

        <Collapse in={selecionado} timeout="auto" unmountOnExit>
          <Box mt={3}>
            <Divider sx={{ mb: 2 }} />

            <Typography
              variant="subtitle2"
              color="primary"
              gutterBottom
              sx={{
                textTransform: "uppercase",
                letterSpacing: 1,
                fontSize: "0.75rem",
              }}
            >
              {t("assignedProfessors")}
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              overflow="auto"
              pb={2}
              sx={{ minHeight: 180 }}
            >
              {docentesAtribuidos.length > 0 ? (
                docentesAtribuidos.map((docente) => (
                  <DocenteCard
                    key={docente.nome}
                    nome={docente.nome}
                    saldo={docente.saldo}
                    prioridade={docente.prioridade}
                    totalFormularios={docente.totalFormularios}
                    cargaDidaticaAtribuida={docente.cargaDidaticaAtribuida}
                    maxCarga={maxCarga}
                    isAtribuido={true}
                    isTravado={isDocenteTravado(docente.nome)}
                    onAction={() => {
                      if (!isDocenteTravado(docente.nome)) {
                        onDeleteAtribuicao(docente.nome, id);
                      }
                    }}
                    onTravar={() => handleTravar(docente.nome)}
                    onClick={() => onDocenteClick?.(docente.nome)}
                    canNavigate={canNavigate}
                  />
                ))
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  width="100%"
                  bgcolor="grey.50"
                  borderRadius={2}
                  border="1px dashed #ccc"
                  py={4}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t("noProfessorAssigned")}
                  </Typography>
                </Box>
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{
                textTransform: "uppercase",
                letterSpacing: 1,
                fontSize: "0.75rem",
              }}
            >
              {t("professorsWithPriority")}
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              overflow="auto"
              pb={1}
              sx={{ minHeight: 180 }}
            >
              {docentesComPrioridade.length > 0 ? (
                docentesComPrioridade.map((docente) => (
                  <DocenteCard
                    key={docente.nome}
                    nome={docente.nome}
                    saldo={docente.saldo}
                    prioridade={docente.prioridade}
                    totalFormularios={docente.totalFormularios}
                    cargaDidaticaAtribuida={docente.cargaDidaticaAtribuida}
                    maxCarga={maxCarga}
                    isAtribuido={false}
                    isTravado={isDocenteTravado(docente.nome)}
                    onAction={() => onAddAtribuicao(docente.nome, id)}
                    onTravar={() => handleTravar(docente.nome)} // Apenas travar!
                    onClick={() => onDocenteClick?.(docente.nome)}
                    canNavigate={canNavigate}
                  />
                ))
              ) : (
                <Box p={2}>
                  <Typography variant="body2" color="text.secondary">
                    {t("noPriorityIndicated")}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Collapse>
      </Box>
    </motion.div>
  );
}
