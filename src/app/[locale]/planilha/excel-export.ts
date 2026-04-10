import * as XLSX from "xlsx";
import type { ColumnConfig } from "@/types/column-config";
import { getCellValue } from "@/types/column-config";
import {
  Atribuicao,
  Disciplina,
  Docente,
  Horario,
} from "@/algoritmo/communs/interfaces/interfaces";

/**
 * Exporta a planilha de disciplinas para formato Excel (.xlsx)
 *
 * @param disciplinas - Lista de disciplinas a serem exportadas
 * @param columns - Configuração das colunas visíveis
 * @param docentes - Lista de docentes para resolver nomes
 * @param filename - Nome do arquivo (padrão: "planilha-disciplinas.xlsx")
 */
export function exportToExcel(
  disciplinas: Disciplina[],
  columns: ColumnConfig[],
  docentes: Docente[],
  atribuicoes: Atribuicao[],
  filename = "planilha-disciplinas.xlsx"
) {
  // Cria um mapa de docentes para busca rápida
  const docentesMap = new Map(docentes.map((d) => [d.nome, d]));

  const maxHorarios = Math.max(
    ...disciplinas.map((d) => d.horarios?.length || 0),
    0
  );

  // Prepara os dados para exportação
  const data = disciplinas.map((disciplina) => {
    const row: Record<string, any> = {};

    columns.forEach((column) => {
      if (column.type === "horarios") {
        const horarios = (disciplina.horarios || []) as Horario[];

        // Cria uma coluna para cada horário
        for (let i = 0; i < maxHorarios; i++) {
          const horario = horarios[i];
          const columnName = `Horário ${i + 1}`;

          if (horario) {
            row[
              columnName
            ] = `${horario.dia}: ${horario.inicio} - ${horario.fim}`;
          } else {
            row[columnName] = ""; // Célula vazia para horários não existentes
          }
        }
        return; // Pula o processamento padrão para esta coluna
      }

      let value = getCellValue(disciplina, column);

      // Tratamento especial para docentes (converte IDs para nomes)
      if (column.type === "docentes" && Array.isArray(value)) {
        const docentesAtribuidos = atribuicoes.find(
          (atribuicao) => atribuicao.id_disciplina === disciplina.id
        ).docentes;
        value = docentesAtribuidos
          .map((docenteId) => {
            const docente = docentesMap.get(docenteId);
            return docente ? docente.nome : docenteId;
          })
          .join(", ");
      }

      // Tratamento especial para arrays (cursos)
      if (Array.isArray(value) && column.type !== "docentes") {
        value = value.join(", ");
      }

      // Tratamento especial para booleanos
      if (typeof value === "boolean") {
        value = value ? "Sim" : "Não";
      }

      row[column.label] = value ?? "";
    });

    return row;
  });

  // Cria a planilha
  const worksheet = XLSX.utils.json_to_sheet(data);

  const columnWidths: { wch: number }[] = [];

  columns.forEach((col) => {
    if (col.type === "horarios") {
      // Adiciona largura para cada coluna de horário
      for (let i = 0; i < maxHorarios; i++) {
        columnWidths.push({ wch: 25 }); // Largura adequada para "Seg: 08:00 - 10:00"
      }
    } else {
      columnWidths.push({
        wch: Math.max(col.label.length, col.width ? col.width / 8 : 15),
      });
    }
  });

  worksheet["!cols"] = columnWidths;

  // Cria o workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Disciplinas");

  // Gera e baixa o arquivo
  XLSX.writeFile(workbook, filename);
}
