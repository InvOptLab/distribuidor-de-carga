"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useGlobalContext } from "@/context/Global";
import { useAlertsContext } from "@/context/Alerts";
import { useAlgorithmContext } from "@/context/Algorithm";

import {
  ContextoExecucao,
  TipoInsercao,
  getActiveFormularios,
} from "@/context/Global/utils";
import {
  addNewSolutionToHistory,
  updateSolutionId,
} from "@/context/SolutionHistory/utils";
import { useTimetable } from "../context/TimetableContext";
import { TabuSearch } from "@/algoritmo/metodos/TabuSearch/Classes/TabuSearch";
import {
  Atribuicao,
  Estatisticas,
  HighsColumn,
  Solucao,
} from "@/algoritmo/communs/interfaces/interfaces";
import { MILP } from "@/algoritmo/metodos/MILP/MILP";

/**
 * Converte a saída do solver HiGHS (baseada em índices e objeto 'Primal')
 * de volta para uma lista legível de atribuições por disciplina.
 *
 * @param solutionVariables - O objeto de solução retornado pelo HiGHS.
 * @param activeDocentes - O array de docentes ATIVOS, na MESMA ORDEM
 * usada para criar o conjunto D.
 * @param activeTurmas - O array de turmas ATIVAS, na MESMA ORDEM
 * usada para criar o conjunto T.
 * @returns Um array de objetos Atribuicao.
 */
export function reconstruirAtribuicoes(
  solutionVariables: Record<string, HighsColumn>,
  activeDocentes: { nome: string }[],
  activeTurmas: { id: string }[]
): Atribuicao[] {
  const atribuicoesFinais: Atribuicao[] = [];

  // Itera sobre cada TURMA (índice j)
  for (let j = 0; j < activeTurmas.length; j++) {
    const idDisciplina = activeTurmas[j].id;
    const docentesAlocados: string[] = [];

    // Itera sobre cada DOCENTE (índice i) para verificar se ele foi alocado a esta turma j
    for (let i = 0; i < activeDocentes.length; i++) {
      const nomeDocente = activeDocentes[i].nome;

      // Monta o nome da variável que o solver conhece
      const varName = `x_${i}_${j}`;

      // Acessa o objeto da variável pelo nome
      const varSolution = solutionVariables[varName];

      // Verifica se a variável existe e se o valor 'Primal' é ~1
      if (varSolution && varSolution.Primal > 0.9) {
        docentesAlocados.push(nomeDocente);
      }
    }

    // Adiciona a turma e seus docentes à lista final
    atribuicoesFinais.push({
      id_disciplina: idDisciplina,
      docentes: docentesAlocados,
    });
  }

  return atribuicoesFinais;
}

