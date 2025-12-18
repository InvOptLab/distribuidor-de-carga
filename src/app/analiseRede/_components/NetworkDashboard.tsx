"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Divider,
  Paper,
} from "@mui/material";
import {
  Hub as HubIcon,
  WarningAmber as WarningIcon,
  PersonOff as PersonOffIcon,
  HealthAndSafety as HealthIcon,
  CrisisAlert as CriticalIcon,
} from "@mui/icons-material";
import { RobustnessReport } from "@/complexNetworks/domain/types";

interface DashboardProps {
  report: RobustnessReport;
}

export default function NetworkDashboard({ report }: DashboardProps) {
  // Helpers para cor baseada na severidade
  const getDensityColor = (d: number) => {
    if (d < 0.1) return "error.main"; // Muito esparsa, difícil de resolver
    if (d < 0.3) return "warning.main";
    return "success.main";
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      {/* --- SEÇÃO 1: KPIS (SINAIS VITAIS) --- */}
      <Grid container spacing={3} mb={4}>
        {/* Card Densidade */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={3}
            sx={{
              borderLeft: 6,
              borderColor: getDensityColor(report.networkDensity),
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <HubIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Densidade da Rede (Conectividade)
                  </Typography>
                  <Typography variant="h4">
                    {(report.networkDensity * 100).toFixed(2)}%
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                Quanto maior, mais flexível é a grade.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card Turmas em Risco */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={3}
            sx={{
              borderLeft: 6,
              borderColor:
                report.leafNodes.length > 0 ? "warning.main" : "success.main",
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <WarningIcon
                  color={report.leafNodes.length > 0 ? "warning" : "success"}
                  fontSize="large"
                />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Turmas Frágeis (Só 1 opção)
                  </Typography>
                  <Typography variant="h4">
                    {report.leafNodes.length}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                Disciplinas que dependem de um único professor.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card Gargalos */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={3}
            sx={{
              borderLeft: 6,
              borderColor:
                report.criticalTeachers.length > 0
                  ? "error.main"
                  : "success.main",
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CriticalIcon
                  color={
                    report.criticalTeachers.length > 0 ? "error" : "success"
                  }
                  fontSize="large"
                />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Docentes Críticos (Gargalos)
                  </Typography>
                  <Typography variant="h4">
                    {report.criticalTeachers.length}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                Professores cuja ausência gera turmas órfãs.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* --- SEÇÃO 2: DETALHES --- */}
      <Grid container spacing={3}>
        {/* Coluna Esquerda: Docentes Críticos */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography
              variant="h6"
              gutterBottom
              display="flex"
              alignItems="center"
              gap={1}
            >
              <HealthIcon color="error" />
              Pontos Únicos de Falha (Docentes)
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {report.criticalTeachers.length === 0 ? (
              <Alert severity="success">
                Nenhum docente crítico identificado. A rede é robusta!
              </Alert>
            ) : (
              <List sx={{ maxHeight: 400, overflow: "auto" }}>
                {report.criticalTeachers.map((teacher) => (
                  <ListItem key={teacher.docenteId} divider>
                    <ListItemText
                      primary={
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {teacher.docenteName}
                          </Typography>
                          <Chip
                            label={`Impacto: ${teacher.impactScore} turmas`}
                            color="error"
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          Se removido, afeta:{" "}
                          {teacher.affectedClasses.slice(0, 3).join(", ")}
                          {teacher.affectedClasses.length > 3 && "..."}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Coluna Direita: Turmas Órfãs e Frágeis */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography
              variant="h6"
              gutterBottom
              display="flex"
              alignItems="center"
              gap={1}
            >
              <PersonOffIcon color="warning" />
              Disciplinas Vulneráveis
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {report.orphanClasses.length > 0 && (
              <Box mb={2}>
                <Alert severity="error" sx={{ mb: 1 }}>
                  <b>{report.orphanClasses.length} Turmas Órfãs</b> (Nenhum
                  professor habilitado/disponível)
                </Alert>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {report.orphanClasses.map((id) => (
                    <Chip
                      key={id}
                      label={id}
                      color="error"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {report.leafNodes.length > 0 ? (
              <Box>
                <Alert severity="warning" sx={{ mb: 1 }}>
                  <b>{report.leafNodes.length} Turmas "Folha"</b> (Apenas 1
                  opção de professor)
                </Alert>
                <List dense sx={{ maxHeight: 300, overflow: "auto" }}>
                  {report.leafNodes.map((id) => (
                    <ListItem key={id}>
                      <ListItemIcon>
                        <WarningIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={`Disciplina ID: ${id}`} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : (
              <Alert severity="success">
                Todas as disciplinas possuem pelo menos 2 opções de docentes.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
