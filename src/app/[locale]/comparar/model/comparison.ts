import type { Disciplina, Docente } from "@/context/Global/utils";
import {
  pairKey,
  type SolutionDetail,
} from "@/app/[locale]/history/model/solutionDetail";
import {
  compareByDirection,
  PRIORITY_DIRECTION,
  type SolutionSummary,
} from "@/app/[locale]/history/model/solutionSummary";
import { buildCompatibility, type Compatibility } from "./compatibility";

export type TurmaStatus = "added" | "removed" | "modified" | "unchanged";
export const TURMA_STATUSES: TurmaStatus[] = [
  "modified",
  "added",
  "removed",
  "unchanged",
];
export type Side = "a" | "b";

export interface TurmaDiff {
  id: string;
  /** Do contexto de B, com fallback para A. */
  turma: Disciplina;
  /** A turma existe (ativa) em cada contexto. */
  inA: boolean;
  inB: boolean;
  docentesA: string[];
  docentesB: string[];
  entraram: string[];
  sairam: string[];
  status: TurmaStatus;
  /** Média das prioridades dos pares com formulário; `null` quando nenhum tem. */
  prioMediaA: number | null;
  prioMediaB: number | null;
  /** B − A; `null` quando falta um dos lados. */
  deltaPrio: number | null;
  semFormularioA: number;
  semFormularioB: number;
  /** Soma dos saldos dos docentes de cada lado (cada um do seu contexto); `null` sem saldo. */
  saldoA: number | null;
  saldoB: number | null;
  /** Soma da carga total (na solução do lado) dos docentes envolvidos. */
  cargaEnvolvidaA: number;
  cargaEnvolvidaB: number;
  conflitoA: boolean;
  conflitoB: boolean;
}

export interface DocenteDiff {
  nome: string;
  /** Do contexto de B, com fallback para A. */
  docente: Docente;
  inA: boolean;
  inB: boolean;
  saldoA?: number;
  saldoB?: number;
  cargaA: number;
  cargaB: number;
  deltaCarga: number;
  turmasA: string[];
  turmasB: string[];
  ganhou: string[];
  perdeu: string[];
  prioMediaA: number | null;
  prioMediaB: number | null;
  conflitoA: boolean;
  conflitoB: boolean;
  /** Ganhou ou perdeu alguma turma. */
  afetado: boolean;
}

export interface SideStats {
  /** Pares docente–turma atribuídos ("total de atribuições"). */
  pares: number;
  /** Docentes com ao menos uma turma. */
  docentesUnicos: number;
  prioMedia: number | null;
  cargaMedia: number | null;
  cargaDesvio: number | null;
}

