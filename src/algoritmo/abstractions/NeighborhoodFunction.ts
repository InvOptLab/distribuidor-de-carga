import { Context } from "vm";
import Constraint from "./Constraint";
import { Vizinho } from "../communs/interfaces/interfaces";

export abstract class NeighborhoodFunction {
  /**
   * Nome dado a função.
   */
  readonly name: string;

  /**
   * Detalhes sobre o processo.
   */
  description: string | undefined;

  constructor(name: string, description: string | undefined) {
    this.name = name;
    this.description = description;
  }

  /**
   * Método responsável por gerar a vizinhança.
   * @returns {Vizinho[]} Vizinhança gerada pela adição de docentes as turmas
   */
  abstract generate(
    context: Context,
    hardConstraints: Map<string, Constraint<any>>,
    baseSolution: Vizinho
  ): Promise<Vizinho[]>;
}
