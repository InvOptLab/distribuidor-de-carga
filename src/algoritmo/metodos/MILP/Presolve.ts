import {
  Variable,
  Constraint,
  Objective,
  Term,
  Expression,
} from "./optimization_model";

/**
 * Representa o estado do modelo durante o processo de presolve.
 * É retornado após a execução para que o modelo principal possa ser atualizado.
 */
export interface PresolveResult {
  variables: Variable[];
  constraints: Constraint[];
  objective: Objective | null;
  objectiveOffset: number;
}

/**
 * Gera um hash numérico simples para uma string.
 * @param str A string de entrada.
 * @returns Um hash inteiro de 32 bits.
 */
function stringHashCode(str: string): number {
  let hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Converte para inteiro de 32 bits
  }
  return hash;
}

/**
 * A classe Presolve encapsula todas as técnicas de pré-processamento para
 * simplificar um modelo de otimização antes de ser resolvido.
 * Ela opera em uma cópia dos dados do modelo para evitar efeitos colaterais.
 */
export class Presolve {
  private variables: Variable[];
  private constraints: Constraint[];
  private objective: Objective | null;
  private objectiveOffset: number = 0;

  // Contadores para estatísticas de cada passe
  private stats = {
    tightenedBounds: 0,
    fixedVars: 0,
    removedConstraints: 0,
    probedVars: 0,
    dominatedCols: 0,
  };

  /**
   * Constrói uma nova instância do solver de pré-processamento.
   * @param variables Uma cópia do array de variáveis do modelo.
   * @param constraints Uma cópia do array de restrições do modelo.
   * @param objective Uma cópia do objeto da função objetivo do modelo.
   */
  constructor(
    variables: Variable[],
    constraints: Constraint[],
    objective: Objective | null
  ) {
    // Clona os dados para evitar modificar o modelo original diretamente
    this.variables = JSON.parse(JSON.stringify(variables));
    this.constraints = JSON.parse(JSON.stringify(constraints));
    this.objective = objective ? JSON.parse(JSON.stringify(objective)) : null;
  }

  /**
   * Ponto de entrada principal para executar o processo de presolve.
   * Executa os passes de simplificação em um loop até que nenhuma
   * outra redução possa ser encontrada.
   * @returns Um objeto PresolveResult contendo o modelo simplificado.
   */
  public run(): PresolveResult {
    const MAX_PRESOLVE_PASSES = 20;
    let pass = 0;
    let reductionsFoundInMainLoop: boolean;

    console.log("Iniciando fase de pré-processamento (Presolve)...");

    do {
      reductionsFoundInMainLoop = false;
      pass++;
      let reductionsInInnerLoop: boolean;

      // =====================================================================
      // LOOP INTERNO: Foco na cascata de alta frequência
      // =====================================================================
      do {
        reductionsInInnerLoop = false;

        // Passe 1: Limpeza rápida e essencial.
        if (this.processSingletonAndRedundantRows()) {
          reductionsInInnerLoop = true;
        }
        // Passe 2: Raciocínio lógico sobre cliques. Pode fixar variáveis.
        if (this.propagateImplications()) {
          reductionsInInnerLoop = true;
        }
        // Passe 3: Aperta formulações Big-M. Altera a estrutura da restrição.
        if (this.strengthenCoefficients()) {
          reductionsInInnerLoop = true;
        }
        // Passe 4: Aperto de limites mais geral.
        if (this.tightenVariableBounds()) {
          reductionsInInnerLoop = true;
        }
        // Passe 5: O passe mais importante da cascata.
        if (this.fixAndSubstituteVariables()) {
          reductionsInInnerLoop = true;
        }
        // Passe 6: Adiciona desigualdades válidas para fortalecer o modelo.
        if (this.generateCoverInequalities()) {
          reductionsInInnerLoop = true;
        }

        if (reductionsInInnerLoop) {
          reductionsFoundInMainLoop = true;
        }
      } while (reductionsInInnerLoop);

      // =====================================================================
      // PASSES EXTERNOS: Heurísticas mais caras
      // =====================================================================

      // Passe 7: Sondagem de variáveis binárias.
      if (this.probeBinaryVariables()) {
        reductionsFoundInMainLoop = true;
        continue;
      }
      // Passe 8: Remoção de colunas dominadas.
      if (this.removeDominatedColumns()) {
        reductionsFoundInMainLoop = true;
      }
    } while (reductionsFoundInMainLoop && pass < MAX_PRESOLVE_PASSES);

    console.log("Presolve concluído.");
    console.log("--- Estatísticas do Presolve ---");
    console.log(`  Passes executados        : ${pass}`);
    console.log(`  Limites apertados      : ${this.stats.tightenedBounds}`);
    console.log(`  Variáveis fixadas        : ${this.stats.fixedVars}`);
    console.log(`  Restrições removidas   : ${this.stats.removedConstraints}`);
    console.log(`  Variáveis sondadas (Probe) : ${this.stats.probedVars}`);
    console.log(`  Colunas dominadas      : ${this.stats.dominatedCols}`);
    console.log("---------------------------------");

    // Retorna o estado final e simplificado do modelo.
    return {
      variables: this.variables,
      constraints: this.constraints,
      objective: this.objective,
      objectiveOffset: this.objectiveOffset,
    };
  }

