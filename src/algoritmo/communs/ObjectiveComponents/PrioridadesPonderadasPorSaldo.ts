import ObjectiveComponent from "@/algoritmo/abstractions/ObjectiveComponent";
import {
  Atribuicao,
  Docente,
  Formulario,
  IParameter,
  ObjectiveComponentParams,
} from "../interfaces/interfaces";
import { modelSCP } from "@/algoritmo/metodos/MILP/MILP";
import {
  OptimizationModel,
  Term,
} from "@/algoritmo/metodos/MILP/optimization_model";

/**
 * Define a estrutura dos parâmetros para esta classe.
 */
export type ParametrosSaldoPonderado = ObjectiveComponentParams & {
  alpha: IParameter<number>;
  //   limiteInferiorSaldo: IParameter<number>;
  //   limiteSuperiorSaldo: IParameter<number>;
};

/**
 * Define o formato dos parâmetros esperados pelo construtor.
 */
type constructorParametrosSaldoPonderado = {
  alpha?: number; // Opcional para usar o padrão
  //   limiteInferiorSaldo?: number; // Opcional para usar o padrão
  //   limiteSuperiorSaldo?: number; // Opcional para usar o padrão
};

/**
 * Componente de Função Objetivo que implementa a lógica de "Refinamento do Modelo:
 * Ponderação pelo Saldo Efetivo".
 *
 * Este componente substitui o cálculo de prioridade padrão (como em
 * PrioridadesDefault) para incorporar um "Fator de Mérito" (M_i)
 * baseado no saldo do docente ($s_i$).
 *
 * A lógica é:
 * 1. Calcular um Saldo Efetivo ($s_i'$) que ignora a "zona neutra" (Essa implementação será mantida comentada devido a possibilidade
 * de ser utilizada no futuro, mas estamos utilizando o saldo do docente sem modificações).
 * $s_i' = \max(0, s_i - L_{\text{sup\_saldo}}) + \min(0, s_i - L_{\text{inf\_saldo}})$
 *
 * 2. Calcular o Fator de Mérito ($M_i$).
 * $M_i = 1 + (\alpha \cdot s_i')$
 *
 * 3. A função objetivo torna-se:
 * $\max \sum_{i \in D} \sum_{j \in T} (M_i \cdot p_{i,j}) \cdot x_{i,j}$
 *
 * Onde $p_{i,j}$ é o valor da prioridade invertida (ex: $P_{max} - \text{prioridade}$).
 */
export class PrioridadesPonderadasPorSaldo extends ObjectiveComponent<ParametrosSaldoPonderado> {
  /**
   * Representa a maior prioridade encontrada no conjunto dos formulários.
   * Utilizada para "inverter" os valores das prioridades.
   */
  public maiorPrioridade: number | undefined;

  constructor(
    name: string,
    isActive: boolean,
    type: "min" | "max", // Geralmente 'max' para este componente
    description: string | undefined,
    multiplier: number | undefined,
    maiorPrioridade: number | undefined,
    // --- Parâmetros Específicos ---
    parametros: constructorParametrosSaldoPonderado | undefined
  ) {
    super(name, isActive, type, description, multiplier);

    this.maiorPrioridade = maiorPrioridade;

    // (Preencher o objeto 'this.params'
    const defaultAlpha = 0.1;
    // const defaultLInf = -1;
    // const defaultLSup = 2;

    this.params = {
      alpha: {
        value: parametros?.alpha ?? defaultAlpha,
        name: "Sensibilidade (alpha)",
        description: "Parâmetro de sensibilidade da ponderação pelo saldo.",
      },
      //   limiteInferiorSaldo: {
      //     value: parametros?.limiteInferiorSaldo ?? defaultLInf,
      //     name: "L_inf_saldo",
      //     description: "Limite inferior da zona neutra de saldo (ex: -1).",
      //   },
      //   limiteSuperiorSaldo: {
      //     value: parametros?.limiteSuperiorSaldo ?? defaultLSup,
      //     name: "L_sup_saldo",
      //     description: "Limite superior da zona neutra de saldo (ex: 2).",
      //   },
    };
  }

  /**
   * (Helper) Encontra e define a maior prioridade com base nos formulários.
   * Copiado de PrioridadesDefault.
   * [c: algoritmo/communs/ObjectiveComponents/PrioridadesDefault.ts, line 41]
   */
  setMaiorPrioridade(formularios: Formulario[]): number {
    this.maiorPrioridade = 0;

    for (const formulario of formularios) {
      if (formulario.prioridade > this.maiorPrioridade) {
        this.maiorPrioridade = formulario.prioridade;
      }
    }
    // Adiciona 1 para que a prioridade 0 (sem formulário) tenha um valor
    this.maiorPrioridade = this.maiorPrioridade + 1;

    return this.maiorPrioridade;
  }

