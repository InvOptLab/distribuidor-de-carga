"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Grid2 as Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useGlobalContext } from "@/context/Global";
import { Disciplina } from "@/context/Global/utils";

interface DisciplinaDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  disciplina: Disciplina;
}

export default function DisciplinaDetailsDialog({
  open,
  onClose,
  disciplina,
}: DisciplinaDetailsDialogProps) {
  const { docentes, formularios } = useGlobalContext();

  // Buscar formulários para esta disciplina
  const disciplinaFormularios = formularios.filter(
    (form) => form.id_disciplina === disciplina.id
  );

  // Buscar informações dos docentes
  const docentesComPrioridade = disciplinaFormularios
    .map((form) => {
      const docente = docentes.find((d) => d.nome === form.nome_docente);
      return {
        docente,
        prioridade: form.prioridade,
      };
    })
    .filter((item) => item.docente); // Remove docentes não encontrados

  // CORRIGIDO: Prioridades menores = cores mais positivas
  const getPrioridadeColor = (prioridade: number) => {
    if (prioridade <= 3) return "success"; // Prioridades altas (1-3)
    if (prioridade <= 6) return "warning"; // Prioridades médias (4-6)
    return "error"; // Prioridades baixas (7+)
  };

  const getSaldoColor = (saldo?: number) => {
    if (saldo === undefined) return "text.primary";
    return saldo >= 0 ? "success.main" : "error.main";
  };

  const formatHorarios = (horarios: any[]) => {
    if (!horarios || horarios.length === 0) return "Não definido";
    return horarios.map((h) => `${h.dia} ${h.inicio}-${h.fim}`).join(", ");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "secondary.main" }}>
            <SchoolIcon />
          </Avatar>
          <Box>
            <Typography variant="h6">Detalhes da Disciplina</Typography>
            <Typography variant="body2" color="text.secondary">
              {disciplina.codigo} - {disciplina.nome}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Informações Gerais */}
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <SchoolIcon color="secondary" />
                  Informações Gerais
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Código
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {disciplina.codigo}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        ID
                      </Typography>
                      <Typography variant="body1">{disciplina.id}</Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Nome
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {disciplina.nome}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Nível
                      </Typography>
                      <Chip
                        label={disciplina.nivel}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Prioridade
                      </Typography>
                      <Typography
                        variant="h6"
                        color="primary.main"
                        fontWeight="bold"
                      >
                        {disciplina.prioridade}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={disciplina.ativo ? "Ativo" : "Inativo"}
                        color={disciplina.ativo ? "success" : "error"}
                        size="small"
                      />
                    </Box>
                  </Grid>

                  {disciplina.grupo && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Grupo
                        </Typography>
                        <Typography variant="body1">
                          {disciplina.grupo}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Características
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          flexWrap: "wrap",
                          mt: 0.5,
                        }}
                      >
                        {disciplina.noturna && (
                          <Chip
                            label="Noturna"
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        )}
                        {disciplina.ingles && (
                          <Chip
                            label="Inglês"
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                        {!disciplina.noturna && !disciplina.ingles && (
                          <Typography variant="body2" color="text.secondary">
                            Nenhuma característica especial
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Horários */}
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <AccessTimeIcon color="primary" />
                  Horários
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="body1">
                  {formatHorarios(disciplina.horarios)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Docentes Interessados */}
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <PersonIcon color="primary" />
                  Docentes Interessados ({docentesComPrioridade.length})
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {docentesComPrioridade.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ py: 3 }}
                  >
                    Nenhum docente preencheu formulário para esta disciplina
                  </Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <strong>Nome do Docente</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Saldo</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Prioridade</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Status</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Agrupar</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {docentesComPrioridade
                          .sort((a, b) => a.prioridade - b.prioridade) // CORRIGIDO: Ordenar por prioridade (menor primeiro = maior prioridade)
                          .map((item, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold">
                                  {item.docente!.nome}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {item.docente!.saldo !== undefined ? (
                                  <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    sx={{
                                      color: getSaldoColor(item.docente!.saldo),
                                    }}
                                  >
                                    {item.docente!.saldo}
                                  </Typography>
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    N/A
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={item.prioridade}
                                  color={getPrioridadeColor(item.prioridade)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={
                                    item.docente!.ativo ? "Ativo" : "Inativo"
                                  }
                                  color={
                                    item.docente!.ativo ? "success" : "error"
                                  }
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">
                                  {item.docente!.agrupar || "N/A"}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Estatísticas Resumidas */}
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined" sx={{ bgcolor: "grey.50" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resumo Estatístico
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="secondary.main">
                        {docentesComPrioridade.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total de Interessados
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main">
                        {
                          docentesComPrioridade.filter(
                            (item) => item.prioridade <= 3
                          ).length
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Alta Prioridade (≤3)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="warning.main">
                        {
                          docentesComPrioridade.filter(
                            (item) =>
                              item.prioridade > 3 && item.prioridade <= 6
                          ).length
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Média Prioridade (4-6)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="error.main">
                        {
                          docentesComPrioridade.filter(
                            (item) => item.prioridade > 6
                          ).length
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Baixa Prioridade (&gt;6)
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
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
