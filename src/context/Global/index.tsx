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
import { createContext, useContext, useState } from "react";
import type { HistoricoSolucao } from "./utils";

//import _ from "lodash"; // Comparação entre objetos de forma otimizada

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
      {children}
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
            atribuicao.id_disciplina === newAtribuicao.id_disciplina
        );

        if (index !== -1) {
          // Atualiza os docentes da atribuição encontrada, evitando duplicações
          newAtribuicoes[index] = {
            ...newAtribuicoes[index],
            docentes: [
              ...newAtribuicoes[index].docentes.filter(
                (docente) => !newAtribuicao.docentes.includes(docente)
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
    id_disciplina: string
  ) {
    const newAtribuicoes = [...context.atribuicoes];

    const index = newAtribuicoes.findIndex(
      (atribuicao) => atribuicao.id_disciplina === id_disciplina
    );

    if (index !== -1) {
      // Atualiza os docentes da atribuição encontrada, evitando duplicações
      newAtribuicoes[index] = {
        ...newAtribuicoes[index],
        docentes: [
          ...newAtribuicoes[index].docentes.filter(
            (docente) => docente !== nome_docente
          ),
        ],
      };
    }

    updateAtribuicoes(newAtribuicoes);
  }
  return { ...context, updateAtribuicoes, updateAtribuicoesDocente };
}
