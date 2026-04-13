"use client";

import React, { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Tooltip,
  Card,
  CardContent,
  Tabs,
  Tab,
  Grid,
  CircularProgress,
  Fade,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TimerIcon from "@mui/icons-material/Timer";
import LoopIcon from "@mui/icons-material/Loop";
import LinearProgress, {
  type LinearProgressProps,
} from "@mui/material/LinearProgress";
import { Estatisticas } from "@/algoritmo/communs/interfaces/interfaces";
import { LineChart } from "@mui/x-charts";
import { _Translator, useTranslations } from "next-intl";

export interface IProgressBar {
  total: number;
  current: number;
}

// Adicione o tipo para os estágios
export type AlgorithmStage = "idle" | "preprocessing" | "solving";

interface AlgoritmoDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  onStop: () => void;
  processing: boolean;
  progress: IProgressBar;
  estatisticasMonitoradas: Partial<Estatisticas>;
  stage?: AlgorithmStage;
}

/**
 * Componente de barra de progresso com label
 */
function LinearProgressWithLabel(
  props: LinearProgressProps & {
    value: number;
    progress: IProgressBar;
    t: _Translator<Record<string, any>, string>;
  },
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Tooltip
          title={props.t("linearProgressLabel", {
            current: props.progress.current,
            total: props.progress.total,
          })}
          // {`Alocações: ${props.progress.current} de ${props.progress.total}`}
        >
          <Typography
            variant="body2"
            sx={{ color: "text.secondary" }}
          >{`${Math.round(props.value)}%`}</Typography>
        </Tooltip>
      </Box>
    </Box>
  );
}

/**
 * Card de métrica com ícone
 */
function MetricCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 1,
              bgcolor: `${color}.100`,
              color: `${color}.main`,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

/**
 * Dialog principal do algoritmo com visualizações de estatísticas
 */
