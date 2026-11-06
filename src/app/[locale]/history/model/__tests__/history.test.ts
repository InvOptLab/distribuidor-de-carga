import { describe, expect, it } from "vitest";
import {
  TipoInsercao,
  TipoTrava,
  type HistoricoSolucao,
} from "@/context/Global/utils";
import {
  docente,
  form,
  turma,
} from "@/app/[locale]/atribuicoes/model/__tests__/fixtures";
import { computeConflictPairs } from "@/app/[locale]/atribuicoes/model/conflicts";
import { buildSolutionDetail, pairKey, relationsOf } from "../solutionDetail";
import { bestEvaluation, buildSolutionSummary } from "../solutionSummary";
import {
  chronologicalKey,
  entryCreatedAt,
  nextFreeHistoryId,
  parseHistoryId,
} from "../sort";
import { formatEvaluation, formatSaldo } from "../format";

function entry(extra: Partial<HistoricoSolucao> = {}): HistoricoSolucao {
  const T1 = turma("T1", { conflitos: new Set(["T2"]), carga: 2 });
  const T2 = turma("T2", { conflitos: new Set(["T1"]) });
  const T3 = turma("T3");
  const TI = turma("TI", { ativo: false });
  return {
    id: "20251106_14_32_05",
    datetime: "06/11/2025, 14:32:05",
    tipoInsercao: TipoInsercao.Algoritmo,
    solucao: {
      avaliacao: 1234.5678,
      atribuicoes: [
        { id_disciplina: "T1", docentes: ["Ana"] },
        { id_disciplina: "T2", docentes: ["Ana", "Bruno"] },
        { id_disciplina: "T3", docentes: [] },
        { id_disciplina: "TI", docentes: ["Bruno"] },
        { id_disciplina: "SUMIU", docentes: ["Ana"] },
      ],
      estatisticas: { tempoExecucao: 12000, iteracoes: 50 } as any,
      algorithm: { name: "tabu-search" } as any,
    },
    contexto: {
      docentes: [
        docente("Ana", { saldo: 1.5 }),
        docente("Bruno", { saldo: undefined }),
        docente("Carla", { saldo: -0.5 }),
        docente("Inativo", { ativo: false }),
      ],
      disciplinas: [T1, T2, T3, TI],
      travas: [
        {
          id_disciplina: "T1",
          nome_docente: "Ana",
          tipo_trava: TipoTrava.Cell,
          trava: true,
        },
        {
          id_disciplina: "TI",
          nome_docente: "Ana",
          tipo_trava: TipoTrava.Cell,
          trava: true,
        },
      ],
      maxPriority: 5,
      formularios: [
        form("Ana", "T1", 1),
        form("Ana", "T3", 4),
        form("Bruno", "T3", 2),
        form("Inativo", "T1", 1),
        form("Ana", "TI", 1),
      ],
    },
    ...extra,
  };
}

