"use client";

import { useState, useMemo } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Alert,
  Card,
  CardContent,
  Grid2 as Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";
import { useGlobalContext } from "@/context/Global";
import SolutionSelector from "./_components/SolutionSelector";
import TimetableGrid from "./_components/TimetableGrid";
import TimetableStats from "./_components/TimetableStats";
import {
  Atribuicao,
  Disciplina,
  HistoricoSolucao,
} from "@/context/Global/utils";

export interface TimetableEntry {
  disciplina: Disciplina;
  docentes: string[];
  dia: string;
  inicio: string;
  fim: string;
  duracao: number;
}

export default function HorariosPage() {
  const { historicoSolucoes } = useSolutionHistory();
  const { docentes } = useGlobalContext();

  const [selectedSolution, setSelectedSolution] =
    useState<HistoricoSolucao | null>(null);
  const [viewMode, setViewMode] = useState<"compact" | "detailed">("detailed");
  const [showInactive, setShowInactive] = useState(false);
  const [filterDay, setFilterDay] = useState<string>("all");

  // Processar dados da solução selecionada
  const timetableData = useMemo(() => {
    if (!selectedSolution) return [];

    const entries: TimetableEntry[] = [];
    const atribuicoesMap = new Map<string, string[]>();

    // Mapear atribuições
    selectedSolution.solucao.atribuicoes.forEach((attr: Atribuicao) => {
      atribuicoesMap.set(attr.id_disciplina, attr.docentes);
    });

    // Processar disciplinas com horários
    selectedSolution.contexto.disciplinas.forEach((disciplina: Disciplina) => {
      if (!showInactive && !disciplina.ativo) return;

      const docentes = atribuicoesMap.get(disciplina.id) || [];

      disciplina.horarios?.forEach((horario) => {
        if (filterDay !== "all" && horario.dia !== filterDay) return;

        // Calcular duração em minutos
        const [inicioHoras, inicioMinutos] = horario.inicio
          .split(":")
          .map(Number);
        const [fimHoras, fimMinutos] = horario.fim.split(":").map(Number);
        const inicioTotal = inicioHoras * 60 + inicioMinutos;
        const fimTotal = fimHoras * 60 + fimMinutos;
        const duracao = fimTotal - inicioTotal;

        entries.push({
          disciplina,
          docentes,
          dia: horario.dia,
          inicio: horario.inicio,
          fim: horario.fim,
          duracao,
        });
      });
    });

    return entries.sort((a, b) => {
      // Ordenar por dia e depois por horário
      const diasOrdem = ["Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."];
      const diaA = diasOrdem.indexOf(a.dia);
      const diaB = diasOrdem.indexOf(b.dia);

      if (diaA !== diaB) return diaA - diaB;

      return a.inicio.localeCompare(b.inicio);
    });
  }, [selectedSolution, showInactive, filterDay]);

  // Estatísticas do quadro de horários
  const stats = useMemo(() => {
    if (!selectedSolution) return null;

    // Contar disciplinas únicas (não horários)
    const disciplinasUnicas = new Set<string>();
    const disciplinasComDocentes = new Set<string>();
    const atribuicoesMap = new Map<string, string[]>();

    // Mapear atribuições
    selectedSolution.solucao.atribuicoes.forEach((attr: Atribuicao) => {
      atribuicoesMap.set(attr.id_disciplina, attr.docentes);
    });

    // Processar disciplinas ativas
    selectedSolution.contexto.disciplinas.forEach((disciplina: Disciplina) => {
      if (!disciplina.ativo) return;
      if (!disciplina.horarios || disciplina.horarios.length === 0) return;

      disciplinasUnicas.add(disciplina.id);

      const docentes = atribuicoesMap.get(disciplina.id) || [];
      if (docentes.length > 0) {
        disciplinasComDocentes.add(disciplina.id);
      }
    });

    const totalDisciplinas = disciplinasUnicas.size;
    const disciplinasAtribuidas = disciplinasComDocentes.size;
    const disciplinasPendentes = totalDisciplinas - disciplinasAtribuidas;

    // Estatísticas de horários
    const diasUtilizados = new Set(timetableData.map((entry) => entry.dia))
      .size;
    const horariosUnicos = new Set(
      timetableData.map((entry) => `${entry.inicio}-${entry.fim}`)
    ).size;
    const duracaoTotal = timetableData.reduce(
      (total, entry) => total + entry.duracao,
      0
    );
    const duracaoMedia =
      totalDisciplinas > 0 ? duracaoTotal / timetableData.length : 0;

    // Distribuição por dia
    const distribuicaoDias = timetableData.reduce((acc, entry) => {
      acc[entry.dia] = (acc[entry.dia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Horários mais utilizados
    const horariosCount = timetableData.reduce((acc, entry) => {
      const slot = `${entry.inicio}-${entry.fim}`;
      acc[slot] = (acc[slot] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDisciplinas,
      disciplinasAtribuidas,
      disciplinasPendentes,
      totalHorarios: timetableData.length,
      diasUtilizados,
      horariosUnicos,
      duracaoMedia: Math.round(duracaoMedia),
      distribuicaoDias,
      horariosCount,
    };
  }, [selectedSolution, timetableData]);

  if (historicoSolucoes.size === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">
          Não há soluções no histórico para visualizar. Execute o algoritmo ou
          importe soluções primeiro.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Quadro de Horários
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Visualize o quadro de horários de uma solução do histórico
        </Typography>
      </Paper>

      {/* Seletor de Solução */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SolutionSelector
            selectedSolution={selectedSolution}
            onSolutionChange={setSelectedSolution}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Opções de Visualização
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControl size="small">
                  <InputLabel>Modo de Visualização</InputLabel>
                  <Select
                    value={viewMode}
                    onChange={(e) =>
                      setViewMode(e.target.value as "compact" | "detailed")
                    }
                    label="Modo de Visualização"
                  >
                    <MenuItem value="detailed">Detalhado</MenuItem>
                    <MenuItem value="compact">Compacto</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel>Filtrar por Dia</InputLabel>
                  <Select
                    value={filterDay}
                    onChange={(e) => setFilterDay(e.target.value)}
                    label="Filtrar por Dia"
                  >
                    <MenuItem value="all">Todos os Dias</MenuItem>
                    <MenuItem value="Seg.">Segunda-feira</MenuItem>
                    <MenuItem value="Ter.">Terça-feira</MenuItem>
                    <MenuItem value="Qua.">Quarta-feira</MenuItem>
                    <MenuItem value="Qui.">Quinta-feira</MenuItem>
                    <MenuItem value="Sex.">Sexta-feira</MenuItem>
                    <MenuItem value="Sáb.">Sábado</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={showInactive}
                      onChange={(e) => setShowInactive(e.target.checked)}
                    />
                  }
                  label="Mostrar Inativos"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {selectedSolution && (
        <>
          {/* Estatísticas */}
          {stats && <TimetableStats stats={stats} />}

          {/* Grade de Horários */}
          <TimetableGrid
            timetableData={timetableData}
            viewMode={viewMode}
            docentes={docentes}
          />
        </>
      )}

      {!selectedSolution && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Selecione uma solução do histórico para visualizar o quadro de
          horários.
        </Alert>
      )}
    </Container>
  );
}