  /**
   * **PASSE 1: Análise de Linhas Singleton e Redundância.**
   * Processa restrições com apenas uma variável (singleton) para apertar
   * os limites dessa variável. Também identifica e remove restrições
   * redundantes e verifica a infactibilidade trivial.
   * @returns `true` se alguma redução foi encontrada, `false` caso contrário.
   */
  private processSingletonAndRedundantRows(): boolean {
    let reductionFound = false;
    const constraintsToRemove: Set<Constraint> = new Set();
    const variableMap = new Map<number, Variable>(
      this.variables.map((v) => [v.id, v])
    );

    for (const constraint of this.constraints) {
      // Se a restrição já foi marcada para remoção, pule.
      if (constraintsToRemove.has(constraint)) {
        continue;
      }

      // --- 1. Análise de Linhas Singleton ---
      if (constraint.expression.length === 1) {
        const term = constraint.expression[0];
        // A variável pode ter sido removida em uma iteração anterior do presolve.
        const variable = variableMap.get(term.variable.id);
        if (!variable) {
          constraintsToRemove.add(constraint);
          reductionFound = true;
          continue;
        }

        const { coefficient } = term;
        const newBound = constraint.rhs / coefficient;

        // Lógica para apertar os limites
        if (constraint.sense === "<=") {
          if (coefficient > 0 && newBound < variable.upperBound) {
            variable.upperBound = newBound;
            reductionFound = true;
            this.stats.tightenedBounds++;
          } else if (coefficient < 0 && newBound > variable.lowerBound) {
            variable.lowerBound = newBound;
            reductionFound = true;
            this.stats.tightenedBounds++;
          }
        } else if (constraint.sense === ">=") {
          if (coefficient > 0 && newBound > variable.lowerBound) {
            variable.lowerBound = newBound;
            reductionFound = true;
            this.stats.tightenedBounds++;
          } else if (coefficient < 0 && newBound < variable.upperBound) {
            variable.upperBound = newBound;
            reductionFound = true;
            this.stats.tightenedBounds++;
          }
        } else if (constraint.sense === "==") {
          // Uma igualdade singleton fixa a variável.
          variable.lowerBound = newBound;
          variable.upperBound = newBound;
          reductionFound = true;
          this.stats.tightenedBounds++;
        }

        // Se a variável se tornou infactível (ex: lb > ub), o problema é infactível.
        if (variable.lowerBound > variable.upperBound + 1e-9) {
          throw new Error(
            `Presolve (Singleton): Inviabilidade detectada para a variável '${variable.name}'. Limites [${variable.lowerBound}, ${variable.upperBound}] são inconsistentes.`
          );
        }

        // Após processar a restrição singleton, ela se torna redundante e pode ser removida.
        constraintsToRemove.add(constraint);
        continue; // Passa para a próxima restrição.
      }

      // --- 2. Análise de Redundância e Inviabilidade Trivial ---
      let minActivity = 0;
      let maxActivity = 0;
      for (const term of constraint.expression) {
        const variable = variableMap.get(term.variable.id);
        if (!variable) continue; // Ignora termos com variáveis já removidas

        if (term.coefficient > 0) {
          minActivity += term.coefficient * variable.lowerBound;
          maxActivity += term.coefficient * variable.upperBound;
        } else {
          minActivity += term.coefficient * variable.upperBound; // Inverte para o negativo
          maxActivity += term.coefficient * variable.lowerBound;
        }
      }

      // Verifica se alguma atividade é infinita
      if (!isFinite(minActivity) || !isFinite(maxActivity)) {
        continue; // Não podemos analisar restrições com limites infinitos
      }

      // Lógica para detectar redundância ou inviabilidade
      if (constraint.sense === "<=") {
        if (maxActivity <= constraint.rhs + 1e-9) {
          // A atividade máxima já satisfaz a restrição, então ela é redundante.
          constraintsToRemove.add(constraint);
        } else if (minActivity > constraint.rhs + 1e-9) {
          // A atividade mínima já viola a restrição, então o problema é infactível.
          throw new Error(
            `Presolve (Redundância): Inviabilidade detectada na restrição '${constraint.name}'. A atividade mínima (${minActivity}) viola o limite <= ${constraint.rhs}.`
          );
        }
      } else if (constraint.sense === ">=") {
        if (minActivity >= constraint.rhs - 1e-9) {
          // A atividade mínima já satisfaz a restrição, então ela é redundante.
          constraintsToRemove.add(constraint);
        } else if (maxActivity < constraint.rhs - 1e-9) {
          // A atividade máxima já viola a restrição, então o problema é infactível.
          throw new Error(
            `Presolve (Redundância): Inviabilidade detectada na restrição '${constraint.name}'. A atividade máxima (${maxActivity}) viola o limite >= ${constraint.rhs}.`
          );
        }
      } else if (constraint.sense === "==") {
        if (
          maxActivity < constraint.rhs - 1e-9 ||
          minActivity > constraint.rhs + 1e-9
        ) {
          throw new Error(
            `Presolve (Redundância): Inviabilidade detectada na restrição de igualdade '${constraint.name}'. O intervalo de atividade [${minActivity}, ${maxActivity}] não contém ${constraint.rhs}.`
          );
        }
        if (
          Math.abs(minActivity - constraint.rhs) < 1e-9 &&
          Math.abs(maxActivity - constraint.rhs) < 1e-9
        ) {
          // A restrição é sempre ativa, mas se já satisfeita por todos os limites, é redundante.
          constraintsToRemove.add(constraint);
        }
      }
    }

    // --- 3. Efetivamente remove as restrições marcadas ---
    if (constraintsToRemove.size > 0) {
      this.constraints = this.constraints.filter(
        (c) => !constraintsToRemove.has(c)
      );
      this.stats.removedConstraints += constraintsToRemove.size;
      reductionFound = true;
    }

    return reductionFound;
  }

