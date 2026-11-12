import { describe, expect, it } from "vitest";
import { TipoInsercao, type HistoricoSolucao } from "@/context/Global/utils";
import {
  docente,
  form,
  turma,
} from "@/app/[locale]/atribuicoes/model/__tests__/fixtures";
import { buildSolutionDetail } from "@/app/[locale]/history/model/solutionDetail";
import {
  bestEvaluation,
  buildSolutionSummary,
  EVALUATION_DIRECTION,
  PRIORITY_DIRECTION,
} from "@/app/[locale]/history/model/solutionSummary";
import { buildComparison, priorityTrend } from "../comparison";
import { formatDelta, formatPercent, METRICS, metricDelta } from "../metrics";
import {
  priorityDistribution,
  stableConstraintKey,
  violationsComparison,
  workloadBand,
  workloadHistogram,
} from "../distributions";
import { algorithmConfig, mergeByKey, sameConstraint } from "../config";
import {
  defaultA,
  mostRecentId,
  resolveCompareParams,
} from "../../state/compareParams";

type Atrib = [string, string[]];

function entry(
  id: string,
  atribuicoes: Atrib[],
  extra: Partial<HistoricoSolucao["contexto"]> = {},
  solucao: Partial<HistoricoSolucao["solucao"]> = {},
): HistoricoSolucao {
  return {
    id,
    datetime: "06/11/2026, 14:32:10",
    tipoInsercao: TipoInsercao.Algoritmo,
    solucao: {
      atribuicoes: atribuicoes.map(([id_disciplina, docentes]) => ({
        id_disciplina,
        docentes,
      })),
      avaliacao: 10,
      ...solucao,
    },
    contexto: {
      docentes: [
        docente("Ana", { saldo: 1 }),
        docente("Bruno", { saldo: -1 }),
        docente("Carla"),
      ],
      disciplinas: [
        turma("T1", { carga: 2 }),
        turma("T2"),
        turma("T3"),
        turma("T4"),
        turma("T5"),
        turma("TI", { ativo: false }),
      ],
      travas: [],
      maxPriority: 5,
      formularios: [
        form("Ana", "T1", 1),
        form("Bruno", "T1", 3),
        form("Carla", "T2", 2),
        form("Ana", "T3", 5),
      ],
      ...extra,
    },
  };
}

function compare(a: HistoricoSolucao, b: HistoricoSolucao) {
  const da = buildSolutionDetail(a);
  const db = buildSolutionDetail(b);
  return buildComparison(
    buildSolutionSummary(a, da),
    buildSolutionSummary(b, db),
    da,
    db,
  );
}

