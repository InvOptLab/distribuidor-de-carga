import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  Paper,
} from "@mui/material";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import { BipartiteGraph } from "@/complexNetworks/core/BipartiteGraph";
import { CurriculumCutSimulationResult } from "@/complexNetworks/domain/types";

interface Props {
  graph: BipartiteGraph;
  runCurriculumCut: (classId: string) => CurriculumCutSimulationResult | null;
}

export default function CurriculumCutSimulator({ graph, runCurriculumCut }: Props) {
  const [selectedClass, setSelectedClass] = useState("");
  const [result, setResult] = useState<CurriculumCutSimulationResult | null>(null);

  const turmas = graph.getAllTurmas();

  const handleSimulate = () => {
    if (!selectedClass) return;
    const res = runCurriculumCut(selectedClass);
    setResult(res);
  };

  return (
    <Card elevation={3} sx={{ p: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom color="primary">
          Simulação de Corte de Disciplina (Node Removal)
        </Typography>
        
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">Como essa simulação funciona?</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Aqui testamos o impacto de políticas educacionais. Se uma disciplina inteira for removida da grade curricular, quais professores serão impactados?
            O simulador revela o impacto na carga horária e, criticamente, identifica quais professores hiperespecializados ficariam com <b>0 turmas (ociosos)</b>.
          </Typography>
        </Alert>

        <Box display="flex" gap={2} mb={4} alignItems="center" p={2} border={1} borderColor="divider" borderRadius={2} bgcolor="background.paper" flexWrap="wrap">
          <TextField
            select
            SelectProps={{ native: true }}
            label="Disciplina / Turma a ser cortada"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            sx={{ minWidth: 300 }}
          >
            <option value="" disabled>Selecione uma Disciplina</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} (Ministrada por {graph.getDegree(t.id)} profs.)
              </option>
            ))}
          </TextField>

          <Button
            variant="contained"
            size="large"
            color="error"
            startIcon={<ContentCutIcon />}
            onClick={handleSimulate}
            disabled={!selectedClass}
          >
            Executar Corte
          </Button>
        </Box>

        {result && (
          <Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Relatório de Impacto
            </Typography>
            
            {result.affectedTeachers.length === 0 ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">Nenhum Impacto Direto</Typography>
                Curiosamente, nenhum professor estava atualmente alocado nesta turma.
              </Alert>
            ) : (
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">Impacto Financeiro e Operacional</Typography>
                O corte desta disciplina afetará a carga horária de <b>{result.affectedTeachers.length} professor(es)</b>.
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%', borderColor: 'error.main' }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="error" display="flex" alignItems="center" gap={1}>
                    Professores Zerados ({result.affectedTeachers.filter(t => t.isZeroed).length})
                  </Typography>
                  <Typography variant="caption" color="text.secondary" paragraph>
                    Aviso Crítico: Estes docentes davam apenas esta matéria. Com o corte, eles ficam sem carga horária no sistema.
                  </Typography>
                  <List dense>
                    {result.affectedTeachers.filter(t => t.isZeroed).length === 0 && (
                      <Typography variant="body2" color="success.main">Nenhum professor zerou a carga.</Typography>
                    )}
                    {result.affectedTeachers.filter(t => t.isZeroed).map((t) => (
                      <ListItem key={t.docenteId} disableGutters>
                        <ListItemText 
                          primary={graph.getNode(t.docenteId)?.label || t.docenteId} 
                          secondary={`Foi de ${t.previousDegree} para 0 turmas`}
                        />
                        <Chip label="OCIOSO" color="error" size="small" />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="warning.main" display="flex" alignItems="center" gap={1}>
                    Redução de Carga ({result.affectedTeachers.filter(t => !t.isZeroed).length})
                  </Typography>
                  <Typography variant="caption" color="text.secondary" paragraph>
                    Professores que perderam horas, mas ainda possuem outras disciplinas na grade.
                  </Typography>
                  <List dense>
                    {result.affectedTeachers.filter(t => !t.isZeroed).length === 0 && (
                      <Typography variant="body2" color="text.secondary">Nenhum outro professor afetado.</Typography>
                    )}
                    {result.affectedTeachers.filter(t => !t.isZeroed).map((t) => (
                      <ListItem key={t.docenteId} disableGutters>
                        <ListItemText 
                          primary={graph.getNode(t.docenteId)?.label || t.docenteId} 
                          secondary={`Reduziu de ${t.previousDegree} para ${t.newDegree} turma(s)`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
