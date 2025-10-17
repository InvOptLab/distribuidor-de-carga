import {
  Atribuicao,
  Celula,
  Disciplina,
  DisciplinaETL,
  Docente,
  Formulario,
  Solucao,
} from "@/algoritmo/communs/interfaces/interfaces";
import {
  ajustaDisciplinas,
  HistoricoSolucao,
  TipoInsercao,
} from "@/context/Global/utils";
import { Dispatch, SetStateAction } from "react";

type UpdateStateFunction<T> = (data: T[]) => void;

const selecionarArraysPorChaves = (
  obj: Record<string, any[]>,
  chaves: string[]
): Record<string, any[]> => {
  return chaves.reduce((resultado, chave) => {
    if (obj.hasOwnProperty(chave)) {
      resultado[chave] = obj[chave];
    }
    return resultado;
  }, {} as Record<string, any[]>);
};

// Função genérica para processar e atualizar estado
export const processAndUpdateState = <T>(
  jsonData: Record<string, any>,
  keys: string | string[],
  processor: (version: string, data: any) => T[],
  updateState: UpdateStateFunction<T>
) => {
  let data;

  if (Array.isArray(keys)) {
    data = selecionarArraysPorChaves(jsonData, keys);
  } else {
    data = jsonData[keys];
  }

  if (data) {
    const processedData = processor(jsonData["versao"], data);
    updateState(processedData);
    return processedData;
  }

  return [];
};

export const processDocentes = (
  version: string,
  data: {
    saldos: Record<string, number>;
    docentes:
      | {
          nome: string;
          ativo: boolean;
          comentario?: string;
          agrupar?: string;
        }[]
      | string[];
  }
): Docente[] => {
  const { saldos, docentes } = data;

  const createDocenteFromString = (nome: string): Docente => ({
    nome,
    ativo: true,
    formularios: new Map<string, number>(),
    trava: false,
    saldo: saldos ? saldos[nome] : undefined,
  });

  const createDocenteFromObject = (docente: {
    nome: string;
    ativo: boolean;
    comentario?: string;
    agrupar?: string;
  }): Docente => ({
    nome: docente.nome,
    ativo: docente.ativo,
    formularios: new Map<string, number>(),
    trava: false,
    saldo: saldos ? saldos[docente.nome] : undefined,
    agrupar: docente.agrupar,
    comentario: docente.comentario,
  });

  if (Array.isArray(docentes)) {
    return docentes.map((docente) =>
      typeof docente === "string"
        ? createDocenteFromString(docente)
        : createDocenteFromObject(docente)
    );
  }

  return []; // Retorna um array vazio se `docentes` não for um array
};

export const processDisciplinas = (
  version: string,
  data: DisciplinaETL[]
): Disciplina[] => {
  const disciplinasJson: DisciplinaETL[] = data;
  const newDisciplinas: DisciplinaETL[] = [];

  for (const disciplina of Object.values(disciplinasJson)) {
    newDisciplinas.push({
      codigo: disciplina.codigo,
      turma: disciplina.turma,
      nome: disciplina.nome,
      horario: disciplina.horario,
      horarios: disciplina?.horarios,
      cursos: disciplina.cursos,
      ementa: disciplina.ementa,
      id: disciplina.id,
      nivel: disciplina.nivel,
      prioridade: disciplina.prioridade,
      noturna: disciplina.noturna,
      ingles: disciplina.ingles,
      docentes: disciplina.docentes,
      ativo: disciplina.ativo !== undefined ? disciplina.ativo : true,
      grupo: disciplina.grupo ? disciplina.grupo : "",
      carga: disciplina.carga ? disciplina.carga : 1,
    });
  }

  return ajustaDisciplinas(version, newDisciplinas);
};

export const processAtribuicoes = (
  version: string,
  data: Record<string, string[]>
): Atribuicao[] => {
  const atribuicoesJson: Record<string, string[]> = data;
  const newAtribuicoes: Atribuicao[] = [];

  for (const [idDisciplina, docentes] of Object.entries(atribuicoesJson)) {
    newAtribuicoes.push({
      id_disciplina: idDisciplina,
      docentes: docentes,
    });
  }
  return newAtribuicoes;
};

