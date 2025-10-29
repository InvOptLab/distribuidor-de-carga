import { Solucao } from "@/algoritmo/communs/interfaces/interfaces";
import { getFormattedDate } from "@/app/atribuicoes";
import {
  ContextoExecucao,
  HistoricoSolucao,
  TipoInsercao,
} from "../Global/utils";

/**
 * Função que adiciona uma nova solução ao histórico
 * @param novaSolucao
 * @param setHistoricoSolucoes
 * @param historicoSolucoes
 * @returns {string} Identificador da solução no histórico
 */
export function addNewSolutionToHistory(
  novaSolucao: Solucao,
  setHistoricoSolucoes: (
    historicoSolucoes: Map<string, HistoricoSolucao>
  ) => void,
  historicoSolucoes: Map<string, HistoricoSolucao>,
  tipoInsercao: TipoInsercao,
  contextoExecucao: ContextoExecucao
): string {
  // Por conta do React, a inserção de um novo item em um Map deve ser feita da maneira a seguir.
  const newHistoricoSolucoesMap: Map<string, HistoricoSolucao> = new Map<
    string,
    HistoricoSolucao
  >(historicoSolucoes);
  const date = new Date();
  const id = getFormattedDate(date);
  newHistoricoSolucoesMap.set(id, {
    id: id,
    solucao: novaSolucao,
    datetime: date.toLocaleString(),
    tipoInsercao: tipoInsercao,
    contexto: contextoExecucao,
    algorithm: novaSolucao.algorithm,
  });

  setHistoricoSolucoes(newHistoricoSolucoesMap);
  return id;
}

/**
 * Função que irá atualizar o state solucaoAtual, que acabou de ser inserida no histórico, adicionando um identificador.
 * @param setSolucaoAtual Função que atribuí o state da solução atual
 * @param {string} id Identificador da solução no histórico
 */
export function updateSolutionId(
  setSolucaoAtual: React.Dispatch<React.SetStateAction<Solucao>>,
  id: string
) {
  setSolucaoAtual((solucaoAtual) => ({
    ...solucaoAtual, // Copia as propriedades existentes de Solucao
    idHistorico: id, // Atualiza apenas o idHistorico
  }));
}
