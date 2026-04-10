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
  Grid as Grid,
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
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import { useGlobalContext } from "@/context/Global";
import { Docente } from "@/context/Global/utils";

interface DocenteDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  docente: Docente;
}

export default function DocenteDetailsDialog({
  open,
  onClose,
  docente,
}: DocenteDetailsDialogProps) {
  const { disciplinas, formularios } = useGlobalContext();

  // Buscar formulários do docente
  const docenteFormularios = formularios.filter(
    (form) => form.nome_docente === docente.nome
  );

  // Buscar informações das disciplinas
  const disciplinasComPrioridade = docenteFormularios
    .map((form) => {
      const disciplina = disciplinas.find((d) => d.id === form.id_disciplina);
      return {
        disciplina,
        prioridade: form.prioridade,
      };
    })
    .filter((item) => item.disciplina); // Remove disciplinas não encontradas

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h6">Detalhes do Docente</Typography>
            <Typography variant="body2" color="text.secondary">
              {docente.nome}
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
                  <PersonIcon color="primary" />
                  Informações Gerais
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Nome
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {docente.nome}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={docente.ativo ? "Ativo" : "Inativo"}
                        color={docente.ativo ? "success" : "error"}
                        size="small"
                      />
                    </Box>
                  </Grid>

                  {docente.saldo !== undefined && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Saldo
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            color: getSaldoColor(docente.saldo),
                            fontWeight: "bold",
                          }}
                        >
                          {docente.saldo}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Agrupar
                      </Typography>
                      <Typography variant="body1">
                        {docente.agrupar || "Não especificado"}
                      </Typography>
                    </Box>
                  </Grid>

                  {docente.comentario && (
                    <Grid size={{ xs: 12 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Comentário
                        </Typography>
                        <Typography variant="body1">
                          {docente.comentario}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Disciplinas com Formulário */}
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <SchoolIcon color="primary" />
                  Disciplinas com Formulário ({disciplinasComPrioridade.length})
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {disciplinasComPrioridade.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ py: 3 }}
                  >
                    Nenhuma disciplina com formulário preenchido
                  </Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <strong>Código</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Nome da Disciplina</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Nível</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Prioridade</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Características</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {disciplinasComPrioridade
                          .sort((a, b) => a.prioridade - b.prioridade) // CORRIGIDO: Ordenar por prioridade (menor primeiro = maior prioridade)
                          .map((item, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold">
                                  {item.disciplina!.codigo}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {item.disciplina!.nome}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={item.disciplina!.nivel}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={item.prioridade}
                                  color={getPrioridadeColor(item.prioridade)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 0.5,
                                    justifyContent: "center",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {item.disciplina!.noturna && (
                                    <Chip
                                      label="Noturna"
                                      size="small"
                                      color="info"
                                      variant="outlined"
                                    />
                                  )}
                                  {item.disciplina!.ingles && (
                                    <Chip
                                      label="Inglês"
                                      size="small"
                                      color="secondary"
                                      variant="outlined"
                                    />
                                  )}
                                  {item.disciplina!.grupo && (
                                    <Chip
                                      label={item.disciplina!.grupo}
                                      size="small"
                                      color="default"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
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
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary.main">
                        {disciplinasComPrioridade.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total de Disciplinas
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main">
                        {
                          disciplinasComPrioridade.filter(
                            (item) => item.prioridade <= 3
                          ).length
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Alta Prioridade (≤3)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="warning.main">
                        {
                          disciplinasComPrioridade.filter(
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
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="error.main">
                        {
                          disciplinasComPrioridade.filter(
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