  /**
   * **PASSE 2: Fixação e Substituição de Variáveis.**
   * Identifica variáveis cujos limites inferior e superior são iguais (fixas).
   * Substitui essas variáveis por seus valores constantes em todas as
   * restrições e na função objetivo, simplificando o modelo.
   * @returns `true` se alguma variável foi fixada e substituída, `false` caso contrário.
   */
  private fixAndSubstituteVariables(): boolean {
    let reductionFound = false;

    // 1. Identifica todas as variáveis que estão fixas.
    // Uma variável é considerada fixa se seus limites são (quase) iguais e finitos.
    const fixedVariables = this.variables.filter(
      (v) =>
        isFinite(v.lowerBound) && Math.abs(v.lowerBound - v.upperBound) < 1e-9
    );

    if (fixedVariables.length === 0) {
      return false; // Nenhuma variável para substituir.
    }

    reductionFound = true;
    this.stats.fixedVars += fixedVariables.length;

    // 2. Cria um mapa para acesso rápido ao valor fixo de cada variável.
    const fixedVarMap = new Map<number, number>();
    fixedVariables.forEach((v) => fixedVarMap.set(v.id, v.lowerBound));

    // 3. Substitui as variáveis fixas nas restrições.
    // Usamos `reduce` para construir uma nova lista de restrições,
    // pois algumas podem se tornar vazias e precisarão ser removidas.
    this.constraints = this.constraints.reduce((acc, constraint) => {
      let newRhs = constraint.rhs;
      const newExpression: Expression = [];

      for (const term of constraint.expression) {
        const fixedValue = fixedVarMap.get(term.variable.id);
        if (fixedValue !== undefined) {
          // Se a variável no termo está na lista de fixas, ajuste o RHS.
          newRhs -= term.coefficient * fixedValue;
        } else {
          // Caso contrário, mantenha o termo na expressão.
          newExpression.push(term);
        }
      }

      // Apenas mantém a restrição se ela ainda tiver variáveis.
      if (newExpression.length > 0) {
        acc.push({ ...constraint, expression: newExpression, rhs: newRhs });
      } else {
        // Se a restrição ficou vazia, ela deve ser verificada.
        // Se 0 <= newRhs (para <=) é falso, o problema é infactível.
        if (
          (constraint.sense === "<=" && 0 > newRhs + 1e-9) ||
          (constraint.sense === ">=" && 0 < newRhs - 1e-9) ||
          (constraint.sense === "==" && Math.abs(newRhs) > 1e-9)
        ) {
          throw new Error(
            `Presolve (Substituição): Inviabilidade detectada na restrição '${constraint.name}' após fixar variáveis.`
          );
        }
        // Se for satisfeita, a restrição é redundante e simplesmente descartada.
        this.stats.removedConstraints++;
      }

      return acc;
    }, [] as Constraint[]);

    // 4. Substitui as variáveis fixas na função objetivo.
    if (this.objective) {
      const newObjectiveExpr: Expression = [];
      for (const term of this.objective.expression) {
        const fixedValue = fixedVarMap.get(term.variable.id);
        if (fixedValue !== undefined) {
          // Se a variável no termo é fixa, seu valor contribui para o offset da função objetivo.
          this.objectiveOffset += term.coefficient * fixedValue;
        } else {
          // Caso contrário, o termo permanece.
          newObjectiveExpr.push(term);
        }
      }
      this.objective.expression = newObjectiveExpr;
    }

    // 5. Remove as variáveis fixas da lista principal de variáveis.
    const fixedVarIds = new Set<number>(fixedVariables.map((v) => v.id));
    this.variables = this.variables.filter((v) => !fixedVarIds.has(v.id));

    return reductionFound;
  }

