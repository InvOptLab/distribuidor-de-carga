import {
  Atribuicao,
  Celula,
  ContextoExecucao,
  Disciplina,
  Docente,
  HistoricoSolucao,
  Solucao,
  TipoInsercao,
} from "@/context/Global/utils";
import { addNewSolutionToHistory } from "@/context/SolutionHistory/utils";
import { TabuSearch } from "@/TabuSearch/Classes/TabuSearch";

/**
 * Função que define a colocação da célula na tabela
 * @param priority Prioridade dade por um docente a uma disciplina
 * @param maxPriority Maior valor encontrado no conjunto de prioridades.
 * @returns Uma `string` representando um RGBA.
 */
export function getPriorityColor(
  priority: number,
  maxPriority: number
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
  const factor =
    // maxFactor - ((priority - 1) / (maxPriority - 1)) * (maxFactor - minFactor);
    minFactor + ((priority - 1) / (maxPriority - 1)) * (maxFactor - minFactor);

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
  maxPriority: number
) {
  // Célula travada
  if (celula.trava) {
    return `rgba(224, 224, 224, 0.6)`;
  }

  // Docente atribuido a Disciplina
  if (atribuido) {
    return `rgba(255, 0, 0, 0.4)`;
  }

  // O Docente apresentou uma prioridade para a Disciplina
  if (prioridade) {
    return getPriorityColor(prioridade, maxPriority);
  }

  return `rgba(255, 255, 255, 1)`;
}

/**
 * Função para gerar o nome do json que será exportado
 */
export function getFormattedDate(date?: Date): string {
  const now = date ? date : new Date();

  // Obtendo os valores individuais de ano, mês, dia, hora, minuto e segundo
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Meses começam do 0, então somamos 1
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Montando a string no formato YYYYMMDD_hh:mm:s.json
  return `${year}${month}${day}_${hours}_${minutes}_${seconds}`;
}

/**
 * Funções para Gerar o JSON de saida após a aplicação dele no State
 */

function exportarJsonBrowser(objeto: any, nomeArquivo: string) {
  const jsonData = JSON.stringify(objeto, null, "\t");
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;

  // Adiciona o link ao documento e clica automaticamente para fazer o download
  document.body.appendChild(link);
  link.click();

  // Remove o link após o download
  document.body.removeChild(link);
}