describe("buildSolutionDetail", () => {
  const detail = buildSolutionDetail(entry());

  it("considera só docentes e turmas ativos", () => {
    expect([...detail.docentes.keys()]).toEqual(["Ana", "Bruno", "Carla"]);
    expect([...detail.turmas.keys()]).toEqual(["T1", "T2", "T3"]);
    expect(detail.formularios).toHaveLength(3);
  });

  it("árvore de docentes: atribuições, carga e conflitos", () => {
    const ana = detail.docentes.get("Ana")!;
    expect(ana.turmas).toEqual(["T1", "T2"]);
    expect(ana.carga).toBe(3);
    expect(ana.conflitos.get("T1")).toEqual(["T2"]);
    expect(ana.conflitos.get("T2")).toEqual(["T1"]);
    // Bruno tem T2, mas T1 (que choca) não é dele: sem conflito (só entre atribuídas)
    expect(detail.docentes.get("Bruno")!.conflitos.size).toBe(0);
    expect(detail.docentes.get("Carla")!.turmas).toEqual([]);
  });

  it("árvore de turmas: docentes e marca de conflito", () => {
    expect(detail.turmas.get("T2")!.docentes).toEqual(["Ana", "Bruno"]);
    expect(detail.turmas.get("T2")!.conflito).toBe(true);
    expect(detail.turmas.get("T3")!.docentes).toEqual([]);
    expect(detail.turmas.get("T3")!.formDocentes).toEqual(["Ana", "Bruno"]);
  });

  it("atribuição sem formulário tem prioridade nula", () => {
    expect(detail.prioridade.get(pairKey("Ana", "T2"))).toBeUndefined();
    expect(detail.semFormulario).toBe(2); // Ana-T2, Bruno-T2
    const rows = relationsOf(detail, { kind: "docente", id: "Ana" });
    expect(rows).toEqual([
      { id: "T1", prioridade: 1, atribuida: true, chocaCom: ["T2"] },
      { id: "T2", prioridade: null, atribuida: true, chocaCom: ["T1"] },
      { id: "T3", prioridade: 4, atribuida: false, chocaCom: [] },
    ]);
  });

  it("união formulários × atribuições para turma", () => {
    expect(relationsOf(detail, { kind: "turma", id: "T3" })).toEqual([
      { id: "Ana", prioridade: 4, atribuida: false, chocaCom: [] },
      { id: "Bruno", prioridade: 2, atribuida: false, chocaCom: [] },
    ]);
    expect(relationsOf(detail, { kind: "turma", id: "NADA" })).toEqual([]);
  });

  it("conta só travas com docente e turma ativos", () => {
    expect(detail.travas).toBe(1);
    expect(detail.maxPriority).toBe(5);
  });

  it("aceita dado legado sem quebrar (critério 9.2)", () => {
    const legado = entry({
      contexto: {
        docentes: [docente("Ana", { saldo: undefined })],
        disciplinas: [
          { ...turma("T1"), conflitos: ["T2"] as any },
          turma("T2"),
        ],
        travas: undefined as any,
        maxPriority: undefined as any,
        formularios: [form("Ana", "T1", 3)],
      },
    });
    legado.solucao.atribuicoes = [
      { id_disciplina: "T1", docentes: ["Ana", "Fantasma"] },
      { id_disciplina: "T2", docentes: undefined as any },
    ];
    const d = buildSolutionDetail(legado);
    expect(d.docentes.get("Ana")!.turmas).toEqual(["T1"]);
    expect(d.maxPriority).toBe(3);
    expect(d.travas).toBe(0);
  });
});

describe("buildSolutionSummary", () => {
  it("métricas da linha", () => {
    const e = entry();
    const s = buildSolutionSummary(e, buildSolutionDetail(e));
    expect(s).toMatchObject({
      id: "20251106_14_32_05",
      origin: TipoInsercao.Algoritmo,
      algorithmKey: "tabu-search",
      avaliacao: 1234.5678,
      turmasAtivas: 3,
      turmasAtendidas: 2,
      docentesAtivos: 3,
      docentesSemAtribuicao: 1,
      conflitos: 1,
      semFormulario: 2,
      travas: 1,
      tempoExecucaoMs: 12000,
      iteracoes: 50,
    });
    expect(s.createdAt).toEqual(new Date(2025, 10, 6, 14, 32, 5));
  });

  it("algoritmo desconhecido ou string de importação", () => {
    const e = entry({
      tipoInsercao: TipoInsercao.Importação,
      algorithm: "Importação" as any,
    });
    e.solucao = { ...e.solucao, algorithm: undefined, estatisticas: undefined };
    const s = buildSolutionSummary(e, buildSolutionDetail(e));
    expect(s.algorithmKey).toBeUndefined();
    expect(s.algorithmName).toBe("Importação");
    expect(s.tempoExecucaoMs).toBeUndefined();
  });

  it("melhor avaliação é a maior", () => {
    expect(
      bestEvaluation([{ avaliacao: 1 }, { avaliacao: 3 }, {}] as any),
    ).toBe(3);
    expect(bestEvaluation([])).toBeUndefined();
  });
});