  /**
   * **PASSE 3: Probing (Sondagem) em Variáveis Binárias.**
   * Testa as consequências lógicas de fixar temporariamente uma variável binária
   * em 0 e depois em 1. Se uma dessas suposições leva a uma infactibilidade
   * óbvia, o valor oposto da variável pode ser permanentemente fixado.
   * @returns `true` se o probing resultou na fixação de alguma variável, `false` caso contrário.
   */
  private probeBinaryVariables(): boolean {
    let reductionFound = false;
    const variableMap = new Map<number, Variable>(
      this.variables.map((v) => [v.id, v])
    );

    // 1. Filtra apenas as variáveis binárias que ainda não estão fixas.
    const binaryVarsToProbe = this.variables.filter(
      (v) => v.type === "Integer" && v.lowerBound === 0 && v.upperBound === 1
    );

    for (const probeVar of binaryVarsToProbe) {
      let variableWasFixed = false;

      // 2. Testa os dois possíveis valores para a variável binária.
      for (const probeValue of [0, 1]) {
        let leadsToInfeasibility = false;

        // 3. Cria um "cenário hipotético" com a variável de teste fixada.
        // Usamos um mapa para que a consulta ao limite seja rápida.
        const temporaryBounds = new Map<number, { lb: number; ub: number }>();
        this.variables.forEach((v) =>
          temporaryBounds.set(v.id, { lb: v.lowerBound, ub: v.upperBound })
        );

        // Aplica a suposição (fixa a variável no cenário hipotético)
        const currentProbeVarBounds = temporaryBounds.get(probeVar.id)!;
        if (probeValue === 0) {
          currentProbeVarBounds.ub = 0;
        } else {
          // probeValue === 1
          currentProbeVarBounds.lb = 1;
        }

        // 4. Propaga as consequências dessa suposição por todas as restrições.
        for (const constraint of this.constraints) {
          let minActivity = 0;
          let maxActivity = 0;

          // Calcula a atividade mínima e máxima da restrição no cenário hipotético.
          for (const term of constraint.expression) {
            const bounds = temporaryBounds.get(term.variable.id);
            if (!bounds) continue; // Variável já foi removida do modelo

            if (term.coefficient > 0) {
              minActivity += term.coefficient * bounds.lb;
              maxActivity += term.coefficient * bounds.ub;
            } else {
              minActivity += term.coefficient * bounds.ub;
              maxActivity += term.coefficient * bounds.lb;
            }
          }

          // 5. Verifica se a restrição foi violada pela suposição.
          let isViolated = false;
          if (
            constraint.sense === "<=" &&
            minActivity > constraint.rhs + 1e-9
          ) {
            isViolated = true;
          } else if (
            constraint.sense === ">=" &&
            maxActivity < constraint.rhs - 1e-9
          ) {
            isViolated = true;
          } else if (
            constraint.sense === "==" &&
            (minActivity > constraint.rhs + 1e-9 ||
              maxActivity < constraint.rhs - 1e-9)
          ) {
            isViolated = true;
          }

          if (isViolated) {
            leadsToInfeasibility = true;
            break; // Para de verificar outras restrições, já encontramos uma violação.
          }
        }

        // 6. Se a suposição levou a uma inviabilidade, fixa a variável no valor oposto.
        if (leadsToInfeasibility) {
          const actualProbeVar = variableMap.get(probeVar.id)!;
          if (probeValue === 0) {
            // Se fixar em 0 causa problema, a variável DEVE ser 1.
            if (actualProbeVar.lowerBound !== 1) {
              // Evita marcar redução se já era 1
              actualProbeVar.lowerBound = 1;
              reductionFound = true;
              this.stats.probedVars++;
            }
          } else {
            // probeValue === 1
            // Se fixar em 1 causa problema, a variável DEVE ser 0.
            if (actualProbeVar.upperBound !== 0) {
              actualProbeVar.upperBound = 0;
              reductionFound = true;
              this.stats.probedVars++;
            }
          }
          variableWasFixed = true;
          break; // Para de testar essa variável, pois já a fixamos.
        }
      }
      // Otimização: Se fixamos a variável, podemos reiniciar o loop principal do presolve
      // para propagar essa nova informação imediatamente.
      if (variableWasFixed && reductionFound) {
        return true;
      }
    }

    return reductionFound;
  }

