import { ObjectiveFunction } from "../classes/ObjectiveFunction";
import {
  Atribuicao,
  Celula,
  Context,
  Disciplina,
  Docente,
  Estatisticas,
  Formulario,
  Solucao,
  Vizinho,
} from "../communs/interfaces/interfaces";
import Constraint from "./Constraint";
import { NeighborhoodFunction } from "./NeighborhoodFunction";
import { ObjectiveComponent } from "./ObjectiveComponent";
import { StopCriteria } from "./StopCriteria";

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
  public readonly name: string;

  /**
   * Indica se as estatísticas devem ser calculadas
   */
  protected enableStatistics: boolean = false;

  /**
   * Interface com todas as propriedades da estatística, sendo undefined quando `enableStatistics` for `undefined`
   */
  public statistics: Estatisticas;

  /**
   * Solução final após a execução do algoritmo.
   * O valor é `undefined` até o algoritmo ser executado ou salvo no histórico (solução manual).
   */
  public solution: Solucao | undefined = undefined;

  // Processos de geração de vizinhos
  public neighborhoodPipe: Map<string, NeighborhoodFunction> = new Map<
    string,
    NeighborhoodFunction
  >();

  // Restrições
  public constraints: {
    hard: Map<string, Constraint<any>>;
    soft: Map<string, Constraint<any>>;
  };

  /**
   * Lista que armazena os processos que serão responsáveis por interromper a execução
   * do algoritmo.
   */
  public stopPipe: Map<string, StopCriteria> = new Map<string, StopCriteria>();

  /**
   * Atribuito para utilizar a Função objetivo e seus componentes.
   */
  public objectiveFunction: ObjectiveFunction;

  // Informações base para os processos
  public context: Context;

  /**
   * Construtor
   */
  constructor(
    name: string,
    atribuicoes: Atribuicao[],
    docentes: Docente[],
    turmas: Disciplina[],
    travas: Celula[],
    prioridades: Formulario[],
    constraints: Constraint<any>[],
    solution: Solucao | undefined,
    neighborhoodFunctions: NeighborhoodFunction[],
    stopFunctions: StopCriteria[],
    objectiveType: "min" | "max",
    objectiveComponentes: ObjectiveComponent[],
    maiorPrioridade: number | undefined,
    enableStatistics: boolean
  ) {
    this.name = name;
    this.enableStatistics = enableStatistics;
    this.solution = solution;

    // Se o parâmetro `maiorPrioridade` não for informado, ele deverá ser encontrado.
    if (maiorPrioridade === undefined) {
      for (const a of prioridades) {
        if (a.prioridade > maiorPrioridade || !maiorPrioridade) {
          maiorPrioridade = a.prioridade;
        }
      }
      maiorPrioridade += 1; // Deixando sempre o 0 como prioridade para quando houver atribução sem formulário
    }

    this.context = {
      atribuicoes: atribuicoes,
      docentes: docentes,
      turmas: turmas,
      travas: travas,
      prioridades: prioridades,
      maiorPrioridade: maiorPrioridade,
    };

    /**
     * Inicializa o Map de Retsrições, atribui as restrições passadas para o contrutor.
     */
    this.constraints = {
      hard: new Map<string, Constraint<any>>(),
      soft: new Map<string, Constraint<any>>(),
    };
    for (const constraint of constraints) {
      if (constraint.isHard) {
        this.constraints.hard.set(constraint.name, constraint);
      } else {
        this.constraints.soft.set(constraint.name, constraint);
      }
    }

    /**
     * Inicializa um Map para o Pipe de geração de vizinhanças.
     */
    for (const process of neighborhoodFunctions) {
      this.neighborhoodPipe.set(process.name, process);
    }

    /**
     * Inicializar a propriedade `statistics`
     */
    this.statistics = {
      avaliacaoPorIteracao: new Map<number, number>(),
      interrupcao: false,
      iteracoes: 0,
      tempoExecucao: 0,
      tempoPorIteracao: new Map<number, number>(),
      docentesPrioridade: new Map<number, number>(),
      qtdOcorrenciasRestricoes: new Map<
        string,
        { label: string; qtd: number }[]
      >(),
    };

    /**
     * Inicializa a propriedade `stopCriteria`
     */
    for (const func of stopFunctions) {
      this.stopPipe.set(func.name, func);
    }

    /**
     * Inicializar a função objetivo
     */
    this.objectiveFunction = new ObjectiveFunction(
      objectiveComponentes,
      objectiveType
    );
  }

  /**
   * Métodos
   */

  /**
   * Executa a função principal do algoritmo.
   */
  abstract execute(
    interrompe?: () => boolean,
    atualizaQuantidadeAlocacoes?: (qtd: number) => void
  ): Promise<Vizinho>;

  // /**
  //  * Todos os algoritmos devem apresentar algumas restrições como padrão.
  //  * Essa função adiciona as restrições na propriedade `constraints`.
  //  */
  // abstract setDefaultConstraints(): Map<string, Constraint>;
}
