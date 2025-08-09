import { Atribuicao } from "@/context/Global/utils";

/**
 * Função para verificar igualdade entre duas atribuições.
 * @param atr1 Atribuição 1.
 * @param atr2 Atribuição 2.
 * @returns Booleano indicando se as atribuições são iguais.
 */
export function atribuicoesIguais(atr1: Atribuicao, atr2: Atribuicao): boolean {
  return (
    atr1.id_disciplina === atr2.id_disciplina &&
    atr1.docentes.length === atr2.docentes.length &&
    atr1.docentes.every((docente) => atr2.docentes.includes(docente))
  );
}