  /**
   * **PASSE 4: Remoção de Colunas Dominadas.**
   * Compara pares de variáveis para determinar se uma "domina" a outra.
   * Uma variável X domina Y se for sempre mais "barato" usar X do que Y
   * e se X contribuir de forma mais favorável para satisfazer as restrições.
   * A variável dominada pode então ser fixada em um de seus limites.
   * @returns `true` se alguma coluna dominada foi encontrada e removida, `false` caso contrário.
   */
  private removeDominatedColumns(): boolean {
    if (!this.objective || this.objective.sense === "maximize") {
      // Esta implementação é específica para problemas de minimização.
      return false;
    }

    let reductionFound = false;
    const varsToFix = new Set<Variable>();
    const objectiveMap = new Map<number, number>();
    this.objective.expression.forEach((term) =>
      objectiveMap.set(term.variable.id, term.coefficient)
    );

    // Estrutura para acesso rápido aos coeficientes: Map<constraint_hash, Map<var_id, coefficient>>
    const constraintCoeffs = new Map<number, Map<number, number>>();
    for (const constraint of this.constraints) {
      const coeffMap = new Map<number, number>();
      for (const term of constraint.expression) {
        coeffMap.set(term.variable.id, term.coefficient);
      }
      // CORREÇÃO: Usa a função de hash independente
      constraintCoeffs.set(stringHashCode(constraint.name), coeffMap);
    }

    for (let i = 0; i < this.variables.length; i++) {
      for (let j = i + 1; j < this.variables.length; j++) {
        const var1 = this.variables[i];
        const var2 = this.variables[j];

        if (
          varsToFix.has(var1) ||
          varsToFix.has(var2) ||
          var1.lowerBound !== 0 ||
          var2.lowerBound !== 0
        ) {
          continue;
        }

        const cost1 = objectiveMap.get(var1.id) ?? 0;
        const cost2 = objectiveMap.get(var2.id) ?? 0;

        for (const direction of ["1_dominates_2", "2_dominates_1"]) {
          const dominator = direction === "1_dominates_2" ? var1 : var2;
          const dominated = direction === "1_dominates_2" ? var2 : var1;
          const dominatorCost = direction === "1_dominates_2" ? cost1 : cost2;
          const dominatedCost = direction === "1_dominates_2" ? cost2 : cost1;

          if (dominatorCost > dominatedCost) {
            continue;
          }

          let canDominate = true;
          for (const constraint of this.constraints) {
            // CORREÇÃO: Usa a função de hash independente
            const coeffs = constraintCoeffs.get(
              stringHashCode(constraint.name)
            )!;
            const dominatorCoeff = coeffs.get(dominator.id) ?? 0;
            const dominatedCoeff = coeffs.get(dominated.id) ?? 0;

            if (constraint.sense === "<=" && dominatorCoeff < dominatedCoeff) {
              canDominate = false;
              break;
            }
            if (constraint.sense === ">=" && dominatorCoeff > dominatedCoeff) {
              canDominate = false;
              break;
            }
            if (
              constraint.sense === "==" &&
              dominatorCoeff !== dominatedCoeff
            ) {
              canDominate = false;
              break;
            }
          }

          if (canDominate) {
            if (dominated.lowerBound === 0) {
              varsToFix.add(dominated);
              reductionFound = true;
              this.stats.dominatedCols++;
            }
          }
        }
      }
    }

    if (varsToFix.size > 0) {
      for (const variable of varsToFix) {
        variable.upperBound = variable.lowerBound;
      }
    }

    return reductionFound;
  }

