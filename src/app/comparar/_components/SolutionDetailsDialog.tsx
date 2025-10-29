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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import TimelineIcon from "@mui/icons-material/Timeline";
import ListIcon from "@mui/icons-material/List";
import { HistoricoSolucao } from "@/context/Global/utils";
import { Solution } from "@/algoritmo/metodos/TabuSearch/TabuList/Solution";
import { Moviment } from "@/algoritmo/metodos/TabuSearch/TabuList/Moviment";
import { isHeuristicAlgorithm, isTabuSearch } from "@/algoritmo/communs/utils";

interface SolutionDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  solution: HistoricoSolucao;
  title: string;
}

export default function SolutionDetailsDialog({
  open,
  onClose,
  solution,
  title,
}: SolutionDetailsDialogProps) {
  const formatDateTime = (datetime: string) => {
    return datetime;
    //return new Date(datetime).toLocaleString("pt-BR");
  };

  const getTotalAssignments = () => {
    return solution.solucao.atribuicoes.reduce(
      (total, attr) => total + attr.docentes.length,
      0
    );
  };

  const getAssignedDisciplines = () => {
    return solution.solucao.atribuicoes.filter(
      (attr) => attr.docentes.length > 0
    ).length;
  };

  const getUniqueDocentes = () => {
    const docentes = new Set<string>();
    solution.solucao.atribuicoes.forEach((attr) => {
      attr.docentes.forEach((docente) => docentes.add(docente));
    });
    return docentes.size;
  };

  const algorithm = solution.algorithm;

  // Função para obter informações da TabuList
  const getTabuListInfo = () => {
    if (isTabuSearch(algorithm)) {
      if (!algorithm?.tabuList) return null;
      if (algorithm.tabuList instanceof Solution) {
        return {
          size: algorithm.tabuList.tabuSize || 0,
          type: "Solução",
        };
      }

      if (algorithm.tabuList instanceof Moviment) {
        return {
          size: `Add: ${algorithm.tabuList.tenures.add}, Drop: ${algorithm.tabuList.tenures.drop}`,
          type: "Movimento",
        };
      }
    }
  };

  // Função para converter Map em array para renderização
  const mapToArray = (map: Map<string, any> | undefined) => {
    if (!map) return [];
    return Array.from(map.entries()).map(([key, value]) => ({
      key,
      name: value.name || key,
      description: value.description || "Sem descrição",

      ...value,
    }));
  };

  const tabuListInfo = getTabuListInfo();
  const neighborhoodFunctions = mapToArray(
    isHeuristicAlgorithm(algorithm) ? algorithm.neighborhoodPipe : null
  );
  const hardConstraints = mapToArray(algorithm?.constraints?.hard);
  const softConstraints = mapToArray(algorithm?.constraints?.soft);
  const stopFunctions = mapToArray(
    isHeuristicAlgorithm(algorithm) ? algorithm.stopPipe : null
  );
  const aspirationFunctions = mapToArray(
    isTabuSearch(algorithm) ? algorithm.aspirationPipe : null
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <InfoIcon />
          </Avatar>
          <Box>
            <Typography variant="h6">Detalhes Completos da Solução</Typography>
            <Typography variant="body2" color="text.secondary">
              {title} - {formatDateTime(solution.datetime)}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Resumo Geral */}
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined" sx={{ bgcolor: "primary.50" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <BarChartIcon color="primary" />
                  Resumo Geral
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography
                        variant="h3"
                        color="primary.main"
                        fontWeight="bold"
                      >
                        {getTotalAssignments()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total de Atribuições
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography
                        variant="h3"
                        color="secondary.main"
                        fontWeight="bold"
                      >
                        {getAssignedDisciplines()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Disciplinas Atribuídas
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography
                        variant="h3"
                        color="success.main"
                        fontWeight="bold"
                      >
                        {getUniqueDocentes()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Docentes Únicos
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography
                        variant="h3"
                        color={
                          solution.solucao.avaliacao === 0
                            ? "success.main"
                            : "warning.main"
                        }
                        fontWeight="bold"
                      >
                        {solution.solucao.avaliacao?.toFixed(1) || "N/A"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avaliação Final
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Informações Básicas */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações Básicas
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Data/Hora de Criação
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatDateTime(solution.datetime)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tipo de Inserção
                    </Typography>
                    <Chip
                      label={solution.tipoInsercao}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      ID da Solução
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {solution.id}
                    </Typography>
                  </Box>
                  {solution.solucao.avaliacao !== undefined && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Avaliação da Solução
                      </Typography>
                      <Chip
                        label={solution.solucao.avaliacao.toFixed(2)}
                        color={
                          solution.solucao.avaliacao === 0
                            ? "success"
                            : "warning"
                        }
                        size="small"
                      />
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Contexto de Execução */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contexto de Execução
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Docentes Ativos
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {solution.contexto.docentes.filter((d) => d.ativo).length}{" "}
                      / {solution.contexto.docentes.length}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Disciplinas Ativas
                    </Typography>
                    <Typography variant="h6" color="secondary.main">
                      {
                        solution.contexto.disciplinas.filter((d) => d.ativo)
                          .length
                      }{" "}
                      / {solution.contexto.disciplinas.length}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Travas Aplicadas
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {solution.contexto.travas.length}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Prioridade Máxima
                    </Typography>
                    <Typography variant="h6" color="info.main">
                      {solution.contexto.maxPriority}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Estatísticas de Execução */}
          {solution.solucao.estatisticas && (
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <TimelineIcon color="primary" />
                    Estatísticas de Execução
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 3, sm: 6 }}>
                      <Box
                        textAlign="center"
                        sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}
                      >
                        <Typography variant="h4" color="primary.main">
                          {solution.solucao.estatisticas.iteracoes}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Iterações
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3, sm: 6 }}>
                      <Box
                        textAlign="center"
                        sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}
                      >
                        <Typography variant="h4" color="secondary.main">
                          {solution.solucao.estatisticas.tempoExecucao.toFixed(
                            2
                          )}
                          s
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tempo de Execução
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3, sm: 6 }}>
                      <Box
                        textAlign="center"
                        sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}
                      >
                        <Chip
                          label={
                            solution.solucao.estatisticas.interrupcao
                              ? "Interrompido"
                              : "Completo"
                          }
                          color={
                            solution.solucao.estatisticas.interrupcao
                              ? "warning"
                              : "success"
                          }
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Status
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3, sm: 6 }}>
                      <Box
                        textAlign="center"
                        sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}
                      >
                        <Typography variant="h4" color="info.main">
                          {solution.solucao.estatisticas.avaliacaoPorIteracao
                            ?.size || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pontos de Dados
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Configurações do Algoritmo */}
          {algorithm && (
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <SettingsIcon color="primary" />
                    Configurações do Algoritmo
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    {/* Lista Tabu */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <ListIcon color="primary" />
                          Lista Tabu
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body2">Tipo:</Typography>
                            <Chip
                              label={tabuListInfo?.type || "N/A"}
                              size="small"
                              color="primary"
                            />
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body2">Tamanho:</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {tabuListInfo?.size || 0}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Contadores */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          Componentes Ativos
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body2">
                              Restrições Hard:
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="error.main"
                            >
                              {hardConstraints.length}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body2">
                              Restrições Soft:
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="warning.main"
                            >
                              {softConstraints.length}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body2">
                              Funções de Vizinhança:
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="primary.main"
                            >
                              {neighborhoodFunctions.length}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body2">
                              Critérios de Parada:
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="secondary.main"
                            >
                              {stopFunctions.length}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body2">
                              Critérios de Aspiração:
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="info.main"
                            >
                              {aspirationFunctions.length}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Detalhes dos Componentes */}
                  <Box sx={{ mt: 3 }}>
                    {/* Restrições Hard */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Restrições Hard ({hardConstraints.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {hardConstraints.length > 0 ? (
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>
                                    <strong>Nome</strong>
                                  </TableCell>
                                  <TableCell>
                                    <strong>Descrição</strong>
                                  </TableCell>
                                  <TableCell align="center">
                                    <strong>Penalidade</strong>
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {hardConstraints.map((constraint, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                      >
                                        {constraint.name}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {constraint.description}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Chip
                                        label={constraint.penalty || "N/A"}
                                        color="error"
                                        size="small"
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Nenhuma restrição hard configurada
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>

                    {/* Restrições Soft */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Restrições Soft ({softConstraints.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {softConstraints.length > 0 ? (
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>
                                    <strong>Nome</strong>
                                  </TableCell>
                                  <TableCell>
                                    <strong>Descrição</strong>
                                  </TableCell>
                                  <TableCell align="center">
                                    <strong>Penalidade</strong>
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {softConstraints.map((constraint, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                      >
                                        {constraint.name}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {constraint.description}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Chip
                                        label={constraint.penalty || "N/A"}
                                        color="warning"
                                        size="small"
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Nenhuma restrição soft configurada
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>

                    {/* Funções de Vizinhança */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Funções de Vizinhança ({neighborhoodFunctions.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {neighborhoodFunctions.length > 0 ? (
                          <Grid container spacing={1}>
                            {neighborhoodFunctions.map((func, index) => (
                              <Grid key={index}>
                                <Chip
                                  label={func.name}
                                  color="primary"
                                  variant="outlined"
                                  title={func.description}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Nenhuma função de vizinhança configurada
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>

                    {/* Critérios de Parada */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Critérios de Parada ({stopFunctions.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {stopFunctions.length > 0 ? (
                          <Grid container spacing={1}>
                            {stopFunctions.map((func, index) => (
                              <Grid key={index}>
                                <Chip
                                  label={func.name}
                                  color="secondary"
                                  variant="outlined"
                                  title={func.description}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Nenhum critério de parada configurado
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>

                    {/* Critérios de Aspiração */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Critérios de Aspiração ({aspirationFunctions.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {aspirationFunctions.length > 0 ? (
                          <Grid container spacing={1}>
                            {aspirationFunctions.map((func, index) => (
                              <Grid key={index}>
                                <Chip
                                  label={func.name}
                                  color="info"
                                  variant="outlined"
                                  title={func.description}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Nenhum critério de aspiração configurado
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" size="large">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
