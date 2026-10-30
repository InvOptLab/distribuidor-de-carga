/** Item mostrado no painel de detalhes (5.7). */
export type DetailsTarget =
  | { kind: "turma"; id: string }
  | { kind: "docente"; nome: string };

export function sameTarget(a: DetailsTarget | null, b: DetailsTarget | null) {
  if (!a || !b) return a === b;
  if (a.kind === "turma" && b.kind === "turma") return a.id === b.id;
  if (a.kind === "docente" && b.kind === "docente") return a.nome === b.nome;
  return false;
}
