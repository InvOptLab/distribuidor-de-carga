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
import { useTranslations } from "next-intl";

interface LineChartsSelectorProps {
  solucao: HistoricoSolucao;
}

export default function LineChartsSelector({
  solucao,
}: LineChartsSelectorProps) {
  const t = useTranslations("Components.LineChartsSelector");
  const [selectedCharts, setSelectedCharts] = React.useState(
    new Set<string>([t("evaluation")])
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
            {t("noInfoSelected")}
          </Typography>
        </Box>
      );
    }

    const estatisticas = solucao.solucao.estatisticas;
    const iteracoes = Array.from(estatisticas.avaliacaoPorIteracao.keys());

    const series = [];
    const xAxis = { label: t("iterations"), data: iteracoes };

    if (selectedCharts.has(t("evaluation"))) {
      const avaliacaoData = Array.from(
        estatisticas.avaliacaoPorIteracao.values()
      );
      series.push({ label: t("evaluation"), data: avaliacaoData });
    }
    if (selectedCharts.has(t("time"))) {
      const tempoData = Array.from(estatisticas.tempoPorIteracao.values());
      series.push({ label: t("timeMs"), data: tempoData });
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
              value={t("evaluation")}
              checked={selectedCharts.has(t("evaluation"))}
              onChange={handleToggleSelectedCharts}
            />
          }
          label={t("evaluation")}
        />
        <FormControlLabel
          control={
            <Checkbox
              value={t("time")}
              checked={selectedCharts.has(t("time"))}
              onChange={handleToggleSelectedCharts}
            />
          }
          label={t("time")}
        />
      </FormGroup>
      <Divider />
      {renderLineChart()}
    </Box>
  );
}
