import { useCollaboration } from "../Collaboration";
import { useGlobalContext } from "../Global";
import { HistoricoSolucao } from "../Global/utils";
import { withEntriesAt, withoutEntries } from "./utils";

/** Entrada removida, com a posição que ocupava no Map, para o desfazer. */
export interface RemovedHistoryEntry {
  id: string;
  entry: HistoricoSolucao;
  position: number;
}

/**
 * Hook com as operações do histórico de soluções, compartilhado pelas telas de grade, histórico,
 * comparar, estatísticas, horários e importação.
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
  const { isInRoom, isOwner, config, broadcastDataUpdate } = useCollaboration();

  /** Em sala colaborativa, só o líder ou convidados com `guestsCanEdit`. */
  const canRestore = !isInRoom || !!isOwner || !!config?.guestsCanEdit;

  /**
   * Remove uma ou mais soluções do histórico (updater funcional). A solução atual é preservada.
   * @returns As entradas removidas, com a posição original, para permitir desfazer.
   */
  const removeSolutionsFromHistory = (ids: string[]): RemovedHistoryEntry[] => {
    const keys = Array.from(historicoSolucoes.keys());
    const removed: RemovedHistoryEntry[] = [];
    for (const id of ids) {
      if (id === solucaoAtual.idHistorico) continue;
      const entry = historicoSolucoes.get(id);
      if (!entry) continue;
      removed.push({ id, entry, position: keys.indexOf(id) });
    }
    if (removed.length > 0) {
      const removedIds = removed.map((r) => r.id);
      setHistoricoSolucoes((prev) => withoutEntries(prev, removedIds));
    }
    return removed;
  };

  // Função para remover a solução do histórico (assinatura mantida)
  const removeSolutionFromHistory = (id: string) => {
    setHistoricoSolucoes((prev) => withoutEntries(prev, [id]));
  };

  /** Desfaz uma remoção, reinserindo as entradas nas posições originais. */
  const reinsertSolutionsInHistory = (entries: RemovedHistoryEntry[]) => {
    if (entries.length === 0) return;
    setHistoricoSolucoes((prev) => withEntriesAt(prev, entries));
  };

  /**
   * Restaura uma solução do histórico como estado de trabalho. Em sala colaborativa,
   * respeita a permissão de edição e propaga o novo estado com FULL_DATA.
   * @returns `false` quando não houve restauração (sem permissão ou id inexistente).
   */
  const restoreHistoryToSolution = (id: string): boolean => {
    const solutionToRestore = historicoSolucoes.get(id);
    if (!solutionToRestore || !canRestore) return false;

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

    if (isInRoom) {
      broadcastDataUpdate(
        {
          atribuicoes: solutionToRestore.solucao.atribuicoes,
          disciplinas: solutionToRestore.contexto.disciplinas,
          docentes: solutionToRestore.contexto.docentes,
          formularios: solutionToRestore.contexto.formularios,
          travas: solutionToRestore.contexto.travas,
        },
        "FULL_DATA",
      );
    }
    return true;
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
    removeSolutionsFromHistory,
    reinsertSolutionsInHistory,
    restoreHistoryToSolution,
    canRestore,
    cleanSolucaoAtual,
    solucaoAtual,
    historicoSolucoes,
  };
};
