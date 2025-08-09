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
        return `rgba(132, 118, 210, 0.12)`;
      }
      return `rgba(224, 224, 224, 0.6)`;
    } else if (id_disciplina === hover.id_disciplina) {
      return `rgba(25, 118, 210, 0.12)`;
    } else {
      return "white";
    }
  };

  /**
   * Define a cor da coluna do docente
   */
  const setColumnCollor = (nome_docente: string) => {
    if (
      travas.some(
        (obj) =>
          obj.nome_docente === nome_docente && obj.tipo_trava === TipoTrava.Row
      )
    ) {
      if (nome_docente === hover.docente) {
        if (verificaConflitosDocente(nome_docente)) {
          return `rgba(255, 118, 210, 0.30)`;
        }
        return `rgba(132, 118, 210, 0.12)`;
      }

      if (verificaConflitosDocente(nome_docente)) {
        return `rgba(255, 200, 200, 1)`;
      }
      return `rgba(224, 224, 224, 0.6)`;
    } else if (nome_docente === hover.docente) {
      if (verificaConflitosDocente(nome_docente)) {
        return `rgba(255, 110, 200, 0.60)`;
      }
      return `rgba(25, 118, 210, 0.12)`;
    } else {
      if (verificaConflitosDocente(nome_docente)) {
        return `rgba(255, 0, 0, 0.5)`;
      }
      return "white";
    }
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

  /**
   * Define as bordas dos elementos no hover
   */
  const setBorder = (
    hover: { docente: string; id_disciplina: string },
    atribuicao: {
      docente: string;
      id_disciplina: string;
    },
    tipo: "celula" | "coluna" | "linha"
  ) => {
    const style = {
      borderTop: "1px solid rgba(224, 224, 224, 1)",
      borderRight: "1px solid rgba(224, 224, 224, 1)",
      borderBottom: "1px solid rgba(224, 224, 224, 1)",
      borderLeft: "1px solid rgba(224, 224, 224, 1)",
    };

    if (tipo === "celula") {
      if (hover.docente === atribuicao.docente) {
        style.borderTop = "1px solid rgba(25, 118, 210, 1)";
        style.borderBottom = "1px solid rgba(25, 118, 210, 1)";
      }

      if (hover.id_disciplina === atribuicao.id_disciplina) {
        style.borderLeft = "1px solid rgba(25, 118, 210, 1)";
        style.borderRight = "1px solid rgba(25, 118, 210, 1)";
      }
    }

    if (tipo === "coluna") {
      if (hover.id_disciplina === atribuicao.id_disciplina) {
        style.borderLeft = "1px solid rgba(25, 118, 210, 1)";
        style.borderRight = "1px solid rgba(25, 118, 210, 1)";
      }
    }

    if (tipo === "linha") {
      if (hover.docente === atribuicao.docente) {
        style.borderTop = "1px solid rgba(25, 118, 210, 1)";
        style.borderBottom = "1px solid rgba(25, 118, 210, 1)";
      } else {
        return { border: "initial" };
      }
    }

    return style;
  };

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
    setBorder,
    verificaConflitosDocente,
  };
}