describe("buildComparison", () => {
  const A = entry("20261106_10_00_00", [
    ["T1", ["Ana"]], // modificada
    ["T2", ["Carla"]], // removida
    ["T3", ["Ana"]], // inalterada
    ["T4", []], // adicionada
    ["T5", []], // vazia nos dois: fora da lista
    ["TI", ["Bruno"]], // inativa: ignorada (C6)
  ]);
  const B = entry("20261106_11_00_00", [
    ["T1", ["Bruno", "Ana"]],
    ["T2", []],
    ["T3", ["Ana"]],
    ["T4", ["Carla"]],
    ["T5", []],
    ["TI", []],
  ]);
  const c = compare(A, B);

  it("classifica as 4 categorias", () => {
    expect(c.counts).toEqual({
      modified: 1,
      removed: 1,
      unchanged: 1,
      added: 1,
    });
    const t1 = c.turmaIndex.get("T1")!;
    expect(t1.status).toBe("modified");
    expect(t1.entraram).toEqual(["Bruno"]);
    expect(t1.sairam).toEqual([]);
    expect(c.turmaIndex.get("T2")!.status).toBe("removed");
    expect(c.turmaIndex.get("T4")!.status).toBe("added");
    expect(c.turmaIndex.get("T3")!.status).toBe("unchanged");
  });

  it("ignora turmas inativas e as vazias nos dois lados", () => {
    expect(c.turmaIndex.has("TI")).toBe(false);
    expect(c.turmaIndex.has("T5")).toBe(false);
  });

  it("conta pares mantidos, adicionados e removidos", () => {
    expect(c.pares).toEqual({ mantidos: 2, adicionados: 2, removidos: 1 });
  });

  it("calcula prioridade média e Δ por turma, com a tendência de ±0,1", () => {
    const t1 = c.turmaIndex.get("T1")!;
    expect(t1.prioMediaA).toBe(1);
    expect(t1.prioMediaB).toBe(2);
    expect(t1.deltaPrio).toBe(1);
    expect(priorityTrend(t1)).toBe("worsened");
    expect(priorityTrend({ deltaPrio: -0.5 })).toBe("improved");
    expect(priorityTrend({ deltaPrio: 0.05 })).toBe("same");
    expect(priorityTrend({ deltaPrio: null })).toBeNull();
  });

  it("monta o diff por docente (carga, ganhou/perdeu, afetado)", () => {
    const bruno = c.docenteIndex.get("Bruno")!;
    expect(bruno.turmasA).toEqual([]);
    expect(bruno.turmasB).toEqual(["T1"]);
    expect(bruno.ganhou).toEqual(["T1"]);
    expect(bruno.cargaB).toBe(2);
    expect(bruno.deltaCarga).toBe(2);
    expect(bruno.afetado).toBe(true);
    const carla = c.docenteIndex.get("Carla")!;
    expect(carla.perdeu).toEqual(["T2"]);
    expect(carla.ganhou).toEqual(["T4"]);
    expect(c.docenteIndex.get("Ana")!.afetado).toBe(false);
  });

  it("conta atribuições sem formulário", () => {
    // Carla em T4 não tem formulário
    expect(c.b.semFormulario).toBe(1);
    expect(c.turmaIndex.get("T4")!.semFormularioB).toBe(1);
    expect(c.statsB.prioMedia).toBeCloseTo((1 + 3 + 5) / 3);
  });

  it("usa o contexto de cada solução e aponta a incompatibilidade", () => {
    const outra = entry(
      "20261106_12_00_00",
      [
        ["T1", ["Ana"]],
        ["T9", ["Dora"]],
      ],
      {
        docentes: [docente("Ana", { saldo: 4 }), docente("Dora")],
        disciplinas: [turma("T1", { carga: 2 }), turma("T9")],
        formularios: [form("Ana", "T1", 4)],
      },
    );
    const cc = compare(A, outra);
    expect(cc.compat.identical).toBe(false);
    expect(cc.compat.turmasSoB).toEqual(["T9"]);
    expect(cc.compat.docentesSoA.sort()).toEqual(["Bruno", "Carla"]);
    expect(cc.compat.docentesSoB).toEqual(["Dora"]);
    expect(cc.compat.formulariosDiferentes).toEqual([
      { docente: "Ana", turma: "T1", a: 1, b: 4 },
    ]);
    // Saldo e prioridade de cada lado vêm do próprio contexto
    expect(cc.docenteIndex.get("Ana")!.saldoA).toBe(1);
    expect(cc.docenteIndex.get("Ana")!.saldoB).toBe(4);
    expect(cc.turmaIndex.get("T1")!.prioMediaB).toBe(4);
    expect(cc.turmaIndex.get("T9")!.inA).toBe(false);
    expect(compare(A, B).compat.identical).toBe(true);
  });
});

describe("métricas", () => {
  it("usa a mesma direção do histórico para a avaliação", () => {
    const avaliacao = METRICS.find((m) => m.id === "avaliacao")!;
    expect(avaliacao.direction).toBe(EVALUATION_DIRECTION);
    const best = bestEvaluation([{ avaliacao: 3 }, { avaliacao: 7 }] as never);
    // A solução com ★ no histórico também é a melhor no placar
    expect(metricDelta(avaliacao, 3, best).verdict).toBe(1);
    expect(metricDelta(avaliacao, best, 3).verdict).toBe(-1);
  });

  it("prioridade segue a direção da grade (1 = mais preferida)", () => {
    const prio = METRICS.find((m) => m.id === "prioMedia")!;
    expect(prio.direction).toBe(PRIORITY_DIRECTION);
    expect(metricDelta(prio, 3, 2).verdict).toBe(1);
  });

  it("iterações e tempo são neutros, e % some quando A é 0 ou ausente", () => {
    const it = METRICS.find((m) => m.id === "iteracoes")!;
    expect(metricDelta(it, 100, 200).verdict).toBe(0);
    expect(metricDelta(it, 0, 10).percent).toBeUndefined();
    expect(metricDelta(it, undefined, 10)).toEqual({ verdict: 0 });
    expect(metricDelta(it, 100, 150).percent).toBe(50);
  });

  it("formata Δ com sinal e % no locale", () => {
    expect(formatDelta("evaluation", 5.53, "pt-BR")).toBe("+5,53");
    expect(formatDelta("integer", -2, "pt-BR")).toBe("−2");
    expect(formatDelta("integer", 0, "pt-BR")).toBe("=");
    expect(formatDelta("integer", undefined, "pt-BR")).toBe("—");
    expect(formatPercent(0.45, "pt-BR")).toBe("+0,5%");
  });
});

