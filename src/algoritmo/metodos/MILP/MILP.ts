import Constraint from "@/algoritmo/abstractions/Constraint";
import { OptimizationModel, Term, Variable } from "./optimization_model";
import { ObjectiveFunction } from "@/algoritmo/classes/ObjectiveFunction";

import { LpSum } from "./utils";

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
}

export interface modelParamns {
  x: Variable[][];
  u: Variable[];
  v: (Variable | null)[][][];
  z: Variable[];
  w: Variable[];
}

export type modelSCP = modelSets & modelConsts & modelParamns;

export class MILP {
  public name: string;

  public model: OptimizationModel;

  public constraints: {
    hard: Map<string, Constraint<any>>;
    soft: Map<string, Constraint<any>>;
  };

  public modelSets: modelSets;

  public modelConsts: modelConsts = { BigM: 0, eta: [], omega: [], P: [] };

  public modelParamns: modelParamns = {
    x: undefined,
    u: undefined,
    v: undefined,
    w: undefined,
    z: undefined,
  };

  public objectiveFunction: ObjectiveFunction;

  constructor(name: string, modelSets: modelSets) {
    this.name = name;

    this.modelSets = modelSets;

    this.model = new OptimizationModel(name);

    // --- Cálculo de Parâmetros Derivados ---
    this.modelConsts.P = this.modelSets.D.map((i) =>
      this.modelSets.T.map((j) => (this.modelSets.p[i][j] > 0 ? 1 : 0))
    );
    this.modelConsts.BigM = this.modelSets.c.reduce((sum, val) => sum + val, 0);
    this.modelConsts.omega = this.modelSets.D.map((i) =>
      this.modelSets.s[i] > 2 ? 0.75 : 1
    );
    this.modelConsts.eta = this.modelSets.D.map((i) =>
      this.modelSets.s[i] < -1 ? 0.75 : 1
    );

    // --- Criação das Variáveis de Decisão ---
    this.modelParamns.x = this.modelSets.D.map((i) =>
      this.modelSets.T.map((j) =>
        this.model.addVariable(`x_${i}_${j}`, { type: "Binary" })
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
    // --- Fim Criação das Variáveis de Decisão ---

    const L_sup = 2;
    const L_inf = 1;
    // 3. Multiplicadores da Função Objetivo
    const K = { K1: 1000, K2: 1000000, K3: 100000, K4: 10000, K5: 10000 };

    const Pmax = Math.max(...this.modelSets.p.flat()) + 1;

    // --- Definição da Função Objetivo ---
    const objectiveTerms: Term[] = [];
    this.modelSets.D.forEach((i) =>
      this.modelSets.T.forEach((j) => {
        if (this.modelSets.p[i][j] > 0)
          objectiveTerms.push({
            variable: this.modelParamns.x[i][j],
            coefficient: K.K1 * (Pmax - this.modelSets.p[i][j]),
          });
      })
    );

    this.modelParamns.u.forEach((u_j) =>
      objectiveTerms.push({ variable: u_j, coefficient: -K.K2 })
    );
    this.modelSets.D.forEach((i) =>
      this.modelSets.F.forEach(([j, k]) => {
        const v_ijk = this.modelParamns.v[i][j][k];
        if (v_ijk) objectiveTerms.push({ variable: v_ijk, coefficient: -K.K3 });
      })
    );
    this.modelParamns.z.forEach((z_i, i) =>
      objectiveTerms.push({
        variable: z_i,
        coefficient: -K.K4 * this.modelConsts.omega[i],
      })
    );
    this.modelParamns.w.forEach((w_i, i) =>
      objectiveTerms.push({
        variable: w_i,
        coefficient: -K.K5 * this.modelConsts.eta[i],
      })
    );
    this.model.setObjective("maximize", LpSum(objectiveTerms));
    console.log("Função objetivo definida.");

    this.modelSets.D.forEach((i) =>
      this.modelSets.T.forEach((j) => {
        this.model.addConstraint(
          `prioridade_definida_${i}_${j}`,
          LpSum([this.modelParamns.x[i][j]]),
          "<=",
          this.modelConsts.P[i][j] + this.modelSets.m[i][j]
        );
      })
    );
    this.modelSets.D.forEach((i) =>
      this.modelSets.T.forEach((j) => {
        if (this.modelSets.m[i][j] == 1) {
          this.model.addConstraint(
            `trava_${i}_${j}`,
            LpSum([this.modelParamns.x[i][j]]),
            "==",
            this.modelSets.a[i][j]
          );
        }
      })
    );

    this.modelSets.T.forEach((j) => {
      const lhs = this.modelSets.D.map((i) => this.modelParamns.x[i][j]);
      lhs.push(this.modelParamns.u[j]);
      this.model.addConstraint(`cobertura_turma_${j}`, LpSum(lhs), "==", 1);
    });

    this.modelSets.D.forEach((i) =>
      this.modelSets.F.forEach(([j, k]) => {
        const v_ijk = this.modelParamns.v[i][j][k]!;
        const lhs = LpSum([
          { variable: this.modelParamns.x[i][j], coefficient: 1 },
          { variable: this.modelParamns.x[i][k], coefficient: 1 },
          { variable: v_ijk, coefficient: -1 },
        ]);
        this.model.addConstraint(
          `conflito_horario_${i}_${j}_${k}`,
          lhs,
          "<=",
          1
        );
      })
    );

    // (8) Carga de trabalho Mínima (Restrição Flexível)
    this.modelSets.D.forEach((i) => {
      const terms = this.modelSets.T.map((j) => ({
        variable: this.modelParamns.x[i][j],
        coefficient: this.modelSets.c[j],
      }));
      terms.push({
        variable: this.modelParamns.z[i],
        coefficient: this.modelConsts.BigM,
      });
      this.model.addConstraint(`carga_minima_${i}`, LpSum(terms), ">=", L_inf);
    });

    // (9) Carga de trabalho Máxima (Restrição Flexível)
    this.modelSets.D.forEach((i) => {
      // Cria o somatório: Σ c_j * x_i,j
      const terms = this.modelSets.T.map((j) => ({
        variable: this.modelParamns.x[i][j],
        coefficient: this.modelSets.c[j],
      }));

      // Adiciona o termo -w_i (antes era -BigM * w_i)
      terms.push({ variable: this.modelParamns.w[i], coefficient: -1 });

      // Adiciona a restrição: (Σ c_j * x_i,j) - w_i <= L_sup
      this.model.addConstraint(`carga_maxima_${i}`, LpSum(terms), "<=", L_sup);
    });
  }

  async execute() {
    const highs_settings = {
      // In node, locateFile is not needed
      // In the browser, point locateFile to the URL of the wasm file (see below)
      locateFile: (file) => "https://lovasoa.github.io/highs-js/" + file,
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const highs_promise = require("highs")(highs_settings);

    const highs = await highs_promise;

    const solution = highs.solve(this.model.toCplexLpFormat(), {});

    return solution;
  }
}
