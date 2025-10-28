import { Presolve } from "./Presolve";
import { SparseMatrixCSC } from "./utils";

/** Representa uma variável de decisão no modelo. */
export interface Variable {
  id: number;
  name: string;
  type: "Continuous" | "Integer" | "Binary";
  lowerBound: number;
  upperBound: number;
}

/** Representa um termo em uma expressão linear, como '5*x1'. */
export interface Term {
  variable: Variable;
  coefficient: number;
}

/** Define uma expressão linear como uma soma de termos. */
export type Expression = Term[];

/** Representa uma restrição completa do modelo. */
export interface Constraint {
  name: string;
  expression: Expression;
  sense: "<=" | ">=" | "==";
  rhs: number;
}

/** Representa a função objetivo do modelo. */
export interface Objective {
  sense: "minimize" | "maximize";
  expression: Expression;
}

/**
 * Filtra as linhas de uma matriz densa e seu vetor RHS correspondente para
 * manter apenas as linhas que são linearmente independentes.
 * @param denseA A matriz de restrições em formato denso.
 * @param b O vetor do lado direito (RHS).
 * @returns Um objeto contendo a matriz A e o vetor b filtrados.
 */
function filterLinearlyIndependentRows(
  denseA: number[][],
  b: number[]
): { A: number[][]; b: number[] } {
  if (denseA.length === 0) {
    return { A: [], b: [] };
  }
  const numVars = denseA[0].length;
  const independentRows: number[][] = [];
  const independentB: number[] = [];
  const basisVectors: number[][] = [];

  const dot = (v1: number[], v2: number[]) =>
    v1.reduce((acc, val, i) => acc + val * v2[i], 0);
  const norm = (v: number[]) => Math.sqrt(dot(v, v));

  for (let i = 0; i < denseA.length; i++) {
    const vector = denseA[i];
    const projection = [...vector];

    for (const basisVec of basisVectors) {
      const scalarProjection = dot(vector, basisVec);
      for (let j = 0; j < numVars; j++) {
        projection[j] -= scalarProjection * basisVec[j];
      }
    }

    if (norm(projection) > 1e-9) {
      independentRows.push(vector);
      independentB.push(b[i]);
      const normalizedProjection = projection.map(
        (val) => val / norm(projection)
      );
      basisVectors.push(normalizedProjection);
    }
  }
  return { A: independentRows, b: independentB };
}

// --- A Classe de Modelagem Principal ---
export class OptimizationModel {
  public name: string;
  private variables: Variable[] = [];
  private variablesByName: Map<string, Variable> = new Map();
  private constraints: Constraint[] = [];
  private objective: Objective | null = null;
  private varCounter = 0;

  constructor(name?: string) {
    this.name = name ? name : "NewModel";
  }

  public addVariable(
    name: string,
    options?: {
      type?: "Continuous" | "Integer" | "Binary";
      lb?: number;
      ub?: number;
    }
  ): Variable {
    if (this.variablesByName.has(name)) {
      throw new Error(`Uma variável com o nome '${name}' já existe.`);
    }

    const varType = options?.type ?? "Continuous";

    const newVar: Variable = {
      id: this.varCounter++,
      name: name,
      type: varType,

      // --- Lógica de Limites ---
      // Se for Binária, força lb=0 e ub=1.
      // Caso contrário, usa os padrões (lb=0, ub=Infinity) ou o que foi fornecido.
      lowerBound: varType === "Binary" ? 0 : options?.lb ?? 0,
      upperBound: varType === "Binary" ? 1 : options?.ub ?? Infinity,
    };

    this.variables.push(newVar);
    this.variablesByName.set(name, newVar);
    return newVar;
  }

  /**
   * Modificar essa função para que seja possível chamar várias vezes esse método e que ele vá adicionando
   * novos componentes sem apagar o(s) anterior(es).
   * (Melhor abordagem) Ou criar uma função setObjectiveComponents que terá esse comportamento de ir adicionando componentes e a
   * `setObjective` executará apenas ao final "juntando tudo".
   */
  public setObjective(
    sense: "minimize" | "maximize",
    expression: Expression
  ): void {
    expression.forEach((term) => {
      if (
        term.variable.id >= this.varCounter ||
        this.variables[term.variable.id] !== term.variable
      ) {
        throw new Error(
          `Variável '${term.variable.name}' na função objetivo não pertence a este modelo.`
        );
      }
    });
    this.objective = { sense, expression };
  }

  public addConstraint(
    name: string,
    expression: Expression,
    sense: "<=" | ">=" | "==",
    rhs: number
  ): void {
    if (this.constraints.some((c) => c.name === name)) {
      throw new Error(`Uma restrição com o nome '${name}' já existe.`);
    }
    expression.forEach((term) => {
      if (
        term.variable.id >= this.varCounter ||
        this.variables[term.variable.id] !== term.variable
      ) {
        throw new Error(
          `Variável '${term.variable.name}' na restrição '${name}' não pertence a este modelo.`
        );
      }
    });
    const newConstraint: Constraint = { name, expression, sense, rhs };
    this.constraints.push(newConstraint);
  }

