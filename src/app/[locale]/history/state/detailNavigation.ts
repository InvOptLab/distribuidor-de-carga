/**
 * Regras puras do diálogo de detalhe: navegação entre soluções,
 * validação dos parâmetros de URL e Esc em camadas. Separadas dos hooks para serem testáveis.
 */

export type EntityKind = "docente" | "turma";
export type EntityRef = { kind: EntityKind; id: string };

export function parseEntityRef(
  raw: string | null | undefined,
): EntityRef | null {
  if (!raw) return null;
  const sep = raw.indexOf(":");
  if (sep <= 0) return null;
  const kind = raw.slice(0, sep);
  const id = raw.slice(sep + 1);
  if ((kind !== "docente" && kind !== "turma") || !id) return null;
  return { kind, id };
}

export function serializeEntityRef(
  ref: EntityRef | null | undefined,
): string | null {
  return ref ? `${ref.kind}:${ref.id}` : null;
}

export function sameEntity(
  a: EntityRef | null | undefined,
  b: EntityRef | null | undefined,
) {
  return !!a && !!b && a.kind === b.kind && a.id === b.id;
}

/** Posição da solução aberta na lista visível (ordenação e filtros atuais). */
export function detailPosition(
  rows: readonly { id: string }[],
  id: string | null,
): { index: number; total: number } | null {
  if (!id) return null;
  const index = rows.findIndex((r) => r.id === id);
  return index === -1 ? null : { index, total: rows.length };
}

/** Vizinho na lista visível, sem dar a volta. `null` quando não há. */
export function neighborId(
  rows: readonly { id: string }[],
  id: string | null,
  delta: number,
): string | null {
  const pos = detailPosition(rows, id);
  if (!pos) return null;
  const next = rows[pos.index + delta];
  return next ? next.id : null;
}

/**
 * Próxima solução ao excluir a aberta: a seguinte; se for a última, a anterior; senão nada.
 */
export function successorAfterRemoval(
  rows: readonly { id: string }[],
  id: string,
): string | null {
  return neighborId(rows, id, 1) ?? neighborId(rows, id, -1);
}

/**
 * Mudanças de URL ao trocar de solução sem fechar: mantém a entidade se ela existir na
 * nova solução e limpa o inspetor.
 */
export function navigationChanges(
  nextId: string,
  entity: EntityRef | null,
  existsIn: (ref: EntityRef) => boolean,
): Record<string, string | null> {
  return {
    detalhe: nextId,
    ent: entity && existsIn(entity) ? serializeEntityRef(entity) : null,
    insp: null,
  };
}

/**
 * Limpeza de parâmetros inválidos: solução inexistente apaga tudo; entidade ou inspetor
 * inexistentes na solução são removidos. Devolve `null` quando nada precisa mudar.
 */
export function invalidParamChanges(
  params: { detalhe: string | null; ent: string | null; insp: string | null },
  hasSolution: (id: string) => boolean,
  existsIn: (ref: EntityRef) => boolean,
): Record<string, string | null> | null {
  const changes: Record<string, string | null> = {};
  if (params.detalhe === null) {
    if (params.ent !== null) changes.ent = null;
    if (params.insp !== null) changes.insp = null;
  } else if (!hasSolution(params.detalhe)) {
    changes.detalhe = null;
    if (params.ent !== null) changes.ent = null;
    if (params.insp !== null) changes.insp = null;
  } else {
    if (params.ent !== null) {
      const ent = parseEntityRef(params.ent);
      if (!ent || !existsIn(ent)) changes.ent = null;
    }
    if (params.insp !== null) {
      const insp = parseEntityRef(params.insp);
      if (!insp || !existsIn(insp)) changes.insp = null;
    }
  }
  return Object.keys(changes).length ? changes : null;
}

/** Camadas internas que o Esc fecha antes do diálogo. Menus e diálogos de confirmação são
 *  modais próprios do MUI e consomem o Esc antes de chegar aqui. */
export type EscapeLayer =
  | { kind: "overlay" } // inspetor sobreposto (médio)
  | { kind: "stack"; level: "relations" | "inspector" }; // pilha (estreito)

export type EscapeAction = "closeOverlay" | "stackBack" | "closeDialog";

export function resolveEscape(layer: EscapeLayer | null): EscapeAction {
  if (!layer) return "closeDialog";
  if (layer.kind === "overlay") return "closeOverlay";
  return "stackBack";
}
