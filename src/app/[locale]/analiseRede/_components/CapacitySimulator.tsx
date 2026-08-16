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
        <Typography variant="body2" color="text.secondary" paragraph>
          Selecione um professor para ser removido da rede (ex: licença). Suas turmas serão 
          repensadas para vizinhos com base na carga horária. Se um vizinho exceder a 
          carga máxima estipulada, ele também falha e repassa todas as turmas.
        </Typography>

        <Box display="flex" gap={2} mb={4} alignItems="center">
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
            <Typography variant="h6" gutterBottom>
              Resultado da Simulação
            </Typography>
            
            {result.initialCascadeSize === 0 ? (
              <Alert severity="success">
                A grade absorveu a ausência! Nenhum outro professor precisou ser sobrecarregado além de sua capacidade máxima.
              </Alert>
            ) : (
              <Alert severity="error">
                Falha em Cascata ocorreu! A saída desse professor sobrecarregou outros {result.initialCascadeSize} professores.
              </Alert>
            )}

            <Box mt={3} display="flex" gap={4}>
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight="bold">Professores em Colapso</Typography>
                <List dense>
                  {result.failedTeachers.map((t) => (
                    <ListItem key={t}>
                      <ListItemText primary={t} />
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight="bold">Turmas Órfãs (Não absorvidas)</Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  {result.orphanedClasses.length === 0 && <Typography variant="body2">Nenhuma</Typography>}
                  {result.orphanedClasses.map((c) => (
                    <Chip key={c} label={c} color="error" variant="outlined" />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