  /**
   * **(Opcional) PASSE 5: Aperto de Limites Baseado em Restrições (Bound Tightening).**
   * Usa uma restrição completa (ex: 2x + 3y <= 10) para derivar limites
   * mais apertados para as variáveis individuais envolvidas (ex: x <= 5).
   * Este é um passe mais complexo e computacionalmente intensivo.
   * @returns `true` se algum limite foi apertado, `false` caso contrário.
   */
  private tightenVariableBounds(): boolean {
    let reductionFound = false;
    const variableMap = new Map<number, Variable>(
      this.variables.map((v) => [v.id, v])
    );

    for (const constraint of this.constraints) {
      // Para cada variável na restrição, tentaremos apertar seus limites.
      for (const termToIsolate of constraint.expression) {
        const variableToBound = variableMap.get(termToIsolate.variable.id);
        if (!variableToBound) continue;

        // Calcula a atividade mínima e máxima de todos os *outros* termos na expressão.
        let otherTermsMinActivity = 0;
        let otherTermsMaxActivity = 0;

        for (const term of constraint.expression) {
          if (term.variable.id === variableToBound.id) continue; // Pula a variável que estamos isolando

          const variable = variableMap.get(term.variable.id);
          if (!variable) continue;

          if (term.coefficient > 0) {
            otherTermsMinActivity += term.coefficient * variable.lowerBound;
            otherTermsMaxActivity += term.coefficient * variable.upperBound;
          } else {
            otherTermsMinActivity += term.coefficient * variable.upperBound;
            otherTermsMaxActivity += term.coefficient * variable.lowerBound;
          }
        }

        // Se a atividade dos outros termos for infinita, não podemos inferir um limite.
        if (
          !isFinite(otherTermsMinActivity) ||
          !isFinite(otherTermsMaxActivity)
        ) {
          continue;
        }

        const coeff = termToIsolate.coefficient;
        const rhs = constraint.rhs;

        // Agora, com base no `sense` da restrição, calculamos um novo limite potencial.
        // A lógica é baseada na reorganização da inequação: a_j*x_j <= b - sum(outros termos)
        if (constraint.sense === "<=") {
          if (coeff > 0) {
            // Novo limite superior: x_j <= (rhs - min_atividade_outros) / coeff
            const newUpperBound = (rhs - otherTermsMinActivity) / coeff;
            if (newUpperBound < variableToBound.upperBound) {
              variableToBound.upperBound = newUpperBound;
              reductionFound = true;
              this.stats.tightenedBounds++;
            }
          } else {
            // coeff < 0
            // Novo limite inferior: x_j >= (rhs - min_atividade_outros) / coeff
            const newLowerBound = (rhs - otherTermsMinActivity) / coeff;
            if (newLowerBound > variableToBound.lowerBound) {
              variableToBound.lowerBound = newLowerBound;
              reductionFound = true;
              this.stats.tightenedBounds++;
            }
          }
        } else if (constraint.sense === ">=") {
          if (coeff > 0) {
            // Novo limite inferior: x_j >= (rhs - max_atividade_outros) / coeff
            const newLowerBound = (rhs - otherTermsMaxActivity) / coeff;
            if (newLowerBound > variableToBound.lowerBound) {
              variableToBound.lowerBound = newLowerBound;
              reductionFound = true;
              this.stats.tightenedBounds++;
            }
          } else {
            // coeff < 0
            // Novo limite superior: x_j <= (rhs - max_atividade_outros) / coeff
            const newUpperBound = (rhs - otherTermsMaxActivity) / coeff;
            if (newUpperBound < variableToBound.upperBound) {
              variableToBound.upperBound = newUpperBound;
              reductionFound = true;
              this.stats.tightenedBounds++;
            }
          }
        }

        // Verifica se o aperto de limites tornou o problema infactível.
        if (variableToBound.lowerBound > variableToBound.upperBound + 1e-9) {
          throw new Error(
            `Presolve (Bound Tightening): Inviabilidade detectada para a variável '${variableToBound.name}'. Limites [${variableToBound.lowerBound}, ${variableToBound.upperBound}] são inconsistentes.`
          );
        }
      }
    }

    return reductionFound;
  }

