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
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TimerIcon from "@mui/icons-material/Timer";
import LoopIcon from "@mui/icons-material/Loop";
import LinearProgress, {
  type LinearProgressProps,
} from "@mui/material/LinearProgress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Estatisticas } from "@/algoritmo/communs/interfaces/interfaces";

export interface IProgressBar {
  total: number;
  current: number;
}

interface AlgoritmoDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  onStop: () => void;
  processing: boolean;
  progress: IProgressBar;
  estatisticasMonitoradas: Partial<Estatisticas>;
}

/**
 * Componente de barra de progresso com label
 */
function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number; progress: IProgressBar }
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Tooltip
          title={`Alocações: ${props.progress.current} de ${props.progress.total}`}
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
}: AlgoritmoDialogProps) {
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
        {"Execução do algoritmo"}
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
          O processo está sendo executado e logo será possível aplicar a solução
          encontrada.
        </DialogContentText>
        <Box sx={{ width: "100%", mb: 3 }}>
          <LinearProgressWithLabel
            value={progressPercentage()}
            progress={progress}
          />
        </Box>

        {/* Cards de métricas */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <MetricCard
              title="Iterações"
              value={metrics.iteracoes}
              icon={<LoopIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MetricCard
              title="Tempo Médio"
              value={metrics.tempoMedio}
              icon={<TimerIcon />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MetricCard
              title="Melhor Avaliação"
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
              <Tab label="Avaliação por Iteração" />
              <Tab label="Tempo por Iteração" />
            </Tabs>

            {/* Gráfico de Avaliação */}
            {tabValue === 0 && (
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="iteracao"
                      label={{
                        value: "Iteração",
                        position: "insideBottom",
                        offset: -5,
                      }}
                    />
                    <YAxis
                      label={{
                        value: "Avaliação",
                        angle: -90,
                        position: "insideLeft",
                      }}
                      domain={["auto", "auto"]}
                    />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avaliacao"
                      stroke="#4caf50"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Avaliação"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}

            {/* Gráfico de Tempo */}
            {tabValue === 1 && (
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="iteracao"
                      label={{
                        value: "Iteração",
                        position: "insideBottom",
                        offset: -5,
                      }}
                    />
                    <YAxis
                      label={{
                        value: "Tempo (ms)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tempo"
                      stroke="#2196f3"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Tempo (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>
        )}

        {!processing && (
          <DialogContentText id="alert-dialog-description">
            O processo foi concluído! Agora você pode aplicar a solução ou
            fechar esta tela clicando no X localizado acima.
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onStop}
          variant="contained"
          disabled={!processing}
          color="error"
        >
          Parar
        </Button>
        <LoadingButton
          variant={processing ? "outlined" : "contained"}
          loading={processing}
          onClick={onApply}
        >
          Aplicar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