  private objectiveOffset = 0;

  /**
   * Constrói as matrizes A e b a partir do modelo pré-processado.
   */
  private buildProblemMatrices(): { A: SparseMatrixCSC; b: number[] } {
    // Reajusta os IDs das variáveis para serem contíguos (0, 1, 2, ...) após o presolve.
    // Cria um mapa para traduzir os IDs antigos (potencialmente não contíguos) para os novos.
    const oldIdToNewId = new Map<number, number>();
    this.variables.forEach((v, i) => {
      oldIdToNewId.set(v.id, i);
      v.id = i;
    });
    const numVars = this.variables.length;

    const tempB: number[] = [];
    // Estrutura intermediária: armazena os coeficientes por linha
    const sparseRows: { col: number; val: number }[][] = [];

    // Normaliza todas as restrições para a forma <= e as adiciona à estrutura intermediária
    for (const constraint of this.constraints) {
      const terms = constraint.expression;
      const rhs = constraint.rhs;
      const sense = constraint.sense;

      const addRow = (currentTerms: Term[], currentRhs: number) => {
        const newRow: { col: number; val: number }[] = [];
        for (const term of currentTerms) {
          const newVarId = oldIdToNewId.get(term.variable.id);
          if (newVarId !== undefined) {
            // Adiciona apenas se a variável ainda existir
            newRow.push({ col: newVarId, val: term.coefficient });
          }
        }
        if (newRow.length > 0) {
          sparseRows.push(newRow);
          tempB.push(currentRhs);
        }
      };

      if (sense === "<=") {
        addRow(terms, rhs);
      } else if (sense === ">=") {
        addRow(
          terms.map((t) => ({ ...t, coefficient: -t.coefficient })),
          -rhs
        );
      } else if (sense === "==") {
        addRow(terms, rhs);
        addRow(
          terms.map((t) => ({ ...t, coefficient: -t.coefficient })),
          -rhs
        );
      }
    }
    // Adiciona os limites das variáveis como restrições
    for (const variable of this.variables) {
      if (isFinite(variable.lowerBound) && variable.lowerBound !== 0) {
        sparseRows.push([{ col: variable.id, val: -1 }]);
        tempB.push(-variable.lowerBound);
      }
      if (isFinite(variable.upperBound)) {
        sparseRows.push([{ col: variable.id, val: 1 }]);
        tempB.push(variable.upperBound);
      }
    }

    // 2. Converte a representação esparsa intermediária para uma matriz densa temporária.
    const tempDenseA = Array(sparseRows.length)
      .fill(0)
      .map(() => Array(numVars).fill(0));
    sparseRows.forEach((row, i) => {
      for (const term of row) {
        tempDenseA[i][term.col] = term.val;
      }
    });

    // 3. (PASSO CRÍTICO) Filtra a matriz densa e o vetor 'b' para remover linhas dependentes.
    const filtered = filterLinearlyIndependentRows(tempDenseA, tempB);
    const finalDenseA = filtered.A;
    const finalB = filtered.b;

    // 4. Converte a matriz densa JÁ FILTRADA para o formato CSC final.
    const numRows = finalDenseA.length;
    const values: number[] = [];
    const rowIndices: number[] = [];
    const colPtr: number[] = [0];

    for (let j = 0; j < numVars; j++) {
      for (let i = 0; i < numRows; i++) {
        if (Math.abs(finalDenseA[i][j]) > 1e-12) {
          values.push(finalDenseA[i][j]);
          rowIndices.push(i);
        }
      }
      colPtr.push(values.length);
    }

    const finalA: SparseMatrixCSC = {
      nRows: numRows,
      nCols: numVars,
      values,
      rowIndices,
      colPtr,
    };

    return { A: finalA, b: finalB };
  }

  /**
   * Executa o processo de presolve usando a classe Presolve dedicada
   * e atualiza o estado interno do modelo com os resultados.
   */
  private runPresolve(): void {
    const presolve = new Presolve(
      this.variables,
      this.constraints,
      this.objective
    );
    const presolveResult = presolve.run();

    // Atualiza o estado do modelo com os resultados do presolve
    this.variables = presolveResult.variables;
    this.constraints = presolveResult.constraints;
    this.objective = presolveResult.objective;
    this.objectiveOffset = presolveResult.objectiveOffset;
  }

