import { describe, expect, it } from "vitest";
import { formatEspelho } from "@/context/Global/utils";
import {
  processDisciplinas,
  processFormularios,
  resolveEspelhos,
  versaoPrincipal,
} from "../UpdateState";

const turmaV4 = {
  codigo: "SME0202",
  nome: "Métodos Numéricos em Equações Diferenciais",
  curso: "BMA, BMACC",
  turma: 1,
  espelho: {
    codigo: "SME5784",
    id: "SME5784,1",
    nome: "Métodos Numéricos para Equações Diferenciais",
    ementa: "https://exemplo/SME5784",
    uuid: "7ae9c2fd-bab0-4b1e-9a38-3316fae34356",
  },
  id: "SME0202,1",
  ementa: "https://exemplo/SME0202",
  nivel: "g+p",
  horarios: [
    { dia: "Seg.", inicio: "10:10", fim: "11:50" },
    { dia: "Qua.", inicio: "10:10", fim: "11:50" },
  ],
  conflitos: ["SME0230,1"],
  noturna: false,
  carga: 1.5,
  uuid: "e225dc67-b95b-459c-92d8-cd150e0afc32",
};

const turmaSemEspelho = {
  codigo: "SME0300",
  nome: "Cálculo Numérico",
  curso: "BCC",
  turma: 2,
  id: "SME0300,2",
  ementa: "",
  nivel: "g",
  horarios: [{ dia: "Seg.", inicio: "10:10", fim: "11:50" }],
  conflitos: [],
  noturna: false,
  carga: 1,
  uuid: "abc",
};

describe("formatEspelho", () => {
  it("monta o rótulo a partir do id", () => {
    expect(formatEspelho(turmaV4.espelho)).toBe("SME5784 - T1");
    expect(formatEspelho({ codigo: "X", id: "X", nome: "" })).toBe("X");
  });
});

describe("versaoPrincipal", () => {
  it("extrai a versão principal", () => {
    expect(versaoPrincipal("4.0")).toBe(4);
    expect(versaoPrincipal("3.0")).toBe(3);
    expect(versaoPrincipal("2.0")).toBe(2);
    expect(versaoPrincipal(undefined)).toBe(1);
  });
});

describe("importação v4.0", () => {
  it("lê turmas com e sem espelho", () => {
    const [comEspelho, semEspelho] = processDisciplinas("4.0", [
      turmaV4,
      turmaSemEspelho,
    ] as any);

    expect(comEspelho.cursos).toBe("BMA, BMACC");
    expect(comEspelho.espelho).toEqual(turmaV4.espelho);
    expect(comEspelho.uuid).toBe(turmaV4.uuid);
    expect(comEspelho.carga).toBe(1.5);
    expect(comEspelho.horarios).toHaveLength(2);
    expect(comEspelho.conflitos).toBeInstanceOf(Set);

    expect(semEspelho.espelho).toBeUndefined();
    expect("espelho" in semEspelho).toBe(false);
  });

  it("aceita disciplinas como objeto indexado por id", () => {
    const out = processDisciplinas("4.0", {
      [turmaV4.id]: turmaV4,
    } as any);
    expect(out.map((d) => d.id)).toEqual(["SME0202,1"]);
  });

  it("lê formulários no formato v3+", () => {
    const out = processFormularios("4.0", {
      Ana: { "SME0202,1": 1, "SME0300,2": 2 },
    } as any);
    expect(out).toEqual([
      { nome_docente: "Ana", id_disciplina: "SME0202,1", prioridade: 1 },
      { nome_docente: "Ana", id_disciplina: "SME0300,2", prioridade: 2 },
    ]);
  });

  it("redireciona ids da turma espelho para a turma principal", () => {
    const disciplinas = processDisciplinas("4.0", [
      turmaV4,
      turmaSemEspelho,
    ] as any);

    const out = resolveEspelhos(
      disciplinas,
      [
        { nome_docente: "Ana", id_disciplina: "SME5784,1", prioridade: 2 },
        { nome_docente: "Ana", id_disciplina: "SME0202,1", prioridade: 4 },
        { nome_docente: "Bia", id_disciplina: "SME5784,1", prioridade: 3 },
      ],
      [
        { id_disciplina: "SME0202,1", docentes: ["Ana"] },
        { id_disciplina: "SME5784,1", docentes: ["Ana", "Bia"] },
      ],
      [{ id_disciplina: "SME5784,1", nome_docente: "Bia", tipo_trava: 3 }],
    );

    expect(out.formularios).toEqual([
      { nome_docente: "Ana", id_disciplina: "SME0202,1", prioridade: 2 },
      { nome_docente: "Bia", id_disciplina: "SME0202,1", prioridade: 3 },
    ]);
    expect(out.atribuicoes).toEqual([
      { id_disciplina: "SME0202,1", docentes: ["Ana", "Bia"] },
    ]);
    expect(out.travas).toEqual([
      { id_disciplina: "SME0202,1", nome_docente: "Bia", tipo_trava: 3 },
    ]);
  });

  it("não altera nada quando não há espelhos", () => {
    const disciplinas = processDisciplinas("3.0", [turmaSemEspelho] as any);
    const formularios = [
      { nome_docente: "Ana", id_disciplina: "SME0300,2", prioridade: 1 },
    ];
    const out = resolveEspelhos(disciplinas, formularios, [], []);
    expect(out.formularios).toBe(formularios);
  });
});
