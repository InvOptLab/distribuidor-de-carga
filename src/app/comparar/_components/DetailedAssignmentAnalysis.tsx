"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid as Grid,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Alert,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import InfoIcon from "@mui/icons-material/Info";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import BalanceIcon from "@mui/icons-material/Balance";
import WorkIcon from "@mui/icons-material/Work";
import StarIcon from "@mui/icons-material/Star";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { useGlobalContext } from "@/context/Global";
import { HistoricoSolucao } from "@/context/Global/utils";

interface DetailedAssignmentAnalysisProps {
  solutionA: HistoricoSolucao;
  solutionB: HistoricoSolucao;
  differences: {
    modified: {
      disciplina: string;
      docentesA: string[];
      docentesB: string[];
      added: string[];
      removed: string[];
    }[];
  };
}

interface DocenteAnalysis {
  nome: string;
  prioridade: number | null;
  saldo: number | null;
  cargaTrabalhoA: number;
  cargaTrabalhoB: number;
  deltaCarga: number;
  disciplinasA: string[];
  disciplinasB: string[];
  status: "added" | "removed" | "unchanged";
}

interface DisciplinaAnalysis {
  id: string;
  nome: string;
  codigo: string;
  carga: number;
  nivel: string;
  grupo?: string;
  docentesA: DocenteAnalysis[];
  docentesB: DocenteAnalysis[];
  impactoTotal: {
    prioridadeMediaA: number;
    prioridadeMediaB: number;
    saldoTotalA: number;
    saldoTotalB: number;
    cargaTotalA: number;
    cargaTotalB: number;
  };
}

