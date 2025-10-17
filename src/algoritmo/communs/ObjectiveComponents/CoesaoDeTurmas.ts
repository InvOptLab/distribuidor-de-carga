import { ObjectiveComponent } from "../../abstractions/ObjectiveComponent";
import {
  Atribuicao,
  Docente,
  Formulario,
  Disciplina,
} from "../interfaces/interfaces";

/**
 * Este componente da função objetivo visa **maximizar** a coesão das atribuições.
 * O objetivo é incentivar que todas as turmas de uma mesma disciplina (mesmo código)
 * sejam atribuídas a um único docente.
 *
 * A penalidade é calculada para cada disciplina que tem suas turmas divididas
 * entre múltiplos docentes. A fórmula para cada docente envolvido é:
 * (qtd de turmas que o docente possui) - (total de turmas da disciplina)
 *
 * O valor ideal para a função é 0. Valores negativos representam uma penalidade.
 */
export class CoesaoDeTurmas extends ObjectiveComponent {
  /**
   * Mapeia um código de disciplina para o número total de turmas existentes.
   * Ex: 'SME0110' -> 3
   */
  private turmasPorCodigo: Map<string, number>;

  /**
   * Armazena a lista de turmas para consulta interna.
   */
  private turmas: Disciplina[];

  constructor(
    name: string,
    isActive: boolean,
    type: "min" | "max", // Deve ser 'max' para a lógica de penalidade negativa
    description: string | undefined,
    multiplier: number | undefined,
    turmas: Disciplina[] // Recebe a lista de turmas para o pré-processamento
  ) {
    super(name, isActive, type, description, multiplier);
    this.turmas = turmas;
    this.turmasPorCodigo = new Map<string, number>();
    this.mapearTurmasPorCodigo();
  }

  /**
   * Método privado chamado no construtor para pré-calcular
   * a quantidade total de turmas para cada código de disciplina.
   */
  private mapearTurmasPorCodigo(): void {
    for (const turma of this.turmas) {
      const count = this.turmasPorCodigo.get(turma.codigo) || 0;
      this.turmasPorCodigo.set(turma.codigo, count + 1);
    }
  }

  /**
   * Calcula o custo de coesão da solução.
   * @param atribuicoes - O conjunto de atribuições da solução atual.
   * @param formularios - Formulários (não utilizado neste componente).
   * @param docentes - A lista de todos os docentes (não utilizado diretamente).
   * @returns O valor da função objetivo para este componente.
   */
  calculate(
    atribuicoes: Atribuicao[],
    formularios: Formulario[],
    docentes: Docente[]
  ): number {
    if (!this.isActive) {
      return 0;
    }

    // Estrutura para contar as atribuições: Map<código, Map<docente, contagem>>
    const distribuicao = new Map<string, Map<string, number>>();

    // 1. Contabiliza quantas turmas de cada disciplina cada docente possui
    for (const atribuicao of atribuicoes) {
      if (atribuicao.docentes.length === 0) continue;

      const turma = this.turmas.find((t) => t.id === atribuicao.id_disciplina);
      if (!turma) continue;

      const codigo = turma.codigo;
      const docente = atribuicao.docentes[0]; // Assumindo um docente por turma

      if (!distribuicao.has(codigo)) {
        distribuicao.set(codigo, new Map<string, number>());
      }
      const docentesNaDisciplina = distribuicao.get(codigo);
      const count = docentesNaDisciplina.get(docente) || 0;
      docentesNaDisciplina.set(docente, count + 1);
    }

    let valorObjetivo = 0;

    // 2. Calcula a penalidade baseada na distribuição
    for (const [codigo, docentesAtribuidos] of distribuicao.entries()) {
      const totalTurmas = this.turmasPorCodigo.get(codigo);

      // Só há penalidade se as turmas estiverem divididas entre mais de um docente
      if (docentesAtribuidos.size > 1 && this.turmasPorCodigo.get(codigo) > 1) {
        for (const [docente, count] of docentesAtribuidos.entries()) {
          // Aplica a fórmula: (atribuições do docente) - (total de turmas)
          // Ex: José tem 2 de 3 turmas -> 2 - 3 = -1 de penalidade
          //     Maria tem 1 de 3 turmas -> 1 - 3 = -2 de penalidade
          // O total para a disciplina SME0110 seria -3. O ideal é 0.
          valorObjetivo += count - totalTurmas;
        }
      }
    }

    return valorObjetivo * this.multiplier;
  }
}
