import ObjectiveComponent from "@/algoritmo/abstractions/ObjectiveComponent";
import {
  Atribuicao,
  Formulario,
  Docente,
  Disciplina,
} from "../interfaces/interfaces";
import { calcularCargaDidatica } from "../utils";
import { modelSCP } from "@/algoritmo/metodos/MILP/MILP";
import {
  OptimizationModel,
  Term,
  Variable,
} from "@/algoritmo/metodos/MILP/optimization_model";
import { LpSum } from "@/algoritmo/metodos/MILP/utils";

// export type MetaDeCargaDidatica = {
//   metaCarga: IParameter<number>;
// };

// type constructorMetaDeCargaDidatica = {
//   metaCarga: number;
// };

export class MinimizarDiferencaSaldos extends ObjectiveComponent<null> {
  // Variáveis para armazenar os desvios (precisam ser acessadas internamente)
  private s_plus: Variable[] = [];
  private s_minus: Variable[] = [];

  constructor(
    name: string,
    isActive: boolean,
    type: "min" | "max",
    description: string | undefined,
    multiplier: number | undefined,
    parametros: null
  ) {
    super(name, isActive, type, description, multiplier);

    // this.params = {
    //   metaCarga: {
    //     value: parametros.metaCarga,
    //     name: "Carga didática média.",
    //     description:
    //       "Carga didática média que será utilizada como base para calcular os desvios das cargas atribuídas aos docentes.",
    //   },
    // };

    this.params = parametros;
  }

  calculate(
    atribuicoes: Atribuicao[],
    formularios: Formulario[],
    docentes?: Docente[],
    turmas?: Disciplina[]
  ): number {
    /**
     * Para a formulação Heurística, podemos utilizar a formulação
     * min Z_2 = ∑_{i∈D} |s′i| = ∑_{i∈D} |si + ∑_{j∈T} cj · x_{i,j} − L_{avg}|
     */
    const L_avg = turmas
      .map((turma) => turma.carga)
      .reduce((acc, carga) => acc + carga, 0);

    let custo = 0;
    for (const docente of docentes) {
      custo += Math.abs(
        docente.saldo +
          calcularCargaDidatica(docente, atribuicoes, turmas) -
          L_avg
      );
    }
    return custo;
  }

  /**
   * Adiciona as variáveis de desvio e as restrições de definição ao modelo
   * e retorna os termos de desvio para a função objetivo.
   */
  milpFormulation(model: OptimizationModel, modelData: modelSCP): Term[] {
    const objectiveTerms: Term[] = [];

    // Calcular o parâmetro L_avg
    const totalCarga = modelData.c.reduce((acc, carga) => acc + carga, 0);
    // Garante que não haja divisão por zero
    const L_avg = modelData.D.length > 0 ? totalCarga / modelData.D.length : 0;

    // Criar as novas variáveis de desvio (s_i^+ e s_i^-)
    // Limpa arrays caso milpFormulation seja chamado múltiplas vezes
    this.s_plus = [];
    this.s_minus = [];

    for (const i of modelData.D) {
      // s_i^+ >= 0 (Contínua)
      const s_p = model.addVariable(`s_plus_${i}`, {
        type: "Continuous",
        lb: 0,
      });
      this.s_plus.push(s_p);

      // s_i^- >= 0 (Contínua)
      const s_m = model.addVariable(`s_minus_${i}`, {
        type: "Continuous",
        lb: 0,
      });
      this.s_minus.push(s_m);

      // Adicionar os termos de desvio à função objetivo
      // (minimizar a soma dos desvios)
      // O multiplicador do componente é aplicado aqui, seguindo o padrão
      // de 'PrioridadesDefault'
      objectiveTerms.push({ variable: s_p, coefficient: this.multiplier });
      objectiveTerms.push({ variable: s_m, coefficient: this.multiplier });
    }

    // Adicionar a restrição de definição ao modelo
    // s_i + \sum(c_j * x_ij) - L_avg = s_i^+ - s_i^-
    // Rearranjando: \sum(c_j * x_ij) - s_i^+ + s_i^- = L_avg - s_i
    for (const i of modelData.D) {
      // Lado Esquerdo (LHS): \sum(c_j * x_ij) - s_i^+ + s_i^-
      const lhsTerms: Term[] = [];

      // Termo: \sum(c_j * x_ij)
      for (const j of modelData.T) {
        lhsTerms.push({
          variable: modelData.x[i][j],
          coefficient: modelData.c[j],
        });
      }

      // Termo: -s_i^+
      lhsTerms.push({
        variable: this.s_plus[i], // Acessa a variável criada
        coefficient: -1,
      });

      // Termo: +s_i^-
      lhsTerms.push({
        variable: this.s_minus[i], // Acessa a variável criada
        coefficient: 1,
      });

      // Lado Direito (RHS): L_avg - s_i
      const rhs = L_avg - modelData.s[i];

      // Adiciona a restrição de igualdade
      model.addConstraint(`def_desvio_carga_${i}`, LpSum(lhsTerms), "==", rhs);
    }

    // Retorna os termos para a função objetivo
    return objectiveTerms;
  }
}
