"use client";

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
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import { HistoricoSolucao } from "@/context/Global/utils";

interface StatisticsComparisonProps {
  solutionA: HistoricoSolucao;
  solutionB: HistoricoSolucao;
}

export default function StatisticsComparison({
  solutionA,
  solutionB,
}: StatisticsComparisonProps) {
  const statsA = solutionA.solucao.estatisticas;
  const statsB = solutionB.solucao.estatisticas;

  const getTrendIcon = (
    valueA: number,
    valueB: number,
    lowerIsBetter = false
  ) => {
    if (valueA === valueB) return <TrendingFlatIcon color="action" />;

    const isImprovement = lowerIsBetter ? valueB < valueA : valueB > valueA;
    return isImprovement ? (
      <TrendingUpIcon color="success" />
    ) : (
      <TrendingDownIcon color="error" />
    );
  };

  const formatDifference = (
    valueA: number,
    valueB: number,
    unit = "",
    decimals = 2
  ) => {
    const diff = valueB - valueA;
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff.toFixed(decimals)}${unit}`;
  };

  const getPercentageChange = (valueA: number, valueB: number) => {
    if (valueA === 0) return valueB === 0 ? "0%" : "∞%";
    const change = ((valueB - valueA) / valueA) * 100;
    const sign = change > 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  const comparisonData = [
    {
      metric: "Avaliação",
      valueA: solutionA.solucao.avaliacao || 0,
      valueB: solutionB.solucao.avaliacao || 0,
      unit: "",
      lowerIsBetter: true,
      format: (val: number) => val.toFixed(2),
    },
    {
      metric: "Iterações",
      valueA: statsA?.iteracoes || 0,
      valueB: statsB?.iteracoes || 0,
      unit: "",
      lowerIsBetter: false,
      format: (val: number) => val.toString(),
    },
    {
      metric: "Tempo de Execução",
      valueA: statsA?.tempoExecucao || 0,
      valueB: statsB?.tempoExecucao || 0,
      unit: "s",
      lowerIsBetter: true,
      format: (val: number) => val.toFixed(2),
    },
  ];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Comparação de Estatísticas
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Métrica</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Solução A</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Solução B</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Diferença</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Variação</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Tendência</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisonData.map((row) => (
                <TableRow key={row.metric}>
                  <TableCell component="th" scope="row">
                    {row.metric}
                  </TableCell>
                  <TableCell align="center">
                    {row.format(row.valueA)}
                    {row.unit}
                  </TableCell>
                  <TableCell align="center">
                    {row.format(row.valueB)}
                    {row.unit}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={formatDifference(row.valueA, row.valueB, row.unit)}
                      size="small"
                      color={
                        row.valueA === row.valueB
                          ? "default"
                          : (
                              row.lowerIsBetter
                                ? row.valueB < row.valueA
                                : row.valueB > row.valueA
                            )
                          ? "success"
                          : "error"
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {getPercentageChange(row.valueA, row.valueB)}
                  </TableCell>
                  <TableCell align="center">
                    {getTrendIcon(row.valueA, row.valueB, row.lowerIsBetter)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Status de Interrupção */}
        <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "center" }}>
          <Chip
            label={`Solução A: ${
              statsA?.interrupcao ? "Interrompida" : "Completa"
            }`}
            color={statsA?.interrupcao ? "warning" : "success"}
            variant="outlined"
          />
          <Chip
            label={`Solução B: ${
              statsB?.interrupcao ? "Interrompida" : "Completa"
            }`}
            color={statsB?.interrupcao ? "warning" : "success"}
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );
}
