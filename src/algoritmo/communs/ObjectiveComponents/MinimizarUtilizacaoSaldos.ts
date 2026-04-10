import ObjectiveComponent from "@/algoritmo/abstractions/ObjectiveComponent";
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
} from "@/algoritmo/metodos/MILP/optimization_model";

export class MinimizarUtilizacaoSaldos extends ObjectiveComponent<null> {
  constructor(
    name: string,
    isActive: boolean,
    type: "min" | "max",
    description: string | undefined,
    multiplier: number | undefined,
    parametros: null,
  ) {
    super(name, isActive, type, description, multiplier);
    this.params = parametros;
  }

  /**
   * Calcula o custo heurístico da função objetivo.
   * Custo = Soma(Saldo_Docente * Carga_Disciplina) para todas as atribuições.
   *
   * @param atribuicoes Conjunto que representa os docentes atribuídos as turmas.
   * @param formularios Conjunto contendo as prioridades (não utilizado nesta componente, mas mantido pela assinatura).
   * @param docentes Lista de docentes para consulta de saldo.
   * @param turmas Lista de disciplinas para consulta de carga.
   */
  calculate(
    atribuicoes: Atribuicao[],
    formularios: Formulario[],
    docentes: Docente[],
    turmas: Disciplina[],
  ): number {
    let custo = 0;

    // Criar mapas para acesso rápido por ID/Nome
    // Assumindo que 'nome' é a chave única para docentes conforme padrão do projeto
    const docentesMap = new Map<string, Docente>();
    docentes.forEach((d) => docentesMap.set(d.nome, d));

    const turmasMap = new Map<string, Disciplina>();
    turmas.forEach((t) => turmasMap.set(t.id, t));

    for (const atribuicao of atribuicoes) {
      const turma = turmasMap.get(atribuicao.id_disciplina);

      // Se a turma não for encontrada ou não tiver carga definida, ignoramos
      if (!turma || turma.carga === undefined) continue;

      for (const docenteNome of atribuicao.docentes) {
        const docente = docentesMap.get(docenteNome);

        // Se o docente existir e tiver saldo
        if (docente && docente.saldo !== undefined) {
          custo += docente.saldo * turma.carga;
        }
      }
    }

    return custo;
  }

  /**
   * Formulação MILP para a função objetivo.
   * Adiciona termos à função objetivo global: K * s_i * c_j * x_ij
   * Onde:
   * K = Multiplier
   * s_i = Saldo do docente i
   * c_j = Carga da turma j
   * x_ij = Variável binária de atribuição
   */
  milpFormulation(model: OptimizationModel, modelData: modelSCP): Term[] {
    const objectiveTerms: Term[] = [];

    // Itera sobre todos os docentes (i)
    for (const i of modelData.D) {
      const saldo = modelData.s[i];

      // Itera sobre todas as turmas (j)
      for (const j of modelData.T) {
        const carga = modelData.c[j];

        // Coeficiente = K * s_i * c_j
        const coefficient = this.multiplier * saldo * carga;

        // Se o coeficiente for diferente de zero, adicionamos o termo
        if (coefficient !== 0) {
          objectiveTerms.push({
            variable: modelData.x[i][j],
            coefficient: coefficient,
          });
        }
      }
    }

    return objectiveTerms;
  }
}
