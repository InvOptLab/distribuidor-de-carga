import { ObjectiveFunction } from "../classes/ObjectiveFunction";
import {
  Context,
  Estatisticas,
  OpcoesMonitoramento,
  Solucao,
} from "../communs/interfaces/interfaces";
import Constraint from "./Constraint";
import { ObjectiveComponent } from "./ObjectiveComponent";

/**
 * Criar uma classe para o algoritmo
 */
export default abstract class Algorithm<T> {
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

  // Restrições
  public constraints: {
    hard: Map<string, Constraint<any>>;
    soft: Map<string, Constraint<any>>;
  };

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
    context: Context,
    constraints: Constraint<any>[],
    solution: Solucao | undefined,
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
      for (const a of context.prioridades) {
        if (a.prioridade > maiorPrioridade || !maiorPrioridade) {
          maiorPrioridade = a.prioridade;
        }
      }
      maiorPrioridade += 1; // Deixando sempre o 0 como prioridade para quando houver atribução sem formulário
    }

    this.context = context;

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
    atualizaQuantidadeAlocacoes?: (qtd: number) => void,
    atualizaEstatisticas?: OpcoesMonitoramento
  ): Promise<T>;

  /**
   * Helper privado para criar um objeto parcial com base nas chaves pedidas.
   */
  protected filtrarEstatisticas(
    campos: (keyof Estatisticas)[]
  ): Partial<Estatisticas> {
    const dadosFiltrados: Partial<Estatisticas> = {};

    for (const campo of campos) {
      // Verifica se a chave existe em 'this.statistics' antes de copiar
      if (Object.prototype.hasOwnProperty.call(this.statistics, campo)) {
        // A asserção 'as any' é uma forma simples de lidar com a
        // complexidade de tipos dinâmicos do TypeScript aqui.
        // Ela está encapsulada e segura dentro deste método.
        (dadosFiltrados as any)[campo] = this.statistics[campo];
      }
    }

    return dadosFiltrados;
  }
}
