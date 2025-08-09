import { Celula, Disciplina, Docente } from "@/context/Global/utils";
import Constraint from "../Classes/Constraint";
import { Vizinho } from "../Interfaces/utils";

/**
 * Função para checar se um docente pode ser alocado a uma disciplina
 * @param {Docente} docente
 * @param {Disciplina} disciplina
 * @param {Trava[]} travas
 * @param {Atribuicao[]} atribuicoes
 * @param {Disciplina[]} disciplinas
 * @returns {Boolean} Indicação se a atribuição do docente X à disciplina Y pode ser realizada.
 */
export function podeAtribuir(
  docente: Docente,
  turma: Disciplina,
  travas: Celula[],
  hardConstraints: Map<string, Constraint>,
  baseSolution: Vizinho
): boolean {
  // if (
  //   docente !== null &&
  //   travas.some(
  //     (trava) =>
  //       trava.id_disciplina === turma.id && trava.nome_docente === docente.nome
  //   )
  // ) {
  //   return false;
  // }

  // if (
  //   !turma.ativo ||
  //   travas.some(
  //     (trava) =>
  //       trava.id_disciplina === turma.id &&
  //       trava.tipo_trava === TipoTrava.Column
  //   )
  // ) {
  //   return false;
  // }

  for (const _constraint of hardConstraints.keys()) {
    const constraint = hardConstraints.get(_constraint);
    if (
      /** Adicionado um ternário para resolver um problema na restrição das travas */
      !constraint.hard(
        baseSolution.atribuicoes,
        docente ? [docente] : [],
        [turma],
        travas
      )
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Compara duas listas, verificando se possuem mesmo tamanho e posteriormente a
 * ordem de seus itens.
 * @param array1
 * @param array2
 * @returns {boolean} `True` caso as listas sejam iguais. `False` caso contrário.
 */
export function compareArrays<T>(array1: T[], array2: T[]): boolean {
  if (array1.length !== array2.length) {
    return false;
  }

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
}
