const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  emsp: " ",
  ensp: " ",
  thinsp: " ",
};

/**
 * Decodifica entidades HTML comuns e numéricas, sem interpretar o HTML.
 */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === "#") {
      const code =
        entity[1] === "x" || entity[1] === "X"
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

/**
 * Texto dos cursos para o cabeçalho da turma (B3): remove o prefixo até o primeiro `;`,
 * os `<br>` e os `&emsp;`. Qualquer outra marcação é descartada e o resultado é texto puro,
 * nunca HTML (D2: o dado pode vir de outro participante da sala).
 */
export function formatCursos(cursos: string | undefined | null): string {
  if (!cursos) return "";
  const semMarcacao = cursos
    .replace(/^[^;]*;/, "")
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&emsp;/gi, " ")
    .replace(/<[^>]*>/g, "");
  return decodeEntities(semMarcacao).replace(/[<>]/g, "");
}
