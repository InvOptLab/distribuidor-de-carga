import { HistoricoSolucao } from "@/context/Global/utils";
import {
  Box,
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { Fragment, useCallback } from "react";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SolutionHistoryButtonGroup from "./SolutionHistoryButtonGroup";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";
import { useAlertsContext } from "@/context/Alerts";
import SolutionHistoryStatistics, {
  TreeDisciplina,
} from "./SolutionHistoryStatistics";
import { exportJson, getFormattedDate } from "@/app/atribuicoes";
import { useHistoryComponentContext } from "../context/history.context";
import { isMILP } from "@/algoritmo/communs/utils";
import { MathModelDisplay } from "@/components/MathModelDisplay";

interface SolutionHistoryRowProps {
  id: string;
  solucao: HistoricoSolucao;
  setHoveredCourese: React.Dispatch<
    React.SetStateAction<TreeDisciplina | null>
  >;
}

const SolutionHistoryRow: React.FC<SolutionHistoryRowProps> = ({
  id,
  solucao,
  setHoveredCourese,
}) => {
  //const [open, setOpen] = useState(false);

  const { idSolutionRowOpen, toggleIdSolutionRowState } =
    useHistoryComponentContext();

  const {
    removeSolutionFromHistory,
    restoreHistoryToSolution,
    solucaoAtual,
    historicoSolucoes,
  } = useSolutionHistory();
  const { addAlerta } = useAlertsContext();

  /**
   * Função a ser passada para o componente filho a fim de remover uma solução do histórico e apresentar
   * um feedback na tela.
   */
  const handleRemoveSolutionFromHistory = (id: string) => {
    removeSolutionFromHistory(id);
    addAlerta("A solução foi removida do histórico!", "warning");
  };

  /**
   * Função a ser passada para o componente filho a fim de atualizar a solução atual e apresentar
   * um feedback na tela.
   */
  const handleRestoreHistoryToSolution = (id: string) => {
    restoreHistoryToSolution(id);
    addAlerta(`A solução ${solucao.datetime} foi aplicada!`, "success");
  };

  const handleDownloadSolutionFromHistory = useCallback(
    (id: string) => {
      const filename = getFormattedDate() + ".json";
      exportJson(
        filename,
        solucao.contexto.docentes,
        solucao.contexto.disciplinas,
        solucao.solucao.atribuicoes,
        solucao.contexto.travas,
        historicoSolucoes.get(id)
      );

      addAlerta(`A solução ${solucao.datetime} foi baixada!`, "success");
    },
    [
      addAlerta,
      historicoSolucoes,
      solucao.contexto.disciplinas,
      solucao.contexto.docentes,
      solucao.contexto.travas,
      solucao.datetime,
      solucao.solucao.atribuicoes,
    ]
  );

  /**
   * Teste modelo
   */
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

  return (
    <Fragment key={`fragment_${id}`}>
      <TableRow
        key={`row_principal_${id}`}
        sx={{
          backgroundColor:
            solucaoAtual.idHistorico === id
              ? "rgba(25, 118, 210, 0.12)"
              : "white",
        }}
      >
        <TableCell key={`icon_${id}`}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => toggleIdSolutionRowState(id)}
          >
            {idSolutionRowOpen.get(id) ? (
              <KeyboardArrowUpIcon key={`arrowUp_${id}`} />
            ) : (
              <KeyboardArrowDownIcon key={`arrowDown_${id}`} />
            )}
          </IconButton>
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          align="center"
          key={`identificador_${id}`}
          // sx={{fontWeight: solucaoAtual.idHistorico === id ? 'bold' : 'normal'}}
        >
          {solucao.datetime}
        </TableCell>
        <TableCell align="center" key={`avaliacao_${id}`}>
          {solucao.solucao.avaliacao}
        </TableCell>
        <TableCell align="center" key={`insercao_${id}`}>
          {solucao.tipoInsercao}
        </TableCell>
        <TableCell align="center" key={`botoes_${id}`}>
          <SolutionHistoryButtonGroup
            key={`SolutionHistoryButtonGroup_${id}`}
            id={id}
            remove={handleRemoveSolutionFromHistory}
            restore={handleRestoreHistoryToSolution}
            download={handleDownloadSolutionFromHistory}
          />
        </TableCell>
      </TableRow>
      <TableRow key={`row_collapse_${id}`}>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={6}
          key={`cell_collapse_${id}`}
        >
          <Collapse
            in={idSolutionRowOpen.get(id)}
            timeout="auto"
            unmountOnExit
            key={`collapse_${id}`}
          >
            <Box sx={{ margin: 1 }} key={`box_collapse_${id}`}>
              <Typography
                variant="h6"
                gutterBottom
                component="div"
                key={`collapse_details_${id}`}
              >
                Detalhes
              </Typography>
              <SolutionHistoryStatistics
                key={`componente_estatisticas_${id}`}
                id={id}
                solucao={solucao}
                setHoveredCourese={setHoveredCourese}
              />
              <Box maxWidth="100%">
                {isMILP(solucao.algorithm) && (
                  <MathModelDisplay
                    title="Problema de Atribuição de Docentes (FAP / TAP)"
                    latexString={fapModel}
                  />
                )}
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};

export default SolutionHistoryRow;
