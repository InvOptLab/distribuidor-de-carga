import { HistoricoSolucao } from "@/context/Global/utils";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useState } from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SolutionHistoryButtonGroup from "./SolutionHistoryButtonGroup";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";
import { useAlertsContext } from "@/context/Alerts";
import { useTranslations } from "next-intl";
import SolutionHistoryStatistics, {
  TreeDisciplina,
} from "./SolutionHistoryStatistics";
import { exportJson, getFormattedDate } from "@/app/[locale]/atribuicoes";
import { useHistoryComponentContext } from "../context/history.context";
import { isMILP } from "@/algoritmo/communs/utils";
import { MathModelDisplay } from "@/components/MathModelDisplay";

interface SolutionHistoryCardProps {
  id: string;
  solucao: HistoricoSolucao;
  setHoveredCourese: React.Dispatch<React.SetStateAction<TreeDisciplina | null>>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`history-tabpanel-${index}`}
      aria-labelledby={`history-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SolutionHistoryCard: React.FC<SolutionHistoryCardProps> = ({
  id,
  solucao,
  setHoveredCourese,
}) => {
  const t = useTranslations("Pages.History");

  const { idSolutionRowOpen, toggleIdSolutionRowState } =
    useHistoryComponentContext();

  const {
    removeSolutionFromHistory,
    restoreHistoryToSolution,
    solucaoAtual,
    historicoSolucoes,
  } = useSolutionHistory();
  const { addAlerta } = useAlertsContext();

  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRemoveSolutionFromHistory = (id: string) => {
    removeSolutionFromHistory(id);
    addAlerta(t("Alerts.removed"), "warning");
  };

  const handleRestoreHistoryToSolution = (id: string) => {
    restoreHistoryToSolution(id);
    addAlerta(t("Alerts.applied", { datetime: solucao.datetime }), "success");
  };

  const handleDownloadSolutionFromHistory = (id: string) => {
    const filename = getFormattedDate() + ".json";
    exportJson(
      filename,
      solucao.contexto.docentes,
      solucao.contexto.disciplinas,
      solucao.solucao.atribuicoes,
      solucao.contexto.travas,
      historicoSolucoes.get(id),
    );

    addAlerta(t("Alerts.downloaded", { datetime: solucao.datetime }), "success");
  };

  const fapModel = String.raw`
  \begin{aligned}
  \begin{equation}
      \begin{split}
          \max \quad & K_1 \cdot \sum_{i \in D} \sum_{j \in T}  x_{i,j} \cdot p_{i,j}
          - K_{2} \cdot \sum_{j \in T} u_{j}
          - K_{3} \cdot \sum_{i \in D} \sum_{(j, k) \in F} v_{i,j,k}
          - K_{4} \cdot \sum_{i \in D}{ \omega_{i} \cdot z_{i}}
          - K_{5} \cdot \sum_{i \in D}{ \eta_{i} \cdot w_{i} }
      \end{split}
  \end{equation} \\

  \textit{S.A}

  \begin{equation}
      \sum_{i \in D} x_{i,j} + u_{j} = 1 \quad \quad \forall j \in T 
  \end{equation} \\

  \begin{equation}
      x_{i,j} \le P_{i,j} + m_{i,j} \quad \quad \forall i \in D, \forall j \in T 
  \end{equation} \\

  \begin{equation}
      x_{i,j} = a_{i,j} \quad \quad \forall i \in D, \forall j \in T \mid m_{i,j} = 1 
  \end{equation} \\

  \begin{equation}
      x_{i,j} + x_{i,k} - v_{i,j,k} \le 1 \quad \forall i \in D, \forall (j,k) \in F 
  \end{equation} \\

  \begin{equation}
      \sum_{j \in T}{c_{j} \cdot x_{i, j}} + \text{BigM} \cdot z_{i} \ge L_{\text{inf}} \quad \quad \forall i \in D
  \end{equation} \\

  \begin{equation}
      \sum_{j \in T}{c_{j} \cdot x_{i, j}} \le L_{\text{sup}} + w_{i} \quad \quad \forall i \in D
  \end{equation} \\

  \begin{equation}
      \text{BigM} = \sum_{j \in T} c_{j}
  \end{equation}
  \end{aligned}
`;

  const isExpanded = idSolutionRowOpen.get(id) || false;
  const isCurrent = solucaoAtual.idHistorico === id;

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2, 
        borderColor: isCurrent ? "primary.main" : "divider",
        borderWidth: isCurrent ? 2 : 1,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 2
        }
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6">{solucao.datetime}</Typography>
            <Chip 
              label={solucao.tipoInsercao} 
              size="small" 
              color="secondary" 
              variant="outlined"
            />
            {isCurrent && (
              <Chip label={t("Alerts.currentSolution") || "Solução Atual"} size="small" color="primary" />
            )}
          </Box>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            {t("columns.evaluation") || "Avaliação"}: {solucao.solucao.avaliacao}
          </Typography>
        }
        action={
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <SolutionHistoryButtonGroup
              id={id}
              remove={handleRemoveSolutionFromHistory}
              restore={handleRestoreHistoryToSolution}
              download={handleDownloadSolutionFromHistory}
            />
            <IconButton onClick={() => toggleIdSolutionRowState(id)} aria-label="expand">
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        }
      />
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="solution history tabs">
              <Tab label={t("tabs.assignments") || "Atribuições"} />
              {isMILP(solucao.algorithm) && <Tab label={t("tabs.mathModel") || "Modelo Matemático"} />}
            </Tabs>
          </Box>
          <CustomTabPanel value={tabValue} index={0}>
            <SolutionHistoryStatistics
              id={id}
              solucao={solucao}
              setHoveredCourese={setHoveredCourese}
            />
          </CustomTabPanel>
          {isMILP(solucao.algorithm) && (
            <CustomTabPanel value={tabValue} index={1}>
              <MathModelDisplay
                title="Problema de Atribuição de Docentes (FAP / TAP)"
                latexString={fapModel}
              />
            </CustomTabPanel>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default SolutionHistoryCard;