describe("ids e ordenação", () => {
  it("parse do id, com e sem sufixo", () => {
    expect(parseHistoryId("20250102_03_04_05")).toEqual(
      new Date(2025, 0, 2, 3, 4, 5),
    );
    expect(parseHistoryId("20250102_03_04_05_2")).toEqual(
      new Date(2025, 0, 2, 3, 4, 5),
    );
    expect(parseHistoryId("20251302_03_04_05")).toBeUndefined();
    expect(parseHistoryId("qualquer")).toBeUndefined();
  });

  it("cai para o datetime quando o id não é de data", () => {
    expect(
      entryCreatedAt({ id: "x", datetime: "2025-01-02T03:04:05" }),
    ).toEqual(new Date(2025, 0, 2, 3, 4, 5));
    expect(entryCreatedAt({ id: "x", datetime: "lixo" })).toBeUndefined();
  });

  it("ordem de inserção desempata o mesmo segundo", () => {
    const d = new Date(2025, 0, 1);
    expect(chronologicalKey(d, 1)).toBeGreaterThan(chronologicalKey(d, 0));
    expect(chronologicalKey(undefined, 5)).toBeLessThan(chronologicalKey(d, 0));
  });

  it("id anti-colisão", () => {
    const taken = new Set(["A", "A_2"]);
    expect(nextFreeHistoryId("B", (id) => taken.has(id))).toBe("B");
    expect(nextFreeHistoryId("A", (id) => taken.has(id))).toBe("A_3");
  });
});

describe("formatação", () => {
  it("saldo", () => {
    expect(formatSaldo(1.5)).toBe("+1,5");
    expect(formatSaldo(-0.5)).toBe("-0,5");
    expect(formatSaldo(undefined)).toBe("—");
    expect(formatSaldo(2, "en")).toBe("+2.0");
  });

  it("avaliação", () => {
    expect(formatEvaluation(1234.5678)).toBe("1.234,57");
    expect(formatEvaluation(undefined)).toBe("—");
  });
});

describe("computeConflictPairs", () => {
  it("devolve os pares só entre turmas ativas atribuídas", () => {
    const turmas = [
      turma("A", { conflitos: new Set(["B", "C"]) }),
      turma("B", { conflitos: new Set(["A"]) }),
      turma("C", { conflitos: new Set(["A"]), ativo: false }),
    ];
    const pares = computeConflictPairs(
      [
        { id_disciplina: "A", docentes: ["x", "y"] },
        { id_disciplina: "B", docentes: ["x"] },
        { id_disciplina: "C", docentes: ["y"] },
      ],
      turmas,
    );
    expect(pares.get("x")).toEqual(
      new Map([
        ["A", ["B"]],
        ["B", ["A"]],
      ]),
    );
    expect(pares.has("y")).toBe(false);
  });
});

describe("excluir e desfazer", async () => {
  const { withEntriesAt, withoutEntries } =
    await import("@/context/SolutionHistory/utils");
  const e = (id: string) => ({ id }) as unknown as HistoricoSolucao;
  const base = new Map([
    ["a", e("a")],
    ["b", e("b")],
    ["c", e("c")],
    ["d", e("d")],
  ]);

  it("reinsere nas posições originais", () => {
    const sem = withoutEntries(base, ["b", "d"]);
    expect([...sem.keys()]).toEqual(["a", "c"]);
    const volta = withEntriesAt(sem, [
      { id: "d", entry: e("d"), position: 3 },
      { id: "b", entry: e("b"), position: 1 },
    ]);
    expect([...volta.keys()]).toEqual(["a", "b", "c", "d"]);
  });

  it("ignora ids que já voltaram", () => {
    expect(withEntriesAt(base, [{ id: "a", entry: e("a"), position: 0 }])).toBe(
      base,
    );
  });
});
