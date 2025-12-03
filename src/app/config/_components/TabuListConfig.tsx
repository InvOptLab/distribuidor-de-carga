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

type TabuType = "Solução" | "Movimento";

export default function TabuListConfig() {
  const { parametros, setParametros, tabuListType, setTabuListType } =
    useAlgorithmContext();

  // Estados locais para controlar os valores
  const [tabuSize, setTabuSize] = useState(parametros.tabuTenure?.size || 100);
  const [addTenure, setAddTenure] = useState(
    parametros.tabuTenure?.tenures?.add || 5
  );
  const [dropTenure, setDropTenure] = useState(
    parametros.tabuTenure?.tenures?.drop || 3
  );
  const [isActive, setIsActive] = useState(true);

  // Sincronizar estados locais com o contexto quando o componente monta
  useEffect(() => {
    if (parametros.tabuTenure) {
      setTabuSize(parametros.tabuTenure.size || 100);
      setAddTenure(parametros.tabuTenure.tenures?.add || 5);
      setDropTenure(parametros.tabuTenure.tenures?.drop || 3);
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
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number.parseInt(event.target.value) || 0;
    setAddTenure(value);
    updateParametros(tabuListType, tabuSize, value, dropTenure);
  };

  const handleDropTenureChange = (
    event: React.ChangeEvent<HTMLInputElement>
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
    dropTen: number
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
                  Configuração da Lista Tabu
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isActive}
                        onChange={handleActiveChange}
                      />
                    }
                    label="Ativo"
                  />
                </FormGroup>
              </Box>

              <Alert severity="info" sx={{ mb: 3 }}>
                A lista tabu mantém um histórico de soluções ou movimentos
                recentes para evitar ciclos no algoritmo de busca.
              </Alert>

              <FormControl component="fieldset" disabled={!isActive}>
                <FormLabel component="legend" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Tipo da Lista Tabu
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
                        <Typography variant="body1">Soluções</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Armazena soluções completas visitadas recentemente
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
                        <Typography variant="body1">Movimentos</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Armazena movimentos específicos (add/drop) realizados
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
                    Parâmetros para Lista de Soluções
                  </Typography>
                  <TextField
                    label="Tamanho da Lista Tabu"
                    type="number"
                    value={tabuSize}
                    onChange={handleTabuSizeChange}
                    disabled={!isActive}
                    fullWidth
                    slotProps={{ htmlInput: { min: 0 } }}
                    helperText="Número máximo de soluções mantidas na lista tabu."
                    sx={{ mt: 2 }}
                  />
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Tipo Solução:</strong> Utiliza o valor de{" "}
                      <code>parametros.tabuTenure.size = {tabuSize}</code> para
                      controlar quantas soluções completas ficam na lista tabu.
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
                    Parâmetros para Lista de Movimentos
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Add Tenure"
                        type="number"
                        value={addTenure}
                        onChange={handleAddTenureChange}
                        disabled={!isActive}
                        fullWidth
                        slotProps={{ htmlInput: { min: 0 } }}
                        helperText="Iterações que um movimento de adição fica tabu."
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Drop Tenure"
                        type="number"
                        value={dropTenure}
                        onChange={handleDropTenureChange}
                        disabled={!isActive}
                        fullWidth
                        slotProps={{ htmlInput: { min: 0 } }}
                        helperText="Iterações que um movimento de remoção fica tabu."
                      />
                    </Grid>
                  </Grid>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Tipo Movimento:</strong> Utiliza{" "}
                      <code>
                        parametros.tabuTenure.tenures.add = {addTenure}
                      </code>{" "}
                      e{" "}
                      <code>
                        parametros.tabuTenure.tenures.drop = {dropTenure}
                      </code>{" "}
                      para controlar por quantas iterações cada tipo de
                      movimento permanece tabu.
                    </Typography>
                  </Alert>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>Configuração Atual:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tipo: {tabuListType} |
                  {tabuListType === "Solução"
                    ? ` Tamanho: ${tabuSize}`
                    : ` Add: ${addTenure}, Drop: ${dropTenure}`}{" "}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
