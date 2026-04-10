"use client";
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
  Grid as Grid,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";
import { HistoricoSolucao } from "@/context/Global/utils";

interface SolutionSelectorProps {
  selectedSolution: HistoricoSolucao | null;
  onSolutionChange: (solution: HistoricoSolucao | null) => void;
}

export default function SolutionSelector({
  selectedSolution,
  onSolutionChange,
}: SolutionSelectorProps) {
  const { historicoSolucoes } = useSolutionHistory();

  const availableSolutions = Array.from(historicoSolucoes.values()).sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  );

  const formatDateTime = (datetime: string) => {
    return datetime;
    //return new Date(datetime).toLocaleString("pt-BR");
  };

  const getTotalAssignments = (solution: HistoricoSolucao) => {
    return solution.solucao.atribuicoes.reduce(
      (total, attr) => total + attr.docentes.length,
      0
    );
  };

  const getActiveDisciplines = (solution: HistoricoSolucao) => {
    return solution.contexto.disciplinas.filter((d) => d.ativo).length;
  };

  const getDisciplinesWithSchedule = (solution: HistoricoSolucao) => {
    return solution.contexto.disciplinas.filter(
      (d) => d.ativo && d.horarios && d.horarios.length > 0
    ).length;
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <CalendarTodayIcon color="primary" />
          Selecionar Solução
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Escolha uma solução do histórico</InputLabel>
          <Select
            value={selectedSolution?.id || ""}
            onChange={(e) => {
              const solution = availableSolutions.find(
                (s) => s.id === e.target.value
              );
              onSolutionChange(solution || null);
            }}
            label="Escolha uma solução do histórico"
          >
            {availableSolutions.map((solution) => (
              <MenuItem key={solution.id} value={solution.id}>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {formatDateTime(solution.datetime)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {solution.tipoInsercao} • {getTotalAssignments(solution)}{" "}
                    atribuições • {getActiveDisciplines(solution)} disciplinas
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedSolution && (
          <Box>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Informações Gerais
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    <Chip
                      label={selectedSolution.tipoInsercao}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`${getTotalAssignments(
                        selectedSolution
                      )} atribuições`}
                      size="small"
                      icon={<AssignmentIcon />}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Disciplinas e Horários
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    <Chip
                      label={`${getActiveDisciplines(
                        selectedSolution
                      )} disciplinas ativas`}
                      size="small"
                      color="success"
                    />
                    <Chip
                      label={`${getDisciplinesWithSchedule(
                        selectedSolution
                      )} com horários`}
                      size="small"
                      color="info"
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {selectedSolution.solucao.avaliacao !== undefined && (
              <Box sx={{ mt: 1 }}>
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
                  variant="filled"
                />
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
