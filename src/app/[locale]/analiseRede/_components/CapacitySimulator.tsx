import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Alert,
  Chip,
  Divider,
  Grid,
  Paper,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { BipartiteGraph } from "@/complexNetworks/core/BipartiteGraph";

interface Props {
  graph: BipartiteGraph;
  simulateCapacityCascade: (
    teacherId: string,
    maxWorkload?: number
  ) => { initialCascadeSize: number; failedTeachers: string[]; orphanedClasses: string[] } | null;
}

export default function CapacitySimulator({ graph, simulateCapacityCascade }: Props) {
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [maxWorkload, setMaxWorkload] = useState(4);
  const [result, setResult] = useState<ReturnType<typeof simulateCapacityCascade>>(null);

  const handleSimulate = () => {
    if (!selectedTeacher) return;
    const res = simulateCapacityCascade(selectedTeacher, maxWorkload);
    setResult(res);
  };

  const docentes = graph.getAllDocentes();

  return (
    <Card elevation={3} sx={{ p: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom color="primary">
          Simulação de Sobrecarga e Falha em Cascata
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">Como essa simulação funciona?</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Neste cenário, testamos a resiliência da grade frente a um imprevisto prático: <b>a saída repentina de um professor</b> (por licença, desligamento, etc.).
          </Typography>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li><Typography variant="body2">As turmas desse professor ficam "órfãs" e precisam ser redistribuídas.</Typography></li>
            <li><Typography variant="body2">O sistema tenta passar essas turmas para outros professores que já dividem disciplinas com ele (vizinhos na rede), priorizando os que têm a menor carga horária no momento.</Typography></li>
            <li><Typography variant="body2">Se ao receber novas turmas um professor ultrapassar a <b>Capacidade Máxima</b> definida, ele "colapsa" de sobrecarga. Quando isso acontece, ele também abandona suas turmas originais, gerando um <b>efeito dominó (cascata)</b> na grade de horários.</Typography></li>
          </ul>
        </Alert>

        <Box display="flex" gap={2} mb={4} alignItems="center" p={2} border={1} borderColor="divider" borderRadius={2} bgcolor="background.paper">
          <TextField
            select
            SelectProps={{ native: true }}
            label="Professor Ausente"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <option value="" disabled>Selecione um Docente</option>
            {docentes.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label} (Carga: {graph.getDegree(d.id)})
              </option>
            ))}
          </TextField>

          <TextField
            type="number"
            label="Capacidade Máx."
            value={maxWorkload}
            onChange={(e) => setMaxWorkload(Number(e.target.value))}
            sx={{ width: 120 }}
            slotProps={{
              htmlInput: { min: 1, max: 20 }
            }}
          />

          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={handleSimulate}
            disabled={!selectedTeacher}
          >
            Simular Cascata
          </Button>
        </Box>

        {result && (
          <Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Resultado do Efeito Dominó
            </Typography>
            
            {result.initialCascadeSize === 0 ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">Rede Estável!</Typography>
                A ausência do professor foi totalmente absorvida pelos seus colegas. Nenhum outro docente precisou ser sobrecarregado além do limite máximo.
              </Alert>
            ) : (
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">Falha em Cascata Ocorreu!</Typography>
                A saída deste professor gerou uma bola de neve. Para cobrir suas turmas, outros colegas excederam o limite, causando um colapso sistêmico que afetou mais <b>{result.initialCascadeSize} professor(es)</b>.
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%', borderColor: result.initialCascadeSize > 0 ? 'error.main' : 'divider' }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="error" display="flex" alignItems="center" gap={1}>
                    Professores em Colapso ({result.failedTeachers.length})
                  </Typography>
                  <Typography variant="caption" color="text.secondary" paragraph>
                    Professores que excederam o limite de turmas e também precisaram abandonar suas aulas.
                  </Typography>
                  <List dense>
                    {result.failedTeachers.map((t) => (
                      <ListItem key={t} disableGutters>
                        <ListItemText 
                          primary={graph.getNode(t)?.label || t} 
                          primaryTypographyProps={{ fontWeight: t === selectedTeacher ? 'bold' : 'normal' }}
                          secondary={t === selectedTeacher ? "Causa inicial" : "Caiu por sobrecarga"}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%', borderColor: result.orphanedClasses.length > 0 ? 'warning.main' : 'divider' }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="warning.main" display="flex" alignItems="center" gap={1}>
                    Turmas Desamparadas ({result.orphanedClasses.length})
                  </Typography>
                  <Typography variant="caption" color="text.secondary" paragraph>
                    Matérias que ficaram sem professor pois não havia ninguém qualificado ou com espaço na agenda para assumir.
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                    {result.orphanedClasses.length === 0 && <Typography variant="body2" color="success.main">Nenhuma turma ficou sem professor.</Typography>}
                    {result.orphanedClasses.map((c) => (
                      <Chip key={c} label={graph.getNode(c)?.label || c} color="warning" variant="outlined" />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
