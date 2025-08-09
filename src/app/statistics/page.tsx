"use client";

import { useSolutionHistory } from "@/context/SolutionHistory/hooks";
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  Card,
} from "@mui/material";
import { useState } from "react";
import SolutionHistoryDetails from "./_components/SolutionHistoryDetails";

export default function Statistics() {
  const { historicoSolucoes } = useSolutionHistory();
  const [solutionId, setSolutionId] = useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setSolutionId(event.target.value as string);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center",
      }}
    >
      {/* Card para seleção de soluções */}
      <Card
        elevation={3}
        sx={{
          padding: 3,
          borderRadius: 3,
          width: "100%",
          maxWidth: 500,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Escolha uma solução para análise
        </Typography>
        <FormControl sx={{ minWidth: "13em", width: "100%" }}>
          <InputLabel id="solution-select-label">Solução</InputLabel>
          <Select
            labelId="solution-select-label"
            id="solution-select"
            value={solutionId}
            label="Solução"
            onChange={handleChange}
            disabled={historicoSolucoes.size === 0}
          >
            {Array.from(historicoSolucoes.values()).map((value) => (
              <MenuItem key={`menu-item-${value.id}`} value={value.id}>
                {value.datetime}
              </MenuItem>
            ))}
          </Select>
          {historicoSolucoes.size === 0 && (
            <FormHelperText>Nenhuma solução encontrada!</FormHelperText>
          )}
        </FormControl>
      </Card>

      {/* Detalhes da Solução Selecionada */}
      {solutionId && (
        <SolutionHistoryDetails
          key={solutionId}
          solucao={historicoSolucoes.get(solutionId)}
        />
      )}
    </Box>
  );
}
