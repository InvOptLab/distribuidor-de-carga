"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Divider,
  Alert,
  Grid as Grid,
} from "@mui/material";
import { useAlgorithmContext } from "@/context/Algorithm";
import { useTranslations } from "next-intl";

export default function SimulatedAnnealingConfig() {
  const { parametros, setParametros } = useAlgorithmContext();
  const t = useTranslations("Pages.Config.SimulatedAnnealing");

  const [initialTemperature, setInitialTemperature] = useState(
    parametros.saConfig?.initialTemperature || 10000
  );
  const [coolingRate, setCoolingRate] = useState(
    parametros.saConfig?.coolingRate || 0.95
  );
  const [iterationsPerTemperature, setIterationsPerTemperature] = useState(
    parametros.saConfig?.iterationsPerTemperature || 100
  );

  useEffect(() => {
    if (parametros.saConfig) {
      setInitialTemperature(parametros.saConfig.initialTemperature);
      setCoolingRate(parametros.saConfig.coolingRate);
      setIterationsPerTemperature(parametros.saConfig.iterationsPerTemperature);
    }
  }, [parametros.saConfig]);

  const updateParametros = (
    temp: number,
    cooling: number,
    iterations: number
  ) => {
    setParametros((prev) => ({
      ...prev,
      saConfig: {
        initialTemperature: temp,
        coolingRate: cooling,
        iterationsPerTemperature: iterations,
      },
    }));
  };

  const handleInitialTemperatureChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number.parseFloat(event.target.value) || 0;
    setInitialTemperature(value);
    updateParametros(value, coolingRate, iterationsPerTemperature);
  };

  const handleCoolingRateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number.parseFloat(event.target.value) || 0;
    setCoolingRate(value);
    updateParametros(initialTemperature, value, iterationsPerTemperature);
  };

  const handleIterationsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number.parseInt(event.target.value) || 0;
    setIterationsPerTemperature(value);
    updateParametros(initialTemperature, coolingRate, value);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" component="h3">
                  {t("title") || "Parâmetros do Simulated Annealing"}
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 3 }}>
                {t("info") ||
                  "O Simulated Annealing aceita soluções piores no início para escapar de ótimos locais. A Temperatura Inicial define a flexibilidade inicial, a Taxa de Resfriamento controla o quão rápido o algoritmo se torna guloso, e as Iterações definem quantos vizinhos avaliar em cada nível de temperatura."}
              </Alert>

              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {t("paramsTitle") || "Configurações Globais"}
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label={t("initialTemperatureLabel") || "Temperatura Inicial (T0)"}
                      type="number"
                      value={initialTemperature}
                      onChange={handleInitialTemperatureChange}
                      fullWidth
                      slotProps={{ htmlInput: { min: 1, step: 100 } }}
                      helperText={t("initialTemperatureHelper") || "Ex: 10000"}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label={t("coolingRateLabel") || "Taxa de Resfriamento (α)"}
                      type="number"
                      value={coolingRate}
                      onChange={handleCoolingRateChange}
                      fullWidth
                      slotProps={{ htmlInput: { min: 0.01, max: 0.99, step: 0.01 } }}
                      helperText={t("coolingRateHelper") || "Ex: 0.95 (0 a 1)"}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label={t("iterationsLabel") || "Iterações por Temperatura (L)"}
                      type="number"
                      value={iterationsPerTemperature}
                      onChange={handleIterationsChange}
                      fullWidth
                      slotProps={{ htmlInput: { min: 1 } }}
                      helperText={t("iterationsHelper") || "Ex: 100"}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>{t("currentConfig") || "Configuração Atual:"}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`T0 = ${initialTemperature} | α = ${coolingRate} | L = ${iterationsPerTemperature}`}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
