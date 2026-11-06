import { describe, expect, it } from "vitest";
import { TipoTrava } from "@/algoritmo/communs/interfaces/interfaces";
import { buildExportPayload, getFormattedDate } from "../../io/exportJson";
import { formatCursos } from "../text";
import { docente, turma } from "./fixtures";

describe("export JSON v3", () => {
  it("mantém o formato", () => {
    const docentes = [
      docente("Ana", {
        saldo: 1.5,
        comentario: "c",
        agrupar: "Agrupar",
        formularios: new Map([
          ["T1", 3],
          ["SUMIU", 2],
        ]),
      }),
    ];
    const turmas = [
      turma("T1", {
        conflitos: new Set(["T2"]),
        horarios: [{ dia: "Seg.", inicio: "08:00", fim: "10:00" }],
      }),
    ];
    const payload = buildExportPayload(
      docentes as any,
      turmas as any,
      [
        { id_disciplina: "T1", docentes: ["Ana"] },
        { id_disciplina: "T2", docentes: [] },
      ],
      [
        {
          id_disciplina: "T1",
          nome_docente: "Ana",
          tipo_trava: TipoTrava.Cell,
        },
      ] as any,
    );
    expect(payload).toMatchSnapshot();
  });

  it("omite atribuicao e travas vazias", () => {
    const payload = buildExportPayload(
      [],
      [],
      [{ id_disciplina: "T1", docentes: [] }],
      [],
    );
    expect(payload).toEqual({
      versao: "3.0",
      formularios: {},
      disciplinas: {},
      docentes: [],
      saldos: {},
    });
  });

  it("nome do arquivo YYYYMMDD_hh_mm_ss", () => {
    expect(getFormattedDate(new Date(2025, 0, 2, 3, 4, 5))).toBe(
      "20250102_03_04_05",
    );
  });
});

describe("formatCursos", () => {
  it("aplica a mesma transformação de antes", () => {
    expect(formatCursos("X;BCC<br>&emsp;BMA")).toBe("BCC BMA");
  });

  it("nunca devolve marcação", () => {
    const out = formatCursos(
      'a;<img src=x onerror="alert(1)">Curso &amp; &lt;b&gt;',
    );
    expect(out).toBe("Curso & b");
    expect(out).not.toMatch(/[<>]/);
  });

  it("aceita vazio", () => {
    expect(formatCursos(undefined)).toBe("");
  });
});
