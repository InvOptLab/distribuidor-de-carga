"use client";
import { Box, Container, Typography, Chip, Stack } from "@mui/material";
import { useGlobalContext } from "@/context/Global";
import { useAlgorithmContext } from "@/context/Algorithm";
import { useCollaboration } from "@/context/Collaboration";
import { CollaborativeGridWrapper } from "../atribuicoes/_components/CollaborativeGridWrapper";
import {
  Atribuicao,
  Disciplina,
  Docente,
  Formulario,
} from "@/context/Global/utils";
import { CargaDeTrabalhoMaximaDocente } from "@/algoritmo/communs/Constraints/CargaDeTrabalhoMaximaDocente";
import { calcularCargaDidatica } from "@/algoritmo/communs/utils";
import { useState, useMemo, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DocentesView from "./_components/DocentesView";
import TurmasView, { TurmaData } from "./_components/TurmasView";
import { DocenteInfo } from "./_components/TurmaRow";
import PersonIcon from "@mui/icons-material/Person";
import ClassIcon from "@mui/icons-material/Class";
import { TipoTrava } from "@/algoritmo/communs/interfaces/interfaces";
import { useAlertsContext } from "@/context/Alerts";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";
import NoDataFound from "@/components/NoDataFound";

// Tipos para a pilha de navegação
type ViewType = "docente" | "turma";

interface StackItem {
  type: ViewType;
  id: string;
  index: number;
}

// Helper: gera mapa de atribuições por docente
function generateAtribuicoesMap(
  docentes: Docente[],
  turmas: Disciplina[],
  atribuicoes: Atribuicao[],
  formularios: Formulario[],
): Map<string, Disciplina[]> {
  const docentesMap = new Map<string, Disciplina[]>();
  for (const docente of docentes) {
    const atribuicoesDocente = atribuicoes.filter(
      (a) => a.docentes.includes(docente.nome) && docente.ativo,
    );
    const turmasDocente: Disciplina[] = [];
    for (const atribuicao of atribuicoesDocente) {
      const turmaOriginal = turmas.find(
        (t) => t.id === atribuicao.id_disciplina && t.ativo,
      );
      if (!turmaOriginal) continue;
      const turma = structuredClone(turmaOriginal);
      const formulario = formularios.find(
        (f) =>
          f.id_disciplina === atribuicao.id_disciplina &&
          f.nome_docente === docente.nome,
      );
      turma.prioridade = !formulario ? 0 : formulario.prioridade;
      turmasDocente.push(turma);
    }
    docentesMap.set(docente.nome, turmasDocente);
  }
  return docentesMap;
}

// Helper: gera mapa de turmas não atribuídas por docente
function generateNaoAtribuidasMap(
  docentes: Docente[],
  turmas: Disciplina[],
  atribuicoes: Atribuicao[],
  formularios: Formulario[],
): Map<string, Disciplina[]> {
  const docentesMap = new Map<string, Disciplina[]>();
  for (const docente of docentes) {
    const naoAtirbuidas: Disciplina[] = [];
    const idTurmaAtribuicoesDocente = atribuicoes
      .filter((a) => a.docentes.includes(docente.nome) && docente.ativo)
      .map((a) => a.id_disciplina);
    const formulariosTurmasNaoAtribuidas = formularios.filter(
      (f) =>
        !idTurmaAtribuicoesDocente.includes(f.id_disciplina) &&
        f.nome_docente === docente.nome,
    );
    for (const formulario of formulariosTurmasNaoAtribuidas) {
      const turmaOriginal = turmas.find(
        (t) => t.id === formulario.id_disciplina,
      );
      if (!turmaOriginal || !turmaOriginal.ativo) continue;
      const turma = structuredClone(turmaOriginal);
      turma.prioridade = formulario.prioridade;
      const atribuicaoExistente = atribuicoes.find(
        (a) => a.id_disciplina === formulario.id_disciplina,
      );
      turma.docentes = atribuicaoExistente ? atribuicaoExistente.docentes : [];
      naoAtirbuidas.push(turma);
    }
    docentesMap.set(docente.nome, naoAtirbuidas);
  }
  return docentesMap;
}

export default function AtribuicaoEmBlocosPage() {
  const {
    docentes,
    disciplinas,
    atribuicoes,
    formularios,
    updateAtribuicoesDocente,
    updateAtribuicoes,
    travas,
    setTravas,
  } = useGlobalContext();

  const { softConstraints, hardConstraints } = useAlgorithmContext();
  const constraints = new Map([...softConstraints, ...hardConstraints]);

  // Hooks de Colaboração
  const {
    isInRoom,
    isOwner,
    config,
    broadcastAssignmentChange,
    broadcastSelectionChange,
    onSelectionChange,
    broadcastDataUpdate,
  } = useCollaboration();

  const { addAlerta } = useAlertsContext();

  const { cleanSolucaoAtual } = useSolutionHistory();

  // Pilha de navegação
  const [navigationStack, setNavigationStack] = useState<StackItem[]>([
    { type: "docente", id: "", index: 0 },
  ]);

  // Estado atual é o topo da pilha
  const currentView = navigationStack[navigationStack.length - 1];

  // Direção da animação
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "left",
  );

  // Lógica de Permissão de Navegação
  const canNavigate = !isInRoom || isOwner || config.guestsCanEdit;

  // Dados computados
  const docentesAtivos = useMemo(
    () => docentes.filter((d) => d.ativo),
    [docentes],
  );
  const turmasAtivas = useMemo(
    () => disciplinas.filter((d) => d.ativo),
    [disciplinas],
  );

  const hasData = docentesAtivos.length > 0 && turmasAtivas.length > 0;

  const maxCargaDidatica = useMemo(() => {
    const constraint = constraints.get("Carga Didática Máxima");
    if (constraint instanceof CargaDeTrabalhoMaximaDocente) {
      return constraint.params.maxLimit.value;
    }
    return 0;
  }, [constraints]);

  const cargaDidaticaMap = useMemo(() => {
    const map = new Map<string, number>();
    docentesAtivos.forEach((docente) => {
      const carga = calcularCargaDidatica(docente, atribuicoes, turmasAtivas);
      map.set(docente.nome, carga);
    });
    return map;
  }, [docentesAtivos, atribuicoes, turmasAtivas]);

  const atribuicoesMap = useMemo(
    () =>
      generateAtribuicoesMap(
        docentesAtivos,
        turmasAtivas,
        atribuicoes,
        formularios,
      ),
    [docentesAtivos, turmasAtivas, atribuicoes, formularios],
  );

  const naoAtribuidasMap = useMemo(
    () =>
      generateNaoAtribuidasMap(
        docentesAtivos,
        turmasAtivas,
        atribuicoes,
        formularios,
      ),
    [docentesAtivos, turmasAtivas, atribuicoes, formularios],
  );

  // Gera dados das turmas para TurmasView
  const turmasData = useMemo((): TurmaData[] => {
    return turmasAtivas.map((turma) => {
      const atribuicao = atribuicoes.find((a) => a.id_disciplina === turma.id);
      const nomesAtribuidos = atribuicao?.docentes || [];

      const docentesAtribuidos: DocenteInfo[] = nomesAtribuidos.map((nome) => {
        const docente = docentes.find((d) => d.nome === nome);
        const formulario = formularios.find(
          (f) => f.nome_docente === nome && f.id_disciplina === turma.id,
        );
        return {
          nome,
          saldo: docente?.saldo || 0,
          prioridade: formulario?.prioridade || 0,
          totalFormularios: docente?.formularios?.size || 0,
          cargaDidaticaAtribuida: cargaDidaticaMap.get(nome) || 0,
        };
      });

      const formulariosParaTurma = formularios.filter(
        (f) =>
          f.id_disciplina === turma.id &&
          !nomesAtribuidos.includes(f.nome_docente),
      );

      const docentesComPrioridade: DocenteInfo[] = formulariosParaTurma
        .filter((f) => f.prioridade > 0)
        .map((f) => {
          const docente = docentes.find((d) => d.nome === f.nome_docente);
          return {
            nome: f.nome_docente,
            saldo: docente?.saldo || 0,
            prioridade: f.prioridade,
            totalFormularios: docente?.formularios?.size || 0,
            cargaDidaticaAtribuida: cargaDidaticaMap.get(f.nome_docente) || 0,
          };
        })
        .sort((a, b) => b.prioridade - a.prioridade);

      return {
        id: turma.id,
        nome: turma.nome,
        codigo: turma.codigo,
        turma: turma.turma,
        horarios: turma.horarios,
        curso: turma.cursos,
        nivel: turma.nivel,
        noturna: turma.noturna,
        ingles: turma.ingles,
        carga: turma.carga || 0,
        docentesAtribuidos,
        docentesComPrioridade,
      };
    });
  }, [turmasAtivas, atribuicoes, formularios, docentes, cargaDidaticaMap]);

  // Inicializar navegação com primeiro docente
  useEffect(() => {
    if (docentesAtivos.length > 0 && navigationStack[0].id === "") {
      setNavigationStack([
        { type: "docente", id: docentesAtivos[0].nome, index: 0 },
      ]);
    }
  }, [docentesAtivos, navigationStack]);

  // Efeito para ouvir mudanças remotas de seleção
  useEffect(() => {
    if (isInRoom) {
      const unsubscribe = onSelectionChange((payload) => {
        setNavigationStack((prev) => {
          const newStack = [...prev];
          // Crie uma cópia do objeto (Desestruturação) para evitar mutar o histórico
          const current = { ...newStack[newStack.length - 1] };

          if (current.type === "docente") {
            current.index = payload.index;
            current.id = docentesAtivos[payload.index]?.nome || "";
          }

          newStack[newStack.length - 1] = current; // Devolve o clone atualizado
          return newStack;
        });
      });
      return () => unsubscribe();
    }
  }, [isInRoom, onSelectionChange, docentesAtivos]);

  // Atualizar índice na view atual
  const handleIndexChange = useCallback(
    (index: number) => {
      setNavigationStack((prev) => {
        const newStack = [...prev];
        // Crie uma cópia do objeto para evitar mutar o histórico
        const current = { ...newStack[newStack.length - 1] };

        if (current.type === "docente") {
          current.id = docentesAtivos[index]?.nome || "";
          current.index = index;
          if (isInRoom) {
            broadcastSelectionChange(index);
          }
        } else {
          current.id = turmasData[index]?.id || "";
          current.index = index;
        }

        newStack[newStack.length - 1] = current; // Devolve o clone atualizado
        return newStack;
      });
    },
    [docentesAtivos, turmasData, isInRoom, broadcastSelectionChange],
  );

  // Verificar se existe docente travado para uma turma
  const getDocenteTravado = useCallback(
    (idDisciplina: string): string | null => {
      const celulaTravada = travas.find(
        (c) =>
          c.id_disciplina === idDisciplina &&
          c.trava === true &&
          c.tipo_trava !== TipoTrava.NotTrava,
      );
      return celulaTravada?.nome_docente || null;
    },
    [travas],
  );

  // Handler de Remoção de Atribuição
  const onDeleteAtribuicao = useCallback(
    (nome_docente: string, id_disciplina: string) => {
      if (!canNavigate) {
        addAlerta(
          "Você não tem permissão para desfazer uma atribuição",
          "warning",
        );
        return;
      }

      // Verificar se está travado
      const celula = travas.find(
        (c) =>
          c.id_disciplina === id_disciplina && c.nome_docente === nome_docente,
      );
      if (celula?.trava && celula?.tipo_trava !== TipoTrava.NotTrava) {
        addAlerta(
          "Esta atribuição está travada e não pode ser removida.",
          "warning",
        );
        return;
      }

      updateAtribuicoesDocente(nome_docente, id_disciplina);
      if (isInRoom) {
        const atribuicaoAtual = atribuicoes.find(
          (a) => a.id_disciplina === id_disciplina,
        );
        if (atribuicaoAtual) {
          const novosDocentes = atribuicaoAtual.docentes.filter(
            (d) => d !== nome_docente,
          );
          const atribuicaoAtualizada = {
            ...atribuicaoAtual,
            docentes: novosDocentes,
          };
          broadcastAssignmentChange(atribuicaoAtualizada, "update");
        }
      }
    },
    [
      canNavigate,
      travas,
      updateAtribuicoesDocente,
      isInRoom,
      atribuicoes,
      broadcastAssignmentChange,
    ],
  );

  // Handler de Adição de Atribuição
  const onAddAtribuicao = useCallback(
    (nome_docente: string, id_disciplina: string) => {
      if (!canNavigate) {
        addAlerta(
          "Você não tem permissão para realizar uma atribuição",
          "warning",
        );
        return;
      }

      // Verificar se existe docente travado
      const docenteTravado = getDocenteTravado(id_disciplina);

      const atribuicaoAtual = atribuicoes.find(
        (a) => a.id_disciplina === id_disciplina,
      );

      if (atribuicaoAtual) {
        let novosDocentes: string[];

        if (docenteTravado) {
          // Se existe docente travado, adicionar ao invés de substituir
          if (!atribuicaoAtual.docentes.includes(nome_docente)) {
            novosDocentes = [...atribuicaoAtual.docentes, nome_docente];

            addAlerta(
              `Já existe um docente travado (${docenteTravado}). O docente ${nome_docente} foi adicionado.`,
              "info",
            );
          } else {
            return; // Docente já está atribuído
          }
        } else {
          // Comportamento padrão: substituir
          novosDocentes = [nome_docente];
        }

        const atribuicaoAtualizada = {
          ...atribuicaoAtual,
          docentes: novosDocentes,
        };

        const newAtribuicoes = [...atribuicoes];
        const index = newAtribuicoes.findIndex(
          (a) => a.id_disciplina === id_disciplina,
        );
        if (index !== -1) {
          newAtribuicoes[index] = atribuicaoAtualizada;
          updateAtribuicoes(newAtribuicoes);
        }
        if (isInRoom) {
          broadcastAssignmentChange(atribuicaoAtualizada, "update");
        }
      }
    },
    [
      canNavigate,
      getDocenteTravado,
      atribuicoes,
      updateAtribuicoes,
      isInRoom,
      broadcastAssignmentChange,
    ],
  );

  // Handler de Travar/Destravar
  const onTravar = useCallback(
    (nome_docente: string, id_disciplina: string) => {
      if (!canNavigate) {
        addAlerta("Você não tem permissão para travar/destravar.", "warning");
        return;
      }

      let novasTravas = [...travas];
      const existingIndex = travas.findIndex(
        (c) =>
          c.id_disciplina === id_disciplina &&
          c.nome_docente === nome_docente &&
          c.tipo_trava === TipoTrava.Cell,
      );

      if (existingIndex !== -1) {
        // A trava já existe. O comportamento correto é REMOVÊ-LA (destravar).
        novasTravas = novasTravas.filter((_, index) => index !== existingIndex);
      } else {
        // A trava não existe. Adicionamos na lista de restrições.
        // ATENÇÃO: Nós APENAS inserimos em novasTravas. Não chamamos nenhum "adicionarDocente"
        // nas atribuições. Isso resolve o seu bug de atribuição automática.
        novasTravas.push({
          nome_docente,
          id_disciplina,
          // trava: true,
          tipo_trava: TipoTrava.Cell,
        });
      }

      // Salva no estado Global
      setTravas(novasTravas);

      // Transmite para a Sala Colaborativa
      if (isInRoom && broadcastDataUpdate) {
        broadcastDataUpdate(
          {
            docentes,
            disciplinas,
            formularios,
            atribuicoes, // Enviamos o estado atual de atribuições INTACTO
            travas: novasTravas, // Enviamos as novas travas
          },
          "FULL_DATA",
        );
      }

      // Limpa a solução visual e os cálculos passados do algoritmo
      if (cleanSolucaoAtual) {
        cleanSolucaoAtual();
      }
    },
    [
      canNavigate,
      travas,
      setTravas,
      isInRoom,
      docentes,
      disciplinas,
      formularios,
      atribuicoes,
      broadcastDataUpdate,
      cleanSolucaoAtual,
    ],
  );

  // Navegar para uma Turma
  const handleTurmaClick = useCallback(
    (idTurma: string) => {
      const turmaIndex = turmasData.findIndex((t) => t.id === idTurma);
      if (turmaIndex !== -1) {
        setSlideDirection("left");
        setNavigationStack((prev) => [
          ...prev,
          { type: "turma", id: idTurma, index: turmaIndex },
        ]);
      }
    },
    [turmasData],
  );

  // Navegar para um Docente
  const handleDocenteClick = useCallback(
    (nomeDocente: string) => {
      const docenteIndex = docentesAtivos.findIndex(
        (d) => d.nome === nomeDocente,
      );
      if (docenteIndex !== -1) {
        setSlideDirection("left");
        setNavigationStack((prev) => [
          ...prev,
          { type: "docente", id: nomeDocente, index: docenteIndex },
        ]);
      }
    },
    [docentesAtivos],
  );

  // Voltar (remover do topo da pilha)
  const handleBack = useCallback(() => {
    if (navigationStack.length > 1) {
      setSlideDirection("right");
      setNavigationStack((prev) => prev.slice(0, -1));
    }
  }, [navigationStack.length]);

  // Indicador de navegação (breadcrumb)
  const breadcrumb = useMemo(() => {
    return navigationStack.map((item) => {
      if (item.type === "docente") {
        const docente = docentesAtivos.find((d) => d.nome === item.id);
        return {
          label: docente?.nome || "Docente",
          type: "docente" as const,
        };
      } else {
        const turma = turmasData.find((t) => t.id === item.id);
        return {
          label: turma ? `${turma.codigo}-T${turma.turma}` : "Turma",
          type: "turma" as const,
        };
      }
    });
  }, [navigationStack, docentesAtivos, turmasData]);

  // Handler para hover de docente
  const handleHoveredDocente = useCallback(() => {
    // Implementação opcional de hover
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8", py: 4 }}>
      <Container maxWidth="xl">
        <CollaborativeGridWrapper>
          {!hasData ? (
            <NoDataFound />
          ) : (
            <Box width="100%">
              {/* Breadcrumb / Indicador de navegação */}
              {navigationStack.length > 1 && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 2, px: 2 }}
                  flexWrap="wrap"
                >
                  <Typography variant="caption" color="text.secondary">
                    Navegação:
                  </Typography>
                  {breadcrumb.map((item, idx) => (
                    <Box key={idx} display="flex" alignItems="center" gap={0.5}>
                      {idx > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          →
                        </Typography>
                      )}
                      <Chip
                        icon={
                          item.type === "docente" ? (
                            <PersonIcon />
                          ) : (
                            <ClassIcon />
                          )
                        }
                        label={item.label}
                        size="small"
                        variant={
                          idx === breadcrumb.length - 1 ? "filled" : "outlined"
                        }
                        color={
                          idx === breadcrumb.length - 1 ? "primary" : "default"
                        }
                        sx={{ height: 24, fontSize: "0.75rem" }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}

              {/* Container com animação */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={navigationStack.length}
                  initial={{
                    opacity: 0,
                    x: slideDirection === "left" ? 100 : -100,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: slideDirection === "left" ? -100 : 100,
                  }}
                  transition={{
                    duration: 0.1,
                    ease: "easeInOut",
                  }}
                >
                  {currentView.type === "docente" ? (
                    <DocentesView
                      docentes={docentesAtivos}
                      atribuicoesMap={atribuicoesMap}
                      naoAtribuidasMap={naoAtribuidasMap}
                      cargaDidaticaMap={cargaDidaticaMap}
                      maxCarga={maxCargaDidatica}
                      onDeleteAtribuicao={onDeleteAtribuicao}
                      onAddAtribuicao={onAddAtribuicao}
                      onHoveredDocente={handleHoveredDocente}
                      onTurmaClick={handleTurmaClick}
                      onTravar={onTravar}
                      selectedIndex={currentView.index}
                      onChangeIndex={handleIndexChange}
                      canNavigate={canNavigate}
                      onBack={handleBack}
                      showBackButton={navigationStack.length > 1}
                      travas={travas}
                    />
                  ) : (
                    <TurmasView
                      turmas={turmasData}
                      maxCarga={maxCargaDidatica}
                      onDeleteAtribuicao={onDeleteAtribuicao}
                      onAddAtribuicao={onAddAtribuicao}
                      onDocenteClick={handleDocenteClick}
                      onTravar={onTravar}
                      selectedIndex={currentView.index}
                      onChangeIndex={handleIndexChange}
                      canNavigate={canNavigate}
                      onBack={handleBack}
                      showBackButton={navigationStack.length > 1}
                      travas={travas}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </Box>
          )}
        </CollaborativeGridWrapper>
      </Container>
    </Box>
  );
}
