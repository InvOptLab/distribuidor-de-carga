import { Expression, Term, Variable } from "./optimization_model";

/**
 * Interface para representar uma matriz no formato Compressed Sparse Row (CSR).
 * Este formato armazena apenas os elementos não-zero, resultando em
 * uma economia massiva de memória e velocidade de processamento para problemas esparsos.
 */
export interface SparseMatrixCSR {
  /** Número de linhas da matriz. */
  nRows: number;
  /** Número de colunas da matriz. */
  nCols: number;
  /** Array contendo todos os valores não-zero da matriz, lidos linha por linha. */
  values: number[];
  /** Array contendo o índice da coluna para cada valor no array `values`. */
  colIndices: number[];
  /**
   * "Ponteiro" para o início de cada linha no array `values`. O número de elementos
   * na linha `i` é `rowPtr[i+1] - rowPtr[i]`.
   * Possui `nRows + 1` elementos.
   */
  rowPtr: number[];
}

export interface SparseMatrixCSC {
  /** Número de linhas da matriz. */
  nRows: number;
  /** Número de colunas da matriz. */
  nCols: number;
  /** Array contendo todos os valores não-zero da matriz, lidos coluna por coluna. */
  values: number[];
  /** Array contendo o índice da linha para cada valor no array `values`. */
  rowIndices: number[];
  /**
   * "Ponteiro" para o início de cada coluna no array `values`. O número de elementos
   * na coluna `j` é `colPtr[j+1] - colPtr[j]`.
   * Possui `nCols + 1` elementos.
   */
  colPtr: number[];
}

/**
 * Cria uma expressão linear a partir de uma lista de variáveis e termos.
 * Simula um somatório (Σ) da notação matemática.
 * @param items Um array que pode conter objetos Variable (coeficiente 1) ou Term.
 * @returns Uma Expression (Term[]) formatada para ser usada no modelo.
 */
export function LpSum(items: (Variable | Term)[]): Expression {
  return items.map((item) => {
    if ("coefficient" in item && "variable" in item) {
      return item;
    }
    return { variable: item as Variable, coefficient: 1 };
  });
}
