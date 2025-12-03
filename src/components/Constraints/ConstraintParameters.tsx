"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Grid,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  ConstraintParams,
  IParameter,
} from "@/algoritmo/communs/interfaces/interfaces";

interface ConstraintParametersProps {
  params: ConstraintParams;
  onParamChange: (paramKey: string, newValue: any) => void;
}

export default function ConstraintParameters({
  params,
  onParamChange,
}: ConstraintParametersProps) {
  const [expanded, setExpanded] = useState(true);

  const handleChange = () => {
    setExpanded(!expanded);
  };

  const renderParameterField = (paramKey: string, param: IParameter<any>) => {
    const valueType = typeof param.value;

    // console.log(`Renderizando parâmetro "${paramKey}":`, param);
    // console.log(`Tipo do valor: ${valueType}`);

    // Boolean - Switch
    if (valueType === "boolean") {
      return (
        <Grid size={12} key={paramKey}>
          <FormControlLabel
            control={
              <Switch
                checked={param.value}
                onChange={(e) => {
                  // console.log(`Switch alterado para: ${e.target.checked}`);
                  onParamChange(paramKey, e.target.checked);
                }}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {param.name}
                </Typography>
                {param.description && (
                  <Tooltip title={param.description} arrow>
                    <IconButton size="small">
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            }
          />
        </Grid>
      );
    }

    // Number - TextField numérico
    if (valueType === "number") {
      return (
        <Grid size={{ xs: 12, md: 6 }} key={paramKey}>
          <TextField
            fullWidth
            type="number"
            label={param.name}
            value={param.value}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              // console.log(`Campo numérico alterado para: ${newValue}`);
              onParamChange(paramKey, newValue);
            }}
            size="small"
            helperText={param.description}
            InputProps={{
              inputProps: { step: "any" },
            }}
          />
        </Grid>
      );
    }

    // String - TextField de texto
    if (valueType === "string") {
      return (
        <Grid size={{ xs: 12, md: 6 }} key={paramKey}>
          <TextField
            fullWidth
            type="text"
            label={param.name}
            value={param.value}
            onChange={(e) => {
              // console.log(`Campo de texto alterado para: ${e.target.value}`);
              onParamChange(paramKey, e.target.value);
            }}
            size="small"
            helperText={param.description}
          />
        </Grid>
      );
    }

    // Array ou Object - TextField multiline com JSON
    if (valueType === "object") {
      const jsonValue = JSON.stringify(param.value, null, 2);
      return (
        <Grid size={12} key={paramKey}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={param.name}
            value={jsonValue}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                // console.log(`JSON alterado para:`, parsed);
                onParamChange(paramKey, parsed);
              } catch (error) {
                console.error("JSON inválido:", error);
              }
            }}
            size="small"
            helperText={param.description || "Formato JSON"}
            placeholder='{"key": "value"}'
          />
        </Grid>
      );
    }

    // Fallback para tipos desconhecidos
    return (
      <Grid size={12} key={paramKey}>
        <Typography variant="body2" color="error">
          Tipo de parâmetro não suportado: {valueType}
        </Typography>
      </Grid>
    );
  };

  const paramCount = Object.keys(params).length;

  return (
    <Accordion
      expanded={expanded}
      onChange={handleChange}
      sx={{
        border: "1px solid",
        borderColor: "primary.light",
        borderRadius: 1,
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: "primary.50",
          borderRadius: 1,
          "&:hover": {
            backgroundColor: "primary.100",
          },
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            ⚙️ Parâmetros da Restrição
          </Typography>
          <Chip
            label={`${paramCount} parâmetro${paramCount !== 1 ? "s" : ""}`}
            size="small"
            color="primary"
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          {Object.entries(params).map(([key, param]) =>
            renderParameterField(key, param)
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
