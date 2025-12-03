"use client";

import type { HistoricoSolucao } from "@/context/Global/utils";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid as Grid,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { useState } from "react";
import WorkloadHistogramChart from "./WorkloadHistogramChart";
import ChartContainer from "@/app/statistics/_components/ChartContainer";
import { BarChartExportData } from "@/lib/chart-exporter";

interface ConstraintViolationsChartProps {
  solutionA: HistoricoSolucao;
  solutionB: HistoricoSolucao;
}

export default function ConstraintViolationsChart({
  solutionA,
  solutionB,
}: ConstraintViolationsChartProps) {
  const [currentTab, setCurrentTab] = useState(0);

  // Cores para o gráfico de pizza
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FFC658",
    "#FF7C7C",
  ];

  // Função para extrair dados de violações de restrições (versão agrupada)
  const extractConstraintData = (solution: HistoricoSolucao) => {
    const violations =
      solution.solucao.estatisticas?.qtdOcorrenciasRestricoes || new Map();
    const data: {
      name: string;
      violations: { label: string; qtd: number }[];
    }[] = [];

    violations.forEach((violationList, constraintName) => {
      let processedViolations = violationList;

      // Para "Carga de Trabalho", usar apenas os 2 primeiros elementos (valores agrupados)
      if (constraintName === "Carga de Trabalho") {
        processedViolations = violationList.slice(0, 2);
      }

      data.push({
        name: constraintName,
        violations: processedViolations,
      });
    });

    return data;
  };

  const dataA = extractConstraintData(solutionA);
  const dataB = extractConstraintData(solutionB);

  // Preparar dados para gráfico de barras comparativo
  const prepareBarChartData = () => {
    const allConstraints = new Set([
      ...dataA.map((d) => d.name),
      ...dataB.map((d) => d.name),
    ]);

    return Array.from(allConstraints).map((constraintName) => {
      const violationsA =
        dataA.find((d) => d.name === constraintName)?.violations || [];
      const violationsB =
        dataB.find((d) => d.name === constraintName)?.violations || [];

      const totalA = violationsA.reduce((sum, v) => sum + v.qtd, 0);
      const totalB = violationsB.reduce((sum, v) => sum + v.qtd, 0);

      return {
        constraint: constraintName,
        solucaoA: totalA,
        solucaoB: totalB,
      };
    });
  };

  // Preparar dados para gráfico de pizza
  const preparePieChartData = (
    data: { name: string; violations: { label: string; qtd: number }[] }[]
  ) => {
    return data.map((constraint, index) => ({
      id: index,
      value: constraint.violations.reduce((sum, v) => sum + v.qtd, 0),
      label: constraint.name,
      color: COLORS[index % COLORS.length],
    }));
  };

  const barChartData = prepareBarChartData();
  const pieDataA = preparePieChartData(dataA);
  const pieDataB = preparePieChartData(dataB);

  // Calcular totais
  const totalViolationsA = pieDataA.reduce((sum, item) => sum + item.value, 0);
  const totalViolationsB = pieDataB.reduce((sum, item) => sum + item.value, 0);

  // Configuração das séries para gráficos de barras com valueFormatter
  const barSeries = [
    {
      dataKey: "solucaoA",
      label: "Solução A",
      color: "#1976d2",
      valueFormatter: (
        value: number | null,
        { dataIndex }: { dataIndex: number }
      ) => {
        if (value === null) return "";
        const data = barChartData[dataIndex];
        return `${data.constraint}: ${value} violações`;
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
        const data = barChartData[dataIndex];
        return `${data.constraint}: ${value} violações`;
      },
    },
  ];

  const exportData: BarChartExportData = {
    xAxis: {
      // Pega os dados do eixo X do 'barChartData'
      data: barChartData.map((item) => item.constraint),
      // Pega a label da config do BarChart (linha 238)
      label: "Restrições",
    },
    yAxis: {
      // Pega a label da config do BarChart (linha 243)
      label: "Número de Violações",
    },
    series: [
      {
        // Pega os dados da 'solucaoA' do 'barChartData'
        data: barChartData.map((item) => item.solucaoA),
        label: "Solução A",
        color: "#1976d2", // Cor da 'barSeries'
      },
      {
        // Pega os dados da 'solucaoB' do 'barChartData'
        data: barChartData.map((item) => item.solucaoB),
        label: "Solução B",
        color: "#dc004e", // Cor da 'barSeries'
      },
    ],
    // Habilita os valores nas barras, com base no 'barLabel' (linha 256)
    showBarValues: true,
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Análise de Violações de Restrições
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
                {totalViolationsA}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Violações - Solução A
              </Typography>
              <Chip
                label={`${dataA.length} tipos de restrições`}
                size="small"
                color="primary"
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
                {totalViolationsB}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Violações - Solução B
              </Typography>
              <Chip
                label={`${dataB.length} tipos de restrições`}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Tabs para diferentes visualizações */}
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="Comparação por Barras" />
          <Tab label="Distribuição - Solução A" />
          <Tab label="Distribuição - Solução B" />
          <Tab label="Histograma - Carga de Trabalho" />
        </Tabs>

        {/* Gráfico de Barras Comparativo */}
        {currentTab === 0 && (
          <Box sx={{ width: "100%", height: 400 }}>
            {barChartData.length > 0 ? (
              <ChartContainer chartData={exportData}>
                <BarChart
                  dataset={barChartData}
                  xAxis={[
                    {
                      scaleType: "band",
                      dataKey: "constraint",
                      label: "Restrições",
                    },
                  ]}
                  yAxis={[
                    {
                      label: "Número de Violações",
                    },
                  ]}
                  series={barSeries}
                  width={undefined}
                  height={400}
                  margin={{ left: 75, right: 75 }}
                  slotProps={{
                    legend: {
                      direction: "vertical",
                      position: { vertical: "top", horizontal: "center" },
                    },
                  }}
                  barLabel="value"
                  grid={{ vertical: false, horizontal: true }}
                />
              </ChartContainer>
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
                  Nenhuma violação de restrição encontrada
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Gráfico de Pizza - Solução A */}
        {currentTab === 1 && (
          <Box sx={{ width: "100%", height: 400 }}>
            {pieDataA.length > 0 && totalViolationsA > 0 ? (
              <PieChart
                series={[
                  {
                    data: pieDataA,
                    highlightScope: { fade: "global", highlight: "item" },
                    faded: {
                      innerRadius: 30,
                      additionalRadius: -30,
                      color: "gray",
                    },
                    valueFormatter: (item, { dataIndex }) => {
                      const data = pieDataA[dataIndex];
                      return `${data.label}: ${item.value} violações`;
                    },
                  },
                ]}
                width={undefined}
                height={400}
                margin={{ right: 200 }}
                slotProps={{
                  legend: {
                    direction: "vertical",
                    position: { vertical: "middle", horizontal: "end" },
                    // padding: 0
                  },
                }}
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
                  Nenhuma violação de restrição encontrada na Solução A
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Gráfico de Pizza - Solução B */}
        {currentTab === 2 && (
          <Box sx={{ width: "100%", height: 400 }}>
            {pieDataB.length > 0 && totalViolationsB > 0 ? (
              <PieChart
                series={[
                  {
                    data: pieDataB,
                    highlightScope: { fade: "global", highlight: "item" },
                    faded: {
                      innerRadius: 30,
                      additionalRadius: -30,
                      color: "gray",
                    },
                    valueFormatter: (item, { dataIndex }) => {
                      const data = pieDataB[dataIndex];
                      return `${data.label}: ${item.value} violações`;
                    },
                  },
                ]}
                width={undefined}
                height={400}
                margin={{ right: 200 }}
                slotProps={{
                  legend: {
                    direction: "vertical",
                    position: { vertical: "middle", horizontal: "end" },
                    // padding: 0,
                  },
                }}
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
                  Nenhuma violação de restrição encontrada na Solução B
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Histograma de Carga de Trabalho - Componente Separado */}
        {currentTab === 3 && (
          <WorkloadHistogramChart solutionA={solutionA} solutionB={solutionB} />
        )}

        {/* Análise Comparativa */}
        <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Análise Comparativa:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip
              label={`Diferença Total: ${
                totalViolationsB - totalViolationsA > 0 ? "+" : ""
              }${totalViolationsB - totalViolationsA}`}
              color={
                totalViolationsB - totalViolationsA === 0
                  ? "default"
                  : totalViolationsB < totalViolationsA
                  ? "success"
                  : "error"
              }
              size="small"
            />
            {totalViolationsB < totalViolationsA && (
              <Chip
                label="Solução B tem menos violações"
                color="success"
                size="small"
                variant="outlined"
              />
            )}
            {totalViolationsA < totalViolationsB && (
              <Chip
                label="Solução A tem menos violações"
                color="success"
                size="small"
                variant="outlined"
              />
            )}
            {totalViolationsA === totalViolationsB &&
              totalViolationsA === 0 && (
                <Chip
                  label="Ambas as soluções são perfeitas!"
                  color="success"
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
