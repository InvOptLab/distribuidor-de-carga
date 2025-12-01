"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { SelectChangeEvent } from "@mui/material/Select";
import type Constraint from "@/algoritmo/abstractions/Constraint";
import ConstraintParameters from "./ConstraintParameters";

interface ConstraintCardProps {
  constraint: Constraint<any>;
  onChange: (constraint: Constraint<any>) => void;
  onDelete: (name: string) => void;
  showInformations: (
    message: string,
    type: "info" | "success" | "error" | "warning",
    closeTime?: number
  ) => void;
}

export default function ConfigConstraintCard({
  constraint,
  onChange,
  onDelete,
  showInformations,
}: ConstraintCardProps) {
  const [tipo, setTipo] = useState<"Hard" | "Soft">(
    constraint.isHard ? "Hard" : "Soft"
  );
  const [penalidade, setPenalidade] = useState<string>(
    String(constraint.penalty || 0)
  );

  // Verificar se a constraint suporta hard e soft através do prototype
  const [supportsHard, setSupportsHard] = useState(true);
  const [supportsSoft, setSupportsSoft] = useState(true);

  useEffect(() => {
    // Acessar o construtor da classe
    const ConstraintClass = constraint.constructor as any;

    // console.log("=== Verificando suporte de tipos ===");
    // console.log("Constraint:", constraint.name);
    // console.log("Constructor:", ConstraintClass);
    // console.log("Constructor.prototype:", ConstraintClass.prototype);

    // Verificar se existem as flags no prototype
    if (ConstraintClass.prototype) {
      // const hardSupport = ConstraintClass.prototype["hard"];
      // const softSupport = ConstraintClass.prototype["soft"];

      // console.log("hard flag:", hardSupport);
      // console.log("soft flag:", softSupport);

      // Definir suporte baseado nas flags do prototype
      // if (typeof hardSupport !== "undefined") {
      //   setSupportsHard(hardSupport === true);
      // }
      setSupportsHard(!!ConstraintClass.prototype["hard"]);
      setSupportsSoft(!!ConstraintClass.prototype["soft"]);

      // if (typeof softSupport !== "undefined") {
      //   setSupportsSoft(softSupport === true);
      // }

      // console.log(
      //   `Resultado - Supports Hard: ${hardSupport}, Supports Soft: ${softSupport}`
      // );
    }
  }, [constraint]);

  // Verificar se a constraint tem parâmetros
  const hasParams =
    constraint.params && Object.keys(constraint.params).length > 0;

  // console.log("ConstraintCard renderizando:");
  // console.log("  - Nome:", constraint.name);
  // console.log("  - Tipo:", tipo);
  // console.log("  - Penalidade:", penalidade);
  // console.log("  - Supports Hard:", supportsHard);
  // console.log("  - Supports Soft:", supportsSoft);
  // console.log("  - Params:", constraint.params);
  // console.log("  - Has Params:", hasParams);

  const handleTipoChange = (event: SelectChangeEvent) => {
    const newTipo = event.target.value as "Hard" | "Soft";
    setTipo(newTipo);

    // Atualizar a propriedade isHard da instância
    constraint.isHard = newTipo === "Hard";

    // Notificar mudança
    onChange(constraint);
  };

  const handlePenalidadeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPenalidade = event.target.value;
    setPenalidade(newPenalidade);

    // Atualizar a propriedade penalty da instância
    constraint.penalty = Number(newPenalidade);

    // Notificar mudança
    onChange(constraint);
  };

  const handleParamChange = (paramKey: string, newValue: any) => {
    // console.log(`Alterando parâmetro "${paramKey}" para:`, newValue);

    // Atualizar o valor diretamente na instância
    if (constraint.params && constraint.params[paramKey]) {
      constraint.params[paramKey].value = newValue;
      // console.log(
      //   `Parâmetro atualizado. Novo valor:`,
      //   constraint.params[paramKey]
      // );

      // Notificar mudança
      onChange(constraint);
    } else {
      // console.error(
      //   `Parâmetro "${paramKey}" não encontrado em constraint.params`
      // );
    }
  };

  const handleDelete = () => {
    // console.log(`ConstraintCard: Chamando onDelete para "${constraint.name}"`);
    onDelete(constraint.name);
  };

  const handleShowInfo = () => {
    if (constraint.description) {
      showInformations(constraint.description, "info");
    }
  };

  // Se só suporta um tipo, ajustar o estado inicial se necessário
  useEffect(() => {
    if (!supportsHard && supportsSoft && tipo === "Hard") {
      setTipo("Soft");
      constraint.isHard = false;
      onChange(constraint);
    } else if (supportsHard && !supportsSoft && tipo === "Soft") {
      setTipo("Hard");
      constraint.isHard = true;
      onChange(constraint);
    }
  }, [supportsHard, supportsSoft]);

  // Desabilitar select se não tem opções ou só tem uma opção
  const selectDisabled =
    (!supportsHard && !supportsSoft) ||
    (supportsHard && !supportsSoft) ||
    (!supportsHard && supportsSoft);

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 2,
        transition: "all 0.3s ease",
        border: "2px solid",
        borderColor: tipo === "Hard" ? "error.main" : "warning.main",
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-4px)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {/* Header */}
          <Grid size={12}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ flexGrow: 1 }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  {constraint.name}
                </Typography>
                <Chip
                  label={tipo === "Hard" ? "RÍGIDA" : "FLEXÍVEL"}
                  color={tipo === "Hard" ? "error" : "warning"}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    height: 24,
                  }}
                />
                {hasParams && (
                  <Chip
                    label={`${Object.keys(constraint.params).length} parâmetro${
                      Object.keys(constraint.params).length !== 1 ? "s" : ""
                    }`}
                    color="primary"
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      height: 24,
                    }}
                  />
                )}
              </Stack>

              <Stack direction="row" spacing={1}>
                {constraint.description && (
                  <Tooltip title="Ver descrição" arrow>
                    <IconButton
                      size="small"
                      onClick={handleShowInfo}
                      color="info"
                    >
                      <InfoOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Remover restrição" arrow>
                  <IconButton size="small" onClick={handleDelete} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          {/* Configurações básicas */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth size="small" disabled={selectDisabled}>
              <InputLabel>Tipo de Restrição</InputLabel>
              <Select
                value={tipo}
                label="Tipo de Restrição"
                onChange={handleTipoChange}
              >
                {supportsHard && (
                  <MenuItem value="Hard">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label="RÍGIDA"
                        color="error"
                        size="small"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                      <Typography variant="body2">
                        Deve ser sempre satisfeita
                      </Typography>
                    </Stack>
                  </MenuItem>
                )}
                {supportsSoft && (
                  <MenuItem value="Soft">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label="FLEXÍVEL"
                        color="warning"
                        size="small"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                      <Typography variant="body2">
                        Preferível mas não obrigatória
                      </Typography>
                    </Stack>
                  </MenuItem>
                )}
              </Select>
              {!supportsHard && !supportsSoft && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  Esta restrição não implementa nenhum tipo
                </Typography>
              )}
              {!supportsHard && supportsSoft && (
                <Typography
                  variant="caption"
                  color="info.main"
                  sx={{ mt: 0.5 }}
                >
                  Apenas modo flexível disponível
                </Typography>
              )}
              {supportsHard && !supportsSoft && (
                <Typography
                  variant="caption"
                  color="info.main"
                  sx={{ mt: 0.5 }}
                >
                  Apenas modo rígido disponível
                </Typography>
              )}
              {supportsHard && supportsSoft && (
                <Typography
                  variant="caption"
                  color="success.main"
                  sx={{ mt: 0.5 }}
                >
                  Ambos os modos disponíveis
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Penalidade"
              value={penalidade}
              onChange={handlePenalidadeChange}
              size="small"
              InputProps={{
                inputProps: { min: 0, step: 1 },
              }}
              helperText="Peso da penalização quando violada"
            />
          </Grid>

          {/* Parâmetros da restrição */}
          {hasParams && (
            <Grid size={12}>
              <ConstraintParameters
                params={constraint.params}
                onParamChange={handleParamChange}
              />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
