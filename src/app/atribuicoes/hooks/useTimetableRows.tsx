"use client";
import { useTimetable } from "../context/TimetableContext";

export function useTimetableRows() {
  const { filteredDocentes, filteredDisciplinas, formularios } = useTimetable();

  /**
   * Gera as linhas da tabela, criando X espaços de disciplina para cada docente filtrado
   */
  const rows = () => {
    const newRows: {
      nome: string;
      prioridades: { id_disciplina: string; prioridade: number }[];
    }[] = [];

    for (const docente of filteredDocentes) {
      if (!docente.ativo) {
        continue;
      }

      const newDocente: {
        nome: string;
        prioridades: { id_disciplina: string; prioridade: number }[];
      } = { nome: docente.nome, prioridades: [] };

      const docenteDisciplinas = formularios.filter(
        (formulario) => formulario.nome_docente == docente.nome
      );

      for (const disciplina of filteredDisciplinas) {
        if (
          docenteDisciplinas
            .map((dd) => dd.id_disciplina)
            .indexOf(disciplina.id) != -1 &&
          disciplina.ativo
        ) {
          const prioridade = docenteDisciplinas.filter(
            (dd) => dd.id_disciplina == disciplina.id
          )[0].prioridade;

          newDocente.prioridades.push({
            id_disciplina: disciplina.id,
            prioridade: prioridade,
          });
        } else {
          newDocente.prioridades.push({
            id_disciplina: disciplina.id,
            prioridade: null,
          });
        }
      }

      newRows.push(newDocente);
    }

    return newRows;
  };

  return { rows };
}
