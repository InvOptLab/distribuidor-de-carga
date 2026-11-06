import type {
  Atribuicao,
  Celula,
  Disciplina,
  Docente,
  HistoricoSolucao,
} from "@/context/Global/utils";

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

/**
 * Monta o objeto do JSON de saída (formato v3, B17). Separado do download para ser testável.
 */
export function buildExportPayload(
  docentes: Docente[],
  disciplinas: Disciplina[],
  atribuicoes: Atribuicao[],
  travas: Celula[],
  solucaoHistorico?: HistoricoSolucao,
) {
  /**
   * Ajustar as disciplinas
   */
  const disciplinasDTO = {};
  for (const disciplina of disciplinas) {
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
  };

  if (Object.keys(atribuicoesDTO).length != 0) {
    dados["atribuicao"] = atribuicoesDTO;
  }

  if (travas.length > 0) {
    dados["travas"] = travas;
  }

  if (solucaoHistorico) {
    const { contexto, solucao } = solucaoHistorico;

    if (solucao.estatisticas) {
      const tempoPorIteracao = Array.from(
        solucao.estatisticas.tempoPorIteracao,
      );
      const avaliacaoPorIteracao = Array.from(
        solucao.estatisticas.avaliacaoPorIteracao,
      );

      dados["solucao"] = {
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
        solucao: {
          avaliacao: solucao.avaliacao,
        },
        maxPriority: contexto.maxPriority,
      };
    }
  }

  return dados;
}

export function exportJson(
  filename: string,
  docentes: Docente[],
  disciplinas: Disciplina[],
  atribuicoes: Atribuicao[],
  travas: Celula[],
  solucaoHistorico?: HistoricoSolucao,
) {
  exportarJsonBrowser(
    buildExportPayload(
      docentes,
      disciplinas,
      atribuicoes,
      travas,
      solucaoHistorico,
    ),
    filename,
  );
}
