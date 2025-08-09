import { Estatisticas, Solucao } from "@/context/Global/utils";
import Constraint from "../Constraint";

/**
 * Criar uma classe para o algoritmo
 */
export default abstract class Algorithm {
  /**
   * Propriedades
   */

  /**
   * Nome do algoritmo
   */
  name: string;

  /**
   * Indica se as estatísticas devem ser calculadas
   */
  enableStatistics: boolean = false;

  /**
   * Interface com todas as propriedades da estatística, sendo undefined quando `enableStatistics` for `undefined`
   */
  statistics: Estatisticas | undefined = undefined;

  /**
   * Solução final após a execução do algoritmo.
   * O valor é `undefined` até o algoritmo ser executado ou salvo no histórico (solução manual).
   */
  solution: Solucao | undefined = undefined;

  /**
   * Lista de Restrições.
   * `key` = Restição.name
   */
  constraints: Map<string, Constraint>;

  /**
   * Construtor
   */
  constructor(
    name: string,
    enableStatistics: boolean,
    solution: Solucao | undefined,
    constraints: Constraint[],
    setDefaults: boolean = true
  ) {
    this.name = name;
    this.enableStatistics = enableStatistics;
    this.solution = solution;

    /**
     * Inicializa o Map de Retsrições, atribui as restrições passadas para o contrutor.
     */
    this.constraints = new Map<string, Constraint>();
    for (const constraint of constraints) {
      this.constraints.set(constraint.name, constraint);
    }

    /**
     * Se a variável `setDefaults` for informada como `true`, serão aplicados todos os valores padrões para as restrições não adicionadas pelo usuário.
     */
    if (setDefaults) {
      this.setDefaultConstraints();
    }
  }

  /**
   * Métodos
   */

  /**
   * Executa a função principal do algoritmo.
   */
  abstract execute(): Solucao;

  /**
   * Todos os algoritmos devem apresentar algumas restrições como padrão.
   * Essa função adiciona as restrições na propriedade `constraints`.
   */
  abstract setDefaultConstraints(): Map<string, Constraint>;
}
