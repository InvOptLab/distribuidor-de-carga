"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid as Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";
// import { useGlobalContext } from "@/context/Global";
import SolutionSelector from "./_components/SolutionSelector";
import AssignmentComparison from "./_components/AssignmentComparison";
import StatisticsComparison from "./_components/StatisticsComparison";
import SolutionSummary from "./_components/SolutionSummary";
import PriorityDistributionChart from "./_components/PriorityDistributionChart";
import ConstraintViolationsChart from "./_components/ConstraintViolationsChart";
import { HistoricoSolucao } from "@/context/Global/utils";

export default function CompararSolucoes() {
  const { historicoSolucoes } = useSolutionHistory();
  // const { docentes, disciplinas } = useGlobalContext();

  const [solutionA, setSolutionA] = useState<HistoricoSolucao | null>(null);
  const [solutionB, setSolutionB] = useState<HistoricoSolucao | null>(null);

  // Pegar a solução mais recente como padrão para A
  useEffect(() => {
    if (historicoSolucoes.size > 0 && !solutionA) {
      const solutions = Array.from(historicoSolucoes.values());
      const mostRecent = solutions.sort(
        (a, b) =>
          new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
      )[0];
      setSolutionA(mostRecent);
    }
  }, [historicoSolucoes, solutionA]);

  // Calcular diferenças entre as atribuições
  const assignmentDifferences = useMemo(() => {
    if (!solutionA || !solutionB) return null;

    const atribuicoesA = new Map<string, string[]>();
    const atribuicoesB = new Map<string, string[]>();

    // Mapear atribuições da solução A
    solutionA.solucao.atribuicoes.forEach((attr) => {
      atribuicoesA.set(attr.id_disciplina, attr.docentes);
    });

    // Mapear atribuições da solução B
    solutionB.solucao.atribuicoes.forEach((attr) => {
      atribuicoesB.set(attr.id_disciplina, attr.docentes);
    });

    const differences = {
      added: [] as { disciplina: string; docentes: string[] }[],
      removed: [] as { disciplina: string; docentes: string[] }[],
      modified: [] as {
        disciplina: string;
        docentesA: string[];
        docentesB: string[];
        added: string[];
        removed: string[];
      }[],
      unchanged: [] as { disciplina: string; docentes: string[] }[],
    };

    // Todas as disciplinas únicas
    const allDisciplinas = new Set([
      ...atribuicoesA.keys(),
      ...atribuicoesB.keys(),
    ]);

    allDisciplinas.forEach((disciplinaId) => {
      const docentesA = atribuicoesA.get(disciplinaId) || [];
      const docentesB = atribuicoesB.get(disciplinaId) || [];

      if (docentesA.length === 0 && docentesB.length > 0) {
        // Disciplina adicionada em B
        differences.added.push({
          disciplina: disciplinaId,
          docentes: docentesB,
        });
      } else if (docentesA.length > 0 && docentesB.length === 0) {
        // Disciplina removida em B
        differences.removed.push({
          disciplina: disciplinaId,
          docentes: docentesA,
        });
      } else if (docentesA.length > 0 && docentesB.length > 0) {
        // Verificar se houve mudanças
        const setA = new Set(docentesA);
        const setB = new Set(docentesB);

        const addedDocentes = docentesB.filter((d) => !setA.has(d));
        const removedDocentes = docentesA.filter((d) => !setB.has(d));

        if (addedDocentes.length > 0 || removedDocentes.length > 0) {
          differences.modified.push({
            disciplina: disciplinaId,
            docentesA,
            docentesB,
            added: addedDocentes,
            removed: removedDocentes,
          });
        } else {
          differences.unchanged.push({
            disciplina: disciplinaId,
            docentes: docentesA,
          });
        }
      }
    });

    return differences;
  }, [solutionA, solutionB]);

  const handleSwapSolutions = () => {
    const temp = solutionA;
    setSolutionA(solutionB);
    setSolutionB(temp);
  };

  if (historicoSolucoes.size === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">
          Não há soluções no histórico para comparar. Execute o algoritmo ou
          importe soluções primeiro.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Comparação de Soluções
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Compare duas soluções do histórico para analisar diferenças nas
          atribuições e estatísticas
        </Typography>
      </Paper>

      {/* Seletores de Soluções */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <SolutionSelector
            title="Solução A"
            selectedSolution={solutionA}
            onSolutionChange={setSolutionA}
            excludeSolution={solutionB}
            color="primary"
          />
        </Grid>

        <Grid
          size={{ xs: 12, md: 2 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Tooltip title="Trocar soluções">
            <IconButton
              onClick={handleSwapSolutions}
              disabled={!solutionA || !solutionB}
              size="large"
              sx={{
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <SwapHorizIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <SolutionSelector
            title="Solução B"
            selectedSolution={solutionB}
            onSolutionChange={setSolutionB}
            excludeSolution={solutionA}
            color="secondary"
          />
        </Grid>
      </Grid>

      {solutionA && solutionB && (
        <>
          {/* Resumo das Soluções */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SolutionSummary
                solution={solutionA}
                title="Solução A"
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SolutionSummary
                solution={solutionB}
                title="Solução B"
                color="secondary"
              />
            </Grid>
          </Grid>

          {/* Estatísticas de Diferenças */}
          {assignmentDifferences && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resumo das Diferenças
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <Chip
                    label={`${assignmentDifferences.added.length} Adicionadas`}
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    label={`${assignmentDifferences.removed.length} Removidas`}
                    color="error"
                    variant="outlined"
                  />
                  <Chip
                    label={`${assignmentDifferences.modified.length} Modificadas`}
                    color="warning"
                    variant="outlined"
                  />
                  <Chip
                    label={`${assignmentDifferences.unchanged.length} Inalteradas`}
                    color="default"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Gráficos de Análise */}
          <PriorityDistributionChart
            solutionA={solutionA}
            solutionB={solutionB}
          />
          <ConstraintViolationsChart
            solutionA={solutionA}
            solutionB={solutionB}
          />

          {/* Comparação de Estatísticas */}
          <StatisticsComparison solutionA={solutionA} solutionB={solutionB} />

          {/* Comparação Detalhada das Atribuições */}
          <AssignmentComparison
            solutionA={solutionA}
            solutionB={solutionB}
            differences={assignmentDifferences}
          />
        </>
      )}

      {(!solutionA || !solutionB) && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Selecione duas soluções para começar a comparação.
        </Alert>
      )}
    </Container>
  );
}