export function exportJson(
  filename: string,
  docentes: Docente[],
  disciplinas: Disciplina[],
  atribuicoes: Atribuicao[],
  travas: Celula[],
  solucaoHistorico?: HistoricoSolucao
) {
  /**
   * Ajustar as disciplinas
   */
  const disciplinasDTO = {};
  for (const disciplina of disciplinas) {
    //const {ativo, trava, conflitos, horarios, ...rest} = disciplina
    const disc: Disciplina = {
      codigo: disciplina.codigo,
      turma: disciplina.turma,
      nome: disciplina.nome,
      horario: disciplina.horario,
      horarios: disciplina.horarios,
      cursos: disciplina.cursos,
      ementa: disciplina.ementa,
      id: disciplina.id,
      nivel: disciplina.nivel,
      prioridade: disciplina.prioridade,
      noturna: disciplina.noturna,
      ingles: disciplina.ingles,
      docentes: disciplina.docentes,
      ativo: disciplina.ativo,
      conflitos: disciplina.conflitos,
      grupo: disciplina.grupo ? disciplina.grupo : "",
      carga: disciplina.carga ? disciplina.carga : 1,
      trava: disciplina.trava,
    };
    console.log(disciplina.conflitos);
    // disciplinasDTO[disciplina.id] = disc;
    disciplinasDTO[disciplina.id] = {
      ...disc,
      conflitos: Array.from(disciplina.conflitos),
    };
  }

  /**
   * Ajusta formulários
   */
  const formulariosDTO = {};
  const docentesDTO = [];
  const saldosDTO = {};

  for (const docente of docentes) {
    docentesDTO.push({
      nome: docente.nome,
      ativo: docente.ativo,
      comentario: docente?.comentario,
      agrupar: docente?.agrupar,
    });
    saldosDTO[docente.nome] = docente.saldo;
    const docenteFormularios = {};

    for (const formulario of docente.formularios.entries()) {
      /**
       * 17/05/2025 -> devido há turma MAI5002 não estar sendo encontrada. Se não me engano removermos essa turma
       * da plataforma, entretando acho que algum docente preencheu.
       */
      if (!disciplinasDTO[formulario[0]]) {
        continue;
      }
      const { ...disciplina } = disciplinasDTO[formulario[0]];
      // V2
      // docenteFormularios[disciplina.id] = {
      //   ...disciplina,
      //   prioridade: formulario[1],
      // };

      // Formato da nova versão (V3)
      docenteFormularios[disciplina.id] = formulario[1];
    }
    formulariosDTO[docente.nome] = docenteFormularios;
  }

  /**
   * Ajustar atribuições
   */
  const atribuicoesDTO = {};
  for (const atribuicao of atribuicoes) {
    if (atribuicao.docentes.length > 0) {
      atribuicoesDTO[atribuicao.id_disciplina] = atribuicao.docentes;
    }
  }

  const dados = {
    versao: "3.0",
    formularios: formulariosDTO,
    disciplinas: disciplinasDTO,
    docentes: docentesDTO,
    saldos: saldosDTO,
    //"atribuicao": atribuicoesDTO
  };

  if (Object.keys(atribuicoesDTO).length != 0) {
    dados["atribuicao"] = atribuicoesDTO;
  }

  if (travas.length > 0) {
    dados["travas"] = travas;
  }

  if (solucaoHistorico) {
    const { contexto, solucao, ...solucaoDTO } = solucaoHistorico;

    if (solucao.estatisticas) {
      const tempoPorIteracao = Array.from(
        solucao.estatisticas.tempoPorIteracao
      );
      const avaliacaoPorIteracao = Array.from(
        solucao.estatisticas.avaliacaoPorIteracao
      );

      dados["solucao"] = {
        ...solucaoDTO,
        solucao: {
          avaliacao: solucao.avaliacao,
          estatisticas: {
            tempoPorIteracao: tempoPorIteracao,
            avaliacaoPorIteracao: avaliacaoPorIteracao,
            tempoExecucao: solucao.estatisticas.tempoExecucao,
            iteracoes: solucao.estatisticas.iteracoes,
            interrupcao: solucao.estatisticas.iteracoes,
          },
        },
        maxPriority: contexto.maxPriority,
      };
    } else {
      dados["solucao"] = {
        ...solucaoDTO,
        solucao: {
          avaliacao: solucao.avaliacao,
        },
        maxPriority: contexto.maxPriority,
      };
    }
  }

  exportarJsonBrowser(dados, filename);
}

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
  algorithm?: TabuSearch
) {
  const novaSolucao: Solucao = {
    atribuicoes: atribuicoes,
    avaliacao: avaliacao,
    algorithm: algorithm,
    estatisticas: algorithm.statistics,
  };

  const id = addNewSolutionToHistory(
    novaSolucao,
    setHistoricoSolucoes,
    historicoSolucoes,
    TipoInsercao.Manual,
    contextoExecucao
  );

  novaSolucao.idHistorico = id;

  setSolucaoAtual(novaSolucao);
}

export function removeInativos(
  docentes: Docente[],
  turmas: Disciplina[],
  atribuicoes: Atribuicao[]
) {
  const activeDocentes = new Map<string, Docente>(
    docentes.filter((doc) => doc.ativo).map((doc) => [doc.nome, doc])
  );
  const activeTurmas = new Map<string, Disciplina>(
    turmas.filter((disc) => disc.ativo).map((disc) => [disc.id, disc])
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
