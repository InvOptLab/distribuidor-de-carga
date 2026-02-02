import ObjectiveComponent from "../../abstractions/ObjectiveComponent";
import {
  Atribuicao,
  Disciplina,
  Docente,
  Formulario,
} from "../interfaces/interfaces";
import { modelSCP } from "@/algoritmo/metodos/MILP/MILP";
import {
  OptimizationModel,
  Term,
  Variable,
} from "@/algoritmo/metodos/MILP/optimization_model";
import { LpSum } from "@/algoritmo/metodos/MILP/utils";
import { calcularCargaDidatica } from "../utils";

/**
 * Define a estrutura dos parâmetros para esta classe.
 * O único parâmetro necessário é o K6 (multiplicador), que já é tratado
 * pela classe base via 'multiplier', mas podemos adicionar parâmetros extras se necessário
 * no futuro. Por enquanto, usamos o padrão.
 */
// export type ParametrosDiferencaCarga = ObjectiveComponentParams;

/**
 * Componente de Função Objetivo para "Minimização da Diferença de Carga Didática".
 *
 * Baseado na formulação:
 * 1. Calcula a Carga Média Ideal ($\mu = \sum c_j / |D|$).
 * 2. Introduz variáveis de desvio $\delta_i^+$ (excesso) e $\delta_i^-$ (déficit).
 * 3. Adiciona a restrição de balanço: $\sum (c_j \cdot x_{i,j}) - \delta_i^+ + \delta_i^- = \mu$
 * 4. Penaliza a soma dos desvios na função objetivo: $- K_6 \cdot \sum (\delta_i^+ + \delta_i^-)$
 */
export class MinimizarDiferencaCargaDidatica extends ObjectiveComponent<any> {
  // Variáveis internas para armazenar os desvios gerados no modelo
  private delta_plus: Variable[] = [];
  private delta_minus: Variable[] = [];
  private delta_abs: Variable[] = []; // Variável auxiliar para o desvio absoluto

  constructor(
    name: string,
    isActive: boolean,
    type: "min" | "max", // Geralmente 'min' (ou 'max' com penalidade negativa)
    description: string | undefined,
    multiplier: number | undefined, // Representa o K6
    parametros: undefined, // Sem parâmetros extras por enquanto
  ) {
    super(name, isActive, type, description, multiplier);
    this.params = parametros; // Inicializa vazio se não houver params extras
  }

  /**
   * Implementação do cálculo para heurísticas (Meta-heurísticas).
   * Calcula o desvio absoluto total em relação à média ideal.
   */
  calculate(
    atribuicoes: Atribuicao[],
    formularios: Formulario[],
    docentes: Docente[],
    turmas: Disciplina[],
  ): number {
    // 1. Evitar divisão por zero caso não haja docentes
    if (docentes.length === 0) return 0;

    // 2. Calcular a Carga Média Ideal (mu)
    // Soma a carga de todas as disciplinas disponíveis (ou filtradas, dependendo do contexto)
    const totalCarga = turmas.reduce(
      (acc, turma) => acc + (turma.carga || 0),
      0,
    );
    const L_avg = totalCarga / docentes.length;

    let desvioTotal = 0;

    // 3. Somar os desvios absolutos de cada docente
    for (const docente of docentes) {
      // Calcula a carga atual atribuída ao docente nesta solução
      const cargaDocente = calcularCargaDidatica(docente, atribuicoes, turmas);

      // Soma o módulo da diferença: |CargaAtual - Média|
      desvioTotal += Math.abs(cargaDocente - L_avg);
    }

    return desvioTotal;
  }

  /**
   * Formulação para o Modelo Matemático (MILP).
   * Implementa as Equações (25), (26) e o termo correspondente em (27).
   */
  milpFormulation(model: OptimizationModel, modelData: modelSCP): Term[] {
    const objectiveTerms: Term[] = [];

    // 1. Calcular a "Carga Média Ideal" ($\mu$) - Eq. (25)
    // $\mu = \frac{\sum_{j \in T} c_j}{|D|}$
    const totalCreditos = modelData.c.reduce((sum, carga) => sum + carga, 0);
    const numDocentes = modelData.D.length;

    // Evita divisão por zero
    const mu = numDocentes > 0 ? totalCreditos / numDocentes : 0;

    // Limpa vetores locais
    this.delta_plus = [];
    this.delta_minus = [];
    this.delta_abs = [];

    // 2. Criar as variáveis de desvio para cada docente
    for (const i of modelData.D) {
      // $\delta_i^+$: Desvio acima da média (Excesso)
      const d_plus = model.addVariable(`delta_plus_${i}`, {
        type: "Continuous",
        lb: 0, // $\ge 0$
      });
      this.delta_plus.push(d_plus);

      // $\delta_i^-$: Desvio abaixo da média (Déficit)
      const d_minus = model.addVariable(`delta_minus_${i}`, {
        type: "Continuous",
        lb: 0, // $\ge 0$
      });
      this.delta_minus.push(d_minus);

      // * $\delta_i^{abs}$: Desvio Absoluto (Soma dos desvios)
      // Esta variável representa "d_plus[i] + d_minus[i]" como uma entidade única
      const d_abs = model.addVariable(`delta_abs_${i}`, {
        type: "Continuous",
        lb: 0,
      });
      this.delta_abs.push(d_abs);

      // * Adiciona restrição de definição: d_plus + d_minus - d_abs = 0
      // Isso garante que d_abs seja exatamente a soma dos dois.
      model.addConstraint(
        `def_delta_abs_${i}`,
        LpSum([
          { variable: d_plus, coefficient: 1 },
          { variable: d_minus, coefficient: 1 },
          { variable: d_abs, coefficient: -1 },
        ]),
        "==",
        0,
      );

      // 3. Adicionar termos à função objetivo
      // Agora adicionamos APENAS a variável d_abs, que encapsula a soma.
      objectiveTerms.push({
        variable: d_abs,
        coefficient: this.multiplier,
      });
    }

    // 4. Adicionar a restrição de balanço para cada docente - Eq. (26)
    // $\sum_{j \in T} (c_j \cdot x_{i,j}) - \delta_i^+ + \delta_i^- = \mu$

    for (const i of modelData.D) {
      const terms: Term[] = [];

      // Termo do somatório da carga real: $\sum (c_j \cdot x_{i,j})$
      for (const j of modelData.T) {
        terms.push({
          variable: modelData.x[i][j],
          coefficient: modelData.c[j],
        });
      }

      // Termo $-\delta_i^+$
      terms.push({
        variable: this.delta_plus[i],
        coefficient: -1,
      });

      // Termo $+\delta_i^-$
      terms.push({
        variable: this.delta_minus[i],
        coefficient: 1,
      });

      // Adiciona a restrição de igualdade ao modelo
      model.addConstraint(
        `balanco_media_carga_${i}`,
        LpSum(terms),
        "==",
        mu, // Lado direito é a constante $\mu$
      );
    }

    return objectiveTerms;
  }
}
