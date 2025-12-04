"use client";

import type React from "react";
import {
  createContext,
  useContext,
  type ReactNode,
  useCallback,
  useState,
  useMemo,
} from "react";
import { useGlobalContext } from "@/context/Global";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";
import { useAlertsContext } from "@/context/Alerts";
import { useAlgorithmContext } from "@/context/Algorithm";
import { DisciplinaFilters, DocenteFilters, FilterRule } from "../types/types";
import {
  exportJson,
  getFormattedDate,
  removeInativos,
  saveAtribuicoesInHistoryState,
} from "..";
import {
  Atribuicao,
  Celula,
  Context,
  Disciplina,
  Docente,
  Estatisticas,
  Solucao,
  TipoTrava,
} from "@/algoritmo/communs/interfaces/interfaces";
import { ContextoExecucao, getActiveFormularios } from "@/context/Global/utils";
import ObjectiveComponent from "@/algoritmo/abstractions/ObjectiveComponent";
import { calculateManualSolution } from "@/algoritmo/communs/calculateManualSolution";
import Algorithm from "@/algoritmo/abstractions/Algorithm";
import Constraint from "@/algoritmo/abstractions/Constraint";
import {
  RoomConfig,
  serializeContextData,
  useCollaboration,
} from "@/context/Collaboration";

/**
 * Remover essa classe depois desse local.
 */
class InsercaoManual extends Algorithm<any> {
  constructor(
    name: string,
    context: Context,
    constraints: Constraint<any>[],
    solution: Solucao | undefined,
    objectiveType: "min" | "max",
    objectiveComponentes: ObjectiveComponent<any>[],
    maiorPrioridade: number | undefined
  ) {
    super(
      name,
      context,
      constraints,
      solution,
      objectiveType,
      objectiveComponentes,
      maiorPrioridade,
      true
    );
  }

  execute(): Promise<any> {
    return;
  }
  protected filtrarEstatisticas(): Partial<Estatisticas> {
    return;
  }
}

interface TimetableContextType {
  docentes: Docente[];
  disciplinas: Disciplina[];
  filteredDocentes: Docente[];
  filteredDisciplinas: Disciplina[];
  formularios: any[];
  atribuicoes: Atribuicao[];
  travas: Celula[];
  maxPriority: number;
  docenteFilters: DocenteFilters;
  disciplinaFilters: DisciplinaFilters;
  setDocenteFilters: (filters: DocenteFilters) => void;
  setDisciplinaFilters: (filters: DisciplinaFilters) => void;
  clearFilters: () => void;
  setAtribuicoes: (atribuicoes: Atribuicao[]) => void;
  setTravas: (travas: Celula[]) => void;
  adicionarDocente: (id_disciplina: string, nome_docente: string) => void;
  removerDocente: (idDisciplina: string, docenteARemover: string) => void;
  handleCellClick: (
    event: React.MouseEvent,
    celula: Celula,
    params: {
      isInRoom: boolean;
      isOwner: boolean;
      config: RoomConfig;
    }
  ) => void;
  handleColumnClick: (event: React.MouseEvent, trava: Celula) => void;
  handleRowClick: (event: React.MouseEvent, trava: Celula) => void;
  cleanStateAtribuicoes: () => void;
  saveAlterations: () => void;
  downalodJson: () => void;
}

const TimetableContext = createContext<TimetableContextType | undefined>(
  undefined
);

