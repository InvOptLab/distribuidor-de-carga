import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { ResilienceSimulation } from "@/complexNetworks/domain/types";

interface Props {
  runResilienceSimulation: (type: "RANDOM" | "TARGETED", steps?: number) => ResilienceSimulation | null;
}

export default function ResilienceSimulator({ runResilienceSimulation }: Props) {
  const [attackType, setAttackType] = useState<"RANDOM" | "TARGETED">("RANDOM");
  const [result, setResult] = useState<ResilienceSimulation | null>(null);

  const handleSimulate = () => {
    const res = runResilienceSimulation(attackType, 20); // 20 passos por padrão
    setResult(res);
  };

  return (
    <Card elevation={3} sx={{ p: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom color="primary">
          Simulação de Resiliência (Robustez a Falhas)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Nesta simulação, os docentes são progressivamente removidos da rede.
          Em um <b>Ataque Aleatório</b>, professores aleatórios saem. Em um <b>Ataque Direcionado</b>, 
          os professores de maior centralidade (os mais essenciais) são os primeiros a sair.
          O gráfico mostra como o Maior Componente Conectado (a parte saudável e contínua da grade)
          se desintegra com o tempo.
        </Typography>

        <Box display="flex" gap={2} mb={4} alignItems="center">
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Tipo de Ataque</InputLabel>
            <Select
              value={attackType}
              label="Tipo de Ataque"
              onChange={(e) => setAttackType(e.target.value as "RANDOM" | "TARGETED")}
            >
              <MenuItem value="RANDOM">Ataque Aleatório (Falhas casuais)</MenuItem>
              <MenuItem value="TARGETED">Ataque Direcionado (Alvos estratégicos)</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={handleSimulate}
          >
            Executar Simulação
          </Button>
        </Box>

        {result && (
          <Box sx={{ width: '100%', height: 400, mt: 4 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Tamanho do Maior Componente vs Nós Removidos ({result.type})
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={result.points}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="step" 
                  label={{ value: 'Passos da Simulação', position: 'insideBottom', offset: -10 }} 
                />
                <YAxis 
                  label={{ value: 'Tamanho Maior Componente', angle: -90, position: 'insideLeft' }} 
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [value, name === 'largestComponentSize' ? 'Maior Componente' : name]}
                  labelFormatter={(label) => `Passo: ${label}`}
                />
                <Legend verticalAlign="top" />
                <Line 
                  type="monotone" 
                  dataKey="largestComponentSize" 
                  name="Maior Componente"
                  stroke="#8884d8" 
                  strokeWidth={3}
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="remainingNodes" 
                  name="Nós Restantes"
                  stroke="#82ca9d" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
