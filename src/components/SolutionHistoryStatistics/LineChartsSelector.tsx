import { HistoricoSolucao } from "@/context/Global/utils";
import {
  Box,
  Divider,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import { LineChart } from "@mui/x-charts";
import React from "react";

interface LineChartsSelectorProps {
  solucao: HistoricoSolucao;
}

export default function LineChartsSelector({
  solucao,
}: LineChartsSelectorProps) {
  const [selectedCharts, setSelectedCharts] = React.useState(
    new Set<string>(["Avaliação"])
  );

  const handleToggleSelectedCharts = (event) => {
    const { value } = event.target;
    setSelectedCharts((prevSelectedCharts) => {
      const newSelectedValues = new Set(prevSelectedCharts);
      if (newSelectedValues.has(value)) {
        newSelectedValues.delete(value);
      } else {
        newSelectedValues.add(value);
      }
      return newSelectedValues;
    });
  };

  const renderLineChart = () => {
    if (selectedCharts.size === 0) {
      return (
        <Box height="100%" alignContent="center">
          <Typography variant="h6" color="error" align="center">
            Nenhuma informação selecionada!
          </Typography>
        </Box>
      );
    }

    const estatisticas = solucao.solucao.estatisticas;
    const iteracoes = Array.from(estatisticas.avaliacaoPorIteracao.keys());

    const series = [];
    const xAxis = { label: "Iterações", data: iteracoes };

    if (selectedCharts.has("Avaliação")) {
      const avaliacaoData = Array.from(
        estatisticas.avaliacaoPorIteracao.values()
      );
      series.push({ label: "Avaliação", data: avaliacaoData });
    }
    if (selectedCharts.has("Tempo")) {
      const tempoData = Array.from(estatisticas.tempoPorIteracao.values());
      series.push({ label: "Tempo (ms)", data: tempoData });
    }

    return (
      <LineChart
        xAxis={[xAxis]}
        yAxis={series.map((s) => ({ label: s.label }))}
        series={series}
        grid={{ vertical: true, horizontal: true }}
        height={300}
      />
    );
  };

  return (
    <Box>
      <FormGroup row sx={{ alignItems: "center", justifyContent: "center" }}>
        <FormControlLabel
          control={
            <Checkbox
              value="Avaliação"
              checked={selectedCharts.has("Avaliação")}
              onChange={handleToggleSelectedCharts}
            />
          }
          label="Avaliação"
        />
        <FormControlLabel
          control={
            <Checkbox
              value="Tempo"
              checked={selectedCharts.has("Tempo")}
              onChange={handleToggleSelectedCharts}
            />
          }
          label="Tempo"
        />
      </FormGroup>
      <Divider />
      {renderLineChart()}
    </Box>
  );
}
