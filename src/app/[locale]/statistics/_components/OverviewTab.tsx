import React, { useMemo, useState } from "react";
import { Box, Typography, Grid, Paper, Card, CardContent, Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from "@mui/material";
import { LineChart } from "@mui/x-charts";
import StarIcon from "@mui/icons-material/Star";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import ShuffleOutlinedIcon from "@mui/icons-material/ShuffleOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BalanceIcon from "@mui/icons-material/Balance";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { HistoricoSolucao } from "@/context/Global/utils";
import { useTranslations } from "next-intl";

interface OverviewTabProps {
  solucao: HistoricoSolucao;
}

export default function OverviewTab({ solucao }: OverviewTabProps) {
  const t = useTranslations("Pages.Statistics.SolutionHistoryDetails");
  const tGlobal = useTranslations();
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoType, setInfoType] = useState<"ISP" | "TAP" | "STD">("ISP");

  // Arrays for charts
  const historyDataIteracoes = Array.from(
    solucao.solucao.estatisticas.avaliacaoPorIteracao.keys(),
  );
  const historyDataAvaliacao = Array.from(
    solucao.solucao.estatisticas.avaliacaoPorIteracao.values(),
  );

  const tempoDataIteracoes = Array.from(
    solucao.solucao.estatisticas.tempoPorIteracao.keys(),
  );
  const tempoDataTempo = Array.from(
    solucao.solucao.estatisticas.tempoPorIteracao.values(),
  );

  // Calcula o total de violações
  const totalViolacoes = useMemo(() => {
    let total = 0;
    if (solucao.solucao.estatisticas.qtdOcorrenciasRestricoes) {
      solucao.solucao.estatisticas.qtdOcorrenciasRestricoes.forEach((restrictions) => {
        restrictions.forEach((restriction) => {
          total += restriction.qtd;
        });
      });
    }
    return total;
  }, [solucao.solucao.estatisticas.qtdOcorrenciasRestricoes]);

  // Calcula as novas métricas de Qualidade: TAP, ISP, Desvio Padrão da Carga
  const metrics = useMemo(() => {
    const { atribuicoes } = solucao.solucao;
    const { docentes, disciplinas, maxPriority } = solucao.contexto;

    let tapCount = 0;
    let ispScoreSum = 0;
    let totalAssignments = 0;

    // Define the max score a single assignment can have (priority 1 -> score = maxPriority - 1)
    // Se não houver maxPriority, assumimos que não há prioridades ou o valor é fallback
    const pMaxScore = maxPriority && maxPriority > 1 ? maxPriority - 1 : 1;

    // Workload calculation map
    const docenteWorkloadMap = new Map<string, number>();
    docentes.filter((d) => d.ativo).forEach((d) => docenteWorkloadMap.set(d.nome, 0));
    const disciplinaMap = new Map(disciplinas.map((d) => [d.id, d]));

    atribuicoes.forEach((atribuicao) => {
      const disciplina = disciplinaMap.get(atribuicao.id_disciplina);
      if (!disciplina) return;

      atribuicao.docentes.forEach((nomeDocente) => {
        totalAssignments += 1;
        const docente = docentes.find((d) => d.nome === nomeDocente);
        
        // Carga didática update
        if (docenteWorkloadMap.has(nomeDocente)) {
          docenteWorkloadMap.set(
            nomeDocente, 
            docenteWorkloadMap.get(nomeDocente)! + (disciplina.carga || 0)
          );
        }

        if (docente && docente.formularios) {
          const prioridade = docente.formularios.get(atribuicao.id_disciplina);
          if (prioridade !== undefined && prioridade > 0) {
            // TAP: check if priority is 1, 2, or 3
            if (prioridade <= 3) {
              tapCount += 1;
            }
            // ISP score calculation
            const score = maxPriority ? maxPriority - prioridade : 0;
            ispScoreSum += score;
          }
        }
      });
    });

    const tap = totalAssignments > 0 ? (tapCount / totalAssignments) * 100 : 0;
    const isp = totalAssignments > 0 ? (ispScoreSum / (pMaxScore * totalAssignments)) * 100 : 0;

    // Desvio padrão da carga
    const workloads = Array.from(docenteWorkloadMap.values());
    const totalDocentes = workloads.length;
    let stdDeviation = 0;
    
    if (totalDocentes > 0) {
      const avgWorkload = workloads.reduce((sum, w) => sum + w, 0) / totalDocentes;
      const variance = workloads.reduce((sum, w) => sum + Math.pow(w - avgWorkload, 2), 0) / totalDocentes;
      stdDeviation = Math.sqrt(variance);
    }

    return {
      tap,
      isp,
      stdDeviation,
    };
  }, [solucao.solucao.atribuicoes, solucao.contexto]);

  const avaliacaoFinal =
    solucao.solucao.avaliacao !== undefined && solucao.solucao.avaliacao !== null
      ? solucao.solucao.avaliacao
      : historyDataAvaliacao.length > 0
        ? historyDataAvaliacao[historyDataAvaliacao.length - 1]
        : 0;

  const handleOpenInfo = (type: "ISP" | "TAP" | "STD") => {
    setInfoType(type);
    setInfoOpen(true);
  };

  const handleCloseInfo = () => {
    setInfoOpen(false);
  };

  return (
    <Box sx={{ mt: 2, mb: 4 }}>
      {/* 
        ==============================
        KPI CARDS GRID
        ==============================
      */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <Paper
            elevation={2}
            sx={{ p: 2, textAlign: "center", bgcolor: "primary.50", borderRadius: 3, height: '100%' }}
          >
            <StarIcon sx={{ fontSize: 36, color: "primary.main", mb: 1 }} />
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {avaliacaoFinal.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tGlobal("Pages.Statistics.Overview.finalEvaluation")}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <Paper
            elevation={2}
            sx={{ p: 2, textAlign: "center", bgcolor: "info.50", borderRadius: 3, height: '100%' }}
          >
            <TimerOutlinedIcon sx={{ fontSize: 36, color: "info.main", mb: 1 }} />
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {solucao.solucao.estatisticas.tempoExecucao.toFixed(2)}s
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("executionTime")}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <Paper
            elevation={2}
            sx={{ p: 2, textAlign: "center", bgcolor: "success.50", borderRadius: 3, height: '100%' }}
          >
            <ShuffleOutlinedIcon sx={{ fontSize: 36, color: "success.main", mb: 1 }} />
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {solucao.solucao.estatisticas.iteracoes}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("iterations")}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <Paper
            elevation={2}
            sx={{ p: 2, textAlign: "center", bgcolor: totalViolacoes === 0 ? "success.50" : "error.50", borderRadius: 3, height: '100%' }}
          >
            <WarningAmberIcon sx={{ fontSize: 36, color: totalViolacoes === 0 ? "success.main" : "error.main", mb: 1 }} />
            <Typography variant="h4" color={totalViolacoes === 0 ? "success.main" : "error.main"} fontWeight="bold">
              {totalViolacoes}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tGlobal("Pages.Statistics.Overview.constraintViolations")}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 
        ==============================
        NEW QUALITY METRICS GRID
        ==============================
      */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.secondary' }}>
        {t("qualityIndicatorsTitle")}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={2}
            sx={{ p: 2, textAlign: "center", bgcolor: "warning.50", borderRadius: 3, height: '100%', position: 'relative' }}
          >
            <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8, color: 'warning.main' }} onClick={() => handleOpenInfo("ISP")}>
              <InfoOutlinedIcon />
            </IconButton>
            <TrendingUpIcon sx={{ fontSize: 36, color: "warning.main", mb: 1 }} />
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {metrics.isp.toFixed(1)}%
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
              {t("ispTitle")}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              {t("ispSubtitle")}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={2}
            sx={{ p: 2, textAlign: "center", bgcolor: "secondary.50", borderRadius: 3, height: '100%', position: 'relative' }}
          >
            <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8, color: 'secondary.main' }} onClick={() => handleOpenInfo("TAP")}>
              <InfoOutlinedIcon />
            </IconButton>
            <StarIcon sx={{ fontSize: 36, color: "secondary.main", mb: 1 }} />
            <Typography variant="h4" color="secondary.main" fontWeight="bold">
              {metrics.tap.toFixed(1)}%
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
              {t("tapTitle")}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              {t("tapSubtitle")}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={2}
            sx={{ p: 2, textAlign: "center", bgcolor: "info.50", borderRadius: 3, height: '100%', position: 'relative' }}
          >
            <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8, color: 'info.main' }} onClick={() => handleOpenInfo("STD")}>
              <InfoOutlinedIcon />
            </IconButton>
            <BalanceIcon sx={{ fontSize: 36, color: "info.main", mb: 1 }} />
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {metrics.stdDeviation.toFixed(2)}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
              {t("stdTitle")}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              {t("stdSubtitle")}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Info Dialog */}
      <Dialog open={infoOpen} onClose={handleCloseInfo} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {infoType === "ISP" && t("ispTitle")}
          {infoType === "TAP" && t("tapTitle")}
          {infoType === "STD" && t("stdTitle")}
        </DialogTitle>
        <DialogContent dividers>
          {infoType === "ISP" && (
            <Box>
              <Typography variant="body1" paragraph>
                {t("ispDialogDesc")}
              </Typography>
              <Paper sx={{ p: 2, bgcolor: "grey.100", mb: 2 }}>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                  {t("ispDialogFormula")}
                </Typography>
              </Paper>
              <Typography variant="body2" color="text.secondary">
                {t("ispDialogFooter")}
              </Typography>
            </Box>
          )}
          {infoType === "TAP" && (
            <Box>
              <Typography variant="body1" paragraph>
                {t("tapDialogDesc")}
              </Typography>
              <Paper sx={{ p: 2, bgcolor: "grey.100", mb: 2 }}>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                  {t("tapDialogFormula")}
                </Typography>
              </Paper>
              <Typography variant="body2" color="text.secondary">
                {t("tapDialogFooter")}
              </Typography>
            </Box>
          )}
          {infoType === "STD" && (
            <Box>
              <Typography variant="body1" paragraph>
                {t("stdDialogDesc")}
              </Typography>
              <Paper sx={{ p: 2, bgcolor: "grey.100", mb: 2 }}>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                  {t("stdDialogFormula")}
                </Typography>
              </Paper>
              <Typography variant="body2" color="text.secondary">
                {t("stdDialogFooter")}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInfo} color="inherit">{t("close")}</Button>
        </DialogActions>
      </Dialog>


      <Divider sx={{ my: 4 }} />

      {/* 
        ==============================
        CHARTS SECTION
        ==============================
      */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        {tGlobal("Pages.Statistics.Overview.algorithmEvolution")}
      </Typography>

      {historyDataIteracoes.length > 0 || tempoDataIteracoes.length > 0 ? (
        <Grid container spacing={3}>
          {historyDataIteracoes.length > 0 ? (
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" align="center" gutterBottom fontWeight="600">
                    {t("evaluationChartTitle")}
                  </Typography>
                  <Box sx={{ width: "100%", height: 350 }}>
                    <LineChart
                      xAxis={[
                        {
                          data: historyDataIteracoes,
                          label: t("xAxisLabelIterations"),
                          min: historyDataIteracoes[0],
                          max: historyDataIteracoes[
                            historyDataIteracoes.length - 1
                          ],
                        },
                      ]}
                      series={[
                        {
                          data: historyDataAvaliacao,
                          label: t("yAxisLabelEvaluation"),
                          showMark: false,
                          color: "#1976d2",
                        },
                      ]}
                      width={undefined}
                      height={350}
                      margin={{ left: 50, right: 20, top: 20, bottom: 50 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ) : null}

          {tempoDataIteracoes.length > 0 ? (
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" align="center" gutterBottom fontWeight="600">
                    {t("timeChartTitle")}
                  </Typography>
                  <Box sx={{ width: "100%", height: 350 }}>
                    <LineChart
                      xAxis={[
                        {
                          data: tempoDataIteracoes,
                          label: t("xAxisLabelIterations"),
                          min: tempoDataIteracoes[0],
                          max: tempoDataIteracoes[tempoDataIteracoes.length - 1],
                        },
                      ]}
                      series={[
                        {
                          data: tempoDataTempo,
                          label: t("yAxisLabelTime"),
                          showMark: false,
                          color: "#2e7d32",
                        },
                      ]}
                      width={undefined}
                      height={350}
                      margin={{ left: 50, right: 20, top: 20, bottom: 50 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ) : null}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          {tGlobal("Pages.Statistics.Overview.noChartData")}
        </Alert>
      )}
    </Box>
  );
}
