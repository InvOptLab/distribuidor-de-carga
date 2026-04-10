"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Button,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";
import SolutionDetailsDialog from "./SolutionDetailsDialog";
import { HistoricoSolucao } from "@/context/Global/utils";

interface SolutionSelectorProps {
  title: string;
  selectedSolution: HistoricoSolucao | null;
  onSolutionChange: (solution: HistoricoSolucao | null) => void;
  excludeSolution?: HistoricoSolucao | null;
  color: "primary" | "secondary";
}

export default function SolutionSelector({
  title,
  selectedSolution,
  onSolutionChange,
  excludeSolution,
  color,
}: SolutionSelectorProps) {
  const { historicoSolucoes } = useSolutionHistory();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const availableSolutions = Array.from(historicoSolucoes.values())
    .filter((solution) => solution.id !== excludeSolution?.id)
    .sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    );

  const formatDateTime = (datetime: string) => {
    // return new Date(datetime).toLocaleString("pt-BR");
    return datetime;
  };

  const getTotalAssignments = (solution: HistoricoSolucao) => {
    return solution.solucao.atribuicoes.reduce(
      (total, attr) => total + attr.docentes.length,
      0
    );
  };

  return (
    <>
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardContent>
          <Typography variant="h6" color={`${color}.main`} gutterBottom>
            {title}
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Selecionar Solução</InputLabel>
            <Select
              value={selectedSolution?.id || ""}
              onChange={(e) => {
                const solution = availableSolutions.find(
                  (s) => s.id === e.target.value
                );
                onSolutionChange(solution || null);
              }}
              label="Selecionar Solução"
            >
              {availableSolutions.map((solution) => (
                <MenuItem key={solution.id} value={solution.id}>
                  <Box>
                    <Typography variant="body2">
                      {formatDateTime(solution.datetime)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {solution.tipoInsercao} • {getTotalAssignments(solution)}{" "}
                      atribuições
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedSolution && (
            <Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                <Chip
                  label={selectedSolution.tipoInsercao}
                  size="small"
                  color={color}
                  variant="outlined"
                />
                <Chip
                  label={`${getTotalAssignments(selectedSolution)} atribuições`}
                  size="small"
                />
                {selectedSolution.solucao.avaliacao !== undefined && (
                  <Chip
                    label={`Avaliação: ${selectedSolution.solucao.avaliacao.toFixed(
                      2
                    )}`}
                    size="small"
                    color={
                      selectedSolution.solucao.avaliacao === 0
                        ? "success"
                        : "warning"
                    }
                  />
                )}
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={<InfoIcon />}
                onClick={() => setDetailsOpen(true)}
                fullWidth
              >
                Ver Detalhes Completos
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes Melhorado */}
      {selectedSolution && (
        <SolutionDetailsDialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          solution={selectedSolution}
          title={title}
        />
      )}
    </>
  );
}