  /**
   * **(NOVO) PASSE 6: Fortalecimento de Coeficientes.**
   * Analisa as restrições para apertar os coeficientes com base nos limites
   * das variáveis inteiras. Por exemplo, em '2x + 5y <= 12' com y <= 1 (inteiro),
   * podemos inferir que o máximo que '5y' pode tirar do RHS para 'x' é 5,
   * permitindo um aperto mais forte no limite de 'x'.
   * @returns `true` se algum coeficiente foi fortalecido, `false` caso contrário.
   */
  private strengthenCoefficients(): boolean {
    let reductionFound = false;
    const variableMap = new Map<number, Variable>(
      this.variables.map((v) => [v.id, v])
    );

    for (const constraint of this.constraints) {
      // Esta técnica é mais eficaz em restrições com 2 variáveis onde uma é binária.
      if (constraint.expression.length !== 2) {
        continue;
      }

      const term1 = constraint.expression[0];
      const term2 = constraint.expression[1];
      const var1 = variableMap.get(term1.variable.id);
      const var2 = variableMap.get(term2.variable.id);

      if (!var1 || !var2) continue;

      // Identifica qual termo tem a variável binária e qual tem a contínua/inteira.
      let binaryTerm: Term | null = null;
      let otherTerm: Term | null = null;

      if (
        var1.type === "Integer" &&
        var1.lowerBound === 0 &&
        var1.upperBound === 1
      ) {
        binaryTerm = term1;
        otherTerm = term2;
      } else if (
        var2.type === "Integer" &&
        var2.lowerBound === 0 &&
        var2.upperBound === 1
      ) {
        binaryTerm = term2;
        otherTerm = term1;
      } else {
        continue; // Nenhum dos termos corresponde a uma variável binária.
      }

      const otherVar = variableMap.get(otherTerm.variable.id)!;

      // Padroniza a restrição para a forma: a*y + b*x <= c
      const a = otherTerm.coefficient;
      const b = binaryTerm.coefficient;
      const c = constraint.rhs;

      // CASO 1: Detecta o padrão y - M*x <= 0  (equivalente a y <= M*x)
      // Isso ocorre quando a=1, c=0, e b < 0. O "M" é -b.
      if (
        constraint.sense === "<=" &&
        Math.abs(a - 1) < 1e-9 &&
        Math.abs(c) < 1e-9 &&
        b < 0
      ) {
        const M = -b;
        // O menor M válido é o limite superior da variável 'y'.
        const tightest_M = otherVar.upperBound;

        if (isFinite(tightest_M) && tightest_M < M) {
          // Encontramos um M mais apertado! Substituímos o coeficiente.
          binaryTerm.coefficient = -tightest_M;
          reductionFound = true;
          this.stats.tightenedBounds++; // Reutilizando stat, pois é conceitualmente similar
        }
      }

      // CASO 2: Detecta o padrão y + M*x <= M (equivalente a y <= M*(1-x))
      // Isso ocorre quando a=1, b > 0, e b=c.
      if (
        constraint.sense === "<=" &&
        Math.abs(a - 1) < 1e-9 &&
        b > 0 &&
        Math.abs(b - c) < 1e-9
      ) {
        const M = b;
        const tightest_M = otherVar.upperBound;

        if (isFinite(tightest_M) && tightest_M < M) {
          // Apertamos o M, precisamos ajustar tanto o coeficiente de x quanto o RHS.
          binaryTerm.coefficient = tightest_M;
          constraint.rhs = tightest_M;
          reductionFound = true;
          this.stats.tightenedBounds++;
        }
      }
    }

    return reductionFound;
  }

  /**
   * **(NOVO) PASSE 7: Propagação de Implicações e Cliques.**
   * Analisa restrições envolvendo variáveis binárias para deduzir implicações lógicas
   * (ex: x=1 => y=0) e encontrar "cliques" (conjuntos de variáveis onde no máximo uma
   * pode ser 1, como em x+y+z <= 1). Essas estruturas lógicas são usadas para
   * fixar variáveis ou gerar novas restrições (cortes) que fortalecem o modelo.
   * @returns `true` se alguma nova dedução foi feita, `false` caso contrário.
   */
  private propagateImplications(): boolean {
    let reductionFound = false;
    const variableMap = new Map<number, Variable>(
      this.variables.map((v) => [v.id, v])
    );

    // 1. Encontra todas as restrições que formam uma clique.
    const cliques: Variable[][] = [];
    for (const constraint of this.constraints) {
      // Uma clique candidata tem a forma: sum(x_i) <= 1
      if (constraint.sense !== "<=" || Math.abs(constraint.rhs - 1) > 1e-9) {
        continue;
      }

      let isClique = true;
      const cliqueVars: Variable[] = [];

      // Verifica se todos os termos têm coeficiente 1 e são variáveis binárias.
      for (const term of constraint.expression) {
        const variable = variableMap.get(term.variable.id);
        if (
          !variable ||
          Math.abs(term.coefficient - 1) > 1e-9 ||
          !(
            variable.type === "Integer" &&
            variable.lowerBound === 0 &&
            variable.upperBound === 1
          )
        ) {
          isClique = false;
          break;
        }
        cliqueVars.push(variable);
      }

      if (isClique && cliqueVars.length > 0) {
        cliques.push(cliqueVars);
      }
    }

    if (cliques.length === 0) {
      return false;
    }

    // 2. Propaga as implicações das cliques encontradas.
    for (const clique of cliques) {
      // Conta quantas variáveis na clique já estão fixadas em 1.
      const varsFixedToOne = clique.filter((v) => v.lowerBound === 1);

      if (varsFixedToOne.length > 1) {
        // Se mais de uma variável na clique está fixada em 1, o problema é infactível.
        throw new Error(
          `Presolve (Implicações): Inviabilidade detectada. As variáveis ${varsFixedToOne
            .map((v) => v.name)
            .join(", ")} formam uma clique e não podem ser todas 1.`
        );
      }

      if (varsFixedToOne.length === 1) {
        // Se exatamente uma variável está fixada em 1, todas as outras na clique DEVEM ser 0.
        const fixedVar = varsFixedToOne[0];
        for (const otherVar of clique) {
          if (otherVar.id !== fixedVar.id && otherVar.upperBound !== 0) {
            // Fixa a outra variável em 0.
            otherVar.upperBound = 0;
            reductionFound = true;
            this.stats.probedVars++; // Reutilizando a estatística
          }
        }
      }
    }

    return reductionFound;
  }

