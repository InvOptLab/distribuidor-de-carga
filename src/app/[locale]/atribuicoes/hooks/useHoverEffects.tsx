"use client";

import { useState } from "react";
import { useTimetable } from "../context/TimetableContext";
import { type Celula, TipoTrava } from "@/context/Global/utils";
import { getPriorityColor } from "..";

export function useHoverEffects() {
  const { filteredDisciplinas, atribuicoes, travas, maxPriority } =
    useTimetable();

  const [hover, setHover] = useState<{
    id_disciplina: string;
    docente: string;
  }>({ docente: "", id_disciplina: "" });

  /**
   * Atualiza o estado de hover ao passar o mouse sobre uma célula
   */
  const handleOnMouseEnter = (nome: string, id_disciplina: string) => {
    setHover({
      docente: nome,
      id_disciplina: id_disciplina,
    });
  };

  /**
   * Atualiza o estado de hover ao passar o mouse sobre um docente
   */
  const handleOnMouseEnterDocente = (nome: string | null) => {
    if (nome) {
      setHover((prev) => ({ ...prev, docente: nome }));
    }
  };

  /**
   * Define a cor do cabeçalho da coluna
   */
  const setHeaderCollor = (id_disciplina: string) => {
    if (
      travas.some(
        (obj) =>
          obj.id_disciplina === id_disciplina &&
          obj.tipo_trava === TipoTrava.Column
      )
    ) {
      if (id_disciplina === hover.id_disciplina) {
        // Cor de trava + hover
        return `rgba(132, 118, 210, 0.25)`;
      }
      // Cor de trava
      return `rgba(224, 224, 224, 0.6)`;
    } else if (id_disciplina === hover.id_disciplina) {
      // Cor de hover normal
      return `rgba(25, 118, 210, 0.12)`;
    } else {
      // Cor padrão transparente para herdar do TableCell
      return "transparent";
    }
  };

  /**
   * Define a cor da coluna do docente (célula sticky)
   */
  const setColumnCollor = (nome_docente: string) => {
    const temConflito = verificaConflitosDocente(nome_docente);
    const estaTravada = travas.some(
      (obj) =>
        obj.nome_docente === nome_docente && obj.tipo_trava === TipoTrava.Row
    );
    const estaHover = nome_docente === hover.docente;

    if (estaTravada) {
      if (estaHover) {
        if (temConflito) return `rgba(255, 118, 210, 0.30)`; // Trava + Hover + Conflito
        return `rgba(132, 118, 210, 0.20)`; // Trava + Hover
      }
      if (temConflito) return `rgba(255, 200, 200, 1)`; // Trava + Conflito
      return `rgba(224, 224, 224, 0.6)`; // Apenas Trava
    }

    if (estaHover) {
      if (temConflito) return `rgba(255, 110, 200, 0.60)`; // Hover + Conflito
      return `rgba(25, 118, 210, 0.12)`; // Apenas Hover
    }

    if (temConflito) return `rgba(255, 0, 0, 0.3)`; // Apenas Conflito

    return "transparent"; // Padrão (usa o fundo do paper)
  };

  /**
   * Define a cor da célula com base na prioridade e estado
   */
  const setCellColor = (prioridade: number | null, celula: Celula) => {
    if (
      travas.some(
        (obj) =>
          obj.id_disciplina === celula.id_disciplina &&
          obj.nome_docente === celula.nome_docente
      )
    ) {
      if (
        atribuicoes.some(
          (obj) =>
            obj.id_disciplina == celula.id_disciplina &&
            obj.docentes.some((docente) => docente == celula.nome_docente)
        )
      ) {
        return `rgba(182, 44, 44, 0.4)`;
      }
      return `rgba(224, 224, 224, 0.6)`;
    } else if (
      atribuicoes.some(
        (obj) =>
          obj.id_disciplina == celula.id_disciplina &&
          obj.docentes.some((docente) => docente == celula.nome_docente)
      )
    ) {
      return `rgba(255, 0, 0, 0.4)`;
    } else if (prioridade) {
      return getPriorityColor(prioridade, maxPriority + 1);
    } else {
      return `rgba(255, 255, 255, 1)`;
    }
  };

  // ***** A FUNÇÃO setBorder FOI REMOVIDA *****

  /**
   * Verifica se um docente tem conflitos de horário
   */
  const verificaConflitosDocente = (nome_docente: string): boolean => {
    const docenteAtribuicoes = atribuicoes.filter((atribuicao) =>
      atribuicao.docentes.includes(nome_docente)
    );

    if (docenteAtribuicoes.length > 0) {
      const atribuicoesDocente: string[] = atribuicoes
        .filter((atribuicao) => atribuicao.docentes.includes(nome_docente))
        .map((atribuicao) => atribuicao.id_disciplina);

      for (let i = 0; i < atribuicoesDocente.length; i++) {
        const disciplinaPivo: any = filteredDisciplinas.find(
          (disciplina) => disciplina.id === atribuicoesDocente[i]
        );
        if (!disciplinaPivo) continue; // Adicionado para segurança

        for (let j = i + 1; j < atribuicoesDocente.length; j++) {
          const disciplinaAtual: any = filteredDisciplinas.find(
            (disciplina) => disciplina.id === atribuicoesDocente[j]
          );
          if (disciplinaAtual === undefined) continue;

          if (disciplinaPivo?.conflitos?.has(disciplinaAtual.id)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  return {
    hover,
    setHover,
    handleOnMouseEnter,
    handleOnMouseEnterDocente,
    setHeaderCollor,
    setColumnCollor,
    setCellColor,
    // setBorder foi removido
    verificaConflitosDocente,
  };
}