describe("distribuições", () => {
  const A = entry("a", [
    ["T1", ["Ana", "Carla"]],
    ["T2", ["Carla"]],
  ]);
  const B = entry("b", [["T1", ["Bruno"]]]);
  const da = buildSolutionDetail(A);
  const db = buildSolutionDetail(B);

  it("prioridades vão de 1 a maxPriority, com 'sem formulário' separado", () => {
    const d = priorityDistribution(da, db);
    expect(d.priorities).toEqual([1, 2, 3, 4, 5]);
    expect(d.a).toEqual([1, 1, 0, 0, 0]);
    expect(d.semFormularioA).toBe(1);
    expect(d.b).toEqual([0, 0, 1, 0, 0]);
    expect(d.meanA).toBe(1.5);
  });

  it("histograma de carga por docente ativo", () => {
    const rows = workloadHistogram(da, db);
    expect(rows).toEqual([
      { carga: 0, a: 1, b: 2 },
      { carga: 2, a: 1, b: 1 },
      { carga: 3, a: 1, b: 0 },
    ]);
    expect([0, 1.5, 2, 4.1, 9].map(workloadBand)).toEqual([0, 1, 1, 3, 4]);
  });

  it("violações casam pela chave estável, em qualquer idioma", () => {
    const va = entry(
      "a",
      [],
      {},
      {
        estatisticas: {
          qtdOcorrenciasRestricoes: new Map([
            ["Conflito de horário", [{ label: "x", qtd: 2 }]],
            [
              "Carga Didática",
              [
                { label: "a", qtd: 1 },
                { label: "b", qtd: 1 },
                { label: "dist", qtd: 50 },
              ],
            ],
          ]),
        } as never,
      },
    );
    const vb = entry(
      "b",
      [],
      {},
      {
        estatisticas: {
          qtdOcorrenciasRestricoes: new Map([
            ["Schedule conflict", [{ label: "x", qtd: 5 }]],
          ]),
        } as never,
      },
    );
    const v = violationsComparison(va, vb);
    expect(stableConstraintKey("Schedule conflict")).toBe("ChoqueDeHorarios");
    const choque = v.rows.find((r) => r.key === "ChoqueDeHorarios")!;
    expect([choque.a, choque.b]).toEqual([2, 5]);
    // "Carga Didática" usa só os 2 primeiros grupos
    expect(v.rows.find((r) => r.key === "CargaDidatica")!.a).toBe(2);
    expect(v.totalA).toBe(4);
    expect(v.hasDataB).toBe(true);
  });
});

