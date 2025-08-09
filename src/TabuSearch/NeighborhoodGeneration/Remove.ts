import { NeighborhoodFunction } from "../Classes/Abstract/NeighborhoodFunction";
import Constraint from "../Classes/Constraint";
import { Context, Vizinho } from "../Interfaces/utils";
import { Movimento } from "../TabuList/Moviment";
import { podeAtribuir } from "./utils";

/**
 * O processo `Remove` é responsável por remover um docente de uma turma.
 * Caso não haja um docente, a vizinhança não deverá ser gerada. (Podemos testar remover essa opção)
 */
export class Remove extends NeighborhoodFunction {
  constructor(name: string, description: string | undefined) {
    super(name, description);
  }

  async generate(
    context: Context,
    hardConstraints: Map<string, Constraint>,
    baseSolution: Vizinho
  ): Promise<Vizinho[]> {
    const vizinhos: Vizinho[] = [];
    for (const turma of context.turmas) {
      if (
        !podeAtribuir(
          undefined,
          turma,
          context.travas,
          hardConstraints,
          baseSolution
        )
      ) {
        /**
         * Verificar se o movimento pode ser realizado através das restrições
         */
        continue;
      }

      /**
       * Gerar o movimento e armazenar as alterações
       */
      const solucaoAtual = structuredClone(baseSolution.atribuicoes);
      const atribuicao = solucaoAtual.find(
        (atribuicao) => atribuicao.id_disciplina === turma.id
      );

      atribuicao.docentes = [];

      /**
       * Gera separadamente cada movimento em caso de troca de múltiplos docentes
       * (caso uam turma tenha 2 ou mais alocações).
       */

      const dropMovimentos: Movimento[] = [];
      for (const docente of turma.docentes) {
        dropMovimentos.push({ turmaId: turma.id, docente: docente });
      }

      const vizinho: Vizinho = {
        isTabu: false,
        movimentos: {
          add: [{ turmaId: turma.id, docente: "" }],
          drop: dropMovimentos,
        },
        atribuicoes: solucaoAtual,
      };

      vizinhos.push(vizinho);
    }

    return vizinhos;
  }
}