export interface Comparison {
  a: SolutionSummary;
  b: SolutionSummary;
  detailA: SolutionDetail;
  detailB: SolutionDetail;
  statsA: SideStats;
  statsB: SideStats;
  /** Turmas com docentes em pelo menos um dos lados (as vazias nos dois ficam de fora, como antes). */
  turmas: TurmaDiff[];
  docentes: DocenteDiff[];
  turmaIndex: Map<string, TurmaDiff>;
  docenteIndex: Map<string, DocenteDiff>;
  counts: Record<TurmaStatus, number>;
  pares: { mantidos: number; adicionados: number; removidos: number };
  compat: Compatibility;
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function prioritiesOf(
  detail: SolutionDetail,
  pairs: Iterable<[string, string]>,
): { values: number[]; semFormulario: number } {
  const values: number[] = [];
  let semFormulario = 0;
  for (const [docente, turma] of pairs) {
    const p = detail.prioridade.get(pairKey(docente, turma));
    if (p === undefined) semFormulario++;
    else values.push(p);
  }
  return { values, semFormulario };
}

function sideStats(detail: SolutionDetail): SideStats {
  let pares = 0;
  const prioridades: number[] = [];
  for (const atribuicao of detail.atribuicoes) {
    for (const nome of atribuicao.docentes) {
      pares++;
      const p = detail.prioridade.get(pairKey(nome, atribuicao.id_disciplina));
      if (p !== undefined) prioridades.push(p);
    }
  }
  let docentesUnicos = 0;
  const cargas: number[] = [];
  detail.docentes.forEach((d) => {
    if (d.turmas.length > 0) docentesUnicos++;
    cargas.push(d.carga);
  });
  const cargaMedia = mean(cargas);
  const cargaDesvio =
    cargaMedia === null
      ? null
      : Math.sqrt(
          cargas.reduce((s, c) => s + (c - cargaMedia) ** 2, 0) / cargas.length,
        );
  return {
    pares,
    docentesUnicos,
    prioMedia: mean(prioridades),
    cargaMedia,
    cargaDesvio,
  };
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((x) => set.has(x));
}

function sumSaldo(detail: SolutionDetail, nomes: string[]): number | null {
  let total = 0;
  let any = false;
  for (const nome of nomes) {
    const saldo = detail.docentes.get(nome)?.docente.saldo;
    if (typeof saldo === "number" && Number.isFinite(saldo)) {
      total += saldo;
      any = true;
    }
  }
  return any ? total : null;
}

function sumCarga(detail: SolutionDetail, nomes: string[]): number {
  return nomes.reduce(
    (s, nome) => s + (detail.docentes.get(nome)?.carga ?? 0),
    0,
  );
}

/**
 * Diff entre duas soluções do histórico, O(T + D + A), lendo tudo do `contexto` de cada uma
 * e só turmas e docentes ativos. A regra de é a mesma de antes:
 * adicionada = vazia em A e com docentes em B; removida = o contrário; modificada = conjuntos
 * diferentes; inalterada = mesmo conjunto.
 */
export function buildComparison(
  a: SolutionSummary,
  b: SolutionSummary,
  detailA: SolutionDetail,
  detailB: SolutionDetail,
): Comparison {
  const turmas: TurmaDiff[] = [];
  const counts: Record<TurmaStatus, number> = {
    added: 0,
    removed: 0,
    modified: 0,
    unchanged: 0,
  };
  const pares = { mantidos: 0, adicionados: 0, removidos: 0 };

  const ids = new Set<string>([
    ...detailA.turmas.keys(),
    ...detailB.turmas.keys(),
  ]);
  ids.forEach((id) => {
    const ta = detailA.turmas.get(id);
    const tb = detailB.turmas.get(id);
    const docentesA = ta?.docentes ?? [];
    const docentesB = tb?.docentes ?? [];
    if (docentesA.length === 0 && docentesB.length === 0) return;

    const setA = new Set(docentesA);
    const setB = new Set(docentesB);
    const entraram = docentesB.filter((d) => !setA.has(d));
    const sairam = docentesA.filter((d) => !setB.has(d));
    pares.adicionados += entraram.length;
    pares.removidos += sairam.length;
    pares.mantidos += docentesA.length - sairam.length;

    let status: TurmaStatus;
    if (docentesA.length === 0) status = "added";
    else if (docentesB.length === 0) status = "removed";
    else status = sameSet(docentesA, docentesB) ? "unchanged" : "modified";
    counts[status]++;

    const pa = prioritiesOf(
      detailA,
      docentesA.map((d) => [d, id] as [string, string]),
    );
    const pb = prioritiesOf(
      detailB,
      docentesB.map((d) => [d, id] as [string, string]),
    );
    const prioMediaA = mean(pa.values);
    const prioMediaB = mean(pb.values);

    turmas.push({
      id,
      turma: (tb ?? ta)!.turma,
      inA: !!ta,
      inB: !!tb,
      docentesA,
      docentesB,
      entraram,
      sairam,
      status,
      prioMediaA,
      prioMediaB,
      deltaPrio:
        prioMediaA !== null && prioMediaB !== null
          ? prioMediaB - prioMediaA
          : null,
      semFormularioA: pa.semFormulario,
      semFormularioB: pb.semFormulario,
      saldoA: sumSaldo(detailA, docentesA),
      saldoB: sumSaldo(detailB, docentesB),
      cargaEnvolvidaA: sumCarga(detailA, docentesA),
      cargaEnvolvidaB: sumCarga(detailB, docentesB),
      conflitoA: ta?.conflito ?? false,
      conflitoB: tb?.conflito ?? false,
    });
  });

  const docentes: DocenteDiff[] = [];
  const nomes = new Set<string>([
    ...detailA.docentes.keys(),
    ...detailB.docentes.keys(),
  ]);
  nomes.forEach((nome) => {
    const da = detailA.docentes.get(nome);
    const db = detailB.docentes.get(nome);
    const turmasA = da?.turmas ?? [];
    const turmasB = db?.turmas ?? [];
    const setA = new Set(turmasA);
    const setB = new Set(turmasB);
    const ganhou = turmasB.filter((t) => !setA.has(t));
    const perdeu = turmasA.filter((t) => !setB.has(t));
    const cargaA = da?.carga ?? 0;
    const cargaB = db?.carga ?? 0;
    docentes.push({
      nome,
      docente: (db ?? da)!.docente,
      inA: !!da,
      inB: !!db,
      saldoA: da?.docente.saldo,
      saldoB: db?.docente.saldo,
      cargaA,
      cargaB,
      deltaCarga: cargaB - cargaA,
      turmasA,
      turmasB,
      ganhou,
      perdeu,
      prioMediaA: mean(
        prioritiesOf(
          detailA,
          turmasA.map((t) => [nome, t] as [string, string]),
        ).values,
      ),
      prioMediaB: mean(
        prioritiesOf(
          detailB,
          turmasB.map((t) => [nome, t] as [string, string]),
        ).values,
      ),
      conflitoA: (da?.conflitos.size ?? 0) > 0,
      conflitoB: (db?.conflitos.size ?? 0) > 0,
      afetado: ganhou.length > 0 || perdeu.length > 0,
    });
  });

  return {
    a,
    b,
    detailA,
    detailB,
    statsA: sideStats(detailA),
    statsB: sideStats(detailB),
    turmas,
    docentes,
    turmaIndex: new Map(turmas.map((t) => [t.id, t])),
    docenteIndex: new Map(docentes.map((d) => [d.nome, d])),
    counts,
    pares,
    compat: buildCompatibility(detailA, detailB),
  };
}

/** Limiar para "melhorou / piorou / igual" na prioridade média. */
export const PRIORITY_THRESHOLD = 0.1;
export type PriorityTrend = "improved" | "worsened" | "same";

/** Tendência da prioridade média da turma, segundo `PRIORITY_DIRECTION`. */
export function priorityTrend(
  diff: Pick<TurmaDiff, "deltaPrio">,
): PriorityTrend | null {
  if (diff.deltaPrio === null) return null;
  if (Math.abs(diff.deltaPrio) <= PRIORITY_THRESHOLD) return "same";
  return compareByDirection(0, diff.deltaPrio, PRIORITY_DIRECTION) > 0
    ? "improved"
    : "worsened";
}

export function turmaLabel(turma: Pick<Disciplina, "codigo" | "nome">): string {
  return `${turma.codigo} · ${turma.nome}`;
}
