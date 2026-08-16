import React from "react";
import { Box, Typography, Card, CardContent, Alert, Grid } from "@mui/material";
import { HistoricoSolucao } from "@/context/Global/utils";
import ConstraintsBarCharts from "./ConstraintsBarCharts";
import ConstraintDiagnostics from "./ConstraintDiagnostics";
import { useTranslations } from "next-intl";

interface ConstraintsTabProps {
  solucao: HistoricoSolucao;
}

export default function ConstraintsTab({ solucao }: ConstraintsTabProps) {
  const t = useTranslations("Pages.Statistics.SolutionHistoryDetails");
  const tGlobal = useTranslations();

  const selectOcorrenciasToDisplay = (
    mapa: Map<string, { label: string; qtd: number; items?: string[] }[]>,
    type: "restricoes" | "objetivos",
  ): Map<string, { label: string; qtd: number; items?: string[] }[]> => {
    const mapaFiltrado = new Map<
      string,
      { label: string; qtd: number; items?: string[] }[]
    >();
    mapa.forEach((value, key) => {
      // Simplification based on typical algorithm setup
      // Usually, objectives have specific names in the algorithm
      const isObjective = key === "MinimizarDiferencaSaldos" || key === "MinimizarUtilizacaoSaldos" || key === "PrioridadesDefault";
      
      if (type === "restricoes" && !isObjective) {
        mapaFiltrado.set(key, value);
      } else if (type === "objetivos" && isObjective) {
        mapaFiltrado.set(key, value);
      }
    });

    return mapaFiltrado;
  };

  const hasConstraintsData =
    solucao.solucao.estatisticas &&
    solucao.solucao.estatisticas.qtdOcorrenciasRestricoes &&
    solucao.solucao.estatisticas.qtdOcorrenciasRestricoes.size > 0;

  return (
    <Box sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        {tGlobal("Pages.Statistics.Constraints.tabTitle")}
      </Typography>

      {hasConstraintsData ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                  {t("histogramConstraintsTitle")}
                </Typography>
                <ConstraintsBarCharts
                  ocorrencias={selectOcorrenciasToDisplay(
                    solucao.solucao.estatisticas.qtdOcorrenciasRestricoes!,
                    "restricoes",
                  )}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ConstraintDiagnostics
              ocorrencias={selectOcorrenciasToDisplay(
                solucao.solucao.estatisticas.qtdOcorrenciasRestricoes!,
                "restricoes",
              )}
            />
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          {tGlobal("Pages.Statistics.Constraints.noConstraintData")}
        </Alert>
      )}
    </Box>
  );
}