  /**
   * **(NOVO) PASSE 8: Geração de Desigualdades de Cobertura (Cover Inequalities).**
   * Identifica restrições do tipo "mochila" (knapsack) com variáveis binárias
   * e gera novas restrições (cortes) que fortalecem a formulação linear
   * sem eliminar nenhuma solução inteira viável.
   * @returns `true` se alguma nova desigualdade foi gerada, `false` caso contrário.
   */
  private generateCoverInequalities(): boolean {
    let reductionFound = false;
    const variableMap = new Map<number, Variable>(
      this.variables.map((v) => [v.id, v])
    );
    const newConstraints: Constraint[] = [];
    let newConstraintCounter = 0;

    for (const constraint of this.constraints) {
      // 1. Verifica se a restrição é uma candidata para "cover inequality".
      // Deve ser do tipo sum(a_i * x_i) <= b, com coeficientes positivos e variáveis binárias.
      if (constraint.sense !== "<=") {
        continue;
      }

      let isKnapsackCandidate = true;
      const knapsackTerms: Term[] = [];

      for (const term of constraint.expression) {
        const variable = variableMap.get(term.variable.id);
        if (
          !variable ||
          term.coefficient <= 0 ||
          !(
            variable.type === "Integer" &&
            variable.lowerBound === 0 &&
            variable.upperBound === 1
          )
        ) {
          isKnapsackCandidate = false;
          break;
        }
        knapsackTerms.push(term);
      }

      if (!isKnapsackCandidate || knapsackTerms.length === 0) {
        continue;
      }

      // 2. Tenta encontrar uma "minimal cover".
      // Uma "cover" é um subconjunto de itens cuja soma dos pesos excede a capacidade.
      const capacity = constraint.rhs;
      const totalWeight = knapsackTerms.reduce(
        (sum, term) => sum + term.coefficient,
        0
      );

      // Se o peso total não excede a capacidade, não há cover a ser encontrada.
      if (totalWeight <= capacity) {
        continue;
      }

      // Heurística simples para encontrar uma cover: ordena por peso e adiciona até exceder.
      const sortedTerms = [...knapsackTerms].sort(
        (a, b) => b.coefficient - a.coefficient
      );

      let currentWeight = 0;
      const cover: Term[] = [];
      for (const term of sortedTerms) {
        if (currentWeight <= capacity) {
          cover.push(term);
          currentWeight += term.coefficient;
        }
      }

      // 3. Verifica se a cover encontrada é "minimal".
      // Se, ao remover o item de menor peso, ainda excedemos a capacidade, a cover não é minimal
      // para esta heurística simples. Lógicas mais complexas poderiam encontrar outras.
      if (cover.length > 0) {
        const smallestItemInCover = cover[cover.length - 1];
        if (currentWeight - smallestItemInCover.coefficient > capacity) {
          // Esta heurística não encontrou uma cover minimal. Pula.
          continue;
        }

        // 4. Gera a nova desigualdade de cobertura.
        // A desigualdade é: sum(x_i for i in C) <= |C| - 1
        const newExpression: Expression = cover.map((term) => ({
          variable: term.variable,
          coefficient: 1,
        }));

        const newConstraint: Constraint = {
          name: `cover_${constraint.name}_${newConstraintCounter++}`,
          expression: newExpression,
          sense: "<=",
          rhs: cover.length - 1,
        };

        newConstraints.push(newConstraint);
        reductionFound = true;
      }
    }

    // 5. Adiciona todas as novas restrições geradas ao modelo.
    if (newConstraints.length > 0) {
      this.constraints.push(...newConstraints);
      // Reutilizando a estatística para indicar que o modelo foi fortalecido
      this.stats.tightenedBounds += newConstraints.length;
    }

    return reductionFound;
  }
}
