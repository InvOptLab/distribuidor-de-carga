"use client";

import type React from "react";

import type {
  Atribuicao,
  Celula,
  Disciplina,
  Docente,
  Formulario,
  Solucao,
} from "@/algoritmo/communs/interfaces/interfaces";
import { createContext, useContext, useEffect, useState } from "react";
import { jsonReplacer, jsonReviver, type HistoricoSolucao } from "./utils";

//import _ from "lodash"; // Comparação entre objetos de forma otimizada

import { get, set } from "idb-keyval";

interface GlobalContextInterface {
  docentes: Docente[];
  setDocentes: React.Dispatch<React.SetStateAction<Docente[]>>;
  disciplinas: Disciplina[];
  setDisciplinas: React.Dispatch<React.SetStateAction<Disciplina[]>>;
  atribuicoes: Atribuicao[];
  setAtribuicoes: React.Dispatch<React.SetStateAction<Atribuicao[]>>;
  formularios: Formulario[]; // Tocar para um hashMap
  setFormularios: React.Dispatch<React.SetStateAction<Formulario[]>>;
  travas: Celula[];
  setTravas: React.Dispatch<React.SetStateAction<Celula[]>>;

  /**
   * Histórico de soluções
   */
  historicoSolucoes: Map<string, HistoricoSolucao>;
  setHistoricoSolucoes: React.Dispatch<
    React.SetStateAction<Map<string, HistoricoSolucao>>
  >;
  solucaoAtual: Solucao;
  setSolucaoAtual: React.Dispatch<React.SetStateAction<Solucao>>;
}

const GlobalContext = createContext<GlobalContextInterface>({
  docentes: [],
  setDocentes: () => {},
  disciplinas: [],
  setDisciplinas: () => {},
  atribuicoes: [],
  setAtribuicoes: () => {},
  formularios: [],
  setFormularios: () => {},
  travas: [],
  setTravas: () => {},
  historicoSolucoes: new Map<string, HistoricoSolucao>(),
  setHistoricoSolucoes: () => {},
  solucaoAtual: {
    atribuicoes: [],
    avaliacao: undefined,
    idHistorico: undefined,
  },
  setSolucaoAtual: () => {},
});