export const processFormularios = (
  version: string,
  data: Record<string, Disciplina[] | number>
): Formulario[] => {
  const formulariosJson: Record<string, Disciplina[] | number> = data;
  const newFormularios: Formulario[] = [];

  if (version.includes("3")) {
    for (const [nome_docente, formularios] of Object.entries(formulariosJson)) {
      for (const id_turma of Object.keys(formularios)) {
        newFormularios.push({
          nome_docente: nome_docente,
          id_disciplina: id_turma,
          prioridade: formularios[id_turma],
        });
      }
    }
  } else {
    for (const [nome_docente, disciplinas] of Object.entries(formulariosJson)) {
      for (const disciplina of Object.values(disciplinas)) {
        newFormularios.push({
          nome_docente: nome_docente,
          id_disciplina: disciplina.id,
          prioridade: disciplina.prioridade,
        });
      }
    }
  }

  return newFormularios;
};

/**
 * Função que processa as informações de importação das travas.
 * @param data Travas vindas do arquivo importado.
 * @returns Lista com todas as travas no arquivo de importação.
 */
export function processTravas(version: string, data: Celula[]) {
  return data;
}

export function processSolucao(
  version: string,
  solucaoImportacao: any,
  atribuicoes: Atribuicao[],
  disciplinas: Disciplina[],
  docentes: Docente[],
  travas: Celula[],
  historicoSolucoes: Map<string, HistoricoSolucao>,
  setHistoricoSolucoes: Dispatch<SetStateAction<Map<string, HistoricoSolucao>>>,
  setSolucaoAtual: Dispatch<SetStateAction<Solucao>>,
  formularios: Formulario[]
) {
  if (!historicoSolucoes.has(solucaoImportacao.id)) {
    /**
     * Carrega solução no histórico
     */
    const solucaoHistorico: HistoricoSolucao = {
      id: solucaoImportacao.id,
      datetime: solucaoImportacao.datetime,
      tipoInsercao: TipoInsercao.Importação,
      solucao: {
        idHistorico: solucaoImportacao.id,
        atribuicoes: atribuicoes,
        avaliacao: solucaoImportacao.solucao.avaliacao,
      },
      contexto: {
        disciplinas: disciplinas,
        docentes: docentes,
        travas: travas,
        maxPriority: solucaoImportacao.maxPriority,
        formularios: formularios,
      },
    };

    /**
     * Valida as estatisticas
     */
    if (solucaoImportacao.solucao.estatisticas) {
      const tempoPorIteracao = new Map<number, number>(
        solucaoImportacao.solucao.estatisticas.tempoPorIteracao
      );
      const avaliacaoPorIteracao = new Map<number, number>(
        solucaoImportacao.solucao.estatisticas.avaliacaoPorIteracao
      );

      solucaoHistorico.solucao.estatisticas = {
        avaliacaoPorIteracao: avaliacaoPorIteracao,
        tempoPorIteracao: tempoPorIteracao,
        interrupcao: solucaoImportacao.solucao.estatisticas.interrupcao,
        iteracoes: solucaoImportacao.solucao.estatisticas.iteracoes,
        tempoExecucao: solucaoImportacao.solucao.estatisticas.tempoExecucao,
      };
    }

    /**
     * Altera o state referente ao histórico de soluções
     */
    const newHistoricoSolucoes = new Map<string, HistoricoSolucao>(
      historicoSolucoes
    );
    newHistoricoSolucoes.set(solucaoHistorico.id, solucaoHistorico);

    setHistoricoSolucoes(newHistoricoSolucoes);

    /**
     * Atualiza a solução atual
     */
    setSolucaoAtual(solucaoHistorico.solucao);

    return solucaoHistorico;
  }

  return historicoSolucoes.get(solucaoImportacao.id);
}
