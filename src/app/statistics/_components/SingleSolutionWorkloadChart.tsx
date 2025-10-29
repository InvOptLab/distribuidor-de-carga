"use client";

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
  Divider,
  Paper,
  Alert,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { useState } from "react";
import { HistoricoSolucao } from "@/context/Global/utils";

interface SingleSolutionWorkloadChartProps {
  solution: HistoricoSolucao;
}

interface DocenteWorkload {
  nome: string;
  cargaTotal: number;
  cargaArredondada: number;
  disciplinas: { id: string; nome: string; carga: number }[];
  saldo: number;
}

interface WorkloadGroup {
  cargaArredondada: number;
  docentes: DocenteWorkload[];
  quantidade: number;
}

export default function SingleSolutionWorkloadChart({
  solution,
}: SingleSolutionWorkloadChartProps) {
  const [expanded, setExpanded] = useState<string | false>(false);

  const calculateDocenteWorkloads = (): DocenteWorkload[] => {
    const { atribuicoes } = solution.solucao;
    const { disciplinas, docentes } = solution.contexto;

    const disciplinaMap = new Map(disciplinas.map((d) => [d.id, d]));
    const docenteWorkloadMap = new Map<string, DocenteWorkload>();

    docentes
      .filter((docente) => docente.ativo)
      .forEach((docente) => {
        docenteWorkloadMap.set(docente.nome, {
          nome: docente.nome,
          cargaTotal: 0,
          cargaArredondada: 0,
          disciplinas: [],
          saldo: docente.saldo,
        });
      });

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

    docenteWorkloadMap.forEach((workload) => {
      workload.cargaArredondada = Math.round(workload.cargaTotal * 100) / 100;
    });

    return Array.from(docenteWorkloadMap.values());
  };

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

  const workloads = calculateDocenteWorkloads();
  const groups = groupByWorkload(workloads);

  const chartData = groups.map((group) => ({
    carga: group.cargaArredondada.toString(),
    cargaNumeric: group.cargaArredondada,
    quantidade: group.quantidade,
  }));

  const getWorkloadColor = (carga: number): string => {
    if (carga === 0) return "#FFC107";
    if (carga <= 2) return "#81C784";
    if (carga <= 4) return "#1976D2";
    if (carga <= 6) return "#FF9800";
    return "#D32F2F";
  };

  const totalDocentes = workloads.length;
  const docentesComCarga = workloads.filter((w) => w.cargaTotal > 0).length;
  const docentesSemCarga = workloads.filter((w) => w.cargaTotal === 0).length;
  const avgWorkload =
    workloads.reduce((sum, w) => sum + w.cargaTotal, 0) / totalDocentes;
  const maxWorkload = Math.max(...workloads.map((w) => w.cargaTotal));
  const minWorkload = Math.min(
    ...workloads.filter((w) => w.cargaTotal > 0).map((w) => w.cargaTotal),
    0
  );

  const variance =
    workloads.reduce(
      (sum, w) => sum + Math.pow(w.cargaTotal - avgWorkload, 2),
      0
    ) / totalDocentes;
  const stdDeviation = Math.sqrt(variance);

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Análise de Carga Didática - {solution.datetime}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          <Paper
            elevation={2}
            sx={{
              p: 2,
              textAlign: "center",
              bgcolor: "primary.50",
              borderRadius: 2,
            }}
          >
            <PersonIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {totalDocentes}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de Docentes
            </Typography>
          </Paper>

          <Paper
            elevation={2}
            sx={{
              p: 2,
              textAlign: "center",
              bgcolor: "success.50",
              borderRadius: 2,
            }}
          >
            <WorkIcon sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {docentesComCarga}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Com Atribuições
            </Typography>
          </Paper>

          <Paper
            elevation={2}
            sx={{
              p: 2,
              textAlign: "center",
              bgcolor: "warning.50",
              borderRadius: 2,
            }}
          >
            <TrendingUpIcon
              sx={{ fontSize: 40, color: "warning.main", mb: 1 }}
            />
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {avgWorkload.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Carga Média
            </Typography>
          </Paper>

          <Paper
            elevation={2}
            sx={{
              p: 2,
              textAlign: "center",
              bgcolor: "error.50",
              borderRadius: 2,
            }}
          >
            <TrendingDownIcon
              sx={{ fontSize: 40, color: "error.main", mb: 1 }}
            />
            <Typography variant="h4" color="error.main" fontWeight="bold">
              {docentesSemCarga}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sem Atribuições
            </Typography>
          </Paper>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Carga Máxima:</strong> {maxWorkload.toFixed(2)} •{" "}
            <strong>Carga Mínima (com atribuições):</strong>{" "}
            {minWorkload.toFixed(2)} • <strong>Desvio Padrão:</strong>{" "}
            {stdDeviation.toFixed(2)}
          </Typography>
        </Alert>

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
              series={[
                {
                  dataKey: "quantidade",
                  label: "Número de Docentes",
                  color: "#1976d2",
                  valueFormatter: (value: number | null) =>
                    value !== null ? `${value} docentes` : "",
                },
              ]}
              width={undefined}
              height={400}
              margin={{ left: 75, right: 75, bottom: 80 }}
              slotProps={{
                legend: {
                  direction: "row",
                  position: { vertical: "top", horizontal: "middle" },
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

        <Box
          sx={{
            mb: 3,
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            justifyContent: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{ width: "100%", textAlign: "center", mb: 1 }}
          >
            Legenda de Cores por Faixa de Carga:
          </Typography>
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

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Detalhes dos Docentes por Faixa de Carga
        </Typography>
        {groups.map((group) => (
          <Accordion
            key={group.cargaArredondada}
            expanded={expanded === group.cargaArredondada.toString()}
            onChange={(_, isExpanded) =>
              setExpanded(
                isExpanded ? group.cargaArredondada.toString() : false
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
                    minWidth: 100,
                    fontWeight: "bold",
                  }}
                />
                <Chip
                  icon={<PersonIcon />}
                  label={`${group.quantidade} ${
                    group.quantidade === 1 ? "docente" : "docentes"
                  }`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {group.docentes.map((docente, index) => (
                  <Box key={docente.nome}>
                    <ListItem
                      sx={{ flexDirection: "column", alignItems: "flex-start" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                          width: "100%",
                        }}
                      >
                        <Chip
                          label={`Saldo: ${docente.saldo.toFixed(2)}`}
                          size="small"
                          variant="outlined"
                          color={
                            docente.saldo > 2
                              ? "success"
                              : docente.saldo < -1
                              ? "error"
                              : "info"
                          }
                        />
                        <Typography variant="subtitle2" fontWeight="bold">
                          {docente.nome}
                        </Typography>
                        <Chip
                          label={`Carga Real: ${docente.cargaTotal.toFixed(4)}`}
                          size="small"
                          variant="outlined"
                          color="info"
                        />
                      </Box>
                      <Box sx={{ width: "100%" }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 0.5 }}
                        >
                          Disciplinas atribuídas ({docente.disciplinas.length}):
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                          }}
                        >
                          {docente.disciplinas.map((disciplina) => (
                            <Chip
                              key={disciplina.id}
                              label={`${disciplina.nome} (${disciplina.carga})`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem", height: 24 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </ListItem>
                    {index < group.docentes.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}

        <Paper
          elevation={1}
          sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 2 }}
        >
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Análise de Distribuição de Carga:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            <Chip
              label={`${groups.length} níveis diferentes de carga`}
              color="primary"
              size="small"
            />
            <Chip
              label={`${docentesComCarga} docentes com carga (${(
                (docentesComCarga / totalDocentes) *
                100
              ).toFixed(1)}%)`}
              color="success"
              size="small"
            />
            {docentesSemCarga > 0 && (
              <Chip
                label={`${docentesSemCarga} docentes sem carga (${(
                  (docentesSemCarga / totalDocentes) *
                  100
                ).toFixed(1)}%)`}
                color="warning"
                size="small"
              />
            )}
            <Chip
              label={`Amplitude: ${(maxWorkload - minWorkload).toFixed(2)}`}
              color="info"
              size="small"
            />
          </Box>
        </Paper>
      </CardContent>
    </Card>
  );
}
