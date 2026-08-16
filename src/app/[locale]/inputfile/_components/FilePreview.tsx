"use client";

import {
  Card,
  CardContent,
  Typography,
  Grid as Grid,
  Chip,
  Box,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  // LinearProgress,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import QuizIcon from "@mui/icons-material/Quiz";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { useTranslations } from "next-intl";

interface FileAnalysis {
  docentes: { total: number; ativos: number; inativos: number };
  disciplinas: { total: number; ativas: number; inativas: number };
  atribuicoes: { total: number; comDocentes: number; semDocentes: number };
  formularios: { total: number; docentesComFormulario: number };
  travas: number;
  solucao: boolean;
  versao?: string;
  dataModificacao?: string;
  qualidade: {
    docentesSemFormulario: number;
    disciplinasSemInteressados: number;
    conflitosHorario: number;
  };
}

interface FilePreviewProps {
  analysis: FileAnalysis;
}

export default function FilePreview({ analysis }: FilePreviewProps) {
  const t = useTranslations("Pages.InputFile.FilePreview");

  // Calcular score de qualidade (0-100)
  const calculateQualityScore = () => {
    let score = 100;
    const totalDocentes = analysis.docentes.total;
    const totalDisciplinas = analysis.disciplinas.total;

    if (totalDocentes > 0) {
      score -= (analysis.qualidade.docentesSemFormulario / totalDocentes) * 30;
    }
    if (totalDisciplinas > 0) {
      score -=
        (analysis.qualidade.disciplinasSemInteressados / totalDisciplinas) * 30;
    }
    if (analysis.qualidade.conflitosHorario > 0) {
      score -= Math.min(analysis.qualidade.conflitosHorario * 2, 40);
    }

    return Math.max(0, Math.round(score));
  };

  const qualityScore = calculateQualityScore();

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <InfoIcon color="primary" />
          {t("title")}
        </Typography>
        {analysis.versao && (
          <Chip
            label={t("version", { version: analysis.versao })}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mb: 2 }}
          />
        )}

        {/* Informações Básicas */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
              <PersonIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {analysis.docentes.total}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t("professors")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("activeProfessors", {
                  active: analysis.docentes.ativos,
                  inactive: analysis.docentes.inativos,
                })}
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
              <SchoolIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="secondary.main">
                {analysis.disciplinas.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Disciplinas
              </Typography>
              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  gap: 0.5,
                  justifyContent: "center",
                }}
              >
                <Chip
                  label={`${analysis.disciplinas.ativas} ativas`}
                  size="small"
                  color="success"
                />
                <Chip
                  label={`${analysis.disciplinas.inativas} inativas`}
                  size="small"
                  color="default"
                />
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
              <AssignmentIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {analysis.atribuicoes.total}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t("assignments")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("withProfessors", {
                  with: analysis.atribuicoes.comDocentes,
                  without: analysis.atribuicoes.semDocentes,
                })}
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
              <QuizIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {analysis.formularios.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Formulários
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={`${analysis.formularios.docentesComFormulario} docentes participaram`}
                  size="small"
                  color="info"
                />
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Detalhes Adicionais */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Informações Adicionais
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <LockIcon />
                </ListItemIcon>
                <ListItemText primary={`${analysis.travas} travas definidas`} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon
                    color={analysis.solucao ? "success" : "disabled"}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    analysis.solucao
                      ? "Contém solução salva"
                      : "Não contém solução"
                  }
                />
              </ListItem>
              {analysis.solucao && (
                <Box sx={{ mt: 1 }}>
                  <Alert
                    icon={<TaskAltIcon fontSize="inherit" />}
                    severity="success"
                    sx={{ borderRadius: 2 }}
                  >
                    <strong>{t("solutionFound")}</strong>
                  </Alert>
                </Box>
              )}
              {analysis.dataModificacao && (
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Data de modificação"
                    secondary={new Date(
                      analysis.dataModificacao
                    ).toLocaleString("pt-BR")}
                  />
                </ListItem>
              )}
            </List>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="subtitle2"
              color="text.primary"
              sx={{ mt: 3, mb: 2, fontWeight: 600 }}
            >
              {t("quality")}
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              <Chip
                icon={
                  analysis.qualidade.docentesSemFormulario > 0 ? (
                    <WarningIcon />
                  ) : (
                    <CheckCircleIcon />
                  )
                }
                label={t("professorsNoForm", {
                  count: analysis.qualidade.docentesSemFormulario,
                })}
                variant="outlined"
                color={
                  analysis.qualidade.docentesSemFormulario > 0
                    ? "warning"
                    : "success"
                }
              />
              <Chip
                icon={
                  analysis.qualidade.disciplinasSemInteressados > 0 ? (
                    <WarningIcon />
                  ) : (
                    <CheckCircleIcon />
                  )
                }
                label={t("classesNoInterested", {
                  count: analysis.qualidade.disciplinasSemInteressados,
                })}
                variant="outlined"
                color={
                  analysis.qualidade.disciplinasSemInteressados > 0
                    ? "warning"
                    : "success"
                }
              />
              <Chip
                icon={
                  analysis.qualidade.conflitosHorario > 0 ? (
                    <ErrorIcon />
                  ) : (
                    <CheckCircleIcon />
                  )
                }
                label={t("scheduleConflicts", {
                  count: analysis.qualidade.conflitosHorario,
                })}
                variant="outlined"
                color={
                  analysis.qualidade.conflitosHorario > 0 ? "error" : "success"
                }
              />
            </Box>
          </Grid>
        </Grid>

        {/* Alertas */}
        {qualityScore < 60 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Atenção:</strong> Os dados apresentam algumas
              inconsistências. Recomendamos revisar os formulários e conflitos
              antes de prosseguir com a atribuição automática.
            </Typography>
          </Alert>
        )}

        {analysis.qualidade.conflitosHorario > 10 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Muitos conflitos detectados:</strong>{" "}
              {analysis.qualidade.conflitosHorario} conflitos de horário podem
              impactar significativamente a qualidade das atribuições.
            </Typography>
          </Alert>
        )}

        {qualityScore >= 80 && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Excelente!</strong> Os dados estão bem estruturados e
              completos. Pronto para atribuição automática.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