export default function DetailedAssignmentAnalysis({
  solutionA,
  solutionB,
  differences,
}: DetailedAssignmentAnalysisProps) {
  const { docentes, disciplinas, formularios } = useGlobalContext();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDisciplina, setSelectedDisciplina] =
    useState<DisciplinaAnalysis | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Função para calcular carga de trabalho de um docente
  const calculateWorkload = (docenteNome: string, atribuicoes: any[]) => {
    return atribuicoes
      .filter((attr) => attr.docentes.includes(docenteNome))
      .reduce((total, attr) => {
        const disciplina = disciplinas.find((d) => d.id === attr.id_disciplina);
        return total + (disciplina?.carga || 0);
      }, 0);
  };

  // Função para obter prioridade do docente para uma disciplina
  const getPrioridade = (docenteNome: string, disciplinaId: string) => {
    const formulario = formularios.find(
      (f) => f.nome_docente === docenteNome && f.id_disciplina === disciplinaId
    );
    return formulario?.prioridade || null;
  };

  // Função para obter saldo do docente
  const getSaldo = (docenteNome: string) => {
    const docente = docentes.find((d) => d.nome === docenteNome);
    return docente?.saldo || null;
  };

  // Análise detalhada das disciplinas modificadas
  const disciplinasAnalysis: DisciplinaAnalysis[] = useMemo(() => {
    return differences.modified
      .map((diff) => {
        const disciplina = disciplinas.find((d) => d.id === diff.disciplina);
        if (!disciplina) return null;

        // Análise dos docentes em cada solução
        const docentesAAnalysis: DocenteAnalysis[] = diff.docentesA.map(
          (docenteNome) => ({
            nome: docenteNome,
            prioridade: getPrioridade(docenteNome, diff.disciplina),
            saldo: getSaldo(docenteNome),
            cargaTrabalhoA: calculateWorkload(
              docenteNome,
              solutionA.solucao.atribuicoes
            ),
            cargaTrabalhoB: calculateWorkload(
              docenteNome,
              solutionB.solucao.atribuicoes
            ),
            deltaCarga: 0, // Será calculado depois
            disciplinasA: solutionA.solucao.atribuicoes
              .filter((attr) => attr.docentes.includes(docenteNome))
              .map((attr) => attr.id_disciplina),
            disciplinasB: solutionB.solucao.atribuicoes
              .filter((attr) => attr.docentes.includes(docenteNome))
              .map((attr) => attr.id_disciplina),
            status: diff.removed.includes(docenteNome)
              ? "removed"
              : "unchanged",
          })
        );

        const docentesBAnalysis: DocenteAnalysis[] = diff.docentesB.map(
          (docenteNome) => ({
            nome: docenteNome,
            prioridade: getPrioridade(docenteNome, diff.disciplina),
            saldo: getSaldo(docenteNome),
            cargaTrabalhoA: calculateWorkload(
              docenteNome,
              solutionA.solucao.atribuicoes
            ),
            cargaTrabalhoB: calculateWorkload(
              docenteNome,
              solutionB.solucao.atribuicoes
            ),
            deltaCarga: 0, // Será calculado depois
            disciplinasA: solutionA.solucao.atribuicoes
              .filter((attr) => attr.docentes.includes(docenteNome))
              .map((attr) => attr.id_disciplina),
            disciplinasB: solutionB.solucao.atribuicoes
              .filter((attr) => attr.docentes.includes(docenteNome))
              .map((attr) => attr.id_disciplina),
            status: diff.added.includes(docenteNome) ? "added" : "unchanged",
          })
        );

        // Calcular delta de carga
        docentesAAnalysis.forEach((docente) => {
          docente.deltaCarga = docente.cargaTrabalhoB - docente.cargaTrabalhoA;
        });
        docentesBAnalysis.forEach((docente) => {
          docente.deltaCarga = docente.cargaTrabalhoB - docente.cargaTrabalhoA;
        });

        // Calcular impacto total
        const calcularMedia = (
          docentes: DocenteAnalysis[],
          campo: keyof DocenteAnalysis
        ) => {
          const valores = docentes
            .map((d) => d[campo] as number)
            .filter((v) => v !== null && !isNaN(v));
          return valores.length > 0
            ? valores.reduce((a, b) => a + b, 0) / valores.length
            : 0;
        };

        const calcularSoma = (
          docentes: DocenteAnalysis[],
          campo: keyof DocenteAnalysis
        ) => {
          return docentes
            .map((d) => d[campo] as number)
            .filter((v) => v !== null && !isNaN(v))
            .reduce((a, b) => a + b, 0);
        };

        return {
          id: disciplina.id,
          nome: disciplina.nome,
          codigo: disciplina.codigo,
          carga: disciplina.carga || 0,
          nivel: disciplina.nivel,
          grupo: disciplina.grupo,
          docentesA: docentesAAnalysis,
          docentesB: docentesBAnalysis,
          impactoTotal: {
            prioridadeMediaA: calcularMedia(docentesAAnalysis, "prioridade"),
            prioridadeMediaB: calcularMedia(docentesBAnalysis, "prioridade"),
            saldoTotalA: calcularSoma(docentesAAnalysis, "saldo"),
            saldoTotalB: calcularSoma(docentesBAnalysis, "saldo"),
            cargaTotalA: calcularSoma(docentesAAnalysis, "cargaTrabalhoA"),
            cargaTotalB: calcularSoma(docentesBAnalysis, "cargaTrabalhoB"),
          },
        };
      })
      .filter(Boolean) as DisciplinaAnalysis[];
  }, [differences, solutionA, solutionB, docentes, disciplinas, formularios]);

  // Estatísticas gerais
  const estatisticasGerais = useMemo(() => {
    const totalDisciplinas = disciplinasAnalysis.length;
    const melhoriasPrioridade = disciplinasAnalysis.filter(
      (d) => d.impactoTotal.prioridadeMediaB < d.impactoTotal.prioridadeMediaA
    ).length;
    const melhoriasSaldo = disciplinasAnalysis.filter(
      (d) => d.impactoTotal.saldoTotalB > d.impactoTotal.saldoTotalA
    ).length;

    return {
      totalDisciplinas,
      melhoriasPrioridade,
      melhoriasSaldo,
      percentualMelhoriasPrioridade:
        totalDisciplinas > 0
          ? (melhoriasPrioridade / totalDisciplinas) * 100
          : 0,
      percentualMelhoriasSaldo:
        totalDisciplinas > 0 ? (melhoriasSaldo / totalDisciplinas) * 100 : 0,
    };
  }, [disciplinasAnalysis]);

  // Função para renderizar chip do docente com informações detalhadas
  const renderDocenteChip = (
    docente: DocenteAnalysis
    //disciplinaId: string
  ) => {
    const getPrioridadeColor = (prioridade: number | null) => {
      if (prioridade === null) return "default";
      if (prioridade <= 3) return "success";
      if (prioridade <= 6) return "warning";
      return "error";
    };

    const getSaldoColor = (saldo: number | null) => {
      if (saldo === null) return "default";
      return saldo >= 0 ? "success" : "error";
    };

    const getCargaColor = (delta: number) => {
      if (delta === 0) return "default";
      return delta > 0 ? "warning" : "success";
    };

    const statusColor =
      docente.status === "added"
        ? "success"
        : docente.status === "removed"
        ? "error"
        : "primary";

    return (
      <Tooltip
        key={docente.nome}
        title={
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {docente.nome}
            </Typography>
            <Typography variant="body2">
              Prioridade: {docente.prioridade || "N/A"}
            </Typography>
            <Typography variant="body2">
              Saldo: {docente.saldo !== null ? docente.saldo : "N/A"}
            </Typography>
            <Typography variant="body2">
              Carga: {docente.cargaTrabalhoA} → {docente.cargaTrabalhoB} (Δ
              {docente.deltaCarga > 0 ? "+" : ""}
              {docente.deltaCarga})
            </Typography>
            <Typography variant="body2">Status: {docente.status}</Typography>
          </Box>
        }
        arrow
      >
        <Box
          sx={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            m: 0.5,
          }}
        >
          <Chip
            label={docente.nome}
            color={statusColor}
            size="small"
            icon={<PersonIcon />}
            sx={{ mb: 0.5 }}
          />
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {docente.prioridade && (
              <Chip
                label={`P:${docente.prioridade}`}
                size="small"
                color={getPrioridadeColor(docente.prioridade)}
                icon={<StarIcon />}
                sx={{ fontSize: "0.7rem", height: 20 }}
              />
            )}
            {docente.saldo !== null && (
              <Chip
                label={`S:${docente.saldo}`}
                size="small"
                color={getSaldoColor(docente.saldo)}
                icon={<BalanceIcon />}
                sx={{ fontSize: "0.7rem", height: 20 }}
              />
            )}
            <Chip
              label={`C:${docente.cargaTrabalhoB}`}
              size="small"
              color={getCargaColor(docente.deltaCarga)}
              icon={<WorkIcon />}
              sx={{ fontSize: "0.7rem", height: 20 }}
            />
          </Box>
        </Box>
      </Tooltip>
    );
  };

  // Função para abrir detalhes da disciplina
  const openDisciplinaDetails = (disciplina: DisciplinaAnalysis) => {
    setSelectedDisciplina(disciplina);
    setDetailsOpen(true);
  };

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <CompareArrowsIcon color="primary" />
            Análise Detalhada das Atribuições Modificadas
          </Typography>

          {/* Estatísticas Gerais */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Resumo da Análise:</strong>{" "}
              {estatisticasGerais.totalDisciplinas} disciplinas modificadas •{" "}
              {estatisticasGerais.melhoriasPrioridade} melhorias de prioridade (
              {estatisticasGerais.percentualMelhoriasPrioridade.toFixed(1)}%) •{" "}
              {estatisticasGerais.melhoriasSaldo} melhorias de saldo (
              {estatisticasGerais.percentualMelhoriasSaldo.toFixed(1)}%)
            </Typography>
          </Alert>

          {/* Legenda */}
          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Legenda dos Chips:
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <StarIcon fontSize="small" color="primary" />
                  <Typography variant="body2">
                    <strong>P:</strong> Prioridade (menor = melhor)
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BalanceIcon fontSize="small" color="primary" />
                  <Typography variant="body2">
                    <strong>S:</strong> Saldo do docente
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <WorkIcon fontSize="small" color="primary" />
                  <Typography variant="body2">
                    <strong>C:</strong> Carga de trabalho atual
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonIcon fontSize="small" color="primary" />
                  <Typography variant="body2">
                    Verde: Adicionado | Vermelho: Removido
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Tabs para diferentes visualizações */}
          <Tabs
            value={selectedTab}
            onChange={(_, newValue) => setSelectedTab(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="Visão Geral" />
            <Tab label="Análise por Impacto" />
            <Tab label="Análise por Prioridade" />
          </Tabs>

          {/* Visão Geral */}
          {selectedTab === 0 && (
            <Box>
              {disciplinasAnalysis.map((disciplina) => (
                <Accordion key={disciplina.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Chip
                        label={`${disciplina.codigo} - ${disciplina.nome}`}
                        icon={<SchoolIcon />}
                        color="primary"
                        onClick={() => openDisciplinaDetails(disciplina)}
                        sx={{ cursor: "pointer" }}
                      />
                      <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                        <Chip
                          label={`Carga: ${disciplina.carga}`}
                          size="small"
                          color="info"
                        />
                        <Chip
                          label={`Nível: ${disciplina.nivel}`}
                          size="small"
                          color="secondary"
                        />
                        {disciplina.impactoTotal.prioridadeMediaB <
                          disciplina.impactoTotal.prioridadeMediaA && (
                          <Chip
                            label="Melhoria Prioridade"
                            size="small"
                            color="success"
                            icon={<TrendingUpIcon />}
                          />
                        )}
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          color="primary.main"
                        >
                          Solução A:
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {disciplina.docentesA.map((docente) =>
                            renderDocenteChip(docente)
                          )}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          color="secondary.main"
                        >
                          Solução B:
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {disciplina.docentesB.map((docente) =>
                            renderDocenteChip(docente)
                          )}
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Análise de Impacto */}
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Análise de Impacto:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="primary.main">
                            {disciplina.impactoTotal.prioridadeMediaA.toFixed(
                              1
                            )}{" "}
                            →{" "}
                            {disciplina.impactoTotal.prioridadeMediaB.toFixed(
                              1
                            )}
                          </Typography>
                          <Typography variant="caption">
                            Prioridade Média
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="secondary.main">
                            {disciplina.impactoTotal.saldoTotalA} →{" "}
                            {disciplina.impactoTotal.saldoTotalB}
                          </Typography>
                          <Typography variant="caption">Saldo Total</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="info.main">
                            {disciplina.impactoTotal.cargaTotalA.toFixed(1)} →{" "}
                            {disciplina.impactoTotal.cargaTotalB.toFixed(1)}
                          </Typography>
                          <Typography variant="caption">Carga Total</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Box textAlign="center">
                          <IconButton
                            onClick={() => openDisciplinaDetails(disciplina)}
                            color="primary"
                            size="small"
                          >
                            <InfoIcon />
                          </IconButton>
                          <Typography variant="caption" display="block">
                            Mais Detalhes
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}

          {/* Análise por Impacto */}
          {selectedTab === 1 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Disciplina</TableCell>
                    <TableCell align="center">Δ Prioridade</TableCell>
                    <TableCell align="center">Δ Saldo</TableCell>
                    <TableCell align="center">Δ Carga</TableCell>
                    <TableCell align="center">Impacto Geral</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {disciplinasAnalysis
                    .sort((a, b) => {
                      const impactoA =
                        Math.abs(
                          a.impactoTotal.prioridadeMediaB -
                            a.impactoTotal.prioridadeMediaA
                        ) +
                        Math.abs(
                          a.impactoTotal.saldoTotalB -
                            a.impactoTotal.saldoTotalA
                        );
                      const impactoB =
                        Math.abs(
                          b.impactoTotal.prioridadeMediaB -
                            b.impactoTotal.prioridadeMediaA
                        ) +
                        Math.abs(
                          b.impactoTotal.saldoTotalB -
                            b.impactoTotal.saldoTotalA
                        );
                      return impactoB - impactoA;
                    })
                    .map((disciplina) => {
                      const deltaPrioridade =
                        disciplina.impactoTotal.prioridadeMediaB -
                        disciplina.impactoTotal.prioridadeMediaA;
                      const deltaSaldo =
                        disciplina.impactoTotal.saldoTotalB -
                        disciplina.impactoTotal.saldoTotalA;
                      const deltaCarga =
                        disciplina.impactoTotal.cargaTotalB -
                        disciplina.impactoTotal.cargaTotalA;

                      return (
                        <TableRow key={disciplina.id} hover>
                          <TableCell>
                            <Chip
                              label={`${disciplina.codigo} - ${disciplina.nome}`}
                              size="small"
                              onClick={() => openDisciplinaDetails(disciplina)}
                              sx={{ cursor: "pointer" }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${
                                deltaPrioridade > 0 ? "+" : ""
                              }${deltaPrioridade.toFixed(2)}`}
                              size="small"
                              color={
                                deltaPrioridade < 0
                                  ? "success"
                                  : deltaPrioridade > 0
                                  ? "error"
                                  : "default"
                              }
                              icon={
                                deltaPrioridade < 0 ? (
                                  <TrendingUpIcon />
                                ) : deltaPrioridade > 0 ? (
                                  <TrendingDownIcon />
                                ) : undefined
                              }
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${
                                deltaSaldo > 0 ? "+" : ""
                              }${deltaSaldo}`}
                              size="small"
                              color={
                                deltaSaldo > 0
                                  ? "success"
                                  : deltaSaldo < 0
                                  ? "error"
                                  : "default"
                              }
                              icon={
                                deltaSaldo > 0 ? (
                                  <TrendingUpIcon />
                                ) : deltaSaldo < 0 ? (
                                  <TrendingDownIcon />
                                ) : undefined
                              }
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${
                                deltaCarga > 0 ? "+" : ""
                              }${deltaCarga.toFixed(1)}`}
                              size="small"
                              color={
                                deltaCarga > 0
                                  ? "warning"
                                  : deltaCarga < 0
                                  ? "info"
                                  : "default"
                              }
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.5,
                                justifyContent: "center",
                              }}
                            >
                              {deltaPrioridade < 0 && (
                                <Chip label="↑P" size="small" color="success" />
                              )}
                              {deltaSaldo > 0 && (
                                <Chip label="↑S" size="small" color="success" />
                              )}
                              {Math.abs(deltaCarga) < 1 && (
                                <Chip label="=C" size="small" color="info" />
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Análise por Prioridade */}
          {selectedTab === 2 && (
            <Box>
              {[
                "Melhorias de Prioridade",
                "Pioras de Prioridade",
                "Sem Alteração",
              ].map((categoria, catIndex) => {
                const filteredDisciplinas = disciplinasAnalysis.filter((d) => {
                  const delta =
                    d.impactoTotal.prioridadeMediaB -
                    d.impactoTotal.prioridadeMediaA;
                  if (catIndex === 0) return delta < -0.1; // Melhorias
                  if (catIndex === 1) return delta > 0.1; // Pioras
                  return Math.abs(delta) <= 0.1; // Sem alteração
                });

                if (filteredDisciplinas.length === 0) return null;

                return (
                  <Accordion key={categoria}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography
                        variant="h6"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {categoria} ({filteredDisciplinas.length})
                        {catIndex === 0 && <TrendingUpIcon color="success" />}
                        {catIndex === 1 && <TrendingDownIcon color="error" />}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {filteredDisciplinas.map((disciplina) => (
                          <ListItem key={disciplina.id} divider>
                            <ListItemAvatar>
                              <Avatar>
                                <SchoolIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={`${disciplina.codigo} - ${disciplina.nome}`}
                              secondary={
                                <Box>
                                  <Typography variant="body2">
                                    Prioridade:{" "}
                                    {disciplina.impactoTotal.prioridadeMediaA.toFixed(
                                      2
                                    )}{" "}
                                    →{" "}
                                    {disciplina.impactoTotal.prioridadeMediaB.toFixed(
                                      2
                                    )}
                                  </Typography>
                                  <Box sx={{ mt: 1 }}>
                                    {disciplina.docentesB.map((docente) =>
                                      renderDocenteChip(docente)
                                    )}
                                  </Box>
                                </Box>
                              }
                            />
                            <IconButton
                              onClick={() => openDisciplinaDetails(disciplina)}
                            >
                              <InfoIcon />
                            </IconButton>
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes da Disciplina */}
      {selectedDisciplina && (
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Análise Detalhada: {selectedDisciplina.codigo} -{" "}
            {selectedDisciplina.nome}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary.main" gutterBottom>
                      Solução A
                    </Typography>
                    <List dense>
                      {selectedDisciplina.docentesA.map((docente) => (
                        <ListItem key={docente.nome}>
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={docente.nome}
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  Prioridade: {docente.prioridade || "N/A"} |
                                  Saldo:{" "}
                                  {docente.saldo !== null
                                    ? docente.saldo
                                    : "N/A"}{" "}
                                  | Carga: {docente.cargaTrabalhoA}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Disciplinas: {docente.disciplinasA.length}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="h6"
                      color="secondary.main"
                      gutterBottom
                    >
                      Solução B
                    </Typography>
                    <List dense>
                      {selectedDisciplina.docentesB.map((docente) => (
                        <ListItem key={docente.nome}>
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor:
                                  docente.status === "added"
                                    ? "success.main"
                                    : "primary.main",
                              }}
                            >
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {docente.nome}
                                {docente.status === "added" && (
                                  <Chip
                                    label="Novo"
                                    size="small"
                                    color="success"
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  Prioridade: {docente.prioridade || "N/A"} |
                                  Saldo:{" "}
                                  {docente.saldo !== null
                                    ? docente.saldo
                                    : "N/A"}{" "}
                                  | Carga: {docente.cargaTrabalhoB}
                                  {docente.deltaCarga !== 0 && (
                                    <Chip
                                      label={`Δ${
                                        docente.deltaCarga > 0 ? "+" : ""
                                      }${docente.deltaCarga}`}
                                      size="small"
                                      color={
                                        docente.deltaCarga > 0
                                          ? "warning"
                                          : "success"
                                      }
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Disciplinas: {docente.disciplinasB.length}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>Fechar</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
