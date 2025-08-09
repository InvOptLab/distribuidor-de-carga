import { useGlobalContext } from "../Global";
import { HistoricoSolucao } from "../Global/utils";

/**
 * Hook customizado para remover uma solução do histórico pelo seu identificador.
 * Retorna uma função que pode ser chamada para remover a solução.
 *
 * @returns {Function} Função que remove uma solução do histórico pelo id.
 */
export const useSolutionHistory = () => {
  // Obtém o contexto global
  const {
    historicoSolucoes,
    setHistoricoSolucoes,
    updateAtribuicoes,
    setSolucaoAtual,
    solucaoAtual,
    setDocentes,
    setTravas,
    setDisciplinas,
    setFormularios,
  } = useGlobalContext();

  // Função para remover a solução do histórico
  const removeSolutionFromHistory = (id: string) => {
    // Cria uma nova instância do Map para garantir imutabilidade
    const newHistoricoSolucoesMap: Map<string, HistoricoSolucao> = new Map<
      string,
      HistoricoSolucao
    >(historicoSolucoes);

    // Remove a solução pelo id
    newHistoricoSolucoesMap.delete(id);

    // Atualiza o estado com o novo Map
    setHistoricoSolucoes(newHistoricoSolucoesMap);
  };

  const restoreHistoryToSolution = (id: string) => {
    /**
     * Passos
     * 1 - Atualizar state solucaoAtual
     * 2 - Atualizar state atribuicoes
     */
    const solutionToRestore = historicoSolucoes.get(id);

    // Adicionado o spred com a atribuição manual do id pois por algum motivo os casos em que possuem estatísticas a propriedade
    // idHistorico não estava sendo inserida no state
    setSolucaoAtual({
      atribuicoes: solutionToRestore.solucao.atribuicoes,
      algorithm: solutionToRestore.solucao.algorithm,
      avaliacao: solutionToRestore.solucao.avaliacao,
      estatisticas: solutionToRestore.solucao.estatisticas,
      idHistorico: id,
    });
    setDisciplinas(solutionToRestore.contexto.disciplinas);
    setDocentes(solutionToRestore.contexto.docentes);
    setTravas(solutionToRestore.contexto.travas);
    setFormularios(solutionToRestore.contexto.formularios);

    updateAtribuicoes(solutionToRestore.solucao.atribuicoes);
  };

  const cleanSolucaoAtual = () => {
    setSolucaoAtual({
      atribuicoes: [],
      avaliacao: undefined,
      idHistorico: undefined,
      estatisticas: undefined,
    });
  };

  // Retorna a função de remoção, que pode ser usada em componentes
  return {
    removeSolutionFromHistory,
    restoreHistoryToSolution,
    cleanSolucaoAtual,
    solucaoAtual,
    historicoSolucoes,
  };
};
