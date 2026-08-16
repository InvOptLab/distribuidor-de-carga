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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  SelectChangeEvent
} from "@mui/material";
import HealingIcon from "@mui/icons-material/Healing";
import { BipartiteGraph } from "@/complexNetworks/core/BipartiteGraph";
import { HealingSimulationResult } from "@/complexNetworks/domain/types";

interface Props {
  graph: BipartiteGraph;
  runHealing: (failedTeachers: string[], maxClassesPerSubstitute?: number) => HealingSimulationResult | null;
}

export default function HealingSimulator({ graph, runHealing }: Props) {
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [maxWorkload, setMaxWorkload] = useState(4);
  const [result, setResult] = useState<HealingSimulationResult | null>(null);

  const docentes = graph.getAllDocentes();

  const handleSimulate = () => {
    if (selectedTeachers.length === 0) return;
    const res = runHealing(selectedTeachers, maxWorkload);
    setResult(res);
  };

  const handleChange = (event: SelectChangeEvent<typeof selectedTeachers>) => {
    const {
      target: { value },
    } = event;
    setSelectedTeachers(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <Card elevation={3} sx={{ p: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom color="primary">
          Simulação de Recuperação (Healing)
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">Como essa simulação funciona?</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Testamos o esforço necessário para curar a rede após um colapso. Se vários professores saírem da rede, quantas contratações de emergência seriam necessárias para assumir as turmas órfãs, mantendo uma carga horária limite aceitável para os novos contratados?
          </Typography>
        </Alert>

        <Box display="flex" gap={2} mb={4} alignItems="center" p={2} border={1} borderColor="divider" borderRadius={2} bgcolor="background.paper" flexWrap="wrap">
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel id="mutiple-teacher-label">Professores Ausentes</InputLabel>
            <Select<string[]>
              labelId="mutiple-teacher-label"
              id="mutiple-teacher"
              multiple
              value={selectedTeachers}
              onChange={handleChange}
              input={<OutlinedInput label="Professores Ausentes" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={graph.getNode(value)?.label || value} size="small" />
                  ))}
                </Box>
              )}
            >
              {docentes.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            type="number"
            label="Carga Máx. por Substituto"
            value={maxWorkload}
            onChange={(e) => setMaxWorkload(Number(e.target.value))}
            sx={{ width: 220 }}
            slotProps={{
              htmlInput: { min: 1, max: 20 }
            }}
          />

          <Button
            variant="contained"
            size="large"
            color="success"
            startIcon={<HealingIcon />}
            onClick={handleSimulate}
            disabled={selectedTeachers.length === 0}
          >
            Curar Rede
          </Button>
        </Box>

        {result && (
          <Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Relatório de Recuperação
            </Typography>
            
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">Solução Encontrada</Typography>
              Foram encontradas <b>{result.totalOrphanedClasses} turmas órfãs</b> deixadas por esses {result.failedTeachers.length} professores. 
              Para resolver o problema sem sobrecarregar ninguém (máximo de {maxWorkload} turmas), você precisará contratar <b>{result.substitutesNeeded} professor(es) substituto(s)</b>.
            </Alert>

            <Grid container spacing={3}>
              {result.substituteAssignments.map((sub, idx) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={idx}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%', borderColor: 'success.main' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="success.main" display="flex" alignItems="center" gap={1}>
                      {sub.substituteId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" paragraph>
                      Assumirá {sub.classesAssigned.length} turma(s).
                    </Typography>
                    <List dense>
                      {sub.classesAssigned.map((c) => (
                        <ListItem key={c} disableGutters>
                          <ListItemText primary={graph.getNode(c)?.label || c} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