describe("configuração do algoritmo", () => {
  it("detecta a lista tabu e os componentes por forma (C9)", () => {
    // Objeto simples, como volta do IndexedDB (sem protótipo das classes)
    const plain = JSON.parse(
      JSON.stringify({
        name: "tabu-search",
        tabuList: { _name: "Moviment", tenures: { add: 3, drop: 4 } },
      }),
    );
    plain.constraints = {
      hard: new Map([
        ["H", { name: "H", _name: "ValidaTravas", penalty: 1, isActive: true }],
      ]),
      soft: new Map([
        [
          "S",
          {
            name: "S",
            _name: "ChoqueDeHorarios",
            penalty: 10,
            isActive: false,
          },
        ],
      ]),
    };
    plain.neighborhoodPipe = new Map([
      ["Add", { instance: { name: "Add", _name: "Add" }, isActive: true }],
      [
        "Remove",
        { instance: { name: "Remove", _name: "Remove" }, isActive: false },
      ],
    ]);
    const e = entry("a", [], {}, {});
    e.algorithm = plain;
    const cfg = algorithmConfig(e);
    expect(cfg.hasAlgorithm).toBe(true);
    expect(cfg.tabu).toEqual({ type: "moviment", add: 3, drop: 4 });
    expect(cfg.constraints.map((c) => [c.key, c.kind, c.active])).toEqual([
      ["ValidaTravas", "hard", true],
      ["ChoqueDeHorarios", "soft", false],
    ]);
    expect(cfg.neighborhood.map((n) => n.key)).toEqual(["Add"]);
  });

  it("solução manual não tem configuração", () => {
    expect(algorithmConfig(entry("a", [])).hasAlgorithm).toBe(false);
  });

  it("junta A e B pela chave e marca diferenças", () => {
    const base = { name: "x", kind: "soft" as const, active: true };
    const rows = mergeByKey(
      [
        { ...base, key: "k1", penalty: 1 },
        { ...base, key: "k2", penalty: 1 },
      ],
      [
        { ...base, key: "k1", penalty: 2 },
        { ...base, key: "k2", penalty: 1 },
        { ...base, key: "k3" },
      ],
      sameConstraint,
    );
    expect(rows.map((r) => [r.key, r.differs])).toEqual([
      ["k1", true],
      ["k2", false],
      ["k3", true],
    ]);
  });
});

describe("parâmetros de URL", () => {
  const h = new Map<string, HistoricoSolucao>([
    ["20261106_10_00_00", entry("20261106_10_00_00", [])],
    ["20261106_14_00_00", entry("20261106_14_00_00", [])],
    ["20261106_12_00_00", entry("20261106_12_00_00", [])],
  ]);
  const raw = { a: null, b: null, ids: null, tab: null, ent: null };

  it("mais recente pela data do id, não pelo datetime local", () => {
    expect(mostRecentId(h)).toBe("20261106_14_00_00");
    expect(defaultA(h, "20261106_10_00_00")).toBe("20261106_10_00_00");
    expect(defaultA(h, "nao-existe")).toBe("20261106_14_00_00");
  });

  it("sem parâmetros: A = padrão gravado na URL, B vazio", () => {
    const r = resolveCompareParams(raw, h, undefined);
    expect(r.a).toBe("20261106_14_00_00");
    expect(r.b).toBeNull();
    expect(r.changes).toEqual({ a: "20261106_14_00_00" });
    expect(r.tab).toBe("overview");
  });

  it("converte o ?ids= legado e avisa dos ids a mais", () => {
    const r = resolveCompareParams(
      { ...raw, ids: "20261106_10_00_00,20261106_12_00_00,20261106_14_00_00" },
      h,
      undefined,
    );
    expect([r.a, r.b]).toEqual(["20261106_10_00_00", "20261106_12_00_00"]);
    expect(r.ignored).toEqual(["20261106_14_00_00"]);
    expect(r.changes).toEqual({
      ids: null,
      a: "20261106_10_00_00",
      b: "20261106_12_00_00",
    });
  });

  it("id inexistente gera aviso e não é substituído em silêncio", () => {
    const r = resolveCompareParams(
      { ...raw, a: "sumiu", b: "20261106_10_00_00" },
      h,
      undefined,
    );
    expect(r.a).toBeNull();
    expect(r.missing).toEqual(["sumiu"]);
    expect(r.changes).toBeNull();
  });

  it("antes da hidratação nada é resolvido; depois, o mesmo link vale", () => {
    const link = {
      ...raw,
      a: "20261106_10_00_00",
      b: "20261106_12_00_00",
      tab: "docentes",
      ent: "docente:Ana",
    };
    const antes = resolveCompareParams(link, new Map(), undefined);
    expect(antes.a).toBeNull();
    const depois = resolveCompareParams(link, h, undefined);
    expect([depois.a, depois.b, depois.tab]).toEqual([
      "20261106_10_00_00",
      "20261106_12_00_00",
      "docentes",
    ]);
    expect(depois.ent).toEqual({ kind: "docente", id: "Ana" });
  });

  it("A e B iguais: B é limpo", () => {
    const r = resolveCompareParams(
      { ...raw, a: "20261106_10_00_00", b: "20261106_10_00_00" },
      h,
      undefined,
    );
    expect(r.b).toBeNull();
  });
});
