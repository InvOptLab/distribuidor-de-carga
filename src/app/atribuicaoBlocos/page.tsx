"use client";
import { Box, Container, Typography, Paper } from "@mui/material";
import DocentesView from "./_components/DocentesView";
import { useGlobalContext } from "@/context/Global";
import {
  Atribuicao,
  Disciplina,
  Docente,
  Formulario,
} from "@/context/Global/utils";
import { calcularCargaDidatica } from "@/algoritmo/communs/utils";
import { useMemo, useRef, useState } from "react";
import HoveredDocente from "../atribuicoes/_components/HoveredDocente";
import { useAlgorithmContext } from "@/context/Algorithm";
import { CargaDeTrabalhoMaximaDocente } from "@/algoritmo/communs/Constraints/CargaDeTrabalhoMaximaDocente";

function generateAtribuicoesMap(
  docentes: Docente[],
  turmas: Disciplina[],
  atribuicoes: Atribuicao[],
  formularios: Formulario[]
): Map<string, Disciplina[]> {
  const docentesMap = new Map<string, Disciplina[]>();

  for (const docente of docentes) {
    const atribuicoesDocente = atribuicoes.filter(
      (a) => a.docentes.includes(docente.nome) && docente.ativo
    );

    const turmasDocente: Disciplina[] = [];
    for (const atribuicao of atribuicoesDocente) {
      // Importante: structuredClone para não mutar o original, mas precisamos garantir
      // que o objeto 'Disciplina' tenha o campo 'conflitos' populado corretamente
      // vindo do contexto global
      const turmaOriginal = turmas.find(
        (t) => t.id === atribuicao.id_disciplina && t.ativo
      );

      if (!turmaOriginal) continue;

      const turma = structuredClone(turmaOriginal);

      const formulario = formularios.find(
        (f) =>
          f.id_disciplina === atribuicao.id_disciplina &&
          f.nome_docente === docente.nome
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
  formularios: Formulario[]
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
        f.nome_docente === docente.nome
    );

    for (const formulario of formulariosTurmasNaoAtribuidas) {
      const turmaOriginal = turmas.find(
        (t) => t.id === formulario.id_disciplina
      );
      if (!turmaOriginal || !turmaOriginal.ativo) continue;

      const turma = structuredClone(turmaOriginal);

      turma.prioridade = formulario.prioridade;
      // Precisamos saber quem já está nela para mostrar, se necessário
      const atribuicaoExistente = atribuicoes.find(
        (a) => a.id_disciplina === formulario.id_disciplina
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

  // Obtém o valor máximo de carga configurado na restrição
  const maxCargaDidatica = useMemo(() => {
    const constraint = constraints.get("Carga de Trabalho Máxima");

    if (constraint instanceof CargaDeTrabalhoMaximaDocente) {
      return constraint.params.maxLimit.value;
    }
    return 0; // Valor padrão caso não encontre ou não tenha parametro
  }, [constraints]);

  const docentesAtivos = docentes.filter((d) => d.ativo);
  const turmasAtivas = disciplinas.filter((d) => d.ativo);

  const onDeleteAtribuicao = (nome_docente: string, id_disciplina: string) => {
    updateAtribuicoesDocente(nome_docente, id_disciplina);
  };

  const onAddAtribuicao = (nome_docente: string, id_disciplina: string) => {
    const newAtribuicoes = [...atribuicoes];
    const atribuicao = newAtribuicoes.find(
      (a) => a.id_disciplina === id_disciplina
    );

    if (atribuicao) {
      atribuicao.docentes = [nome_docente];
      updateAtribuicoes(newAtribuicoes);
    }
  };

  const atribuicoesMap = generateAtribuicoesMap(
    docentesAtivos,
    turmasAtivas,
    atribuicoes,
    formularios
  );

  const naoAtribuidasMap = generateNaoAtribuidasMap(
    docentesAtivos,
    turmasAtivas,
    atribuicoes,
    formularios
  );

  // Mapa de Carga Didática
  const cargaDidaticaMap = new Map<string, number>();
  docentesAtivos.forEach((docente) => {
    const carga = calcularCargaDidatica(docente, atribuicoes, turmasAtivas);
    cargaDidaticaMap.set(docente.nome, carga);
  });

  const [hoveredDocente, setHoveredDocente] = useState<Docente | null>(null);

  // Refs dos timers
  const enterTimer = useRef<NodeJS.Timeout | null>(null);
  const leaveTimer = useRef<NodeJS.Timeout | null>(null);
  const LEAVE_DELAY_MS = 200;

  const handleMouseActionsDocente = (nome: string | null) => {
    if (nome === null) {
      setHoveredDocente(null);
    } else {
      setHoveredDocente(docentes.find((d) => d.nome === nome) || null);
    }
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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4f6f8",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Atribuição em Blocos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie as atribuições focando em um docente por vez.
          </Typography>
        </Box>

        <DocentesView
          docentes={docentesAtivos}
          atribuicoesMap={atribuicoesMap}
          naoAtribuidasMap={naoAtribuidasMap}
          cargaDidaticaMap={cargaDidaticaMap}
          maxCarga={maxCargaDidatica}
          onDeleteAtribuicao={onDeleteAtribuicao}
          onAddAtribuicao={onAddAtribuicao}
          onHoveredDocente={handleMouseActionsDocente}
        />

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
