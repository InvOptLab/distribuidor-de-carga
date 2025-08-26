"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid2 as Grid,
  Chip,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useGlobalContext } from "@/context/Global";
import { HistoricoSolucao } from "@/context/Global/utils";

interface PriorityDistributionChartProps {
  solutionA: HistoricoSolucao;
  solutionB: HistoricoSolucao;
}

export default function PriorityDistributionChart({
  solutionA,
  solutionB,
}: PriorityDistributionChartProps) {
  const { formularios } = useGlobalContext();

  // Função para calcular distribuição de prioridades para uma solução
  const calculatePriorityDistribution = (solution: HistoricoSolucao) => {
    const priorityCount = new Map<number, number>();

    // Contar prioridades das atribuições
    solution.solucao.atribuicoes.forEach((atribuicao) => {
      atribuicao.docentes.forEach((docenteNome) => {
        // Buscar a prioridade do docente para esta disciplina
        const formulario = formularios.find(
          (f) =>
            f.id_disciplina === atribuicao.id_disciplina &&
            f.nome_docente === docenteNome
        );

        if (formulario) {
          const prioridade = formulario.prioridade;
          priorityCount.set(
            prioridade,
            (priorityCount.get(prioridade) || 0) + 1
          );
        }
      });
    });

    return priorityCount;
  };

  // Calcular distribuições
  const distributionA = calculatePriorityDistribution(solutionA);
  const distributionB = calculatePriorityDistribution(solutionB);

  // Obter todas as prioridades únicas
  const allPriorities = new Set([
    ...distributionA.keys(),
    ...distributionB.keys(),
  ]);
  const sortedPriorities = Array.from(allPriorities).sort((a, b) => a - b);

  // Preparar dados para o gráfico
  const chartData = sortedPriorities.map((priority) => ({
    prioridade: priority,
    solucaoA: distributionA.get(priority) || 0,
    solucaoB: distributionB.get(priority) || 0,
  }));

  // Calcular totais
  const totalA = Array.from(distributionA.values()).reduce(
    (sum, count) => sum + count,
    0
  );
  const totalB = Array.from(distributionB.values()).reduce(
    (sum, count) => sum + count,
    0
  );

  // CORRIGIDO: Calcular médias ponderadas (menores valores = melhores prioridades)
  const calculateWeightedAverage = (distribution: Map<number, number>) => {
    let totalWeight = 0;
    let totalCount = 0;

    distribution.forEach((count, priority) => {
      totalWeight += priority * count;
      totalCount += count;
    });

    return totalCount > 0 ? totalWeight / totalCount : 0;
  };

  const avgA = calculateWeightedAverage(distributionA);
  const avgB = calculateWeightedAverage(distributionB);

  // Configuração das séries com valueFormatter
  const series = [
    {
      dataKey: "solucaoA",
      label: "Solução A",
      color: "#1976d2",
      valueFormatter: (
        value: number | null,
        { dataIndex }: { dataIndex: number }
      ) => {
        if (value === null) return "";
        const data = chartData[dataIndex];
        return `Prioridade ${data.prioridade}: ${value} atribuições`;
      },
    },
    {
      dataKey: "solucaoB",
      label: "Solução B",
      color: "#dc004e",
      valueFormatter: (
        value: number | null,
        { dataIndex }: { dataIndex: number }
      ) => {
        if (value === null) return "";
        const data = chartData[dataIndex];
        return `Prioridade ${data.prioridade}: ${value} atribuições`;
      },
    },
  ];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Distribuição de Atribuições por Prioridade
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Menores valores de prioridade representam maior importância (1 =
          máxima prioridade)
        </Typography>

        {/* Estatísticas Resumidas */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                textAlign: "center",
                p: 2,
                bgcolor: "primary.50",
                borderRadius: 1,
              }}
            >
              <Typography variant="h4" color="primary.main">
                {totalA}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Atribuições - Solução A
              </Typography>
              <Chip
                label={`Média: ${avgA.toFixed(1)} (${
                  avgA <= 3 ? "Excelente" : avgA <= 6 ? "Boa" : "Regular"
                })`}
                size="small"
                color={avgA <= 3 ? "success" : avgA <= 6 ? "warning" : "error"}
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                textAlign: "center",
                p: 2,
                bgcolor: "secondary.50",
                borderRadius: 1,
              }}
            >
              <Typography variant="h4" color="secondary.main">
                {totalB}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Atribuições - Solução B
              </Typography>
              <Chip
                label={`Média: ${avgB.toFixed(1)} (${
                  avgB <= 3 ? "Excelente" : avgB <= 6 ? "Boa" : "Regular"
                })`}
                size="small"
                color={avgB <= 3 ? "success" : avgB <= 6 ? "warning" : "error"}
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Gráfico */}
        <Box sx={{ width: "100%", height: 400 }}>
          {chartData.length > 0 ? (
            <BarChart
              dataset={chartData}
              xAxis={[
                {
                  scaleType: "band",
                  dataKey: "prioridade",
                  label: "Prioridade (menor = melhor)",
                },
              ]}
              yAxis={[
                {
                  label: "Quantidade de Atribuições",
                },
              ]}
              grid={{ vertical: false, horizontal: true }}
              series={series}
              width={undefined}
              height={400}
              margin={{ left: 75, right: 75 }}
              slotProps={{
                legend: {
                  direction: "row",
                  position: { vertical: "top", horizontal: "middle" },
                },
              }}
              barLabel="value"
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Nenhum dado de prioridade encontrado
              </Typography>
            </Box>
          )}
        </Box>

        {/* CORRIGIDO: Análise Comparativa */}
        <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Análise Comparativa:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip
              label={`Diferença Total: ${totalB - totalA > 0 ? "+" : ""}${
                totalB - totalA
              }`}
              color={
                totalB - totalA === 0
                  ? "default"
                  : totalB > totalA
                  ? "success"
                  : "error"
              }
              size="small"
            />
            <Chip
              label={`Diferença Média: ${avgB - avgA > 0 ? "+" : ""}${(
                avgB - avgA
              ).toFixed(2)}`}
              color={
                Math.abs(avgB - avgA) < 0.1
                  ? "default"
                  : avgA > avgB
                  ? "success"
                  : "error"
              }
              size="small"
            />
            {avgA > avgB && (
              <Chip
                label="Solução B tem prioridades melhores"
                color="success"
                size="small"
                variant="outlined"
              />
            )}
            {avgB > avgA && (
              <Chip
                label="Solução A tem prioridades melhores"
                color="success"
                size="small"
                variant="outlined"
              />
            )}
            {Math.abs(avgA - avgB) < 0.1 && (
              <Chip
                label="Prioridades equivalentes"
                color="default"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
