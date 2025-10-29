import Algorithm from "../abstractions/Algorithm";
import Constraint from "../abstractions/Constraint";
import { MILP } from "../metodos/MILP/MILP";
import { TabuSearch } from "../metodos/TabuSearch/Classes/TabuSearch";
import {
  Atribuicao,
  Celula,
  Disciplina,
  Docente,
  Vizinho,
} from "./interfaces/interfaces";

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
  hardConstraints: Map<string, Constraint<any>>,
  baseSolution: Vizinho,
  disciplinas: Disciplina[]
): boolean {
  for (const _constraint of hardConstraints.keys()) {
    const constraint = hardConstraints.get(_constraint);
    if (
      /** Adicionado um ternário para resolver um problema na restrição das travas */
      !constraint.hard(
        baseSolution.atribuicoes,
        docente ? [docente] : [],
        [turma],
        travas,
        disciplinas
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

// Definir um tipo de união para todos os seus algoritmos
export type AnyAlgorithm = TabuSearch | MILP;

// --- Type Guards ---

/**
 * Verifica se um algoritmo é uma instância de TabuSearch.
 */
export function isTabuSearch(
  alg: Algorithm<any> | AnyAlgorithm
): alg is TabuSearch {
  // Use o nome que você definiu no construtor da classe TabuSearch
  return alg.name === "tabu-search"; //
}

/**
 * Verifica se um algoritmo é uma instância de MILP.
 */
export function isMILP(alg: Algorithm<any> | AnyAlgorithm): alg is MILP {
  // Use o nome que você definiu no construtor da classe MILP
  return alg.name === "integer-solver"; //
}

/**
 * Verifica se é um algoritmo heurístico (com pipes de vizinhança/parada).
 * Isso é útil para seções compartilhadas.
 */
export function isHeuristicAlgorithm(
  alg: Algorithm<any> | AnyAlgorithm
): alg is TabuSearch {
  return isTabuSearch(alg);
}