  public displayModelStats(A: SparseMatrixCSC): void {
    if (!this.objective) {
      console.warn(
        "Aviso: Exibindo estatísticas de um modelo sem função objetivo."
      );
    }
    if (this.variables.length === 0) {
      console.warn("Aviso: Exibindo estatísticas de um modelo sem variáveis.");
    }

    // Constrói as matrizes para obter as dimensões pós-presolve.
    // `buildProblemMatrices` agora retorna { A: SparseMatrixCSC; b: number[] }
    // const { A } = this.buildProblemMatrices();

    const numVars = this.variables.length;
    // O número de restrições é o número de linhas na matriz esparsa.
    const numConstraints = A.nRows;
    // O número de parâmetros não-zero é simplesmente o comprimento do array de valores.
    const numParameters = A.values.length;

    const integerVarIndices = this.variables
      .filter((v) => v.type === "Integer")
      .map((v) => v.id);

    const binaryVars = this.variables.filter((v) => v.type === "Binary");

    console.log("\n--- Estatísticas do Modelo Otimizado ---");
    console.log(
      `Tipo de Problema: ${
        integerVarIndices.length > 0
          ? "Programação Linear Inteira Mista (PLIM)"
          : "Programação Linear (PL)"
      }`
    );
    console.log(`Variáveis de Decisão : ${numVars}`);
    console.log(`  - Contínuas        : ${numVars - integerVarIndices.length}`);
    console.log(`  - Inteiras         : ${integerVarIndices.length}`);
    console.log(`  - Binárias         : ${binaryVars.length}`);
    console.log(`Restrições           : ${numConstraints}`);
    console.log(`Parâmetros (não-zero): ${numParameters}`);
    console.log("----------------------------------------");
  }

  /**
   * Formata uma expressão linear para o formato LP.
   * Ex: 10x1 + 6x2
   * @param expression A expressão a ser formatada.
   * @returns Uma string formatada.
   */
  private formatExpression(expression: Expression): string {
    if (expression.length === 0) {
      return "0";
    }

    return expression
      .map((term, index) => {
        const coeff = term.coefficient;
        if (Math.abs(coeff) < 1e-12) return null; // Ignora termos zero

        const varName = term.variable.name;
        const absCoeff = Math.abs(coeff);
        let sign: string;
        let coeffStr: string;

        // Define o sinal
        if (index === 0) {
          sign = coeff < 0 ? "-" : "";
        } else {
          sign = coeff < 0 ? " - " : " + ";
        }

        // Define o coeficiente
        if (absCoeff === 1) {
          coeffStr = ""; // Não mostra '1' (ex: 'x1' em vez de '1 x1')
        } else {
          coeffStr = `${absCoeff} `; // Adiciona espaço (ex: '10 x1')
        }

        return `${sign}${coeffStr}${varName}`;
      })
      .filter(Boolean) // Remove termos nulos
      .join("");
  }

  /**
   * Gera uma representação em string do modelo no formato CPLEX LP.
   * @returns Uma string contendo o modelo formatado.
   */
  public toCplexLpFormat(): string {
    const lines: string[] = [];

    if (!this.objective) {
      throw new Error(
        "Não é possível gerar o LP: Função objetivo não definida."
      );
    }

    // 1. Função Objetivo (sem alteração)
    lines.push(this.objective.sense === "maximize" ? "Maximize" : "Minimize");
    lines.push(` obj: ${this.formatExpression(this.objective.expression)}`);

    // 2. Restrições (Constraints) (sem alteração)
    lines.push("\nSubject To");
    if (this.constraints.length === 0) {
      lines.push(" \\ Nenhuma restrição");
    }
    for (const constraint of this.constraints) {
      const exprStr = this.formatExpression(constraint.expression);
      lines.push(
        ` ${constraint.name}: ${exprStr} ${
          constraint.sense === "==" ? "=" : constraint.sense
        } ${constraint.rhs}`
      );
    }

    // 3. Limites (Bounds)
    const boundsLines: string[] = [];
    for (const v of this.variables) {
      // --- Pula variáveis Binárias ---
      // Os limites 0 <= x <= 1 são implícitos pela seção "Binaries"
      if (v.type === "Binary") {
        continue;
      }
      // --- Fim da Alteração ---

      const name = v.name;
      if (v.lowerBound === -Infinity && v.upperBound === Infinity) {
        boundsLines.push(` ${name} free`);
        continue;
      }
      if (v.lowerBound !== 0 && isFinite(v.lowerBound)) {
        boundsLines.push(` ${name} >= ${v.lowerBound}`);
      }
      if (v.upperBound !== Infinity && isFinite(v.upperBound)) {
        boundsLines.push(` ${name} <= ${v.upperBound}`);
      }
    }

    if (boundsLines.length > 0) {
      lines.push("\nBounds");
      lines.push(...boundsLines);
    }

    // 4. Tipos de Variáveis (General para Inteiras)
    const integers = this.variables.filter((v) => v.type === "Integer");
    if (integers.length > 0) {
      lines.push("\nGeneral");
      for (const v of integers) {
        lines.push(` ${v.name}`);
      }
    }

    // --- Adiciona a seção Binaries ---
    const binaries = this.variables.filter((v) => v.type === "Binary");
    if (binaries.length > 0) {
      lines.push("\nBinaries");
      for (const v of binaries) {
        lines.push(` ${v.name}`);
      }
    }

    lines.push("\nEnd");

    return lines.join("\n");
  }
}
