"use client";

import {
  Card,
  CardContent,
  Typography,
  Grid2 as Grid,
  Box,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";

interface TimetableStatsProps {
  stats: {
    totalDisciplinas: number;
    disciplinasAtribuidas: number;
    disciplinasPendentes: number;
    totalHorarios: number;
    diasUtilizados: number;
    horariosUnicos: number;
    duracaoMedia: number;
    distribuicaoDias: Record<string, number>;
    horariosCount: Record<string, number>;
  };
}

export default function TimetableStats({ stats }: TimetableStatsProps) {
  const percentualAtribuido =
    stats.totalDisciplinas > 0
      ? (stats.disciplinasAtribuidas / stats.totalDisciplinas) * 100
      : 0;

  const diasSemana = ["Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."];
  const horariosPopulares = Object.entries(stats.horariosCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <ScheduleIcon color="primary" />
          Estatísticas do Quadro de Horários
        </Typography>

        <Grid container spacing={3}>
          {/* Estatísticas Principais */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    bgcolor: "primary.50",
                    borderRadius: 1,
                  }}
                >
                  <AssignmentIcon
                    color="primary"
                    sx={{ fontSize: 32, mb: 1 }}
                  />
                  <Typography variant="h5" fontWeight="bold">
                    {stats.totalDisciplinas}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Disciplinas
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    bgcolor: "success.50",
                    borderRadius: 1,
                  }}
                >
                  <PersonIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold">
                    {stats.disciplinasAtribuidas}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Atribuídas
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    bgcolor: "warning.50",
                    borderRadius: 1,
                  }}
                >
                  <CalendarIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold">
                    {stats.diasUtilizados}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Dias Utilizados
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    bgcolor: "info.50",
                    borderRadius: 1,
                  }}
                >
                  <TimeIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold">
                    {stats.totalHorarios}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Horários
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Progresso de Atribuição */}
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" fontWeight="medium">
                  Progresso de Atribuição
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {percentualAtribuido.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={percentualAtribuido}
                sx={{ height: 8, borderRadius: 4 }}
                color={
                  percentualAtribuido === 100
                    ? "success"
                    : percentualAtribuido > 80
                    ? "primary"
                    : "warning"
                }
              />
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
              >
                <Typography variant="caption" color="success.main">
                  {stats.disciplinasAtribuidas} atribuídas
                </Typography>
                <Typography variant="caption" color="error.main">
                  {stats.disciplinasPendentes} pendentes
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Distribuição e Horários Populares */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Distribuição por Dia
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {diasSemana.map((dia) => (
                  <Chip
                    key={dia}
                    label={`${dia}: ${stats.distribuicaoDias[dia] || 0}`}
                    size="small"
                    variant={
                      stats.distribuicaoDias[dia] ? "filled" : "outlined"
                    }
                    color={stats.distribuicaoDias[dia] ? "primary" : "default"}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Horários Mais Utilizados
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {horariosPopulares.map(([horario, count], index) => (
                  <Chip
                    key={horario}
                    label={`${horario}: ${count} horários`}
                    size="small"
                    color={
                      index === 0
                        ? "success"
                        : index === 1
                        ? "primary"
                        : "secondary"
                    }
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
