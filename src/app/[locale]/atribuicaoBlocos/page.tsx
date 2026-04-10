"use client";
import { Box, Container, Typography } from "@mui/material";
import DocentesView from "./_components/DocentesView";
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
import { useRef, useState, useMemo, useEffect } from "react";
import HoveredDocente from "../atribuicoes/_components/HoveredDocente";

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

function generateNaoAtribuidasMap(
  docentes: Docente[],
  turmas: Disciplina[],
  atribuicoes: Atribuicao[],
  formularios: Formulario[],
) {
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

export default function DocentesPage() {
  const {
    docentes,
    disciplinas,
    atribuicoes,
    formularios,
    updateAtribuicoesDocente,
    updateAtribuicoes,
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
  } = useCollaboration();

  // Estado Local da Seleção
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Lógica de Permissão de Navegação
  const canNavigate = !isInRoom || isOwner || config.guestsCanEdit;

  // Handler de Navegação (Local + Remoto)
  const handleIndexChange = (index: number) => {
    if (canNavigate) {
      setSelectedIndex(index);
      if (isInRoom) {
        broadcastSelectionChange(index);
      }
    }
  };

  // Efeito para ouvir mudanças remotas de seleção
  useEffect(() => {
    if (isInRoom) {
      const unsubscribe = onSelectionChange((payload) => {
        // Atualiza o índice localmente quando recebe um evento da sala
        setSelectedIndex(payload.index);
      });
      return () => unsubscribe();
    }
  }, [isInRoom, onSelectionChange]);

  const maxCargaDidatica = useMemo(() => {
    const constraint = constraints.get("Carga Didática Máxima");
    if (constraint instanceof CargaDeTrabalhoMaximaDocente) {
      return constraint.params.maxLimit.value;
    }
    return 0;
  }, [constraints]);

  const docentesAtivos = docentes.filter((d) => d.ativo);
  const turmasAtivas = disciplinas.filter((d) => d.ativo);

  const onDeleteAtribuicao = (nome_docente: string, id_disciplina: string) => {
    if (!canNavigate) return; // Segurança extra

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
  };

  const onAddAtribuicao = (nome_docente: string, id_disciplina: string) => {
    if (!canNavigate) return; // Segurança extra

    const atribuicaoAtual = atribuicoes.find(
      (a) => a.id_disciplina === id_disciplina,
    );
    if (atribuicaoAtual) {
      const novosDocentes = [nome_docente];
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
  };

  const atribuicoesMap = generateAtribuicoesMap(
    docentesAtivos,
    turmasAtivas,
    atribuicoes,
    formularios,
  );
  const naoAtribuidasMap = generateNaoAtribuidasMap(
    docentesAtivos,
    turmasAtivas,
    atribuicoes,
    formularios,
  );

  const cargaDidaticaMap = new Map<string, number>();
  docentesAtivos.forEach((docente) => {
    const carga = calcularCargaDidatica(docente, atribuicoes, turmasAtivas);
    cargaDidaticaMap.set(docente.nome, carga);
  });

  const [hoveredDocente, setHoveredDocente] = useState<Docente | null>(null);
  const enterTimer = useRef<NodeJS.Timeout | null>(null);
  const leaveTimer = useRef<NodeJS.Timeout | null>(null);
  const LEAVE_DELAY_MS = 200;

  const handleMouseActionsDocente = (nome: string | null) => {
    if (nome === null) setHoveredDocente(null);
    else setHoveredDocente(docentes.find((d) => d.nome === nome) || null);
  };
  const clearTimers = () => {
    if (enterTimer.current) {
      clearTimeout(enterTimer.current);
      enterTimer.current = null;
    }
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };
  const handleMouseLeave = () => {
    clearTimers();
    leaveTimer.current = setTimeout(() => {
      setHoveredDocente(null);
    }, LEAVE_DELAY_MS);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8", py: 4 }}>
      <Container maxWidth="xl">
        <CollaborativeGridWrapper>
          <Box width="100%">
            {/* <Box mb={4}>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                Atribuição em Blocos
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {isInRoom
                  ? "Modo Colaborativo: Navegação sincronizada."
                  : "Gerencie as atribuições sequencialmente ou navegue pela lista."}
              </Typography>
            </Box> */}

            <DocentesView
              docentes={docentesAtivos}
              atribuicoesMap={atribuicoesMap}
              naoAtribuidasMap={naoAtribuidasMap}
              cargaDidaticaMap={cargaDidaticaMap}
              maxCarga={maxCargaDidatica}
              onDeleteAtribuicao={onDeleteAtribuicao}
              onAddAtribuicao={onAddAtribuicao}
              onHoveredDocente={handleMouseActionsDocente}
              // Novas props de controle de estado
              selectedIndex={selectedIndex}
              onChangeIndex={handleIndexChange}
              canNavigate={canNavigate}
            />
          </Box>
        </CollaborativeGridWrapper>

        {/* {hoveredDocente && (
          <HoveredDocente
            docente={hoveredDocente}
            onMouseEnter={clearTimers}
            onMouseLeave={handleMouseLeave}
          />
        )} */}
      </Container>
    </Box>
  );
}
