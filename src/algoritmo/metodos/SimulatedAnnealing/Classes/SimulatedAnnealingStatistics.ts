import { Estatisticas } from "@/algoritmo/communs/interfaces/interfaces";
import { Statistics } from "@/algoritmo/classes/Statistics";

export interface EstatisticasSA {
  tempoPorIteracaoSA: Map<number, number>;
  temperaturaPorIteracao: Map<number, number>;
  aceitacoesPiores: number;
}

export class SimulatedAnnealingStatistics extends Statistics {
  public customStatistics: EstatisticasSA;

  constructor() {
    super();
    this.customStatistics = {
      tempoPorIteracaoSA: new Map(),
      temperaturaPorIteracao: new Map(),
      aceitacoesPiores: 0,
    };
  }
}
