"use client";

import { HistoricoSolucao } from "@/context/Global/utils";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid as Grid,
} from "@mui/material";

interface SolutionSummaryProps {
  solution: HistoricoSolucao;
  title: string;
  color: "primary" | "secondary";
}

export default function SolutionSummary({
  solution,
  title,
  color,
}: SolutionSummaryProps) {
  const formatDateTime = (datetime: string) => {
    // return new Date(datetime).toLocaleString("pt-BR");
    return datetime;
  };

  const getTotalAssignments = () => {
    return solution.solucao.atribuicoes.reduce(
      (total, attr) => total + attr.docentes.length,
      0
    );
  };

  const getAssignedDisciplines = () => {
    return solution.solucao.atribuicoes.filter(
      (attr) => attr.docentes.length > 0
    ).length;
  };

  const getUniqueDocentes = () => {
    const docentes = new Set<string>();
    solution.solucao.atribuicoes.forEach((attr) => {
      attr.docentes.forEach((docente) => docentes.add(docente));
    });
    return docentes.size;
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" color={`${color}.main`} gutterBottom>
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {formatDateTime(solution.datetime)}
        </Typography>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 6 }}>
            <Box textAlign="center">
              <Typography variant="h4" color={`${color}.main`}>
                {getTotalAssignments()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total de Atribuições
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Box textAlign="center">
              <Typography variant="h4" color={`${color}.main`}>
                {getAssignedDisciplines()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Disciplinas Atribuídas
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Box textAlign="center">
              <Typography variant="h4" color={`${color}.main`}>
                {getUniqueDocentes()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Docentes Únicos
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Box textAlign="center">
              <Typography
                variant="h4"
                color={
                  solution.solucao.avaliacao === 0
                    ? "success.main"
                    : "warning.main"
                }
              >
                {solution.solucao.avaliacao?.toFixed(1) || "N/A"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avaliação
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Chip
            label={solution.tipoInsercao}
            size="small"
            color={color}
            variant="outlined"
          />
          {solution.solucao.estatisticas && (
            <>
              <Chip
                label={`${solution.solucao.estatisticas.iteracoes} iterações`}
                size="small"
              />
              <Chip
                label={`${solution.solucao.estatisticas.tempoExecucao.toFixed(
                  1
                )}s`}
                size="small"
              />
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
