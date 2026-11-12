import Algorithm from "@/algoritmo/abstractions/Algorithm";
import Constraint from "@/algoritmo/abstractions/Constraint";
import ObjectiveComponent from "@/algoritmo/abstractions/ObjectiveComponent";
import {
  Context,
  Estatisticas,
  Solucao,
} from "@/algoritmo/communs/interfaces/interfaces";

/**
 * "Algoritmo" vazio usado para registrar no histórico uma solução feita à mão.
 */
export class InsercaoManual extends Algorithm<any> {
  constructor(
    name: string,
    context: Context,
    constraints: Constraint<any>[],
    solution: Solucao | undefined,
    objectiveType: "min" | "max",
    objectiveComponentes: ObjectiveComponent<any>[],
    maiorPrioridade: number | undefined,
  ) {
    super(
      name,
      context,
      constraints,
      solution,
      objectiveType,
      objectiveComponentes,
      maiorPrioridade,
      true,
    );
  }

  execute(): Promise<any> {
    return;
  }
  protected filtrarEstatisticas(): Partial<Estatisticas> {
    return;
  }
}
