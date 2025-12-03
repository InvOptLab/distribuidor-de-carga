"use client";

import type { HistoricoSolucao } from "@/context/Global/utils";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Grid as Grid,
  Divider,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import { useState } from "react";

interface WorkloadHistogramChartProps {
  solutionA: HistoricoSolucao;
  solutionB: HistoricoSolucao;
}

interface DocenteWorkload {
  nome: string;
  cargaTotal: number;
  cargaArredondada: number;
  disciplinas: { id: string; nome: string; carga: number }[];
}

interface WorkloadGroup {
  cargaArredondada: number;
  docentes: DocenteWorkload[];
  quantidade: number;
}

export default function WorkloadHistogramChart({
  solutionA,
  solutionB,
}: WorkloadHistogramChartProps) {
  const [expandedA, setExpandedA] = useState<string | false>(false);
  const [expandedB, setExpandedB] = useState<string | false>(false);

  // Função para calcular a carga de trabalho de cada docente
  const calculateDocenteWorkloads = (
    solution: HistoricoSolucao
  ): DocenteWorkload[] => {
    const { atribuicoes } = solution.solucao;
    const { disciplinas, docentes } = solution.contexto;

    // Criar mapa de disciplinas para acesso rápido
    const disciplinaMap = new Map(disciplinas.map((d) => [d.id, d]));

    // Criar mapa para armazenar carga por docente
    const docenteWorkloadMap = new Map<string, DocenteWorkload>();

    // Inicializar todos os docentes com carga zero
    docentes
      .filter((docente) => docente.ativo)
      .forEach((docente) => {
        docenteWorkloadMap.set(docente.nome, {
          nome: docente.nome,
          cargaTotal: 0,
          cargaArredondada: 0,
          disciplinas: [],
        });
      });

    // Calcular cargas baseado nas atribuições
    atribuicoes.forEach((atribuicao) => {
      const disciplina = disciplinaMap.get(atribuicao.id_disciplina);
      if (!disciplina || !disciplina.carga) return;

      atribuicao.docentes.forEach((nomeDocente) => {
        const docenteWorkload = docenteWorkloadMap.get(nomeDocente);
        if (docenteWorkload) {
          docenteWorkload.cargaTotal += disciplina.carga;
          docenteWorkload.disciplinas.push({
            id: disciplina.id,
            nome: disciplina.nome,
            carga: disciplina.carga,
          });
        }
      });
    });

    // Arredondar cargas para 2 casas decimais
    docenteWorkloadMap.forEach((workload) => {
      workload.cargaArredondada = Math.round(workload.cargaTotal * 100) / 100;
    });

    return Array.from(docenteWorkloadMap.values());
  };

  // Função para agrupar docentes por carga arredondada
  const groupByWorkload = (workloads: DocenteWorkload[]): WorkloadGroup[] => {
    const groups = new Map<number, WorkloadGroup>();

    workloads.forEach((workload) => {
      const carga = workload.cargaArredondada;

      if (!groups.has(carga)) {
        groups.set(carga, {
          cargaArredondada: carga,
          docentes: [],
          quantidade: 0,
        });
      }

      const group = groups.get(carga)!;
      group.docentes.push(workload);
      group.quantidade = group.docentes.length;
    });

    return Array.from(groups.values()).sort(
      (a, b) => a.cargaArredondada - b.cargaArredondada
    );
  };

  // Calcular dados para ambas as soluções
  const workloadsA = calculateDocenteWorkloads(solutionA);
  const workloadsB = calculateDocenteWorkloads(solutionB);
  const groupsA = groupByWorkload(workloadsA);
  const groupsB = groupByWorkload(workloadsB);

  // Preparar dados para o gráfico
  const prepareChartData = () => {
    const allCargas = new Set([
      ...groupsA.map((g) => g.cargaArredondada),
      ...groupsB.map((g) => g.cargaArredondada),
    ]);

    return Array.from(allCargas)
      .sort((a, b) => a - b)
      .map((carga) => {
        const groupA = groupsA.find((g) => g.cargaArredondada === carga);
        const groupB = groupsB.find((g) => g.cargaArredondada === carga);

        return {
          carga: carga.toString(),
          cargaNumeric: carga,
          solucaoA: groupA?.quantidade || 0,
          solucaoB: groupB?.quantidade || 0,
        };
      });
  };

  const chartData = prepareChartData();

  // Função para obter cor baseada na carga
  const getWorkloadColor = (carga: number): string => {
    if (carga === 0) return "#FFC107"; // Amarelo
    if (carga <= 2) return "#81C784"; // Verde claro
    if (carga <= 4) return "#1976D2"; // Azul
    if (carga <= 6) return "#FF9800"; // Laranja
    return "#D32F2F"; // Vermelho para cargas altas
  };

  // Configuração das séries para o gráfico
  const workloadSeries = [
    {
      dataKey: "solucaoA",
      label: "Solução A",
      color: "#1976d2",
      valueFormatter: (
        value: number | null,
        { dataIndex }: { dataIndex: number }
      ) => {
        if (value === null) return "";
        const data = chartData[dataIndex];
        return `Carga ${data.carga}: ${value} docentes`;
      },
    },
    {
      dataKey: "solucaoB",
      label: "Solução B",
      color: "#dc004e",
      valueFormatter: (
        value: number | null,
        { dataIndex }: { dataIndex: number }
      ) => {
        if (value === null) return "";
        const data = chartData[dataIndex];
        return `Carga ${data.carga}: ${value} docentes`;
      },
    },
  ];

  // Função para renderizar detalhes dos docentes
  const renderDocenteDetails = (
    groups: WorkloadGroup[],
    expanded: string | false,
    setExpanded: (panel: string | false) => void,
    solutionLabel: string
  ) => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Detalhes dos Docentes - {solutionLabel}
      </Typography>
      {groups.map((group) => (
        <Accordion
          key={`${solutionLabel}-${group.cargaArredondada}`}
          expanded={expanded === `${solutionLabel}-${group.cargaArredondada}`}
          onChange={(_, isExpanded) =>
            setExpanded(
              isExpanded ? `${solutionLabel}-${group.cargaArredondada}` : false
            )
          }
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
              }}
            >
              <Chip
                label={`Carga: ${group.cargaArredondada}`}
                size="small"
                sx={{
                  bgcolor: getWorkloadColor(group.cargaArredondada),
                  color: "white",
                  minWidth: 80,
                }}
              />
              <Chip
                icon={<PersonIcon />}
                label={`${group.quantidade} docentes`}
                size="small"
                variant="outlined"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {group.docentes.map((docente, index) => (
                <Box key={docente.nome}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="subtitle2">
                            {docente.nome}
                          </Typography>
                          <Chip
                            label={`Carga Real: ${docente.cargaTotal.toFixed(
                              4
                            )}`}
                            size="small"
                            variant="outlined"
                            color="info"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Disciplinas atribuídas ({docente.disciplinas.length}
                            ):
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                              mt: 0.5,
                            }}
                          >
                            {docente.disciplinas.map((disciplina) => (
                              <Chip
                                key={disciplina.id}
                                label={`${disciplina.nome} (${disciplina.carga})`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "0.7rem", height: 20 }}
                              />
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < group.docentes.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

  // Calcular estatísticas
  const totalDocentesA = workloadsA.length;
  const totalDocentesB = workloadsB.length;
  const avgWorkloadA =
    workloadsA.reduce((sum, w) => sum + w.cargaTotal, 0) / totalDocentesA;
  const avgWorkloadB =
    workloadsB.reduce((sum, w) => sum + w.cargaTotal, 0) / totalDocentesB;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Histograma de Carga de Trabalho dos Docentes
        </Typography>

        {/* Estatísticas Resumidas */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                textAlign: "center",
                p: 2,
                bgcolor: "primary.50",
                borderRadius: 1,
              }}
            >
              <Typography variant="h4" color="primary.main">
                {totalDocentesA}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Docentes - Solução A
              </Typography>
              <Chip
                label={`Carga Média: ${avgWorkloadA.toFixed(2)}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                textAlign: "center",
                p: 2,
                bgcolor: "secondary.50",
                borderRadius: 1,
              }}
            >
              <Typography variant="h4" color="secondary.main">
                {totalDocentesB}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Docentes - Solução B
              </Typography>
              <Chip
                label={`Carga Média: ${avgWorkloadB.toFixed(2)}`}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Gráfico de Barras */}
        <Box sx={{ width: "100%", height: 400, mb: 3 }}>
          {chartData.length > 0 ? (
            <BarChart
              dataset={chartData}
              xAxis={[
                {
                  scaleType: "band",
                  dataKey: "carga",
                  label:
                    "Carga de Trabalho (arredondada para 2 casas decimais)",
                },
              ]}
              yAxis={[
                {
                  label: "Quantidade de Docentes",
                },
              ]}
              series={workloadSeries}
              width={undefined}
              height={400}
              margin={{ left: 75, right: 75 }}
              slotProps={{
                legend: {
                  direction: "horizontal",
                  position: { vertical: "top", horizontal: "center" },
                },
              }}
              barLabel="value"
              grid={{ vertical: false, horizontal: true }}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Nenhum dado de carga de trabalho encontrado
              </Typography>
            </Box>
          )}
        </Box>
        {/* Legenda de Cores */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            justifyContent: "center",
          }}
        >
          <Chip
            label="Carga 0"
            size="small"
            sx={{ bgcolor: "#FFC107", color: "black" }}
          />
          <Chip
            label="Carga 0.1-2.0"
            size="small"
            sx={{ bgcolor: "#81C784", color: "white" }}
          />
          <Chip
            label="Carga 2.1-4.0"
            size="small"
            sx={{ bgcolor: "#1976D2", color: "white" }}
          />
          <Chip
            label="Carga 4.1-6.0"
            size="small"
            sx={{ bgcolor: "#FF9800", color: "white" }}
          />
          <Chip
            label="Carga 6.1+"
            size="small"
            sx={{ bgcolor: "#D32F2F", color: "white" }}
          />
        </Box>

        {/* Detalhes dos Docentes */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            {renderDocenteDetails(
              groupsA,
              expandedA,
              setExpandedA,
              "Solução A"
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {renderDocenteDetails(
              groupsB,
              expandedB,
              setExpandedB,
              "Solução B"
            )}
          </Grid>
        </Grid>

        {/* Análise Comparativa */}
        <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Análise Comparativa de Carga de Trabalho:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip
              label={`Diferença Média: ${(avgWorkloadB - avgWorkloadA).toFixed(
                2
              )}`}
              color={
                Math.abs(avgWorkloadB - avgWorkloadA) < 0.01
                  ? "default"
                  : avgWorkloadB < avgWorkloadA
                  ? "success"
                  : "error"
              }
              size="small"
            />
            <Chip
              label={`${groupsA.length} níveis de carga (A)`}
              color="primary"
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${groupsB.length} níveis de carga (B)`}
              color="secondary"
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
