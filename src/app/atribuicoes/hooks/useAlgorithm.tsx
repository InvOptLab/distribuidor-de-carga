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
  Estatisticas,
  Solucao,
} from "@/algoritmo/communs/interfaces/interfaces";

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
        undefined, //maxPriority + 1,
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