export default function AlgoritmoDialog({
  open,
  onClose,
  onApply,
  onStop,
  processing,
  progress,
  estatisticasMonitoradas,
  stage = "solving",
}: AlgoritmoDialogProps) {
  const t = useTranslations("AlgorithmDialog");

  const [tabValue, setTabValue] = React.useState(0);

  // Calcula a porcentagem de progresso
  const progressPercentage = (): number => {
    if (!processing) {
      return 100;
    }
    const value = Math.ceil((100 * progress.current) / progress.total);
    return value >= 100 ? 100 : value;
  };

  // Prepara dados para os gráficos
  const chartData = useMemo(() => {
    const tempoPorIteracao =
      estatisticasMonitoradas.tempoPorIteracao || new Map();
    const avaliacaoPorIteracao =
      estatisticasMonitoradas.avaliacaoPorIteracao || new Map();

    const data: Array<{
      iteracao: number;
      tempo: number;
      avaliacao: number;
    }> = [];

    // Combina os dados de tempo e avaliação
    const allIterations = new Set([
      ...Array.from(tempoPorIteracao.keys()),
      ...Array.from(avaliacaoPorIteracao.keys()),
    ]);

    Array.from(allIterations)
      .sort((a, b) => a - b)
      .forEach((iteracao) => {
        data.push({
          iteracao,
          tempo: tempoPorIteracao.get(iteracao) || 0,
          avaliacao: avaliacaoPorIteracao.get(iteracao) || 0,
        });
      });

    return data;
  }, [estatisticasMonitoradas]);

  // Calcula métricas agregadas
  const metrics = useMemo(() => {
    const iteracoes = estatisticasMonitoradas.iteracoes || 0;
    const tempoPorIteracao =
      estatisticasMonitoradas.tempoPorIteracao || new Map();
    const avaliacaoPorIteracao =
      estatisticasMonitoradas.avaliacaoPorIteracao || new Map();

    // Tempo médio por iteração
    const tempos = Array.from(tempoPorIteracao.values());
    const tempoMedio =
      tempos.length > 0
        ? (tempos.reduce((a, b) => a + b, 0) / tempos.length).toFixed(2)
        : "0.00";

    // Melhor avaliação
    const avaliacoes = Array.from(avaliacaoPorIteracao.values());
    const melhorAvaliacao =
      avaliacoes.length > 0 ? Math.max(...avaliacoes).toFixed(2) : "0.00";

    return {
      iteracoes,
      tempoMedio: `${tempoMedio}ms`,
      melhorAvaliacao,
    };
  }, [estatisticasMonitoradas]);

  // Helper para textos dinâmicos
  const getStatusMessage = () => {
    if (stage === "preprocessing") return t("StatusMessages.preprocessing");
    if (processing) return t("StatusMessages.solving");
    return t("StatusMessages.completed");
  };

  const getSubMessage = () => {
    if (stage === "preprocessing") return t("SubMessages.preprocessing");
    if (processing) return t("SubMessages.solving");
    return t("SubMessages.completed");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle id="alert-dialog-title">
        {stage === "preprocessing"
          ? t("Stage.preprocessing")
          : t("Stage.solving")}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" sx={{ mb: 2 }}>
          {getStatusMessage()}
        </DialogContentText>

        <Typography variant="caption" color="text.secondary" component="p">
          {getSubMessage()}
        </Typography>
        {/* Exibição condicional baseada no estágio */}
        {stage === "preprocessing" ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              {t("Stage.preprocessingDescription")}
            </Typography>
          </Box>
        ) : (
          <Fade in={true}>
            <Box>
              <Box sx={{ width: "100%", mb: 3 }}>
                <LinearProgressWithLabel
                  value={progressPercentage()}
                  progress={progress}
                  t={t}
                />
              </Box>

              {/* Cards de métricas */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MetricCard
                    title={t("Metrics.iterations")}
                    value={metrics.iteracoes}
                    icon={<LoopIcon />}
                    color="primary"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MetricCard
                    title={t("Metrics.averageTime")}
                    value={metrics.tempoMedio}
                    icon={<TimerIcon />}
                    color="info"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MetricCard
                    title={t("Metrics.bestRating")}
                    value={metrics.melhorAvaliacao}
                    icon={<TrendingUpIcon />}
                    color="success"
                  />
                </Grid>
              </Grid>

              {/* Tabs para diferentes visualizações */}
              {chartData.length > 0 && (
                <Box sx={{ width: "100%" }}>
                  <Tabs
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                    sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
                  >
                    <Tab label={t("Chart.evaluationPerIteration")} />
                    <Tab label={t("Chart.timePerIteration")} />
                  </Tabs>

                  {/* Gráfico de Avaliação */}
                  {tabValue === 0 && (
                    <Box sx={{ width: "100%", height: 300 }}>
                      {/* <ChartContainer> */}
                      <LineChart
                        xAxis={[
                          {
                            data: chartData.map((item) => item.iteracao),
                            label: t("Metrics.iterations"),
                          },
                        ]}
                        series={[
                          {
                            data: Array.from(
                              chartData.map((item) => item.avaliacao),
                            ),
                            label: t("Metrics.evaluation"),
                            color: "#4caf50",
                          },
                        ]}
                        grid={{ vertical: true, horizontal: true }}
                        height={300}
                        margin={{ left: 75, right: 75 }}
                      />
                      {/* </ChartContainer> */}
                    </Box>
                  )}

                  {/* Gráfico de Tempo */}
                  {tabValue === 1 && (
                    <Box sx={{ width: "100%", height: 300 }}>
                      {/* <ChartContainer> */}
                      <LineChart
                        xAxis={[
                          {
                            data: chartData.map((item) => item.iteracao),
                            label: t("Metrics.iterations"),
                          },
                        ]}
                        series={[
                          {
                            data: Array.from(
                              chartData.map((item) => item.tempo),
                            ),
                            label: t("Metrics.time"),
                            color: "#1C77C3",
                          },
                        ]}
                        grid={{ vertical: true, horizontal: true }}
                        height={300}
                        margin={{ left: 75, right: 75 }}
                      />
                      {/* </ChartContainer> */}
                    </Box>
                  )}
                </Box>
              )}

              {!processing && (
                <DialogContentText id="alert-dialog-description">
                  {t("description")}
                </DialogContentText>
              )}
            </Box>
          </Fade>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onStop}
          variant="contained"
          disabled={!processing}
          color="error"
        >
          {t("stop")}
        </Button>
        <Button
          variant={processing ? "outlined" : "contained"}
          loading={processing}
          onClick={onApply}
        >
          {t("apply")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