  /**
   * (Helper) Calcula o Fator de Mérito (M_i) para um único docente.
   * @param s_i O saldo (s_i) do docente.
   * @returns O Fator de Mérito (M_i).
   */
  private calcularFatorDeMerito(s_i: number): number {
    // 1. Calcular Saldo Efetivo (s_i') - Eq. \ref{eq:saldo_efetivo}
    // s_i' = max(0, s_i - 2) + min(0, s_i + 1)
    // const desvioPositivo = Math.max(
    //   0,
    //   s_i - this.params.limiteSuperiorSaldo.value
    // );
    // const desvioNegativo = Math.min(
    //   0,
    //   s_i - this.params.limiteInferiorSaldo.value
    // );
    // const s_efetivo = desvioPositivo + desvioNegativo;

    // 2. Calcular Fator de Mérito (M_i) - Eq. \ref{eq:fator_merito}
    // M_i = 1 + (alpha * s_i')
    // const M_i = 1 + this.params.alpha.value * s_efetivo;
    const M_i = 1 + this.params.alpha.value * s_i;

    return M_i;
  }

  /**
   * Calcula o valor da função objetivo ponderada para heurísticas.
   * Implementa a Eq. \ref{eq:fo_refinada}.
   */
  calculate(
    atribuicoes: Atribuicao[],
    formularios: Formulario[],
    docentes: Docente[]
  ): number {
    // 1. Garante que 'maiorPrioridade' esteja definido
    if (!this.maiorPrioridade) {
      this.setMaiorPrioridade(formularios);
    }

    // 2. Pré-calcula o Fator de Mérito (M_i) para todos os docentes
    const fatoresDeMerito = new Map<string, number>();
    for (const docente of docentes) {
      // Usa o saldo do docente (s_i), com 0 como padrão se não for fornecido
      const s_i = docente.saldo ?? 0;
      const M_i = this.calcularFatorDeMerito(s_i);
      fatoresDeMerito.set(docente.nome, M_i);
    }

    // 3. Calcula o custo total
    let custo = 0;
    for (const atribuicao of atribuicoes) {
      for (const docenteAtribuido of atribuicao.docentes) {
        const docente = docentes.find((d) => d.nome === docenteAtribuido);
        if (!docente) continue;

        const prioridade = docente.formularios.get(atribuicao.id_disciplina);

        if (prioridade) {
          // Obtém M_i e p_ij
          const M_i = fatoresDeMerito.get(docente.nome) ?? 1.0;
          const p_ij = this.maiorPrioridade - prioridade; // Inverte a prioridade

          // Custo = M_i * p_ij
          custo += M_i * p_ij;
        }
        // Se não há prioridade (prioridade 0), p_ij = 0, então o custo é 0.
      }
    }

    // 4. Retorna o custo final aplicado o multiplicador do componente
    return custo * this.multiplier;
  }

  /**
   * Gera os termos da função objetivo para o modelo MILP.
   * Implementa a Eq. \ref{eq:fo_refinada}.
   */
  milpFormulation(model: OptimizationModel, modelData: modelSCP): Term[] {
    const objectiveTerms: Term[] = [];

    // 1. Pré-calcula o Fator de Mérito (M_i) para todos os docentes
    //    usando os dados do modelData.
    const fatoresDeMerito: number[] = [];
    for (const i of modelData.D) {
      const s_i = modelData.s[i]; // $s_i$
      const M_i = this.calcularFatorDeMerito(s_i);
      fatoresDeMerito[i] = M_i;
    }

    // 2. Gera os termos: (M_i * p_ij) * x_ij
    for (const i of modelData.D) {
      const M_i = fatoresDeMerito[i]; // Fator de Mérito do docente i

      for (const j of modelData.T) {
        // Obtém a prioridade original (ex: 1, 2, 3...)
        const prioridade_original = modelData.p[i][j];

        // Calcula p_ij (o valor invertido), igual ao PrioridadesDefault
        const p_ij =
          prioridade_original > 0 ? modelData.Pmax - prioridade_original : 0;

        // O coeficiente final é (M_i * p_ij)
        // const coeff = M_i * p_ij; // Arredondado para comparar com o Gurobi (arredonda para cima)

        objectiveTerms.push({
          variable: modelData.x[i][j], // $x_{i,j}$
          coefficient: M_i * p_ij * this.multiplier, // Aplica o multiplicador global
          // coefficient: Math.floor(coeff * this.multiplier), // Aplica o multiplicador global
        });
      }
    }

    return objectiveTerms;
  }
}
