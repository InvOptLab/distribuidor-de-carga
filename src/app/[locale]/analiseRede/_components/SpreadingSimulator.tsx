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
  ListItemIcon,
} from "@mui/material";
import PodcastsIcon from "@mui/icons-material/Podcasts";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { BipartiteGraph } from "@/complexNetworks/core/BipartiteGraph";
import { SpreadingSimulationResult } from "@/complexNetworks/domain/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  graph: BipartiteGraph;
  runSpreading: (initialId: string, steps?: number, prob?: number) => SpreadingSimulationResult | null;
}

export default function SpreadingSimulator({ graph, runSpreading }: Props) {
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [maxSteps, setMaxSteps] = useState(10);
  const [probability, setProbability] = useState(1.0);
  const [result, setResult] = useState<SpreadingSimulationResult | null>(null);

  const docentes = graph.getAllDocentes();

  const handleSimulate = () => {
    if (!selectedTeacher) return;
    const res = runSpreading(selectedTeacher, maxSteps, probability);
    setResult(res);
  };

  return (
    <Card elevation={3} sx={{ p: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom color="primary">
          Simulação de Propagação (Influência)
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">Como essa simulação funciona?</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Utiliza o modelo de contágio em redes (SIR). Se você treinar um professor em uma nova metodologia, com qual velocidade isso se espalharia para os demais docentes? 
            Professores "conversam" entre si com base nas turmas que dividem em comum. Descubra os maiores influenciadores da sua rede.
          </Typography>
        </Alert>

        <Box display="flex" gap={2} mb={4} alignItems="center" p={2} border={1} borderColor="divider" borderRadius={2} bgcolor="background.paper" flexWrap="wrap">
          <TextField
            select
            SelectProps={{ native: true }}
            label="Iniciador (Paciente Zero)"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            sx={{ minWidth: 250 }}
          >
            <option value="" disabled>Selecione um Docente</option>
            {docentes.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </TextField>

          <TextField
            type="number"
            label="Passos de Tempo (Dias)"
            value={maxSteps}
            onChange={(e) => setMaxSteps(Number(e.target.value))}
            sx={{ width: 180 }}
            slotProps={{
              htmlInput: { min: 1, max: 50 }
            }}
          />

          <TextField
            type="number"
            label="Probabilidade de Transmissão (0.0 a 1.0)"
            value={probability}
            onChange={(e) => setProbability(Number(e.target.value))}
            sx={{ width: 280 }}
            slotProps={{
              htmlInput: { min: 0, max: 1, step: 0.1 }
            }}
          />

          <Button
            variant="contained"
            size="large"
            color="secondary"
            startIcon={<PodcastsIcon />}
            onClick={handleSimulate}
            disabled={!selectedTeacher}
          >
            Iniciar Propagação
          </Button>
        </Box>

        {result && (
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
            <Box flex={2}>
              <Typography variant="h6" gutterBottom>
                Curva de Adoção
              </Typography>
              <Typography variant="caption" color="text.secondary" paragraph>
                Crescimento cumulativo de professores que adotaram a ideia a partir do passo zero.
              </Typography>
              <Box height={300} width="100%">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.steps}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="step" label={{ value: 'Passos (Tempo)', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis label={{ value: 'Professores Atingidos', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="totalInfected" stroke="#9c27b0" strokeWidth={3} name="Total Atingido" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>

            <Box flex={1}>
              <Typography variant="h6" gutterBottom color="warning.main" display="flex" alignItems="center">
                <EmojiEventsIcon sx={{ mr: 1 }} />
                Top Influenciadores
              </Typography>
              <Typography variant="caption" color="text.secondary" paragraph>
                Treine estes professores primeiro para obter o contágio mais rápido na rede.
              </Typography>
              <List sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                {result.topSpreaders.map((spreader, idx) => (
                  <React.Fragment key={spreader.docenteId}>
                    <ListItem>
                      <ListItemIcon>
                        <Typography variant="h6" color={idx === 0 ? "warning.main" : "text.secondary"}>
                          #{idx + 1}
                        </Typography>
                      </ListItemIcon>
                      <ListItemText 
                        primary={graph.getNode(spreader.docenteId)?.label || spreader.docenteId}
                        secondary={`Potencial: ${spreader.score} conexões diretas`}
                      />
                    </ListItem>
                    {idx < result.topSpreaders.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
