"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  FormControl,
  Grid2,
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

  // Verificar se a constraint tem parâmetros
  const hasParams =
    constraint.params && Object.keys(constraint.params).length > 0;

  console.log("ConstraintCard renderizando:");
  console.log("  - Nome:", constraint.name);
  console.log("  - Tipo:", tipo);
  console.log("  - Penalidade:", penalidade);
  console.log("  - Params:", constraint.params);
  console.log("  - Has Params:", hasParams);

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
    console.log(`Alterando parâmetro "${paramKey}" para:`, newValue);

    // Atualizar o valor diretamente na instância
    if (constraint.params && constraint.params[paramKey]) {
      constraint.params[paramKey].value = newValue;
      console.log(
        `Parâmetro atualizado. Novo valor:`,
        constraint.params[paramKey]
      );

      // Notificar mudança
      onChange(constraint);
    } else {
      console.error(
        `Parâmetro "${paramKey}" não encontrado em constraint.params`
      );
    }
  };

  const handleDelete = () => {
    onDelete(constraint.name);
  };

  const handleShowInfo = () => {
    if (constraint.description) {
      showInformations(constraint.description, "info");
    }
  };

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
        <Grid2 container spacing={2}>
          {/* Header */}
          <Grid2 size={12}>
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
          </Grid2>

          <Grid2 size={12}>
            <Divider />
          </Grid2>

          {/* Configurações básicas */}
          <Grid2 size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de Restrição</InputLabel>
              <Select
                value={tipo}
                label="Tipo de Restrição"
                onChange={handleTipoChange}
              >
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
              </Select>
            </FormControl>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
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
          </Grid2>

          {/* Parâmetros da restrição */}
          {hasParams && (
            <Grid2 size={12}>
              <ConstraintParameters
                params={constraint.params}
                onParamChange={handleParamChange}
              />
            </Grid2>
          )}
        </Grid2>
      </CardContent>
    </Card>
  );
}
