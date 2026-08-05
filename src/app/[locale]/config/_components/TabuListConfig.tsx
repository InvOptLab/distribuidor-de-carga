"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Divider,
  Alert,
  Switch,
  FormGroup,
  Grid as Grid,
} from "@mui/material";
import { useAlgorithmContext } from "@/context/Algorithm";
import { useTranslations } from "next-intl";

type TabuType = "Solução" | "Movimento";

export default function TabuListConfig() {
  const { parametros, setParametros, tabuListType, setTabuListType } =
    useAlgorithmContext();
  const t = useTranslations("Pages.Config.TabuList");

  // Estados locais para controlar os valores
  const [tabuSize, setTabuSize] = useState(parametros.tabuTenure?.size);
  const [addTenure, setAddTenure] = useState(
    parametros.tabuTenure?.tenures?.add,
  );
  const [dropTenure, setDropTenure] = useState(
    parametros.tabuTenure?.tenures?.drop,
  );
  const [isActive, setIsActive] = useState(true);

  // Sincronizar estados locais com o contexto quando o componente monta
  useEffect(() => {
    if (parametros.tabuTenure) {
      setTabuSize(parametros.tabuTenure.size);
      setAddTenure(parametros.tabuTenure.tenures?.add);
      setDropTenure(parametros.tabuTenure.tenures?.drop);
    }
  }, [parametros.tabuTenure]);

  const handleTabuTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newType = event.target.value as TabuType;
    setTabuListType(newType);

    // Atualizar os parâmetros no contexto baseado no tipo selecionado
    updateParametros(newType, tabuSize, addTenure, dropTenure);
  };

  const handleTabuSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value) || 0;

    setTabuSize(value);
    updateParametros(tabuListType, value, addTenure, dropTenure);
  };

  const handleAddTenureChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = Number.parseInt(event.target.value) || 0;
    setAddTenure(value);
    updateParametros(tabuListType, tabuSize, value, dropTenure);
  };

  const handleDropTenureChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = Number.parseInt(event.target.value) || 0;
    setDropTenure(value);
    updateParametros(tabuListType, tabuSize, addTenure, value);
  };

  const handleActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const active = event.target.checked;
    setIsActive(active);
    updateParametros(tabuListType, tabuSize, addTenure, dropTenure);
  };

  // Função auxiliar para atualizar os parâmetros no contexto
  const updateParametros = (
    type: TabuType,
    size: number,
    addTen: number,
    dropTen: number,
  ) => {
    setParametros((prev) => ({
      ...prev,
      tabuTenure: {
        size: size,
        tenures: {
          add: addTen,
          drop: dropTen,
        },
      },
    }));
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
                  {t("title")}
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isActive}
                        onChange={handleActiveChange}
                      />
                    }
                    label={t("active")}
                  />
                </FormGroup>
              </Box>

              <Alert severity="info" sx={{ mb: 3 }}>
                {t("info")}
              </Alert>

              <FormControl component="fieldset" disabled={!isActive}>
                <FormLabel component="legend" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t("typeLabel")}
                  </Typography>
                </FormLabel>
                <RadioGroup
                  value={tabuListType}
                  onChange={handleTabuTypeChange}
                  sx={{ mb: 3 }}
                >
                  <FormControlLabel
                    value="Solução"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">{t("typeSolution")}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t("typeSolutionDesc")}
                        </Typography>
                      </Box>
                    }
                    sx={{ my: 1 }}
                  />
                  <FormControlLabel
                    value="Movimento"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">{t("typeMovement")}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t("typeMovementDesc")}
                        </Typography>
                      </Box>
                    }
                    sx={{ my: 1 }}
                  />
                </RadioGroup>
              </FormControl>

              <Divider sx={{ my: 1 }} />

              {tabuListType === "Solução" ? (
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {t("paramsSolution")}
                  </Typography>
                  <TextField
                    label={t("sizeLabel")}
                    type="number"
                    value={tabuSize}
                    onChange={handleTabuSizeChange}
                    disabled={!isActive}
                    fullWidth
                    slotProps={{ htmlInput: { min: 0 } }}
                    helperText={t("sizeHelper")}
                    sx={{ mt: 2 }}
                  />
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>{t("solutionAlertTitle")}</strong> {t("solutionAlertDesc", { code: `parametros.tabuTenure.size = ${tabuSize}` })}
                    </Typography>
                  </Alert>
                </Box>
              ) : (
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {t("paramsMovement")}
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label={t("addTenureLabel")}
                        type="number"
                        value={addTenure}
                        onChange={handleAddTenureChange}
                        disabled={!isActive}
                        fullWidth
                        slotProps={{ htmlInput: { min: 0 } }}
                        helperText={t("addTenureHelper")}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label={t("dropTenureLabel")}
                        type="number"
                        value={dropTenure}
                        onChange={handleDropTenureChange}
                        disabled={!isActive}
                        fullWidth
                        slotProps={{ htmlInput: { min: 0 } }}
                        helperText={t("dropTenureHelper")}
                      />
                    </Grid>
                  </Grid>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>{t("movementAlertTitle")}</strong> {t("movementAlertDesc", { codeAdd: `parametros.tabuTenure.tenures.add = ${addTenure}`, codeDrop: `parametros.tabuTenure.tenures.drop = ${dropTenure}` })}
                    </Typography>
                  </Alert>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>{t("currentConfig")}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("typeConfig", { type: tabuListType })}
                  {tabuListType === "Solução"
                    ? t("sizeConfig", { size: tabuSize })
                    : t("tenureConfig", { add: addTenure, drop: dropTenure })}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