export function GlobalWrapper({ children }: { children: React.ReactNode }) {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [atribuicoes, setAtribuicoes] = useState<Atribuicao[]>([]);
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [travas, setTravas] = useState<Celula[]>([]);

  /**
   * Histórico de soluções
   */
  const [historicoSolucoes, setHistoricoSolucoes] = useState<
    Map<string, HistoricoSolucao>
  >(new Map<string, HistoricoSolucao>());
  const [solucaoAtual, setSolucaoAtual] = useState<Solucao>({
    atribuicoes: [],
    avaliacao: undefined,
    idHistorico: undefined,
  });

  // Flag para saber se já recuperamos os dados do localStorage (evita problemas de hidratação do SSR)
  const [isHydrated, setIsHydrated] = useState(false);

  const STORAGE_KEY = "distribuidor_carga_sessao";

  // Efeito para LER todos os dados em paralelo ao inicializar
  useEffect(() => {
    import("idb-keyval").then(({ getMany }) => {
      // getMany busca todas as chaves ao mesmo tempo de forma super rápida
      getMany([
        "docentes",
        "disciplinas",
        "atribuicoes",
        "travas",
        "formularios",
        "solucaoAtual",
        "historicoSolucoes",
      ])
        .then(
          ([
            savedDocentes,
            savedDisciplinas,
            savedAtribuicoes,
            savedTravas,
            savedFormularios,
            savedSolucaoAtual,
            savedHistorico,
          ]) => {
            if (savedDocentes)
              setDocentes(JSON.parse(savedDocentes, jsonReviver));
            if (savedDisciplinas)
              setDisciplinas(JSON.parse(savedDisciplinas, jsonReviver));
            if (savedAtribuicoes)
              setAtribuicoes(JSON.parse(savedAtribuicoes, jsonReviver));
            if (savedTravas) setTravas(JSON.parse(savedTravas, jsonReviver));
            if (savedFormularios)
              setFormularios(JSON.parse(savedFormularios, jsonReviver));
            if (savedSolucaoAtual)
              setSolucaoAtual(JSON.parse(savedSolucaoAtual, jsonReviver));
            if (savedHistorico)
              setHistoricoSolucoes(JSON.parse(savedHistorico, jsonReviver));
          },
        )
        .catch(console.error)
        .finally(() => setIsHydrated(true));
    });
  }, []);

  // Efeito para SALVAR os dados nas alterações (Com Debounce para Performance)
  // Salva Configurações Básicas (Rápido)
  useEffect(() => {
    if (!isHydrated) return;
    import("idb-keyval").then(({ setMany }) => {
      setMany([
        ["docentes", JSON.stringify(docentes, jsonReplacer)],
        ["disciplinas", JSON.stringify(disciplinas, jsonReplacer)],
        ["formularios", JSON.stringify(formularios, jsonReplacer)],
        ["travas", JSON.stringify(travas, jsonReplacer)],
      ]).catch(console.error);
    });
  }, [isHydrated, docentes, disciplinas, formularios, travas]);

  // Salva Atribuições (Médio)
  useEffect(() => {
    if (!isHydrated) return;
    const timer = setTimeout(() => {
      import("idb-keyval").then(({ set }) =>
        set("atribuicoes", JSON.stringify(atribuicoes, jsonReplacer)),
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [isHydrated, atribuicoes]);

  // Salva Histórico de Soluções (Pesado - com Debounce maior)
  useEffect(() => {
    if (!isHydrated) return;
    const timer = setTimeout(() => {
      import("idb-keyval").then(({ setMany }) => {
        setMany([
          ["solucaoAtual", JSON.stringify(solucaoAtual, jsonReplacer)],
          [
            "historicoSolucoes",
            JSON.stringify(historicoSolucoes, jsonReplacer),
          ],
        ]);
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [isHydrated, solucaoAtual, historicoSolucoes]);

  return (
    <GlobalContext.Provider
      value={{
        docentes,
        setDocentes,
        disciplinas,
        setDisciplinas,
        atribuicoes,
        setAtribuicoes,
        formularios,
        setFormularios,
        travas,
        setTravas,
        historicoSolucoes,
        setHistoricoSolucoes,
        setSolucaoAtual,
        solucaoAtual,
      }}
    >
      {isHydrated ? children : null}
    </GlobalContext.Provider>
  );
}

/**
 * Hooks
 */
export function useGlobalContext() {
  const context = useContext(GlobalContext);

  /**
   * Atualizar as atribuições com uma solução
   * @param novasAtribuicoes
   */
  function updateAtribuicoes(novasAtribuicoes: Atribuicao[]) {
    // Ajustar a função para não limpar as atribuições fora dos filtros (isso vale também para as Travas)
    // Possivelmente para resolver isso, os filtros devem ser inseridos no contexto e verificados na hora de inserir a atribuição
    // na lista.
    // Atribuições de itens Inativos não devem ser alteradas.

    /** Alterar para ver o state solucaoAtual */
    if (context.atribuicoes.length === novasAtribuicoes.length) {
      context.setAtribuicoes(novasAtribuicoes);
    } else {
      const newAtribuicoes = [...context.atribuicoes]; // Cria uma cópia do array original

      for (const newAtribuicao of novasAtribuicoes) {
        // Encontra a atribuição correspondente no array copiado
        const index = newAtribuicoes.findIndex(
          (atribuicao) =>
            atribuicao.id_disciplina === newAtribuicao.id_disciplina,
        );

        if (index !== -1) {
          // Atualiza os docentes da atribuição encontrada, evitando duplicações
          newAtribuicoes[index] = {
            ...newAtribuicoes[index],
            docentes: [
              ...newAtribuicoes[index].docentes.filter(
                (docente) => !newAtribuicao.docentes.includes(docente),
              ),
              ...newAtribuicao.docentes,
            ],
          };
        }
      }
      // Atualiza o estado com o novo array de atribuições modificado
      context.setAtribuicoes(newAtribuicoes);
    }
  }

  /**
   * Remove uma turma do docente
   * @param nome_docente
   * @param id_disciplina
   */
  function updateAtribuicoesDocente(
    nome_docente: string,
    id_disciplina: string,
  ) {
    const newAtribuicoes = [...context.atribuicoes];

    const index = newAtribuicoes.findIndex(
      (atribuicao) => atribuicao.id_disciplina === id_disciplina,
    );

    if (index !== -1) {
      // Atualiza os docentes da atribuição encontrada, evitando duplicações
      newAtribuicoes[index] = {
        ...newAtribuicoes[index],
        docentes: [
          ...newAtribuicoes[index].docentes.filter(
            (docente) => docente !== nome_docente,
          ),
        ],
      };
    }

    updateAtribuicoes(newAtribuicoes);
  }
  return { ...context, updateAtribuicoes, updateAtribuicoesDocente };
}
