import Algorithm from "@/algoritmo/abstractions/Algorithm";
import { Statistics } from "@/algoritmo/classes/Statistics";
import { Solucao } from "@/algoritmo/communs/interfaces/interfaces";
import {
  Atribuicao,
  Celula,
  ContextoExecucao,
  Disciplina,
  Docente,
  HistoricoSolucao,
  TipoInsercao,
} from "@/context/Global/utils";
import { addNewSolutionToHistory } from "@/context/SolutionHistory/utils";

/**
 * Função que define a colocação da célula na tabela
 * @param priority Prioridade dade por um docente a uma disciplina
 * @param maxPriority Maior valor encontrado no conjunto de prioridades.
 * @returns Uma `string` representando um RGBA.
 */
export function getPriorityColor(
  priority: number,
  maxPriority: number,
): string {
  // Se a prioridade for null ou undefined, não altera a cor
  if (priority === null || priority === undefined) {
    return "inherit"; // 'inherit' mantém a cor original do elemento
  }

  // Define os componentes RGB da cor base (rgb(118, 196, 188))
  const baseRed = 118;
  const baseGreen = 196;
  const baseBlue = 188;

  // Variação mínima e máxima para intensificar ou clarear a cor
  const minFactor = 0.6; // Fator de escurecimento máximo (mais escuro)
  const maxFactor = 1.8; // Fator de clareamento máximo (mais claro)

  // Calcula o fator de ajuste da cor com base na prioridade
  // Evita divisão por zero quando só existe uma prioridade (maxPriority <= 1)
  const span = maxPriority - 1;
  const ratio = span > 0 ? (priority - 1) / span : 0;
  const factor = minFactor + ratio * (maxFactor - minFactor);

  // Aplica o fator de ajuste aos componentes RGB
  const red = Math.floor(baseRed * factor);
  const green = Math.floor(baseGreen * factor);
  const blue = Math.floor(baseBlue * factor);

  // Retorna a cor ajustada em RGB
  return `rgba(${red}, ${green}, ${blue}, 0.8)`;
}

/**
 * Função que define qual será a cor aplicada para cada célula da tabela.
 * @param {number|null|undefined} prioridade - Prioridade dada pelo docente a disciplina, ou nulo em caso de ser o cabeçalho.
 * @param {Celula} celula - Refere-se a célula que está sendo carregada.
 * @returns {string} Retorna um rgba para ser aplicado a propriedade css `background-color`.
 */
export function setCellColor(
  prioridade: number,
  celula: Celula,
  atribuido: boolean,
  maxPriority: number,
  isHighContrast: boolean = false
) {
  // Célula travada
  if (celula.trava) {
    if (isHighContrast) {
      return {
        backgroundColor: "transparent",
        border: "3px dashed #FFFFFF",
        color: "#FFFFFF",
      };
    }
    return { backgroundColor: `rgba(224, 224, 224, 0.6)` };
  }

  // Docente atribuido a Disciplina
  if (atribuido) {
    if (isHighContrast) {
      return {
        backgroundColor: "#FFFF00",
        border: "3px solid #FFFF00",
        color: "#000000",
      };
    }
    return { backgroundColor: `rgba(255, 0, 0, 0.4)` };
  }

  // O Docente apresentou uma prioridade para a Disciplina
  if (prioridade) {
    if (isHighContrast) {
      return {
        backgroundColor: "transparent",
        border: "2px solid #FFFFFF",
        color: "#FFFF00", // Amarelo no preto para alto contraste da prioridade
      };
    }
    return { backgroundColor: getPriorityColor(prioridade, maxPriority) };
  }

  if (isHighContrast) {
    return {
      backgroundColor: "#000000",
      border: "1px solid #FFFFFF",
      color: "#FFFFFF",
    };
  }

  return { backgroundColor: `rgba(255, 255, 255, 1)` };
}

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
