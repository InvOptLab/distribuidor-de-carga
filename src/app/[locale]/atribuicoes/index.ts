import Algorithm from "@/algoritmo/abstractions/Algorithm";
import { Statistics } from "@/algoritmo/classes/Statistics";
import { Solucao } from "@/algoritmo/communs/interfaces/interfaces";
import {
  Atribuicao,
  ContextoExecucao,
  Disciplina,
  Docente,
  HistoricoSolucao,
  TipoInsercao,
} from "@/context/Global/utils";
import { addNewSolutionToHistory } from "@/context/SolutionHistory/utils";

export { exportJson, getFormattedDate, buildExportPayload } from "./io/exportJson";

/**
 * Salvar as atribuições no state do histórico em casos em que o usuário tenha feito alterações manuais.
 * @param atribuicoes
 * @param avaliacao
 * @param historicoSolucoes
 * @param setSolucaoAtual
 * @param setHistoricoSolucoes
 * @param addNewSolutionToHistory
 */
export function saveAtribuicoesInHistoryState(
  atribuicoes: Atribuicao[],
  avaliacao: number,
  historicoSolucoes: Map<string, HistoricoSolucao>,
  setHistoricoSolucoes,
  setSolucaoAtual,
  contextoExecucao: ContextoExecucao,
  algorithm?: Algorithm<any>,
  statistics?: Statistics,
) {
  const novaSolucao: Solucao = {
    atribuicoes: atribuicoes,
    avaliacao: avaliacao,
    algorithm: algorithm,
    estatisticas: statistics,
  };

  const id = addNewSolutionToHistory(
    novaSolucao,
    setHistoricoSolucoes,
    historicoSolucoes,
    TipoInsercao.Manual,
    contextoExecucao,
  );

  novaSolucao.idHistorico = id;

  setSolucaoAtual(novaSolucao);
}

export function removeInativos(
  docentes: Docente[],
  turmas: Disciplina[],
  atribuicoes: Atribuicao[],
) {
  const activeDocentes = new Map<string, Docente>(
    docentes.filter((doc) => doc.ativo).map((doc) => [doc.nome, doc]),
  );
  const activeTurmas = new Map<string, Disciplina>(
    turmas.filter((disc) => disc.ativo).map((disc) => [disc.id, disc]),
  );

  const activeAtribuicoes: Atribuicao[] = [];

  for (const atribuicao of atribuicoes) {
    if (activeTurmas.has(atribuicao.id_disciplina)) {
      const docentesAtribuicaoAtivos = [];
      for (const docente of atribuicao.docentes) {
        if (activeDocentes.has(docente)) {
          docentesAtribuicaoAtivos.push(docente);
        }
      }
      activeAtribuicoes.push({
        id_disciplina: atribuicao.id_disciplina,
        docentes: docentesAtribuicaoAtivos,
      });
    }
  }

  return {
    docentes: Array.from(activeDocentes.values()),
    turmas: Array.from(activeTurmas.values()),
    atribuicoes: activeAtribuicoes,
  };
}
