import { Statistics } from "@/algoritmo/classes/Statistics";
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
  chaves: string[],
): Record<string, any[]> => {
  return chaves.reduce(
    (resultado, chave) => {
      if (obj.hasOwnProperty(chave)) {
        resultado[chave] = obj[chave];
      }
      return resultado;
    },
    {} as Record<string, any[]>,
  );
};

// Função genérica para processar e atualizar estado
export const processAndUpdateState = <T>(
  jsonData: Record<string, any>,
  keys: string | string[],
  processor: (version: string, data: any) => T[],
  updateState: UpdateStateFunction<T>,
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
  },
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
        : createDocenteFromObject(docente),
    );
  }

  return []; // Retorna um array vazio se `docentes` não for um array
};

export const processDisciplinas = (
  version: string,
  data: DisciplinaETL[],
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
      // v4.0 renomeou `cursos` para `curso`
      cursos: disciplina.cursos ?? disciplina.curso ?? "",
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
      // Só inclui as chaves quando presentes (turmas sem espelho não têm o atributo)
      ...(disciplina.espelho ? { espelho: { ...disciplina.espelho } } : {}),
      ...(disciplina.uuid ? { uuid: disciplina.uuid } : {}),
    });
  }

  return ajustaDisciplinas(version, newDisciplinas);
};

/**
 * Versão principal do arquivo ("3.0" -> 3, "4.0" -> 4). Arquivos sem versão
 * são tratados como o formato mais antigo (1).
 */
export const versaoPrincipal = (version?: string): number => {
  const major = parseInt(String(version ?? "").split(".")[0], 10);
  return Number.isNaN(major) ? 1 : major;
};

/**
 * Turmas espelho (v4.0): a turma da pós vem aninhada na turma da graduação
 * (`disciplina.espelho`). Formulários, atribuições e travas que referenciem o
 * id da turma espelho são redirecionados para a turma principal, mesclando
 * duplicatas (formulário: menor prioridade; atribuição: união dos docentes).
 */
export const resolveEspelhos = (
  disciplinas: Disciplina[],
  formularios: Formulario[],
  atribuicoes: Atribuicao[],
  travas: Celula[],
): {
  formularios: Formulario[];
  atribuicoes: Atribuicao[];
  travas: Celula[];
} => {
  const principal = new Map<string, string>();
  const idsPrincipais = new Set(disciplinas.map((d) => d.id));
  for (const d of disciplinas) {
    // Se a turma espelho também existir como turma própria, não redireciona
    if (d.espelho?.id && !idsPrincipais.has(d.espelho.id)) {
      principal.set(d.espelho.id, d.id);
    }
  }

  if (principal.size === 0) return { formularios, atribuicoes, travas };

  const resolve = (id?: string) => (id && principal.get(id)) || id;

  const formMap = new Map<string, Formulario>();
  for (const f of formularios) {
    const id_disciplina = resolve(f.id_disciplina)!;
    const key = `${f.nome_docente}\u0000${id_disciplina}`;
    const atual = formMap.get(key);
    if (!atual || f.prioridade < atual.prioridade) {
      formMap.set(key, { ...f, id_disciplina });
    }
  }

  const atribMap = new Map<string, Atribuicao>();
  for (const a of atribuicoes) {
    const id_disciplina = resolve(a.id_disciplina)!;
    const atual = atribMap.get(id_disciplina);
    if (!atual) {
      atribMap.set(id_disciplina, { id_disciplina, docentes: [...a.docentes] });
    } else {
      for (const doc of a.docentes) {
        if (!atual.docentes.includes(doc)) atual.docentes.push(doc);
      }
    }
  }

  const travaKeys = new Set<string>();
  const novasTravas: Celula[] = [];
  for (const t of travas) {
    const id_disciplina = resolve(t.id_disciplina);
    const key = `${t.nome_docente}\u0000${id_disciplina}\u0000${t.tipo_trava}`;
    if (travaKeys.has(key)) continue;
    travaKeys.add(key);
    novasTravas.push({ ...t, id_disciplina });
  }

  return {
    formularios: Array.from(formMap.values()),
    atribuicoes: Array.from(atribMap.values()),
    travas: novasTravas,
  };
};

export const processAtribuicoes = (
  version: string,
  data: Record<string, string[]>,
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
  data: Record<string, Disciplina[] | number>,
): Formulario[] => {
  const formulariosJson: Record<string, Disciplina[] | number> = data;
  const newFormularios: Formulario[] = [];

  // A partir da v3 os formulários são { docente: { id_turma: prioridade } }
  if (versaoPrincipal(version) >= 3) {
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
  formularios: Formulario[],
) {
  if (!historicoSolucoes.has(solucaoImportacao.id)) {
    console.log("Caiu aqui");

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
      algorithm: solucaoImportacao.algorithm ?? "Importação",
    };

    /**
     * Valida as estatisticas
     */
    if (solucaoImportacao.solucao.estatisticas) {
      const tempoPorIteracao = new Map<number, number>(
        solucaoImportacao.solucao.estatisticas.tempoPorIteracao,
      );
      const avaliacaoPorIteracao = new Map<number, number>(
        solucaoImportacao.solucao.estatisticas.avaliacaoPorIteracao,
      );

      solucaoHistorico.solucao.estatisticas = new Statistics();

      for (
        let i = 0;
        i < solucaoImportacao.solucao.estatisticas.iteracoes;
        i++
      ) {
        solucaoHistorico.solucao.estatisticas.addIteracaoData(
          i,
          avaliacaoPorIteracao.get(i),
          tempoPorIteracao.get(i),
        );
      }

      solucaoHistorico.solucao.estatisticas.interrupcao =
        solucaoImportacao.solucao.estatisticas.interrupcao;

      solucaoHistorico.solucao.estatisticas.iteracoes =
        solucaoImportacao.solucao.estatisticas.iteracoes;

      solucaoHistorico.solucao.estatisticas.tempoExecucao =
        solucaoImportacao.solucao.estatisticas.tempoExecucao;
    }

    /**
     * Altera o state referente ao histórico de soluções
     */
    const newHistoricoSolucoes = new Map<string, HistoricoSolucao>(
      historicoSolucoes,
    );

    console.log(solucaoHistorico);

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
