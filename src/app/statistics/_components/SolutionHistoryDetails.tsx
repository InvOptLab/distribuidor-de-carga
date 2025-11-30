"use client";

import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid2,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tooltip,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import { BarChart, LineChart } from "@mui/x-charts";
import ConstraintsBarCharts from "./ConstraintsBarCharts";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ShuffleOutlinedIcon from "@mui/icons-material/ShuffleOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import ShutterSpeedOutlinedIcon from "@mui/icons-material/ShutterSpeedOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import LinearScaleIcon from "@mui/icons-material/LinearScale";
import ChartContainer from "./ChartContainer";
import { HistoricoSolucao } from "@/context/Global/utils";
import { AVAILABLE_ALGORITHMS } from "@/app/types/algorithm-types";
import { isHeuristicAlgorithm, isTabuSearch } from "@/algoritmo/communs/utils";
import { Solution } from "@/algoritmo/metodos/TabuSearch/TabuList/Solution";
import { Moviment } from "@/algoritmo/metodos/TabuSearch/TabuList/Moviment";

export default function SolutionHistoryDetails({
  solucao,
}: {
  solucao: HistoricoSolucao;
}) {
  const algorithmType = solucao.algorithm?.name || "tabu-search";
  const algorithmConfig = AVAILABLE_ALGORITHMS.find(
    (alg) => alg.id === algorithmType
  );
  const algorithmName = algorithmConfig?.name || "Algoritmo Desconhecido";
  const algoritmo = solucao.algorithm;

  // const shouldShowSection = (sectionId: string): boolean => {
  //   if (!algorithmConfig) return false;
  //   return algorithmConfig.configSections.some(
  //     (section) => section.id === sectionId
  //   );
  // };

  if (!solucao) {
    return <Typography variant="h6">Solução não encontrada!</Typography>;
  }

  // // Adiciona uma verificação de 'algoritmo' nulo.
  // if (!algoritmo) {
  //   return (
  //     <Box sx={{ padding: 3 }}>
  //       <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
  //         <Alert severity="warning">
  //           Os detalhes de configuração do algoritmo não foram salvos nesta
  //           solução.
  //         </Alert>
  //       </Paper>
  //     </Box>
  //   );
  // }

  const selectOcorrenciasToDisplay = (
    ocorrencias: Map<
      string,
      {
        label: string;
        qtd: number;
      }[]
    >,
    type: "restricoes" | "carga"
  ) => {
    const data = new Map<
      string,
      {
        label: string;
        qtd: number;
      }[]
    >();

    for (const [key, constraint] of ocorrencias.entries()) {
      if (key === "Carga de Trabalho") {
        if (type === "restricoes") {
          data.set(key, constraint.slice(0, 2));
        } else {
          data.set(key, constraint.slice(2));
        }
      } else if (type === "restricoes") {
        data.set(key, constraint);
      }
    }

    return data;
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom align="center">
            Detalhes da Solução
          </Typography>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body1">
              <strong>Algoritmo Utilizado:</strong> {algorithmName}
            </Typography>
          </Alert>

          <Card
            elevation={3}
            sx={{ padding: 2, borderRadius: 2, marginBottom: 2 }}
          >
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="body1">
                  <b>Data e Hora:</b> {solucao.datetime}
                </Typography>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="body1">
                  <b>Inserção:</b> {solucao.tipoInsercao}
                </Typography>
              </Grid2>
              <Grid2
                size={{ xs: 12, sm: 6, md: 4 }}
                display="flex"
                alignContent="center"
                alignItems="center"
                flexDirection="row"
                flexWrap="wrap"
                justifyContent="flex-start"
              >
                <Typography variant="body1">
                  <b>Interrompido:</b>{" "}
                </Typography>
                {solucao.solucao.estatisticas &&
                solucao.solucao.estatisticas.interrupcao ? (
                  <Chip label="Sim" color="error" />
                ) : (
                  <Chip label="Não" color="success" />
                )}
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="body1">
                  <b>Avaliação:</b> {solucao.solucao.avaliacao}
                </Typography>
              </Grid2>
              {solucao.solucao.estatisticas &&
                solucao.solucao.estatisticas.tempoExecucao && (
                  <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                    <Tooltip
                      title={`${Math.floor(
                        solucao.solucao.estatisticas.tempoExecucao / 60000
                      )} min ${(
                        (solucao.solucao.estatisticas.tempoExecucao % 60000) /
                        1000
                      ).toFixed(3)} s`}
                      arrow
                    >
                      <Typography variant="body1" sx={{ cursor: "help" }}>
                        <b>Tempo de Execução:</b>{" "}
                        {solucao.solucao.estatisticas.tempoExecucao} ms
                      </Typography>
                    </Tooltip>
                  </Grid2>
                )}
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="body1">
                  <b>Iterações:</b>{" "}
                  {solucao.solucao.estatisticas &&
                  solucao.solucao.estatisticas.iteracoes
                    ? solucao.solucao.estatisticas.iteracoes
                    : "Dado não informado!"}
                </Typography>
              </Grid2>
            </Grid2>
          </Card>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h4" gutterBottom>
          Configurações
        </Typography>

        {algoritmo && isTabuSearch(algoritmo) && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Parâmetros Globais</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key="tabuList">
                  <Card
                    elevation={3}
                    sx={{
                      padding: 2,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      minHeight: 100,
                      textAlign: "center",
                      backgroundColor: "#e3f2fd",
                      border: "2px solid #1976d2",
                    }}
                  >
                    <Tooltip title="Define a quantidade máxima de elementos armazenados na lista tabu.">
                      <InfoOutlinedIcon
                        color="primary"
                        sx={{ fontSize: 40, marginRight: 2 }}
                      />
                    </Tooltip>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        Tamanho da Lista Tabu
                      </Typography>
                      <Typography variant="h5" color="primary">
                        {algoritmo.tabuList instanceof Solution
                          ? algoritmo.tabuList.tabuSize
                          : algoritmo.tabuList instanceof Moviment
                          ? `${algoritmo.tabuList.tenures.add} - ${algoritmo.tabuList.tenures.drop}`
                          : "N/A"}
                      </Typography>
                    </Box>
                  </Card>
                </Grid2>
              </Grid2>
            </AccordionDetails>
          </Accordion>
        )}

        {algoritmo && algoritmo.constraints && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Restrições</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid2 container spacing={2}>
                {[
                  ...algoritmo.constraints.hard.values(),
                  ...algoritmo.constraints.soft.values(),
                ].map((constraint) => (
                  <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={constraint.name}>
                    <Card
                      elevation={3}
                      sx={{
                        padding: 2,
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        minHeight: 150,
                        textAlign: "center",
                        backgroundColor: constraint.isHard
                          ? "#ffebee"
                          : "#fff3cd",
                        border: constraint.isHard
                          ? "2px solid #d32f2f"
                          : "2px solid #ffb300",
                      }}
                    >
                      {constraint.isHard ? (
                        <ErrorOutlineIcon
                          color="error"
                          sx={{ fontSize: 40, marginBottom: 1 }}
                        />
                      ) : (
                        <TrendingDownOutlinedIcon
                          sx={{
                            fontSize: 40,
                            marginBottom: 1,
                            color: "#ffb300",
                          }}
                        />
                      )}
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {constraint.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {constraint.isHard
                            ? "Restrição Hard (Obrigatória)"
                            : "Restrição Soft (Flexível)"}
                        </Typography>
                        {!constraint.isHard && (
                          <Typography
                            variant="body2"
                            color="error"
                            fontWeight="bold"
                          >
                            Penalidade: {constraint.penalty}
                          </Typography>
                        )}
                      </Box>
                    </Card>
                  </Grid2>
                ))}
              </Grid2>
            </AccordionDetails>
          </Accordion>
        )}

        {algoritmo &&
          isHeuristicAlgorithm(algoritmo) &&
          algoritmo.neighborhoodPipe && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Geração da Vizinhança</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid2 container spacing={2}>
                  {Array.from(algoritmo.neighborhoodPipe.values()).map(
                    (genFunc) => (
                      <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={genFunc.name}>
                        <Card
                          elevation={3}
                          sx={{
                            padding: 2,
                            borderRadius: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: 150,
                            textAlign: "center",
                            backgroundColor: "#fff3e0",
                            border: "2px solid #ff9800",
                          }}
                        >
                          <ShuffleOutlinedIcon
                            color="warning"
                            sx={{ fontSize: 40, marginBottom: 1 }}
                          />
                          <Typography variant="body1" fontWeight="bold">
                            {genFunc.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {genFunc.description}
                          </Typography>
                        </Card>
                      </Grid2>
                    )
                  )}
                </Grid2>
              </AccordionDetails>
            </Accordion>
          )}

        {isHeuristicAlgorithm(algoritmo) && algoritmo?.stopPipe && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Interrupção</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid2 container spacing={2}>
                {Array.from(algoritmo.stopPipe.values()).map((stopFunc) => {
                  let details = null;
                  let icon = (
                    <PauseCircleOutlineOutlinedIcon
                      color="warning"
                      sx={{ fontSize: 40, marginBottom: 1 }}
                    />
                  );

                  if (stopFunc.name === "Iterações sem Modificação") {
                    details = `Iterações sem modificação: ${
                      (stopFunc as any).limiteIteracoesSemModificacao || "N/A"
                    }`;
                    icon = (
                      <ShutterSpeedOutlinedIcon
                        color="warning"
                        sx={{ fontSize: 40, marginBottom: 1 }}
                      />
                    );
                  } else if (stopFunc.name === "Iterações Máximas") {
                    details = `Quantidade máxima de iterações: ${
                      (stopFunc as any).maxIteracoes || "N/A"
                    }`;
                    icon = (
                      <TimerOutlinedIcon
                        color="error"
                        sx={{ fontSize: 40, marginBottom: 1 }}
                      />
                    );
                  } else if (
                    stopFunc.name === "Iterações sem Melhora na Avaliação"
                  ) {
                    details = `Quantidade máxima de iterações sem modificação: ${
                      (stopFunc as any).limiteIteracoesSemMelhoraAvaliacao ||
                      "N/A"
                    }`;
                    icon = (
                      <LinearScaleIcon
                        color="error"
                        sx={{ fontSize: 40, marginBottom: 1 }}
                      />
                    );
                  }

                  return (
                    <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={stopFunc.name}>
                      <Card
                        elevation={3}
                        sx={{
                          padding: 2,
                          borderRadius: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: 150,
                          textAlign: "center",
                          backgroundColor: "#e3f2fd",
                          border: "2px solid #1976d2",
                        }}
                      >
                        {icon}
                        <Typography variant="body1" fontWeight="bold">
                          {stopFunc.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {stopFunc.description}
                        </Typography>
                        {details && (
                          <Typography
                            variant="body2"
                            color="error"
                            fontWeight="bold"
                          >
                            {details}
                          </Typography>
                        )}
                      </Card>
                    </Grid2>
                  );
                })}
              </Grid2>
            </AccordionDetails>
          </Accordion>
        )}

        {isTabuSearch(algoritmo) && algoritmo?.aspirationPipe && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Critérios de Aspiração</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid2 container spacing={2}>
                {Array.from(algoritmo.aspirationPipe.values()).map(
                  (aspirationFunc) => (
                    <Grid2
                      size={{ xs: 12, sm: 6, md: 4 }}
                      key={aspirationFunc.name}
                    >
                      <Card
                        elevation={3}
                        sx={{
                          padding: 2,
                          borderRadius: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: 150,
                          textAlign: "center",
                          backgroundColor: "#e8f5e9",
                          border: "2px solid #2e7d32",
                        }}
                      >
                        <CheckCircleOutlineOutlinedIcon
                          color="success"
                          sx={{ fontSize: 40, marginBottom: 1 }}
                        />
                        <Typography variant="body1" fontWeight="bold">
                          {aspirationFunc.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {aspirationFunc.description}
                        </Typography>
                        {(aspirationFunc as any).iteracoesParaAceitacao && (
                          <Typography
                            variant="body2"
                            color="textPrimary"
                            fontWeight="bold"
                          >
                            Iterações para aceitação:{" "}
                            {(aspirationFunc as any).iteracoesParaAceitacao}
                          </Typography>
                        )}
                      </Card>
                    </Grid2>
                  )
                )}
              </Grid2>
            </AccordionDetails>
          </Accordion>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h4" gutterBottom>
          Gráficos
        </Typography>

        <Grid2 container spacing={3}>
          {solucao.solucao.estatisticas &&
          solucao.solucao.estatisticas.docentesPrioridade &&
          solucao.solucao.estatisticas.docentesPrioridade.size > 0 ? (
            <Grid2 size={{ xs: 12 }}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" align="center" gutterBottom>
                    Histograma Quantidade de Atribuições por Prioridade
                  </Typography>
                  <ChartContainer
                    chartData={{
                      xAxis: {
                        data: Array.from(
                          solucao.solucao.estatisticas.docentesPrioridade
                            .keys()
                            .map((item) => item.toString())
                        ),
                        label: "Prioridade",
                      },
                      yAxis: {
                        label: "Prioridade",
                      },
                      series: [
                        {
                          label: "Prioridade",
                          data: Array.from(
                            solucao.solucao.estatisticas.docentesPrioridade.values()
                          ),
                        },
                      ],
                      showBarValues: true,
                    }}
                  >
                    <BarChart
                      key="histograma_quantidade_atribuicoes_por_prioridade"
                      xAxis={[
                        {
                          scaleType: "band",
                          label: "Prioridades",
                          data: Array.from(
                            solucao.solucao.estatisticas.docentesPrioridade.keys()
                          ),
                        },
                      ]}
                      series={[
                        {
                          label: "Prioridade",
                          data: Array.from(
                            solucao.solucao.estatisticas.docentesPrioridade.values()
                          ),
                        },
                      ]}
                      height={300}
                      grid={{ vertical: false, horizontal: true }}
                      yAxis={[{ label: "Quantidade" }]}
                      margin={{ left: 75, right: 75 }}
                      barLabel="value"
                    />
                  </ChartContainer>
                </CardContent>
              </Card>
            </Grid2>
          ) : (
            <Grid2 size={{ xs: 12 }}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" align="center" gutterBottom>
                    Histograma Quantidade de Atribuições por Prioridade
                  </Typography>
                  <Alert severity="warning">
                    Dados de prioridade não disponíveis para esta solução.
                  </Alert>
                </CardContent>
              </Card>
            </Grid2>
          )}

          {solucao.solucao.estatisticas &&
          solucao.solucao.estatisticas.avaliacaoPorIteracao &&
          solucao.solucao.estatisticas.avaliacaoPorIteracao.size > 0 ? (
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" align="center" gutterBottom>
                    Gráfico Avaliação por Iteração
                  </Typography>
                  {/* <ChartContainer> */}
                  <LineChart
                    xAxis={[
                      {
                        data: Array.from(
                          solucao.solucao.estatisticas.avaliacaoPorIteracao.keys()
                        ),
                        label: "Iteração",
                      },
                    ]}
                    series={[
                      {
                        data: Array.from(
                          solucao.solucao.estatisticas.avaliacaoPorIteracao.values()
                        ),
                        label: "Avaliação",
                        color: "#1C77C3",
                      },
                    ]}
                    grid={{ vertical: true, horizontal: true }}
                    height={300}
                    margin={{ left: 75, right: 75 }}
                  />
                  {/* </ChartContainer> */}
                </CardContent>
              </Card>
            </Grid2>
          ) : (
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" align="center" gutterBottom>
                    Gráfico Avaliação por Iteração
                  </Typography>
                  <Alert severity="warning">
                    Dados de avaliação por iteração não disponíveis para esta
                    solução.
                  </Alert>
                </CardContent>
              </Card>
            </Grid2>
          )}

          {solucao.solucao.estatisticas &&
          solucao.solucao.estatisticas.tempoPorIteracao &&
          solucao.solucao.estatisticas.tempoPorIteracao.size > 0 ? (
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" align="center" gutterBottom>
                    Gráfico Tempo (ms) por Iteração
                  </Typography>
                  {/* <ChartContainer> */}
                  <LineChart
                    xAxis={[
                      {
                        data: Array.from(
                          solucao.solucao.estatisticas.tempoPorIteracao.keys()
                        ),
                        label: "Iteração",
                      },
                    ]}
                    // yAxis={[
                    //   {
                    //     label: "Tempo (ms)",
                    //   },
                    // ]}
                    series={[
                      {
                        data: Array.from(
                          solucao.solucao.estatisticas.tempoPorIteracao.values()
                        ),
                        label: "Tempo (ms)",
                        color: "#F39237",
                      },
                    ]}
                    grid={{ vertical: true, horizontal: true }}
                    height={300}
                    margin={{ left: 75, right: 75 }}
                  />
                  {/* </ChartContainer> */}
                </CardContent>
              </Card>
            </Grid2>
          ) : (
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" align="center" gutterBottom>
                    Gráfico Tempo (ms) por Iteração
                  </Typography>
                  <Alert severity="warning">
                    Dados de tempo por iteração não disponíveis para esta
                    solução.
                  </Alert>
                </CardContent>
              </Card>
            </Grid2>
          )}

          {solucao.solucao.estatisticas &&
          solucao.solucao.estatisticas.qtdOcorrenciasRestricoes &&
          solucao.solucao.estatisticas.qtdOcorrenciasRestricoes.size > 0 ? (
            <Grid2 size={{ xs: 12 }}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" align="center" gutterBottom>
                    Histograma Ocorrências de Restrições
                  </Typography>
                  {/* <ChartContainer> */}
                  <ConstraintsBarCharts
                    ocorrencias={selectOcorrenciasToDisplay(
                      solucao.solucao.estatisticas.qtdOcorrenciasRestricoes,
                      "restricoes"
                    )}
                  />
                  {/* </ChartContainer> */}
                </CardContent>
              </Card>
            </Grid2>
          ) : (
            <Grid2 size={{ xs: 12 }}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" align="center" gutterBottom>
                    Histograma Ocorrências de Restrições
                  </Typography>
                  <Alert severity="warning">
                    Dados de ocorrências de restrições não disponíveis para esta
                    solução.
                  </Alert>
                </CardContent>
              </Card>
            </Grid2>
          )}
        </Grid2>
      </Paper>
    </Box>
  );
}
