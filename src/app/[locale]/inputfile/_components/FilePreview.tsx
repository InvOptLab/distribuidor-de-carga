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
// import TrendingUpIcon from "@mui/icons-material/TrendingUp";

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

  // const getQualityColor = (score: number) => {
  //   if (score >= 80) return "success";
  //   if (score >= 60) return "warning";
  //   return "error";
  // };

  // const getQualityIcon = (score: number) => {
  //   if (score >= 80) return <CheckCircleIcon />;
  //   if (score >= 60) return <WarningIcon />;
  //   return <ErrorIcon />;
  // };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <InfoIcon color="primary" />
          Prévia do Arquivo
        </Typography>

        {/* Informações Básicas */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
              <PersonIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {analysis.docentes.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Docentes
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
                  label={`${analysis.docentes.ativos} ativos`}
                  size="small"
                  color="success"
                />
                <Chip
                  label={`${analysis.docentes.inativos} inativos`}
                  size="small"
                  color="default"
                />
              </Box>
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
              <AssignmentIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {analysis.atribuicoes.comDocentes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Atribuições
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
                  label={`${analysis.atribuicoes.comDocentes} preenchidas`}
                  size="small"
                  color="success"
                />
                <Chip
                  label={`${analysis.atribuicoes.semDocentes} vazias`}
                  size="small"
                  color="warning"
                />
              </Box>
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

        {/* Score de Qualidade */}
        {/* <Card
          variant="outlined"
          sx={{ mb: 3, bgcolor: `${getQualityColor(qualityScore)}.50` }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              {getQualityIcon(qualityScore)}
              <Typography variant="h6">Score de Qualidade dos Dados</Typography>
              <Chip
                label={`${qualityScore}/100`}
                color={getQualityColor(qualityScore)}
                icon={<TrendingUpIcon />}
                sx={{ ml: "auto" }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={qualityScore}
              color={getQualityColor(qualityScore)}
              sx={{ height: 8, borderRadius: 4, mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Baseado na completude dos dados, formulários preenchidos e
              conflitos detectados
            </Typography>
          </CardContent>
        </Card> */}

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
                  secondary={analysis.versao && `Versão: ${analysis.versao}`}
                />
              </ListItem>
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
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Análise de Qualidade
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon
                    color={
                      analysis.qualidade.docentesSemFormulario > 0
                        ? "warning"
                        : "disabled"
                    }
                  />
                </ListItemIcon>
                <ListItemText
                  primary={`${analysis.qualidade.docentesSemFormulario} docentes sem formulário`}
                  secondary={
                    analysis.qualidade.docentesSemFormulario > 0
                      ? "Alguns docentes não preencheram formulários"
                      : "Todos os docentes preencheram formulários"
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon
                    color={
                      analysis.qualidade.disciplinasSemInteressados > 0
                        ? "warning"
                        : "disabled"
                    }
                  />
                </ListItemIcon>
                <ListItemText
                  primary={`${analysis.qualidade.disciplinasSemInteressados} disciplinas sem interessados`}
                  secondary={
                    analysis.qualidade.disciplinasSemInteressados > 0
                      ? "Algumas disciplinas não têm docentes interessados"
                      : "Todas as disciplinas têm docentes interessados"
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ErrorIcon
                    color={
                      analysis.qualidade.conflitosHorario > 0
                        ? "error"
                        : "disabled"
                    }
                  />
                </ListItemIcon>
                <ListItemText
                  primary={`${analysis.qualidade.conflitosHorario} conflitos de horário detectados`}
                  secondary={
                    analysis.qualidade.conflitosHorario > 0
                      ? "Disciplinas com horários sobrepostos encontradas"
                      : "Nenhum conflito de horário detectado"
                  }
                />
              </ListItem>
            </List>
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
