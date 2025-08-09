import { Vizinho } from "./Interfaces/utils";

/**
 * Função utilizada para aplciar uma pausa no processo.
 * @param {number} ms Valor em milissegundos.
 */
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Função que informa se duas vizinhanças são iguais.
 * @description A comparação inicia com a observação das avaliações, em seguida o tamanho das atribuições
 * e somente depois as atribuições. No caso, atribuições com mais de um docente serão
 * verificadas pela ordem dos docentes, implicando que `[1, 2] != [2, 1]`.
 * @param vizinho1 {Vizinho} Vizinho 1.
 * @param vizinho2 {Vizinho} Vizinho 2.
 *
 * @returns {boolean} `True` caso os vizinhos sejam iguais.`False` caso contrário
 */
export function compararVizihos(vizinho1: Vizinho, vizinho2: Vizinho): boolean {
  if (vizinho1?.avaliacao !== vizinho2?.avaliacao) {
    return false;
  }

  if (vizinho1.atribuicoes.length !== vizinho2.atribuicoes.length) {
    return false;
  }

  for (let i = 0; i < vizinho1.atribuicoes.length; i++) {
    if (
      vizinho1.atribuicoes[i].id_disciplina !==
      vizinho2.atribuicoes[i].id_disciplina
    ) {
      return false;
    }

    if (
      vizinho1.atribuicoes[i].docentes.length !==
      vizinho2.atribuicoes[i].docentes.length
    ) {
      return false;
    }

    for (let j = 0; j < vizinho1.atribuicoes[i].docentes.length; j++) {
      if (
        vizinho1.atribuicoes[i].docentes[j] !==
        vizinho2.atribuicoes[i].docentes[j]
      ) {
        return false;
      }
    }
  }

  return true;
}

export function compararVizihosTeste(
  vizinho1: Vizinho,
  vizinho2: Vizinho
): boolean {
  if (vizinho1?.avaliacao !== vizinho2?.avaliacao) {
    return false;
  }

  if (vizinho1.atribuicoes.length !== vizinho2.atribuicoes.length) {
    return false;
  }

  for (let i = 0; i < vizinho1.atribuicoes.length; i++) {
    if (
      vizinho1.atribuicoes[i].id_disciplina !==
      vizinho2.atribuicoes[i].id_disciplina
    ) {
      return false;
    }

    if (
      vizinho1.atribuicoes[i].docentes.length !==
      vizinho2.atribuicoes[i].docentes.length
    ) {
      return false;
    }

    for (let j = 0; j < vizinho1.atribuicoes[i].docentes.length; j++) {
      if (
        vizinho1.atribuicoes[i].docentes[j] !==
        vizinho2.atribuicoes[i].docentes[j]
      ) {
        return false;
      }
    }
  }

  return true;
}
