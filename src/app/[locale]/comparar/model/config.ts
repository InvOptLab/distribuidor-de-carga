import type { HistoricoSolucao } from "@/context/Global/utils";
import { algorithmNameOf } from "@/app/[locale]/history/model/solutionSummary";

/**
 * Configuração do algoritmo lida por **forma** (propriedades), não por `instanceof`: depois de
 * recarregar a página, `algorithm` volta do IndexedDB como objeto simples (com os Maps revividos).
 */

export interface ConstraintConfig {
  key: string;
  name: string;
  description?: string;
  kind: "hard" | "soft";
  penalty?: number;
  active: boolean;
}

export interface ComponentConfig {
  key: string;
  name: string;
  description?: string;
}

export type TabuConfig =
  | { type: "solution"; size?: number }
  | { type: "moviment"; add?: number; drop?: number }
  | { type: "other"; name: string };

export interface AlgorithmConfig {
  hasAlgorithm: boolean;
  name?: string;
  constraints: ConstraintConfig[];
  neighborhood: ComponentConfig[];
  stop: ComponentConfig[];
  aspiration: ComponentConfig[];
  tabu: TabuConfig | null;
}

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return !!v && typeof v === "object";
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v : undefined;
}

function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

/** Valores de um Map, de um objeto ou de uma lista de pares/valores. */
function valuesOf(container: unknown): [string, unknown][] {
  if (!container) return [];
  if (container instanceof Map)
    return [...container.entries()].map(([k, v]) => [String(k), v]);
  if (Array.isArray(container)) {
    return container.map((item, i) =>
      Array.isArray(item) && item.length === 2
        ? [String(item[0]), item[1]]
        : [String(i), item],
    );
  }
  if (isObj(container)) return Object.entries(container);
  return [];
}

/** Entrada do pipe: instância pura ou wrapper `{ instance, isActive }`. */
function unwrap(value: unknown): { instance: Obj; active: boolean } | null {
  if (!isObj(value)) return null;
  const instance = isObj(value.instance) ? value.instance : value;
  const active =
    typeof value.isActive === "boolean"
      ? value.isActive
      : typeof instance.isActive === "boolean"
        ? instance.isActive
        : true;
  return { instance, active };
}

function components(
  container: unknown,
  onlyActive: boolean,
): ComponentConfig[] {
  const out: ComponentConfig[] = [];
  for (const [mapKey, value] of valuesOf(container)) {
    const entry = unwrap(value);
    if (!entry || (onlyActive && !entry.active)) continue;
    const name = str(entry.instance.name) ?? mapKey;
    out.push({
      key: str(entry.instance._name) ?? name,
      name,
      description: str(entry.instance.description),
    });
  }
  return out;
}

function constraints(
  container: unknown,
  kind: "hard" | "soft",
): ConstraintConfig[] {
  const out: ConstraintConfig[] = [];
  for (const [mapKey, value] of valuesOf(container)) {
    const entry = unwrap(value);
    if (!entry) continue;
    const name = str(entry.instance.name) ?? mapKey;
    out.push({
      key: str(entry.instance._name) ?? name,
      name,
      description: str(entry.instance.description),
      kind,
      penalty: num(entry.instance.penalty),
      active: entry.active,
    });
  }
  return out;
}

function tabuOf(list: unknown): TabuConfig | null {
  if (!isObj(list)) return null;
  const tenures = list.tenures;
  if (isObj(tenures))
    return { type: "moviment", add: num(tenures.add), drop: num(tenures.drop) };
  if ("tabuSize" in list) return { type: "solution", size: num(list.tabuSize) };
  const name = str(list._name);
  if (name === "Moviment") return { type: "moviment" };
  if (name === "Solution") return { type: "solution" };
  return name ? { type: "other", name } : null;
}

export function algorithmConfig(entry: HistoricoSolucao): AlgorithmConfig {
  const raw = entry.algorithm ?? entry.solucao?.algorithm;
  const name = algorithmNameOf(entry);
  if (!isObj(raw)) {
    return {
      hasAlgorithm: false,
      name,
      constraints: [],
      neighborhood: [],
      stop: [],
      aspiration: [],
      tabu: null,
    };
  }
  const cons: Obj = isObj(raw.constraints) ? raw.constraints : {};
  return {
    hasAlgorithm: true,
    name,
    constraints: [
      ...constraints(cons.hard, "hard"),
      ...constraints(cons.soft, "soft"),
    ],
    neighborhood: components(raw.neighborhoodPipe, true),
    stop: components(raw.stopPipe, true),
    aspiration: components(raw.aspirationPipe, true),
    tabu: tabuOf(raw.tabuList),
  };
}

export interface MergedRow<T> {
  key: string;
  a?: T;
  b?: T;
  differs: boolean;
}

/** Junta as listas de A e B pela chave estável, marcando as diferenças. */
export function mergeByKey<T extends { key: string }>(
  a: T[],
  b: T[],
  equal: (x: T, y: T) => boolean,
): MergedRow<T>[] {
  const byKey = new Map<string, MergedRow<T>>();
  for (const item of a)
    byKey.set(item.key, { key: item.key, a: item, differs: true });
  for (const item of b) {
    const row = byKey.get(item.key);
    if (row) row.b = item;
    else byKey.set(item.key, { key: item.key, b: item, differs: true });
  }
  byKey.forEach((row) => {
    row.differs = !row.a || !row.b || !equal(row.a, row.b);
  });
  return [...byKey.values()];
}

export const sameConstraint = (x: ConstraintConfig, y: ConstraintConfig) =>
  x.active === y.active && x.penalty === y.penalty && x.kind === y.kind;

export const sameComponent = () => true;

export function sameTabu(a: TabuConfig | null, b: TabuConfig | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
