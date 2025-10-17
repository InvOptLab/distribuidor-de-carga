"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Switch,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Alert,
  Tooltip,
  IconButton,
  Grid,
  FormControlLabel,
  Snackbar,
} from "@mui/material";
import {
  Info as InfoIcon,
  TableChart as TableChartIcon,
  RestartAlt as RestartAltIcon,
} from "@mui/icons-material";
import { useAlgorithmContext } from "@/context/Algorithm";
import { useAlertsContext } from "@/context/Alerts";
import { getPriorityColor } from "@/app/atribuicoes";
import { ObjectiveComponent } from "@/algoritmo/abstractions/ObjectiveComponent";

export default function ObjectiveConfig() {
  const { objectiveComponents, setObjectiveComponents, maiorPrioridade } =
    useAlgorithmContext();
  const { addAlerta } = useAlertsContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );
  const [multiplierTable, setMultiplierTable] = useState(
    new Map<number, number>()
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Função mais robusta que verifica de múltiplas formas
  const componentHasMultiplierTable = (
    component: ObjectiveComponent
  ): boolean => {
    // Método 1: Verificar se a propriedade existe diretamente
    if ("tabelaMultiplicadores" in component) return true;

    // Método 2: Verificar usando hasOwnProperty
    if (
      Object.prototype.hasOwnProperty.call(component, "tabelaMultiplicadores")
    )
      return true;

    // Método 3: Verificar se existe no prototype da classe
    const proto = Object.getPrototypeOf(component);
    if (proto && "tabelaMultiplicadores" in proto) return true;

    // Método 4: Verificar usando Object.getOwnPropertyNames
    const ownProps = Object.getOwnPropertyNames(component);
    if (ownProps.includes("tabelaMultiplicadores")) return true;

    // Método 5: Verificar usando Reflect
    if (
      typeof Reflect !== "undefined" &&
      Reflect.has(component, "tabelaMultiplicadores")
    )
      return true;

    return false;
  };

  const activeCount = Array.from(objectiveComponents.values()).filter(
    (c) => c.isActive
  ).length;

  const handleComponentToggle = (
    componentName: string,
    currentState: boolean
  ) => {
    // Verificar se é a última componente ativa
    if (currentState && activeCount === 1) {
      addAlerta(
        "Pelo menos uma componente da função objetivo deve permanecer ativa",
        "warning",
        4
      );
      return;
    }

    const newComponents = new Map(objectiveComponents);
    const component = newComponents.get(componentName);
    if (component) {
      component.isActive = !component.isActive;
      newComponents.set(componentName, component);
      setObjectiveComponents(newComponents);
    }
  };

  const handleMultiplierChange = (componentName: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;

    const newComponents = new Map(objectiveComponents);
    const component = newComponents.get(componentName);
    if (component) {
      component.multiplier = numValue;
      newComponents.set(componentName, component);
      setObjectiveComponents(newComponents);
    }
  };

  const openMultiplierDialog = (componentName: string) => {
    setSelectedComponent(componentName);

    // Inicializar tabela com valores padrão ou existentes
    const component = objectiveComponents.get(componentName);
    if (component && componentHasMultiplierTable(component)) {
      const existingTable =
        (component as any).tabelaMultiplicadores || new Map<number, number>();
      const initialTable = new Map<number, number>();

      for (let i = 0; i <= maiorPrioridade; i++) {
        initialTable.set(i, existingTable.get(i) || 0);
      }

      setMultiplierTable(initialTable);
    }

    setDialogOpen(true);
  };

  const defaultMultipliers = (componentName: string) => {
    const newComponents = new Map(objectiveComponents);
    const component = newComponents.get(componentName);

    if (component && componentHasMultiplierTable(component)) {
      // Definir tabelaMultiplicadores como undefined para usar o cálculo padrão

      const table = new Map<number, number>();

      for (let i = 1; i <= maiorPrioridade; i++) {
        table.set(i, Math.pow(2, maiorPrioridade - i));
      }

      table.set(0, 0);

      (component as any).tabelaMultiplicadores = table;
      newComponents.set(componentName, component);
      setObjectiveComponents(newComponents);

      addAlerta(
        `Configuração padrão aplicada para ${componentName}. Será usado o cálculo exponencial 2^(${maiorPrioridade} - p)`,
        "success",
        5
      );
    }
  };

  const saveMultiplierTable = () => {
    if (!selectedComponent) return;

    const newMultiplierTable = new Map<number, number>();
    for (let i = 0; i <= maiorPrioridade; i++) {
      newMultiplierTable.set(i, multiplierTable.get(i) || 0);
    }

    setMultiplierTable(newMultiplierTable);

    const newComponents = new Map(objectiveComponents);
    const component = newComponents.get(selectedComponent);

    if (component && componentHasMultiplierTable(component)) {
      // Atualizar a tabela de multiplicadores na instância
      (component as any).tabelaMultiplicadores = newMultiplierTable;
      newComponents.set(selectedComponent, component);
      setObjectiveComponents(newComponents);
    }

    setDialogOpen(false);
    setSelectedComponent(null);
    setSnackbarOpen(true);
  };

  const handleTableValueChange = (priority: number, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;

    const newMultiplierTable = structuredClone(multiplierTable);
    newMultiplierTable.set(priority, numValue);

    // setMultiplierTable((prev) => ({
    //   ...prev,
    //   [priority]: numValue,
    // }));

    setMultiplierTable(newMultiplierTable);
  };

  // const getPriorityColor = (priority: number) => {
  //   if (priority <= 3) return "error";
  //   if (priority <= 6) return "warning";
  //   return "success";
  // };

  const getPriorityLabel = (priority: number) => {
    if (priority <= 3) return "Alta";
    if (priority <= 6) return "Média";
    return "Baixa";
  };

  const isUsingDefaultMultipliers = (componentName: string): boolean => {
    const component = objectiveComponents.get(componentName);
    if (!component || !componentHasMultiplierTable(component)) return false;

    const table = (component as any).tabelaMultiplicadores;

    if (table === undefined) {
      return true;
    }

    for (let i = 1; i <= maiorPrioridade; i++) {
      if (table.get(i) !== Math.pow(2, maiorPrioridade - i)) {
        return false;
      }
    }

    return table.get(0) === 0;
  };

  const totalComponents = objectiveComponents.size;

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 1 }}>
        <Typography variant="body2">
          As componentes da função objetivo determinam como a qualidade das
          soluções será avaliada.
        </Typography>
      </Alert>

      <Alert severity="warning" sx={{ mb: 1 }}>
        <Typography variant="body2">
          Pelo menos uma componente deve estar ativa para que o algoritmo
          funcione corretamente.
        </Typography>
      </Alert>

      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h6">Componentes Ativas:</Typography>
        <Chip
          label={`${activeCount} de ${totalComponents}`}
          color={activeCount > 0 ? "success" : "error"}
          variant="outlined"
        />
      </Box>

      <Grid container spacing={2}>
        {Array.from(objectiveComponents.entries()).map(([name, component]) => (
          <Grid item xs={12} md={6} key={name}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                opacity: component.isActive ? 1 : 0.6,
                border: component.isActive ? 2 : 1,
                borderColor: component.isActive ? "primary.main" : "divider",
                transition: "all 0.3s ease",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {component.name}
                    </Typography>
                    <Box
                      sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}
                    >
                      <Chip
                        label={component.type.toUpperCase()}
                        color={
                          component.type === "min" ? "primary" : "secondary"
                        }
                        size="small"
                      />
                      <Chip
                        label={component.isActive ? "Ativa" : "Inativa"}
                        color={component.isActive ? "success" : "default"}
                        size="small"
                      />
                      {componentHasMultiplierTable(component) && (
                        <Chip
                          label={
                            isUsingDefaultMultipliers(name)
                              ? "Padrão"
                              : "Customizada"
                          }
                          color={
                            isUsingDefaultMultipliers(name) ? "info" : "warning"
                          }
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    {component.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, minHeight: 40 }}
                      >
                        {component.description}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {component.description && (
                      <Tooltip title={component.description}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            addAlerta(
                              component.description ||
                                "Sem descrição disponível",
                              "info",
                              8
                            )
                          }
                        >
                          <InfoIcon fontSize="small" color="info" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <TextField
                    label="Multiplicador"
                    type="number"
                    value={component.multiplier || 0}
                    onChange={(e) =>
                      handleMultiplierChange(name, e.target.value)
                    }
                    disabled={!component.isActive}
                    size="small"
                    fullWidth
                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                    helperText="Peso da componente na função objetivo"
                  />
                </Box>

                {componentHasMultiplierTable(component) && (
                  <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
                    <Tooltip title="Configurar tabela de multiplicadores por prioridade">
                      <Button
                        variant={
                          isUsingDefaultMultipliers(name)
                            ? "contained"
                            : "outlined"
                        }
                        startIcon={<TableChartIcon />}
                        onClick={() => openMultiplierDialog(name)}
                        //disabled={!component.isActive}
                        size="small"
                        color={
                          isUsingDefaultMultipliers(name) ? "info" : "primary"
                        }
                        sx={{ flex: 1 }}
                      >
                        Configurar Tabela
                      </Button>
                    </Tooltip>

                    <Tooltip
                      title={`Usar cálculo padrão: 2^(${maiorPrioridade} - p)`}
                    >
                      <Button
                        variant={
                          isUsingDefaultMultipliers(name)
                            ? "outlined"
                            : "contained"
                        }
                        startIcon={<RestartAltIcon />}
                        onClick={() => defaultMultipliers(name)}
                        disabled={!component.isActive}
                        size="small"
                        color={
                          isUsingDefaultMultipliers(name) ? "primary" : "info"
                        }
                        sx={{ flex: 1 }}
                      >
                        Usar Padrão
                      </Button>
                    </Tooltip>
                  </Box>
                )}

                <FormControlLabel
                  control={
                    <Switch
                      checked={component.isActive}
                      onChange={() =>
                        handleComponentToggle(name, component.isActive)
                      }
                      disabled={component.isActive && activeCount === 1}
                      color="primary"
                    />
                  }
                  label={component.isActive ? "Ativo" : "Inativo"}
                />

                {component.isActive && activeCount === 1 && (
                  <Typography
                    variant="caption"
                    color="warning.main"
                    display="block"
                    sx={{ mt: 1 }}
                  >
                    Pelo menos uma componente deve permanecer ativa
                  </Typography>
                )}
                {componentHasMultiplierTable(component) &&
                  isUsingDefaultMultipliers(name) && (
                    <Typography
                      variant="caption"
                      color="info.main"
                      display="block"
                      sx={{ mt: 1 }}
                    >
                      Usando cálculo exponencial: 2^({maiorPrioridade} -
                      prioridade)
                    </Typography>
                  )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para Tabela de Multiplicadores */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TableChartIcon />
            Configurar Multiplicadores por Prioridade
            {selectedComponent && (
              <Chip label={selectedComponent} color="primary" size="small" />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Configure os multiplicadores para cada nível de prioridade (1 a{" "}
            {maiorPrioridade}). Valores maiores dão mais peso para aquela
            prioridade na função objetivo.
          </Alert>

          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Cálculo Padrão:</strong> 2^({maiorPrioridade} -
              prioridade)
              <br />
              Exemplo: Para prioridade 1 = 2^({maiorPrioridade} - 1) ={" "}
              {Math.pow(2, maiorPrioridade - 1)}
            </Typography>
          </Alert>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Prioridade</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Faixa</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Multiplicador</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Padrão</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: maiorPrioridade + 1 }, (_, i) => i).map(
                  (priority) => {
                    const defaultValue =
                      priority != 0
                        ? Math.pow(2, maiorPrioridade - priority)
                        : 0;
                    return (
                      <TableRow key={priority}>
                        <TableCell>
                          <Chip
                            label={priority}
                            sx={{
                              backgroundColor: getPriorityColor(
                                priority,
                                maiorPrioridade
                              ),
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {getPriorityLabel(priority)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={multiplierTable.get(priority) || 0}
                            onChange={(e) =>
                              handleTableValueChange(priority, e.target.value)
                            }
                            size="small"
                            slotProps={{ htmlInput: { min: 0, step: 1 } }}
                            sx={{ width: 120 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {defaultValue}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={saveMultiplierTable} variant="contained">
            Salvar Configuração
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de Confirmação */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Tabela de multiplicadores salva com sucesso!"
      />
    </Box>
  );
}
