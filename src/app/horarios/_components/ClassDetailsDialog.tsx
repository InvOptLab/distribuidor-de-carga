"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid2 as Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Card,
  CardContent,
  Link,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Language as LanguageIcon,
  NightsStay as NightIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import type { TimetableEntry } from "../page";
import { Docente } from "@/context/Global/utils";

interface ClassDetailsDialogProps {
  entry: TimetableEntry | null;
  open: boolean;
  onClose: () => void;
  docentes: Docente[];
}

export default function ClassDetailsDialog({
  entry,
  open,
  onClose,
  docentes,
}: ClassDetailsDialogProps) {
  if (!entry) return null;

  const {
    disciplina,
    docentes: docentesAtribuidos,
    inicio,
    fim,
    duracao,
    dia,
  } = entry;

  const getDocenteInfo = (nomeDocente: string) => {
    return docentes.find((d) => d.nome === nomeDocente);
  };

  const formatHorario = (inicio: string, fim: string, duracao: number) => {
    return `${inicio} às ${fim} (${duracao} minutos)`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h6" component="div">
            {disciplina.codigo} - {disciplina.nome}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {dia}, {formatHorario(inicio, fim, duracao)}
          </Typography>
        </Box>
        <Button onClick={onClose} size="small" sx={{ minWidth: "auto", p: 1 }}>
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Informações da Disciplina */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <SchoolIcon color="primary" />
                  Informações da Disciplina
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Código
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {disciplina.codigo}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nome Completo
                    </Typography>
                    <Typography variant="body1">{disciplina.nome}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Turma
                    </Typography>
                    <Typography variant="body1">{disciplina.turma}</Typography>
                  </Box>

                  {disciplina.cursos && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Cursos
                      </Typography>
                      <Typography variant="body1">
                        {disciplina.cursos}
                      </Typography>
                    </Box>
                  )}

                  {disciplina.nivel && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Nível
                      </Typography>
                      <Typography variant="body1">
                        {disciplina.nivel}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Características
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      <Chip
                        label={disciplina.ativo ? "Ativo" : "Inativo"}
                        size="small"
                        color={disciplina.ativo ? "success" : "default"}
                        variant="outlined"
                      />
                      {disciplina.noturna && (
                        <Chip
                          label="Noturno"
                          size="small"
                          color="info"
                          variant="outlined"
                          icon={<NightIcon />}
                        />
                      )}
                      {disciplina.ingles && (
                        <Chip
                          label="Inglês"
                          size="small"
                          color="secondary"
                          variant="outlined"
                          icon={<LanguageIcon />}
                        />
                      )}
                      <Chip
                        label={`Prioridade ${disciplina.prioridade}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Horário e Docentes */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Informações de Horário */}
              <Card variant="outlined">
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <ScheduleIcon color="primary" />
                    Horário
                  </Typography>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Dia da Semana:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {dia}
                      </Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Horário:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {inicio} - {fim}
                      </Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Duração:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {duracao} minutos
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Docentes Atribuídos */}
              <Card variant="outlined">
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <PersonIcon color="primary" />
                    Docentes Atribuídos
                    <Chip
                      label={docentesAtribuidos.length}
                      size="small"
                      color="primary"
                    />
                  </Typography>

                  {docentesAtribuidos.length > 0 ? (
                    <List dense>
                      {docentesAtribuidos.map((nomeDocente, index) => {
                        const docenteInfo = getDocenteInfo(nomeDocente);
                        return (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: "primary.main",
                                }}
                              >
                                {nomeDocente.charAt(0).toUpperCase()}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={nomeDocente}
                              secondary={
                                docenteInfo ? (
                                  <Box
                                    sx={{ display: "flex", gap: 0.5, mt: 0.5 }}
                                  >
                                    <Chip
                                      label={
                                        docenteInfo.ativo ? "Ativo" : "Inativo"
                                      }
                                      size="small"
                                      color={
                                        docenteInfo.ativo
                                          ? "success"
                                          : "default"
                                      }
                                      variant="outlined"
                                    />
                                    {docenteInfo.saldo !== undefined && (
                                      <Chip
                                        label={`Saldo: ${docenteInfo.saldo}`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                ) : (
                                  "Informações não disponíveis"
                                )
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 2 }}>
                      <AssignmentIcon
                        sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Nenhum docente atribuído a esta turma
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* Ementa (se disponível) */}
          {disciplina.ementa && (
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Ementa
                  </Typography>
                  <Link variant="body2" color="text.secondary">
                    {disciplina.ementa}
                  </Link>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
