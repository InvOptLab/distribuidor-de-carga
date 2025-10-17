import { ObjectiveComponent } from "../../abstractions/ObjectiveComponent";
import {
  Atribuicao,
  Docente,
  Formulario,
  Disciplina,
} from "../interfaces/interfaces";

/**
 * Este componente da função objetivo visa **minimizar** a heterogeneidade da grade de um docente.
 * A métrica calcula, para cada docente, o número de grupos de disciplinas distintos que ele leciona.
 * A função de custo é a soma dos quadrados do número desses grupos distintos para cada docente.
 * $$min \sum_{d \in Docentes} (p_d)^2$$
 * Onde $p_d$ é o número de grupos de disciplinas distintos para o docente $d$.
 */
export class HeterogeneidadeGrade extends ObjectiveComponent {
  private turmas: Disciplina[];

  constructor(
    name: string,
    isActive: boolean,
    type: "min" | "max", // Geralmente 'min' para este componente
    description: string | undefined,
    multiplier: number | undefined,
    turmas: Disciplina[] // Recebe a lista de turmas para consultar os grupos
  ) {
    super(name, isActive, type, description, multiplier);
    this.turmas = turmas;
  }

  /**
   * Calcula o custo de heterogeneidade da solução.
   * @param atribuicoes - O conjunto de atribuições da solução atual.
   * @param formularios - Formulários (não utilizado neste componente).
   * @param docentes - A lista de todos os docentes.
   * @returns O valor de custo da heterogeneidade.
   */
  calculate(
    atribuicoes: Atribuicao[],
    formularios: Formulario[], // não utilizado
    docentes: Docente[]
  ): number {
    if (!this.isActive) {
      return 0;
    }

    let custoTotal = 0;

    for (const docente of docentes) {
      const atribuicoesDoDocente = atribuicoes.filter((atribuicao) =>
        atribuicao.docentes.includes(docente.nome)
      );

      if (atribuicoesDoDocente.length === 0) {
        continue;
      }

      const gruposDeDisciplinas = new Set<string>();

      for (const atribuicao of atribuicoesDoDocente) {
        const turma = this.turmas.find(
          (t) => t.id === atribuicao.id_disciplina
        );
        // Utiliza o 'grupo' da disciplina. Se não houver, o próprio código da disciplina serve como identificador único.
        if (turma) {
          gruposDeDisciplinas.add(turma.codigo);
        }
      }

      const p_d = gruposDeDisciplinas.size;
      custoTotal += Math.pow(p_d, 2);
    }

    return custoTotal * this.multiplier;
  }
}
