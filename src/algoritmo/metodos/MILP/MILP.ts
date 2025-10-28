import Constraint from "@/algoritmo/abstractions/Constraint";
import { OptimizationModel, Variable } from "./optimization_model";
import { ObjectiveFunction } from "@/algoritmo/classes/ObjectiveFunction";

import { ExactAlgorithm } from "@/algoritmo/abstractions/ExactAlgorithm";
import {
  Context,
  HighsSolverResult,
  Solucao,
} from "@/algoritmo/communs/interfaces/interfaces";
import { ObjectiveComponent } from "@/algoritmo/abstractions/ObjectiveComponent";

export interface modelSets {
  D: number[];
  T: number[];
  c: number[];
  s: number[];
  p: number[][];
  m: number[][];
  a: number[][];
  F: [number, number][];
}

export interface modelConsts {
  BigM: number;
  P: (0 | 1)[][];
  omega: (1 | 0.75)[];
  eta: (1 | 0.75)[];
  Pmax: number;
}

export interface modelParamns {
  x: Variable[][];
  u: Variable[];
  v: (Variable | null)[][][];
  z: Variable[];
  w: Variable[];
  b: Variable[][]; // (3) flexível
}

export type modelSCP = modelSets & modelConsts & modelParamns;

export class MILP extends ExactAlgorithm {
  public name: string;

  public model: OptimizationModel;

  public constraints: {
    hard: Map<string, Constraint<any>>;
    soft: Map<string, Constraint<any>>;
  };

  public modelSets: modelSets;

  public modelConsts: modelConsts = {
    BigM: 0,
    eta: [],
    omega: [],
    P: [],
    Pmax: 0,
  };

  public modelParamns: modelParamns = {
    x: undefined,
    u: undefined,
    v: undefined,
    w: undefined,
    z: undefined,
    b: undefined,
  };

  public objectiveFunction: ObjectiveFunction;

  constructor(
    name: string,
    context: Context,
    constraints: Constraint<any>[],
    solution: Solucao | undefined,
    objectiveType: "min" | "max",
    objectiveComponentes: ObjectiveComponent[],
    maiorPrioridade: number | undefined,
    enableStatistics: boolean,

    modelSets: modelSets
  ) {
    super(
      name,
      context,
      constraints,
      solution,
      objectiveType,
      objectiveComponentes,
      maiorPrioridade,
      enableStatistics
    );

    this.name = name;

    this.modelSets = modelSets;

    this.model = new OptimizationModel(name);

    // --- Cálculo de Parâmetros Derivados ---
    this.modelConsts.BigM = this.modelSets.c.reduce((sum, val) => sum + val, 0);
    this.modelConsts.omega = this.modelSets.D.map((i) =>
      this.modelSets.s[i] > 2 ? 0.75 : 1
    );
    this.modelConsts.eta = this.modelSets.D.map((i) =>
      this.modelSets.s[i] < -1 ? 0.75 : 1
    );

    this.modelConsts.Pmax = Math.max(...this.modelSets.p.flat()) + 1;

    this.modelConsts.P = this.modelSets.D.map((i) =>
      this.modelSets.T.map(
        (j) => (this.modelSets.p[i][j] > 0 ? 1 : 0)
        // this.modelSets.p[i][j] !== this.modelConsts.Pmax - 1 ? 1 : 0
      )
    );

    // --- Criação das Variáveis de Decisão ---
    this.modelParamns.x = this.modelSets.D.map((i) =>
      this.modelSets.T.map((j) =>
        this.model.addVariable(`x_${i}_${j}`, { type: "Binary" })
      )
    );

    /**
     * Utilizado caso a restrição (3) atribuição somente com formulário ou trava, seja dada como flexível
     */
    this.modelParamns.b = this.modelSets.D.map((i) =>
      this.modelSets.T.map((j) =>
        this.model.addVariable(`b_${i}_${j}`, { type: "Binary" })
      )
    );

    this.modelParamns.u = this.modelSets.T.map((j) =>
      this.model.addVariable(`u_${j}`, { type: "Binary" })
    );

    this.modelParamns.v = this.modelSets.D.map((i) =>
      this.modelSets.T.map((j) =>
        this.modelSets.T.map((k) => {
          if (this.modelSets.F.some((pair) => pair[0] === j && pair[1] === k)) {
            return this.model.addVariable(`v_${i}_${j}_${k}`, {
              type: "Binary",
            });
          }
          return null;
        })
      )
    );

    this.modelParamns.z = this.modelSets.D.map((i) =>
      this.model.addVariable(`z_${i}`, { type: "Binary" })
    );

    this.modelParamns.w = this.modelSets.D.map((i) =>
      this.model.addVariable(`w_${i}`, { type: "Continuous", lb: 0 })
    );
  }

  /**
   * Implementação do método abstrato de ExactAlgorithm.
   * Itera sobre os componentes e restrições e os adiciona ao modelo.
   */
  protected buildModel(): void {
    // 1. Define o sentido da otimização
    this.model.setObjectiveSense(
      this.objectiveFunction.type === "min" ? "minimize" : "maximize"
    );

    // 2. Adiciona Componentes da Função Objetivo
    for (const component of this.objectiveFunction.components.values()) {
      if (component.isActive && component.milpFormulation) {
        const terms = component.milpFormulation(this.model, {
          ...this.modelSets,
          ...this.modelConsts,
          ...this.modelParamns,
        });

        // Lógica para inverter o sinal se o tipo do componente for
        // oposto ao da função objetivo principal
        const multiplier =
          component.type === this.objectiveFunction.type ? 1 : -1;

        const finalTerms = terms.map((t) => ({
          ...t,
          coefficient: t.coefficient * multiplier,
          // coefficient: t.coefficient * component.multiplier * multiplier,
        }));

        this.model.addObjectiveTerms(finalTerms);
      }
    }

    // 3. Adiciona Restrições Hard
    for (const constraint of this.constraints.hard.values()) {
      if (constraint.isActive && constraint.milpHardFormulation) {
        constraint.milpHardFormulation(this.model, {
          ...this.modelSets,
          ...this.modelConsts,
          ...this.modelParamns,
        });
      }
    }

    // 4. Adiciona Restrições Soft (como penalidades no objetivo)
    for (const constraint of this.constraints.soft.values()) {
      if (constraint.isActive && constraint.milpSoftFormulation) {
        const { objectiveTerms } = constraint.milpSoftFormulation(this.model, {
          ...this.modelSets,
          ...this.modelConsts,
          ...this.modelParamns,
        });

        // Penalidades sempre se opõem ao objetivo principal
        // (ex: se MAX, penalidade é negativa; se MIN, penalidade é positiva)
        const penaltyMultiplier =
          this.objectiveFunction.type === "max" ? -1 : 1;

        const finalPenaltyTerms = objectiveTerms.map((t) => ({
          ...t,
          coefficient: penaltyMultiplier * t.coefficient,
          // coefficient: t.coefficient * constraint.penalty * penaltyMultiplier,
        }));

        this.model.addObjectiveTerms(finalPenaltyTerms);
      }
    }
  }

  /**
   * Implementação da execução do solver
   */
  protected async runSolver(): Promise<HighsSolverResult> {
    const highs_settings = {
      // In node, locateFile is not needed
      // In the browser, point locateFile to the URL of the wasm file (see below)
      locateFile: (file) => "https://lovasoa.github.io/highs-js/" + file,
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const highs_promise = require("highs")(highs_settings);

    const highs = await highs_promise;

    const lpString = this.model.toCplexLpFormat();
    console.log(lpString);
    return highs.solve(lpString, {});
  }
}
