"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid2,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TuneIcon from "@mui/icons-material/Tune";

export interface IParameter<T> {
  value: T;
  name: string;
  description: string;
}

export type ConstraintParams = {
  [key: string]: IParameter<any>;
};

interface ConstraintParametersProps {
  params: ConstraintParams;
  onParamChange: (paramKey: string, newValue: any) => void;
}

export default function ConstraintParameters({
  params,
  onParamChange,
}: ConstraintParametersProps) {
  const [expanded, setExpanded] = useState(true);

  console.log("ConstraintParameters renderizando com params:", params);

  if (!params || Object.keys(params).length === 0) {
    console.log("Params vazio ou null, retornando null");
    return null;
  }

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const renderParameterInput = (key: string, param: IParameter<any>) => {
    if (!param || typeof param !== "object" || !("value" in param)) {
      console.error(`Parâmetro inválido para chave "${key}":`, param);
      return (
        <Typography variant="body2" color="error">
          Parâmetro inválido
        </Typography>
      );
    }

    const value = param.value;
    console.log(
      `Renderizando input para "${key}" (${param.name}) com valor:`,
      value,
      "tipo:",
      typeof value
    );

    if (typeof value === "boolean") {
      return (
        <FormControlLabel
          control={
            <Switch
              checked={value}
              onChange={(e) => {
                console.log(`Switch "${key}" alterado para:`, e.target.checked);
                onParamChange(key, e.target.checked);
              }}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {param.name || key}
            </Typography>
          }
        />
      );
    }

    if (typeof value === "number") {
      return (
        <TextField
          fullWidth
          type="number"
          label={param.name || key}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value === "" ? 0 : Number(e.target.value);
            console.log(`TextField numérico "${key}" alterado para:`, newValue);
            onParamChange(key, newValue);
          }}
          size="small"
          InputProps={{
            inputProps: { step: "any" },
          }}
        />
      );
    }

    if (typeof value === "string") {
      return (
        <TextField
          fullWidth
          label={param.name || key}
          value={value}
          onChange={(e) => {
            console.log(
              `TextField string "${key}" alterado para:`,
              e.target.value
            );
            onParamChange(key, e.target.value);
          }}
          size="small"
        />
      );
    }

    if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
      return (
        <TextField
          fullWidth
          label={param.name || key}
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              console.log(`TextField JSON "${key}" alterado para:`, parsed);
              onParamChange(key, parsed);
            } catch (error) {
              console.warn("JSON inválido durante digitação:", error);
            }
          }}
          size="small"
          multiline
          rows={3}
          placeholder="Formato JSON"
        />
      );
    }

    return (
      <TextField
        fullWidth
        label={param.name || key}
        value={String(value)}
        onChange={(e) => {
          console.log(
            `TextField fallback "${key}" alterado para:`,
            e.target.value
          );
          onParamChange(key, e.target.value);
        }}
        size="small"
      />
    );
  };

  const paramCount = Object.keys(params).length;

  return (
    <Box sx={{ mt: 2 }}>
      <Accordion
        expanded={expanded}
        onChange={handleToggle}
        sx={{
          border: "2px solid",
          borderColor: "primary.main",
          borderRadius: 2,
          boxShadow: 2,
          "&:before": {
            display: "none",
          },
          overflow: "hidden",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: "primary.main",
            color: "white",
            minHeight: 56,
            "&.Mui-expanded": {
              minHeight: 56,
            },
            "& .MuiAccordionSummary-content": {
              margin: "12px 0",
            },
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ width: "100%" }}
          >
            <TuneIcon />
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, flexGrow: 1 }}
            >
              Parâmetros Específicos
            </Typography>
            <Chip
              label={`${paramCount} parâmetro${paramCount !== 1 ? "s" : ""}`}
              size="small"
              sx={{
                backgroundColor: "white",
                color: "primary.main",
                fontWeight: 700,
              }}
            />
          </Stack>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 3, backgroundColor: "grey.50" }}>
          <Grid2 container spacing={2}>
            {Object.entries(params).map(([key, param]) => {
              if (!param || typeof param !== "object" || !("value" in param)) {
                console.warn(`Parâmetro inválido para chave "${key}":`, param);
                return null;
              }

              return (
                <Grid2 size={12} key={key}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      backgroundColor: "white",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "grey.300",
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        spacing={1}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          {renderParameterInput(key, param)}
                        </Box>
                        {param.description && (
                          <Tooltip
                            title={param.description}
                            arrow
                            placement="top"
                          >
                            <IconButton size="small" color="info">
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                      {param.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            fontStyle: "italic",
                            pl: 1,
                          }}
                        >
                          💡 {param.description}
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                </Grid2>
              );
            })}
          </Grid2>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
