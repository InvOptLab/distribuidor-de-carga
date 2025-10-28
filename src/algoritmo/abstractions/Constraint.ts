import {
  Atribuicao,
  Celula,
  ConstraintParams,
  Disciplina,
  Docente,
} from "../communs/interfaces/interfaces";
import { modelSCP } from "../metodos/MILP/MILP";
import { OptimizationModel, Term } from "../metodos/MILP/optimization_model";

export interface ConstraintInterface {
  name: string;
  tipo: "Hard" | "Soft";
  penalidade: string;
  descricao: string;
  constraint: new (...args: any[]) => Constraint<any>;
}

/**
 * Classe que será tomada como base para qualquer restrição que for criada para qualquer método dentro do sistema.
 * Ela obrigará que todas as informações e métodos basicos sejam criados.
 *
 * A ideia é que possamos escolher qual será o comportamento da restrição, podendo ser alterado.
 */
export default abstract class Constraint<T extends ConstraintParams[] | any> {
  /**
   * Propriedades
   */

  /**
   * Nome dado a resttição
   */
  readonly name: string;

  /**
   * Detalhes sobre a restrição
   */
  description: string;

  /**
   * Se `true` o comportamento selecionado deve ser this.hard(), caso contrário this.soft().
   */
  isHard: boolean;

  /**
   * Penalidade que será atribuída a função `soft`
   */
  penalty: number;

  /**
   * Indica se a restrição está ativa
   */
  isActive: boolean;

  public params: T;

  /**
   * Construtor
   */
  constructor(
    name: string,
    description: string,
    isHard: boolean,
    penalty: number,
    isActive: boolean = true
  ) {
    this.name = name;
    this.description = description;

    this.isHard = isHard;
    this.penalty = penalty;
    this.isActive = isActive;
  }

  /**
   * Métodos
   */
  soft?(
    atribuicoes?: Atribuicao[],
    docentes?: Docente[],
    disciplinas?: Disciplina[],
    travas?: Celula[]
  ): number;
  hard?(
    atribuicoes?: Atribuicao[],
    docentes?: Docente[],
    disciplinasAtribuidas?: Disciplina[],
    travas?: Celula[],
    disciplinas?: Disciplina[]
  ): boolean;

  abstract toObject(): ConstraintInterface;

  /**
   * Método responsável por retornar a quantidade de vezes que a restrição é quebrada em um conjunto
   * de atribuições.
   * Uma forma simples de implementar esse método é chamar o método `this.soft` e dividir o resultado
   * pelo valor da penalidade `this.penalty`, resultando em exatamenta a quantidade de vezes que
   * a restrição foi quebrada.
   * **Vale ressaltar que para essa ideia funcionar, o valhor de `this.penalty` deve ser diferente de 0.**
   * @example
   *  return this.soft(atribuicoes) / this.penalty
   * @returns {Array<string, number} Quantidade de vezes que a restrição foi quebrada com um
   * título para representa-lo.
   * @example
   * return [{label: docentes, qtd: 5}, {label: turmas, qtd: 1]
   */
  occurrences?(
    atribuicoes: Atribuicao[],
    docentes?: Docente[],
    disciplinas?: Disciplina[],
    travas?: Celula[]
  ): { label: string; qtd: number }[];

  /**
   * (NOVO) Método para formulação de restrições HARD no MILP.
   * Adiciona restrições diretamente ao modelo.
   */
  milpHardFormulation?(model: OptimizationModel, modelData: modelSCP): void;

  /**
   * (NOVO) Método para formulação de restrições SOFT no MILP.
   * Retorna termos para a função objetivo e, opcionalmente,
   * novas restrições (ex: para definir variáveis de penalidade).
   */
  milpSoftFormulation?(
    model: OptimizationModel,
    modelData: modelSCP
  ): {
    objectiveTerms: Term[];
  };
}
