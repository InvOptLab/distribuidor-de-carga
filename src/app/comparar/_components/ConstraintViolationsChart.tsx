"use client";

import { HistoricoSolucao } from "@/context/Global/utils";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid2 as Grid,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { useState } from "react";

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

  // Função para obter cor baseada no valor (para histograma de carga de trabalho)
  const getWorkloadColor = (value: number): string => {
    if (value === 0) return "#FFC107"; // Amarelo
    if (value === 1) return "#81C784"; // Verde claro
    if (value === 2) return "#1976D2"; // Azul escuro

    // Para valores >= 3, tons de vermelho progressivos
    const intensity = Math.min(value / 10, 1); // Normalizar para máximo de 10
    const red = Math.floor(255 * (0.5 + intensity * 0.5)); // De 128 a 255
    const green = Math.floor(128 * (1 - intensity)); // De 128 a 0
    const blue = Math.floor(128 * (1 - intensity)); // De 128 a 0

    return `rgb(${red}, ${green}, ${blue})`;
  };

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

  // Função para extrair dados detalhados da "Carga de Trabalho"
  const extractWorkloadDetailData = (solution: HistoricoSolucao) => {
    const violations =
      solution.solucao.estatisticas?.qtdOcorrenciasRestricoes || new Map();
    const workloadViolations = violations.get("Carga de Trabalho") || [];

    // Pegar todos os elementos exceto os 2 primeiros (que são os agrupados)
    return workloadViolations.slice(2).map((item, index) => ({
      carga: item.label,
      quantidade: item.qtd,
      valor: Number.parseInt(item.label) || index + 3, // Usar o label como valor numérico
    }));
  };

  const dataA = extractConstraintData(solutionA);
  const dataB = extractConstraintData(solutionB);
  const workloadDetailA = extractWorkloadDetailData(solutionA);
  const workloadDetailB = extractWorkloadDetailData(solutionB);

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

  // Preparar dados para histograma de carga de trabalho
  const prepareWorkloadHistogramData = () => {
    // Combinar dados das duas soluções
    const allCargas = new Set([
      ...workloadDetailA.map((item) => item.carga),
      ...workloadDetailB.map((item) => item.carga),
    ]);

    return Array.from(allCargas)
      .sort((a, b) => {
        // Ordenar numericamente se possível
        const numA = Number.parseInt(a);
        const numB = Number.parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a.localeCompare(b);
      })
      .map((carga) => {
        const itemA = workloadDetailA.find((item) => item.carga === carga);
        const itemB = workloadDetailB.find((item) => item.carga === carga);
        const valor = Number.parseInt(carga) || 0;

        return {
          carga,
          solucaoA: itemA?.quantidade || 0,
          solucaoB: itemB?.quantidade || 0,
          valor,
          color: getWorkloadColor(valor),
        };
      });
  };

  const barChartData = prepareBarChartData();
  const pieDataA = preparePieChartData(dataA);
  const pieDataB = preparePieChartData(dataB);
  const workloadHistogramData = prepareWorkloadHistogramData();

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

  // Configuração das séries para histograma de carga de trabalho com valueFormatter
  const workloadSeries = [
    {
      dataKey: "solucaoA",
      label: "Solução A",
      color: "#1976d2",
      valueFormatter: (
        value: number | null,
        { dataIndex }: { dataIndex: number }
      ) => {
        if (value === null) return "";
        const data = workloadHistogramData[dataIndex];
        return `${data.carga}: ${value} docentes`;
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
        const data = workloadHistogramData[dataIndex];
        return `${data.carga} disciplinas: ${value} docentes`;
      },
    },
  ];

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
                margin={{ left: 80, right: 20, top: 20, bottom: 100 }}
                slotProps={{
                  legend: {
                    direction: "row",
                    position: { vertical: "top", horizontal: "middle" },
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
                    highlightScope: { faded: "global", highlighted: "item" },
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
                    direction: "column",
                    position: { vertical: "middle", horizontal: "right" },
                    padding: 0,
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
                    highlightScope: { faded: "global", highlighted: "item" },
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
                    direction: "column",
                    position: { vertical: "middle", horizontal: "right" },
                    padding: 0,
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

        {/* Histograma de Carga de Trabalho */}
        {currentTab === 3 && (
          <Box sx={{ width: "100%", height: 400 }}>
            {workloadHistogramData.length > 0 ? (
              <>
                {/* Legenda de Cores */}
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    justifyContent: "center",
                  }}
                >
                  <Chip
                    label="0 disciplinas"
                    size="small"
                    sx={{ bgcolor: "#FFC107", color: "black" }}
                  />
                  <Chip
                    label="1 disciplina"
                    size="small"
                    sx={{ bgcolor: "#81C784", color: "white" }}
                  />
                  <Chip
                    label="2 disciplinas"
                    size="small"
                    sx={{ bgcolor: "#1976D2", color: "white" }}
                  />
                  <Chip
                    label="3+ disciplinas"
                    size="small"
                    sx={{ bgcolor: "#D32F2F", color: "white" }}
                  />
                </Box>

                <BarChart
                  dataset={workloadHistogramData}
                  xAxis={[
                    {
                      scaleType: "band",
                      dataKey: "carga",
                      label: "Número de Disciplinas por Docente",
                    },
                  ]}
                  yAxis={[
                    {
                      label: "Quantidade de Docentes",
                    },
                  ]}
                  series={workloadSeries}
                  width={undefined}
                  height={400}
                  margin={{ left: 80, right: 20, top: 20, bottom: 80 }}
                  slotProps={{
                    legend: {
                      direction: "row",
                      position: { vertical: "top", horizontal: "middle" },
                    },
                  }}
                />
              </>
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
                  Nenhum dado detalhado de carga de trabalho encontrado
                </Typography>
              </Box>
            )}
          </Box>
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
            {currentTab === 3 && workloadHistogramData.length > 0 && (
              <Chip
                label={`${workloadHistogramData.length} níveis de carga analisados`}
                color="info"
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