export function TimetableProvider({ children }: { children: ReactNode }) {
  const {
    docentes,
    disciplinas,
    formularios,
    atribuicoes,
    setAtribuicoes,
    travas,
    setTravas,
    solucaoAtual,
    setSolucaoAtual,
    historicoSolucoes,
    setHistoricoSolucoes,
  } = useGlobalContext();

  const { hardConstraints, softConstraints, objectiveComponents } =
    useAlgorithmContext();
  const { cleanSolucaoAtual } = useSolutionHistory();
  const { addAlerta } = useAlertsContext();

  // LÓGICA DE COLABORAÇÃO: Consumir o hook
  const { broadcastAssignmentChange, broadcastDataUpdate, isInRoom } =
    useCollaboration();

  const [docenteFilters, setDocenteFilters] = useState<DocenteFilters>({
    search: "",
    rules: [],
  });

  const [disciplinaFilters, setDisciplinaFilters] = useState<DisciplinaFilters>(
    {
      search: "",
      rules: [],
    }
  );

  // Calculate maxPriority based on active docentes and disciplinas
  const maxPriority = useMemo(() => {
    const activeFormularios = getActiveFormularios(
      formularios,
      disciplinas,
      docentes
    );
    return activeFormularios.reduce(
      (max, form) => Math.max(max, form.prioridade),
      0
    );
  }, [formularios, disciplinas, docentes]);

  // Helper function to convert time string (hh:mm) to minutes
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr || typeof timeStr !== "string") return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to check if a value matches a filter rule
  const matchesRule = (value: any, rule: FilterRule): boolean => {
    switch (rule.type) {
      case "exact":
        return value === rule.value;
      case "contains":
        return value
          ?.toString()
          .toLowerCase()
          .includes(rule.value.toLowerCase());
      case "chips":
        if (rule.fieldKey === "horarios_dias") {
          // For horarios dias, check if any of the selected days match
          if (!Array.isArray(value)) return false;
          return value.some((horario) => rule.value.includes(horario.dia));
        }
        return rule.value.includes(value);
      case "boolean":
        return value === rule.value;
      case "timeRange":
        if (rule.fieldKey === "horarios_tempo" && Array.isArray(value)) {
          // Convert filter times to minutes for comparison
          const ruleStartMinutes = rule.value.start
            ? timeToMinutes(rule.value.start)
            : 0; // 00:00 if not specified
          const ruleEndMinutes = rule.value.end
            ? timeToMinutes(rule.value.end)
            : 24 * 60; // 24:00 if not specified

          // Check if any horario overlaps with the time range
          return value.some((horario) => {
            const horarioStartMinutes = timeToMinutes(horario.inicio);
            const horarioEndMinutes = timeToMinutes(horario.fim);

            // Check for overlap: horario starts before rule ends AND horario ends after rule starts
            return (
              horarioStartMinutes < ruleEndMinutes &&
              horarioEndMinutes > ruleStartMinutes
            );
          });
        }
        return false;
      case "number":
        return value === rule.value;
      default:
        return true;
    }
  };

  // Apply filters to docentes
  const filteredDocentes = useMemo(() => {
    return docentes.filter((docente) => {
      if (!docente.ativo) return false;

      // Apply search filter
      if (
        docenteFilters.search &&
        !docente.nome
          .toLowerCase()
          .includes(docenteFilters.search.toLowerCase())
      ) {
        return false;
      }

      // Apply rule filters
      for (const rule of docenteFilters.rules) {
        const value = (docente as any)[rule.fieldKey];
        if (!matchesRule(value, rule)) {
          return false;
        }
      }

      return true;
    });
  }, [docentes, docenteFilters]);

  // Apply filters to disciplinas
  const filteredDisciplinas = useMemo(() => {
    return disciplinas.filter((disciplina) => {
      if (!disciplina.ativo) return false;

      // Apply search filter (nome, codigo, or id)
      if (disciplinaFilters.search) {
        const searchLower = disciplinaFilters.search.toLowerCase();
        if (
          !disciplina.nome.toLowerCase().includes(searchLower) &&
          !disciplina.codigo.toLowerCase().includes(searchLower) &&
          !disciplina.id.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Apply rule filters
      for (const rule of disciplinaFilters.rules) {
        let fieldKey = rule.fieldKey;

        if (
          rule.fieldKey === "horarios_tempo" ||
          rule.fieldKey === "horarios_dias"
        ) {
          fieldKey = "horarios";
        }
        const value = (disciplina as any)[fieldKey];

        // const value = (disciplina as any)[rule.fieldKey];
        if (!matchesRule(value, rule)) {
          return false;
        }
      }

      return true;
    });
  }, [disciplinas, disciplinaFilters]);

  const clearFilters = () => {
    setDocenteFilters({ search: "", rules: [] });
    setDisciplinaFilters({ search: "", rules: [] });
  };

  /**
   * Adiciona um novo docente a uma disciplina no state de atribuições
   */
  const adicionarDocente = useCallback(
    (id_disciplina: string, nome_docente: string) => {
      let novaAtribuicaoParaBroadcast: Atribuicao | null = null;

      // Atualiza o estado local
      setAtribuicoes((prevAtribuicoes) => {
        const index = prevAtribuicoes.findIndex(
          (a) => a.id_disciplina === id_disciplina
        );

        if (index !== -1) {
          // Atualiza existente
          const updated = {
            ...prevAtribuicoes[index],
            docentes: [...prevAtribuicoes[index].docentes, nome_docente],
          };
          novaAtribuicaoParaBroadcast = updated;

          const novoArray = [...prevAtribuicoes];
          novoArray[index] = updated;
          return novoArray;
        } else {
          // Cria nova
          const nova = {
            id_disciplina: id_disciplina,
            docentes: [nome_docente],
          };
          novaAtribuicaoParaBroadcast = nova;
          return [...prevAtribuicoes, nova];
        }
      });

      // LÓGICA DE COLABORAÇÃO: Broadcast após atualização local
      if (isInRoom && novaAtribuicaoParaBroadcast) {
        broadcastAssignmentChange(novaAtribuicaoParaBroadcast, "update");
      }
    },
    [setAtribuicoes, isInRoom, broadcastAssignmentChange]
  );

  /**
   * Remove um docente de uma disciplina no state de atribuições
   */
  const removerDocente = useCallback(
    (idDisciplina: string, docenteARemover: string) => {
      const index = atribuicoes.findIndex(
        (a) => a.id_disciplina === idDisciplina
      );

      if (index !== -1) {
        // 1. Calcular
        const updatedAtribuicao = {
          ...atribuicoes[index],
          docentes: atribuicoes[index].docentes.filter(
            (docente) => docente != docenteARemover
          ),
        };
        const newAtribuicoesList = [...atribuicoes];
        newAtribuicoesList[index] = updatedAtribuicao;

        // 2. Atualizar Local
        setAtribuicoes(newAtribuicoesList);

        // 3. Broadcast
        if (isInRoom) {
          broadcastAssignmentChange(updatedAtribuicao, "update");
        }
      }
    },
    [atribuicoes, setAtribuicoes, isInRoom, broadcastAssignmentChange]
  );

  /**
   * Gerencia e aplica comportamentos ao clicar em uma célula da tabela
   */
  const handleCellClick = (
    event: React.MouseEvent,
    celula: Celula,
    params: {
      isInRoom: boolean;
      isOwner: boolean;
      config: RoomConfig;
    }
  ) => {
    // Security Check
    if (params.isInRoom) {
      const canEdit = params.isOwner || params.config.guestsCanEdit;
      if (!canEdit) {
        addAlerta(
          "Apenas o líder da sala pode realizar alterações.",
          "warning"
        );
        return;
      }
    }

    if (event.ctrlKey) {
      // Lógica de TRAVAS (Locks)
      let newTravas = [...travas];
      const exists = travas.some(
        (obj) => JSON.stringify(obj) === JSON.stringify(celula)
      );

      if (!exists) {
        newTravas.push(celula);
      } else {
        newTravas = newTravas.filter(
          (obj) => JSON.stringify(obj) !== JSON.stringify(celula)
        );
      }

      setTravas(newTravas);

      // Broadcast Específico para Travas (FULL_DATA com travas atualizadas)
      if (isInRoom) {
        broadcastDataUpdate(
          serializeContextData({
            docentes,
            disciplinas,
            formularios,
            atribuicoes, // Estado atual
            travas: newTravas, // Novo estado de travas
          }),
          "FULL_DATA"
        );
      }
    } else {
      // Lógica de Atribuição (Add/Remove)
      if (
        !travas.some(
          (trava) =>
            trava.id_disciplina === celula.id_disciplina &&
            trava.nome_docente === celula.nome_docente
        )
      ) {
        const newAtribuicao = atribuicoes.find(
          (atribuicao) => atribuicao.id_disciplina == celula.id_disciplina
        );

        if (
          !newAtribuicao ||
          (newAtribuicao &&
            !newAtribuicao.docentes.some(
              (docente) => docente == celula.nome_docente
            ))
        ) {
          adicionarDocente(celula.id_disciplina, celula.nome_docente!);
        } else {
          removerDocente(celula.id_disciplina, celula.nome_docente!);
        }
      }
    }

    cleanSolucaoAtual();

    // REMOVIDO: O broadcast genérico aqui sobrescrevia as mudanças de adicionar/remover
  };

  /**
   * Gerencia os comportamentos das colunas ao serem clicadas
   */
  const handleColumnClick = (event: React.MouseEvent, trava: Celula) => {
    if (event.ctrlKey) {
      let newTravas = [...travas];
      const exists = travas.some(
        (obj) => JSON.stringify(obj) === JSON.stringify(trava)
      );

      if (!exists) {
        if (trava.tipo_trava == TipoTrava.Column) {
          const travar: Celula[] = docentes.map((docente) => ({
            id_disciplina: trava.id_disciplina,
            nome_docente: docente.nome,
            tipo_trava: TipoTrava.ColumnCell,
          }));
          travar.push(trava);
          newTravas = [...newTravas, ...travar];
        }
      } else {
        if (trava.tipo_trava == TipoTrava.Column) {
          newTravas = newTravas.filter(
            (obj) =>
              (obj.tipo_trava !== TipoTrava.ColumnCell &&
                obj.tipo_trava !== TipoTrava.Column) ||
              obj.id_disciplina != trava.id_disciplina
          );
        }
      }

      setTravas(newTravas);
      cleanSolucaoAtual();

      // Broadcast Travas
      if (isInRoom) {
        broadcastDataUpdate(
          serializeContextData({
            docentes,
            disciplinas,
            formularios,
            atribuicoes,
            travas: newTravas,
          }),
          "FULL_DATA"
        );
      }
    }
  };

  /**
   * Gerencia os comportamentos das linhas ao serem clicadas
   */
  const handleRowClick = (event: React.MouseEvent, trava: Celula) => {
    if (event.ctrlKey) {
      let newTravas = [...travas];
      const exists = travas.some(
        (obj) => JSON.stringify(obj) === JSON.stringify(trava)
      );

      if (!exists) {
        if (trava.tipo_trava == TipoTrava.Row) {
          const travar: Celula[] = disciplinas.map((disciplina) => ({
            id_disciplina: disciplina.id,
            nome_docente: trava.nome_docente,
            tipo_trava: TipoTrava.RowCell,
          }));
          travar.push(trava);
          newTravas = [...newTravas, ...travar];
        }
      } else {
        if (trava.tipo_trava == TipoTrava.Row) {
          newTravas = newTravas.filter(
            (obj) =>
              (obj.tipo_trava !== TipoTrava.RowCell &&
                obj.tipo_trava !== TipoTrava.Row) ||
              obj.nome_docente != trava.nome_docente
          );
        }
      }

      setTravas(newTravas);
      cleanSolucaoAtual();

      // Broadcast Travas
      if (isInRoom) {
        broadcastDataUpdate(
          serializeContextData({
            docentes,
            disciplinas,
            formularios,
            atribuicoes,
            travas: newTravas,
          }),
          "FULL_DATA"
        );
      }
    }
  };

  /**
   * Limpa o state `atribuicoes`, deixando-o vazio
   */
  const cleanStateAtribuicoes = () => {
    const atribuicoesLimpa: Atribuicao[] = [];

    for (const atribuicao of atribuicoes) {
      let found = false;
      for (const docente of atribuicao.docentes) {
        if (
          travas.find(
            (trava) =>
              trava.id_disciplina === atribuicao.id_disciplina &&
              docente === trava.nome_docente
          ) ||
          !docentes.find((doc) => doc.nome === docente)?.ativo ||
          !disciplinas.find((disc) => disc.id === atribuicao.id_disciplina)
            ?.ativo
        ) {
          if (!found) {
            atribuicoesLimpa.push({
              ...atribuicao,
              docentes: atribuicao.docentes.filter(
                (d) =>
                  travas.find(
                    (t) =>
                      t.id_disciplina === atribuicao.id_disciplina &&
                      d === t.nome_docente
                  ) || !docentes.find((doc) => doc.nome === d)?.ativo
              ),
            });
            found = true;
          }
        }
      }

      if (!found) {
        atribuicoesLimpa.push({
          id_disciplina: atribuicao.id_disciplina,
          docentes: [],
        });
      }
    }

    setAtribuicoes(atribuicoesLimpa);
    addAlerta("A solução foi limpa com sucesso!", "success");

    // LÓGICA DE COLABORAÇÃO: Broadcast da limpeza
    if (isInRoom) {
      // Envia todo o conjunto de atribuições atualizado (limpo)
      broadcastDataUpdate(
        serializeContextData({
          atribuicoes: atribuicoesLimpa,
          disciplinas: disciplinas,
          docentes: docentes,
          formularios: formularios,
          travas: travas,
        }),
        "FULL_DATA"
      );
    }
  };

  /**
   * Salva as alterações atuais no histórico (maunal)
   */
  const saveAlterations = async () => {
    try {
      const objectives: ObjectiveComponent<any>[] = Array.from(
        objectiveComponents.values()
      ).filter((entry) => entry.isActive);

      const ativos = removeInativos(docentes, disciplinas, atribuicoes);

      const solucaoManual: Solucao = await calculateManualSolution(
        ativos.atribuicoes,
        ativos.docentes,
        ativos.turmas,
        travas,
        formularios,
        softConstraints, // Map de restrições soft
        hardConstraints, // Map de restrições hard
        objectives,
        maxPriority
      );

      const contextoExecucao: ContextoExecucao = {
        disciplinas: [...disciplinas],
        docentes: [...docentes],
        travas: [...travas],
        maxPriority: maxPriority,
        formularios: formularios,
      };

      /**
       * Precisa ser revisto, talvez uma opção seja criar um método "manual" para facilitar a inserção.
       */
      const algorithm = new InsercaoManual(
        "manual-insert",
        {
          atribuicoes: ativos.atribuicoes,
          docentes: ativos.docentes,
          turmas: ativos.turmas,
          prioridades: formularios,
          travas: travas,
          maiorPrioridade: maxPriority,
        },
        [...hardConstraints.values(), ...softConstraints.values()],
        solucaoManual,
        "max",
        [...objectiveComponents.values()],
        maxPriority
      );

      saveAtribuicoesInHistoryState(
        solucaoManual.atribuicoes,
        solucaoManual.avaliacao,
        historicoSolucoes,
        setHistoricoSolucoes,
        setSolucaoAtual,
        contextoExecucao,
        algorithm,
        solucaoManual.estatisticas
      );

      addAlerta("As atribuições foram adicionadas ao histórico!", "success");
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      addAlerta("Erro ao salvar as alterações!", "error");
    }
  };

  /**
   * Exporta as atribuições para um arquivo JSON
   */
  const downalodJson = () => {
    if (!atribuicoes.some((atribuicao) => atribuicao.docentes.length > 0)) {
      addAlerta("Nenhuma atribuição foi realizada!", "warning");
      // return;
    }

    let filename: string;

    if (solucaoAtual.idHistorico) {
      filename = solucaoAtual.idHistorico + ".json";
      exportJson(
        filename,
        docentes,
        disciplinas,
        atribuicoes,
        travas,
        historicoSolucoes.get(solucaoAtual.idHistorico)
      );
    } else {
      filename = getFormattedDate() + ".json";
      exportJson(filename, docentes, disciplinas, atribuicoes, travas);
    }
  };

  const value = {
    docentes,
    disciplinas,
    filteredDocentes,
    filteredDisciplinas,
    formularios,
    atribuicoes,
    travas,
    maxPriority,
    docenteFilters,
    disciplinaFilters,
    setDocenteFilters,
    setDisciplinaFilters,
    clearFilters,
    setAtribuicoes,
    setTravas,
    adicionarDocente,
    removerDocente,
    handleCellClick,
    handleColumnClick,
    handleRowClick,
    cleanStateAtribuicoes,
    saveAlterations,
    downalodJson,
  };

  return (
    <TimetableContext.Provider value={value}>
      {children}
    </TimetableContext.Provider>
  );
}

export function useTimetable() {
  const context = useContext(TimetableContext);
  if (context === undefined) {
    throw new Error("useTimetable must be used within a TimetableProvider");
  }
  return context;
}
