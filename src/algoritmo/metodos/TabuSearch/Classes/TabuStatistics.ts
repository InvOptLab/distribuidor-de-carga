import { Statistics } from "@/algoritmo/classes/Statistics";
import { EstatisticasTabu } from "./TabuSearch";

/**
 * Estende a classe Statistics para incluir dados específicos da Busca Tabu.
 */
export class TabuStatistics extends Statistics implements EstatisticasTabu {
  public tempoPorIteracaoTabu: Map<number, number>;

  constructor() {
    super(); // Chama o construtor da classe Statistics
    this.tempoPorIteracaoTabu = new Map<number, number>();
  }
}