export function useAlgorithm() {
  const {
    docentes,
    disciplinas,
    formularios,
    atribuicoes,
    travas,
    solucaoAtual,
    setSolucaoAtual,
    historicoSolucoes,
    setHistoricoSolucoes,
    updateAtribuicoes,
  } = useGlobalContext();

  const { maxPriority } = useTimetable();

  const {
    parametros,
    hardConstraints,
    softConstraints,
    neighborhoodFunctions,
    stopFunctions,
    aspirationFunctions,
    tabuListType,
    objectiveComponents,
    selectedAlgorithm,
  } = useAlgorithmContext();
  const { addAlerta } = useAlertsContext();

  const [openDialog, setOpenDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [interrompe, setInterrompe] = useState(false);
  const [disciplinasAlocadas, setDisciplinasAlocadas] = useState(0);
  // const [estatisticasMonitoradas, setEstatisticasMonitoradas] = useState({
  //   iteracoes: 0,
  //   tempoPorIteracao: new Map<number, number>(),
  //   avaliacaoPorIteracao: new Map<number, number>(),
  // });

  /**
   * Em vez de um único objeto 'estatisticasMonitoradas',
   * crie um estado para cada dado que seu gráfico precisa.
   */
  const [iteracoes, setIteracoes] = useState(0);
  const [tempoPorIteracao, setTempoPorIteracao] = useState(
    () => new Map<number, number>()
  );
  const [avaliacaoPorIteracao, setAvaliacaoPorIteracao] = useState(
    () => new Map<number, number>()
  );

  const disciplinasAlocadasRef = useRef(disciplinasAlocadas);
  const interrompeRef = useRef(interrompe);
  // const estatisticasMonitoradasRef = useRef(estatisticasMonitoradas);

  /**
   * Campos a serem monitorados durante a execução do algoritmo.
   */
  const camposMonitorados = new Map<keyof Estatisticas, number>();
  camposMonitorados.set("iteracoes", 1);
  camposMonitorados.set("tempoPorIteracao", 1);
  camposMonitorados.set("avaliacaoPorIteracao", 1);

  useEffect(() => {
    interrompeRef.current = interrompe;
    disciplinasAlocadasRef.current = disciplinasAlocadas;
    // estatisticasMonitoradasRef.current = estatisticasMonitoradas;
  }, [interrompe, disciplinasAlocadas]);

  /**
   * Esta função usa a forma funcional (prevState)
   * para atualizar APENAS os estados que receberam novos dados,
   * e mescla os Maps.
   */
  const handleStatisticsUpdate = useCallback(
    (mudancas: Partial<Estatisticas>) => {
      // Atualiza 'iteracoes' se presente
      if (mudancas.iteracoes !== undefined) {
        // Substituição simples
        setIteracoes(mudancas.iteracoes);
      }

      // Atualiza 'tempoPorIteracao' se presente
      if (mudancas.tempoPorIteracao) {
        // Usa o 'prevState' (prevMap) para mesclar os dados
        setTempoPorIteracao((prevMap) => {
          // Cria um novo Map para imutabilidade
          const newMap = new Map(prevMap);
          // Adiciona/sobrescreve as novas entradas
          mudancas.tempoPorIteracao!.forEach((value, key) => {
            newMap.set(key, value);
          });
          return newMap;
        });
      }

      // Atualiza 'avaliacaoPorIteracao' se presente
      if (mudancas.avaliacaoPorIteracao) {
        setAvaliacaoPorIteracao((prevMap) => {
          const newMap = new Map(prevMap);
          mudancas.avaliacaoPorIteracao!.forEach((value, key) => {
            newMap.set(key, value);
          });
          return newMap;
        });
      }
    },
    []
  );

  /**
   * Executa o algoritmo Busca Tabu
   */
  const executeProcess = async () => {
    handleClickOpenDialog();
    setProcessing(true);

    try {
      if (selectedAlgorithm === "tabu-search") {
        const neighborhood = Array.from(neighborhoodFunctions.values())
          .filter((entry) => entry.isActive)
          .map((entry) => entry.instance);

        const stop = Array.from(stopFunctions.values())
          .filter((entry) => entry.isActive)
          .map((entry) => entry.instance);

        const aspiration = Array.from(aspirationFunctions.values())
          .filter((entry) => entry.isActive)
          .map((entry) => entry.instance);

        const objectives = Array.from(objectiveComponents.values()).filter(
          (entry) => entry.isActive
        );

        // Filter only active items
        const activeDocentes = docentes.filter((d) => d.ativo);
        const activeDisciplinas = disciplinas.filter((d) => d.ativo);
        const activeFormularios = getActiveFormularios(
          formularios,
          disciplinas,
          docentes
        );

        // Filter atribuicoes to only include active items
        const activeAtribuicoes = atribuicoes
          .filter((attr) =>
            activeDisciplinas.some((d) => d.id === attr.id_disciplina)
          )
          .map((attr) => ({
            ...attr,
            docentes: attr.docentes.filter((docente) =>
              activeDocentes.some((d) => d.nome === docente)
            ),
          }));

        const buscaTabu = new TabuSearch(
          activeAtribuicoes,
          activeDocentes,
          activeDisciplinas,
          travas,
          activeFormularios,
          [...hardConstraints.values(), ...softConstraints.values()],
          { atribuicoes: activeAtribuicoes },
          neighborhood,
          tabuListType,
          tabuListType === "Solução"
            ? parametros.tabuTenure.size
            : parametros.tabuTenure.tenures,
          stop,
          aspiration,
          maxPriority + 1,
          "max",
          objectives
        );

        await new Promise((resolve) => setTimeout(resolve, 0));

        await buscaTabu.execute(
          () => interrompeRef.current,
          setDisciplinasAlocadas,
          { campos: camposMonitorados, onUpdate: handleStatisticsUpdate }
        );

        const solucao: Solucao = {
          atribuicoes: buscaTabu.bestSolution.atribuicoes,
          avaliacao: buscaTabu.bestSolution.avaliacao,
          estatisticas: buscaTabu.statistics,
          algorithm: buscaTabu,
        };
        setSolucaoAtual(solucao);
      } else {
        const activeDocentes = docentes.filter((d) => d.ativo);
        const activeTurmas = disciplinas.filter((d) => d.ativo);
        const activeFormularios = getActiveFormularios(
          formularios,
          disciplinas,
          docentes
        );

        const activeAtribuicoes = atribuicoes
          .filter((attr) =>
            activeTurmas.some((d) => d.id === attr.id_disciplina)
          )
          .map((attr) => ({
            ...attr,
            docentes: attr.docentes.filter((docente) =>
              activeDocentes.some((d) => d.nome === docente)
            ),
          }));

        const objectives = Array.from(objectiveComponents.values()).filter(
          (entry) => entry.isActive
        );

        // Conjuntos
        const D_count = activeDocentes.length; // Número de docentes
        const T_count = activeTurmas.length; // Número de turmas

        // Mapeamento para facilitar a leitura
        const D = Array.from({ length: D_count }, (_, i) => i); // Docentes: 0, 1, 2
        const T = Array.from({ length: T_count }, (_, j) => j); // Turmas: 0, 1, 2, 3, 4

        // Parâmetros dos Docentes e Turmas
        // Carga horária de cada turma j
        const c: number[] = activeTurmas.map((t) => t.carga);
        // Saldo de carga horária acumulado de cada docente i
        const s: number[] = activeDocentes.map((d) => {
          if (d.ativo) return d.saldo;
        });
        // Prioridades p_ij do docente i para a turma j
        const p: number[][] = [];

        const m: number[][] = [];
        const a: number[][] = [];

        for (const docente of activeDocentes) {
          const dados = [];
          for (const turma of activeTurmas) {
            dados.push(0);

            const trava = travas.find(
              (trava) =>
                trava.nome_docente === docente.nome &&
                trava.id_disciplina === turma.id
            );

            if (trava) {
            }
          }
          m.push(dados);
          a.push(dados);
        }

        // Crie um Set para busca O(1)
        const travasSet = new Set(
          travas.map((trava) => `${trava.nome_docente}|${trava.id_disciplina}`)
        );

        for (let i = 0; i < activeDocentes.length; i++) {
          const docente = activeDocentes[i];
          for (let j = 0; j < activeTurmas.length; j++) {
            const turma = activeTurmas[j];

            // Verificação O(1)
            if (travasSet.has(`${docente.nome}|${turma.id}`)) {
              m[i][j] = 1;
            } else {
              m[i][j] = 0;
            }

            const atribuicao = activeAtribuicoes.find(
              (atribuicao) =>
                atribuicao.docentes.includes(docente.nome) &&
                atribuicao.id_disciplina === turma.id
            );

            if (atribuicao) {
              a[i][j] = 1;
            } else {
              a[i][j] = 0;
            }
          }
        }

        const F: [number, number][] = [];

        for (let i = 0; i < activeTurmas.length; i++) {
          for (let j = 0; j < activeTurmas.length; j++) {
            if (i >= j) {
              continue;
            }

            // Se a turma 'i' tem a turma 'j' em sua lista de conflitos.
            if (activeTurmas[i].conflitos.has(activeTurmas[j].id)) {
              // Adiciona o par de ÍNDICES [i, j] à lista F.
              F.push([i, j]);
              F.push([j, i]);
            }
          }
        }

        for (const docente of activeDocentes) {
          const prioridadesDocente = [];
          for (const turma of activeTurmas) {
            const prioridadeDocenteTurma = formularios.find(
              (f) =>
                f.id_disciplina === turma.id && f.nome_docente === docente.nome
            );

            prioridadesDocente.push(
              prioridadeDocenteTurma ? prioridadeDocenteTurma.prioridade : 0 //maxPriority + 1
            );
          }
          p.push(prioridadesDocente);
        }

        const solver = new MILP(
          "integer-solver",
          {
            atribuicoes: activeAtribuicoes,
            docentes: activeDocentes,
            prioridades: activeFormularios,
            travas: travas,
            turmas: activeTurmas,
          },
          [...hardConstraints.values(), ...softConstraints.values()],
          { atribuicoes: activeAtribuicoes },
          "max",
          objectives,
          maxPriority + 1,
          true,
          {
            D: D,
            T: T,
            a: a,
            c: c,
            F: F,
            m: m,
            p: p,
            s: s,
          }
        );

        const solution = await solver.execute();

        const solucao: Solucao = {
          atribuicoes: solver.solution.atribuicoes,
          avaliacao: solution.ObjectiveValue,
          algorithm: solver,
          estatisticas: solver.statistics,
        };

        setSolucaoAtual(solucao);
      }
    } catch (error) {
      console.error("Erro na execução do algoritmo:", error);
      addAlerta("Erro na execução do algoritmo!", "error");
    } finally {
      setProcessing(false);
      setInterrompe(false);
      setDisciplinasAlocadas(0);
    }
  };

  const handleClickOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  /**
   * Aplica a solução encontrada pelo algoritmo no state global
   */
  const applySolution = () => {
    try {
      const contextoExecucao: ContextoExecucao = {
        disciplinas: [...disciplinas],
        docentes: [...docentes],
        travas: [...travas],
        maxPriority: maxPriority,
        formularios: formularios,
      };

      const idSolucao: string = addNewSolutionToHistory(
        solucaoAtual,
        setHistoricoSolucoes,
        historicoSolucoes,
        TipoInsercao.Algoritmo,
        contextoExecucao
      );

      updateSolutionId(setSolucaoAtual, idSolucao);
      updateAtribuicoes(solucaoAtual.atribuicoes);

      addAlerta("A solução foi aplicada com sucesso!", "success");
      handleCloseDialog();
    } catch (error) {
      console.error("Erro ao aplicar solução:", error);
      addAlerta("Erro ao aplicar a solução!", "error");
    }
  };

  /**
   * Interrompe a execução do algoritmo
   */
  const interruptExecution = () => {
    setInterrompe(true);
    addAlerta("A execução do algoritmo foi interrompida!", "warning");
  };

  return {
    openDialog,
    processing,
    disciplinasAlocadas,
    executeProcess,
    handleCloseDialog,
    applySolution,
    interruptExecution,
    estatisticasMonitoradas: {
      iteracoes: iteracoes,
      tempoPorIteracao: tempoPorIteracao,
      avaliacaoPorIteracao: avaliacaoPorIteracao,
    },
  };
}
