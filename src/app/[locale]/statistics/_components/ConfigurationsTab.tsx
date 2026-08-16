import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import ShuffleOutlinedIcon from "@mui/icons-material/ShuffleOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import ShutterSpeedOutlinedIcon from "@mui/icons-material/ShutterSpeedOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import LinearScaleIcon from "@mui/icons-material/LinearScale";
import { HistoricoSolucao } from "@/context/Global/utils";
import {
  isHeuristicAlgorithm,
  isTabuSearch,
  isSimulatedAnnealing,
} from "@/algoritmo/communs/utils";
import { useTranslations } from "next-intl";

interface ConfigurationsTabProps {
  solucao: HistoricoSolucao;
}

export default function ConfigurationsTab({ solucao }: ConfigurationsTabProps) {
  const t = useTranslations("Pages.Statistics.SolutionHistoryDetails");
  const algoritmo = solucao.algorithm;

  if (!algoritmo) {
    return (
      <Box sx={{ mt: 2, p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          Os detalhes de configuração do algoritmo não foram salvos nesta
          solução.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        {t("configurations")}
      </Typography>

      {isTabuSearch(algoritmo) && (
        <Accordion elevation={2} sx={{ mb: 2, borderRadius: 2, "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" fontWeight="500">{t("globalParameters")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key="tabuListType">
                <Card
                  elevation={0}
                  sx={{
                    padding: 2,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 100,
                    textAlign: "center",
                    backgroundColor: "#e3f2fd",
                    border: "1px solid #90caf9",
                  }}
                >
                  <Tooltip title="Define a estrutura utilizada para representar a lista tabu.">
                    <InfoOutlinedIcon
                      color="primary"
                      sx={{ fontSize: 40, marginRight: 2 }}
                    />
                  </Tooltip>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {t("tabuListType")}
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {(algoritmo as any).tabuList?._name || (algoritmo as any).tabuList?.constructor?.name || "N/A"}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }} key="tabuListSize">
                <Card
                  elevation={0}
                  sx={{
                    padding: 2,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 100,
                    textAlign: "center",
                    backgroundColor: "#e3f2fd",
                    border: "1px solid #90caf9",
                  }}
                >
                  <Tooltip title="Define a quantidade máxima de elementos armazenados na lista tabu.">
                    <InfoOutlinedIcon
                      color="primary"
                      sx={{ fontSize: 40, marginRight: 2 }}
                    />
                  </Tooltip>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {t("tabuListSize")}
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {(() => {
                        const tSize = (algoritmo as any).tabuList?.tabuSize;
                        if (tSize == null) return "N/A";
                        if (typeof tSize === "object" && "add" in tSize && "drop" in tSize) {
                          return `Add: ${tSize.add} / Drop: ${tSize.drop}`;
                        }
                        return String(tSize);
                      })()}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {isSimulatedAnnealing(algoritmo) && (
        <Accordion elevation={2} sx={{ mb: 2, borderRadius: 2, "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" fontWeight="500">{t("globalParameters")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key="initialTemperature">
                <Card
                  elevation={0}
                  sx={{
                    padding: 2,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 100,
                    textAlign: "center",
                    backgroundColor: "#e3f2fd",
                    border: "1px solid #90caf9",
                  }}
                >
                  <Tooltip title="Temperatura Inicial (T0)">
                    <InfoOutlinedIcon
                      color="primary"
                      sx={{ fontSize: 40, marginRight: 2 }}
                    />
                  </Tooltip>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      Temperatura Inicial
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {(algoritmo as any).initialTemperature || "N/A"}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }} key="coolingRate">
                <Card
                  elevation={0}
                  sx={{
                    padding: 2,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 100,
                    textAlign: "center",
                    backgroundColor: "#e3f2fd",
                    border: "1px solid #90caf9",
                  }}
                >
                  <Tooltip title="Taxa de Resfriamento (Alpha)">
                    <InfoOutlinedIcon
                      color="primary"
                      sx={{ fontSize: 40, marginRight: 2 }}
                    />
                  </Tooltip>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      Taxa de Resfriamento
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {(algoritmo as any).coolingRate || "N/A"}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }} key="iterationsPerTemperature">
                <Card
                  elevation={0}
                  sx={{
                    padding: 2,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 100,
                    textAlign: "center",
                    backgroundColor: "#e3f2fd",
                    border: "1px solid #90caf9",
                  }}
                >
                  <Tooltip title="Iterações por Temperatura (L)">
                    <InfoOutlinedIcon
                      color="primary"
                      sx={{ fontSize: 40, marginRight: 2 }}
                    />
                  </Tooltip>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      Iter. por Temperatura
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {(algoritmo as any).iterationsPerTemperature || "N/A"}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {algoritmo.constraints && (
        <Accordion elevation={2} sx={{ mb: 2, borderRadius: 2, "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" fontWeight="500">{t("constraints")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {[
                ...algoritmo.constraints.hard.values(),
                ...algoritmo.constraints.soft.values(),
              ].map((constraint) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={constraint.name}>
                  <Card
                    elevation={0}
                    sx={{
                      padding: 2,
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      minHeight: 150,
                      textAlign: "center",
                      backgroundColor: constraint.isHard ? "#ffebee" : "#fff3cd",
                      border: constraint.isHard
                        ? "1px solid #ef9a9a"
                        : "1px solid #ffe082",
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
                      <Typography variant="body2" fontWeight="bold">
                        {constraint.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {constraint.isHard
                          ? "Restrição Hard (Obrigatória)"
                          : "Restrição Soft (Flexível)"}
                      </Typography>
                      {!constraint.isHard && (
                        <Typography
                          variant="caption"
                          color="error"
                          fontWeight="bold"
                          display="block"
                        >
                          Penalidade: {constraint.penalty}
                        </Typography>
                      )}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {isHeuristicAlgorithm(algoritmo) && algoritmo.neighborhoodPipe && (
        <Accordion elevation={2} sx={{ mb: 2, borderRadius: 2, "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" fontWeight="500">
              {t("neighborhoodGeneration")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {Array.from(algoritmo.neighborhoodPipe.values())
                .filter((genFuncEntry: any) => genFuncEntry.instance ? genFuncEntry.isActive : genFuncEntry.isActive !== false)
                .map(
                (genFuncEntry: any, index) => {
                  const genFunc = genFuncEntry.instance || genFuncEntry;
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`neighborhood-${genFunc.name || index}-${index}`}>
                      <Card
                        elevation={0}
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
                          border: "1px solid #ffcc80",
                        }}
                      >
                        <ShuffleOutlinedIcon
                          color="warning"
                          sx={{ fontSize: 40, marginBottom: 1 }}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {genFunc.name || genFunc._name || "Desconhecido"}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {genFunc.description || ""}
                        </Typography>
                      </Card>
                    </Grid>
                  );
                },
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {isHeuristicAlgorithm(algoritmo) && algoritmo?.stopPipe && (
        <Accordion elevation={2} sx={{ mb: 2, borderRadius: 2, "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" fontWeight="500">{t("interruption")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {Array.from(algoritmo.stopPipe.values())
                .filter((stopFuncEntry: any) => stopFuncEntry.instance ? stopFuncEntry.isActive : stopFuncEntry.isActive !== false)
                .map((stopFuncEntry: any, index) => {
                const stopFunc = stopFuncEntry.instance || stopFuncEntry;
                let details = null;
                let icon = (
                  <PauseCircleOutlineOutlinedIcon
                    color="warning"
                    sx={{ fontSize: 40, marginBottom: 1 }}
                  />
                );

                if (stopFunc._name === "IteracoesSemModificacao" || stopFunc.name === "Iterações sem Modificação") {
                  details = `Iterações sem modificação: ${
                    (stopFunc as any).limiteIteracoesSemModificacao || "N/A"
                  }`;
                  icon = (
                    <ShutterSpeedOutlinedIcon
                      color="warning"
                      sx={{ fontSize: 40, marginBottom: 1 }}
                    />
                  );
                } else if (stopFunc._name === "IteracoesMaximas" || stopFunc.name === "Iterações Máximas") {
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
                  stopFunc._name === "IteracoesSemMelhoraAvaliacao" || stopFunc.name === "Iterações sem Melhora na Avaliação"
                ) {
                  details = `Iterações sem melhoria: ${
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
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`stopFunc-${stopFunc._name || stopFunc.name || index}`}>
                    <Card
                      elevation={0}
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
                        border: "1px solid #90caf9",
                      }}
                    >
                      {icon}
                      <Typography variant="body2" fontWeight="bold">
                        {stopFunc.name || stopFunc._name || "Desconhecido"}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {stopFunc.description || ""}
                      </Typography>
                      {details && (
                        <Typography
                          variant="caption"
                          color="error"
                          fontWeight="bold"
                          display="block"
                        >
                          {details}
                        </Typography>
                      )}
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {isTabuSearch(algoritmo) && algoritmo?.aspirationPipe && (
        <Accordion elevation={2} sx={{ mb: 2, borderRadius: 2, "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" fontWeight="500">{t("aspirationCriteria")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {Array.from(algoritmo.aspirationPipe.values())
                .filter((aspirationFuncEntry: any) => aspirationFuncEntry.instance ? aspirationFuncEntry.isActive : aspirationFuncEntry.isActive !== false)
                .map(
                (aspirationFuncEntry: any, index) => {
                  const aspirationFunc = aspirationFuncEntry.instance || aspirationFuncEntry;
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`aspirationFunc-${aspirationFunc._name || aspirationFunc.name || index}`}>
                      <Card
                        elevation={0}
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
                          border: "1px solid #a5d6a7",
                        }}
                      >
                        <CheckCircleOutlineOutlinedIcon
                          color="success"
                          sx={{ fontSize: 40, marginBottom: 1 }}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {aspirationFunc.name || aspirationFunc._name || "Desconhecido"}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {aspirationFunc.description || ""}
                        </Typography>
                        {(aspirationFunc as any).iteracoesParaAceitacao && (
                          <Typography
                            variant="caption"
                            color="success"
                            fontWeight="bold"
                            display="block"
                          >
                            Iterações para aceite:{" "}
                            {(aspirationFunc as any).iteracoesParaAceitacao}
                          </Typography>
                        )}
                      </Card>
                    </Grid>
                  );
                },
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}
