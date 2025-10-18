import { Context } from "vm";
import { NeighborhoodFunction } from "../../abstractions/NeighborhoodFunction";
import Constraint from "../../abstractions/Constraint";
import { Movimento, Vizinho } from "../interfaces/interfaces";
import { podeAtribuir } from "../utils";
/**
 * O processo `Add` é responsável por adicionar um docente a uma turma (ou caso tenha alguma alocação, subistituir).
 */
export class Add extends NeighborhoodFunction {
  constructor(name: string, description: string | undefined) {
    super(name, description);
  }

  async generate(
    context: Context,
    hardConstraints: Map<string, Constraint<any>>,
    baseSolution: Vizinho
  ): Promise<Vizinho[]> {
    const vizinhos: Vizinho[] = [];
    for (const turma of context.turmas) {
      for (const docente of context.docentes) {
        /**
         * Verificar se o movimento pode ser realizado através das restrições
         */
        if (
          !podeAtribuir(
            docente,
            turma,
            context.travas,
            hardConstraints,
            baseSolution
          )
        ) {
          continue;
        }

        /**
         * Gerar o movimento e armazenar as alterações
         */
        const solucaoAtual = structuredClone(baseSolution.atribuicoes);
        const atribuicao = solucaoAtual.find(
          (atribuicao) => atribuicao.id_disciplina === turma.id
        );

        /**
         * Gera separadamente cada movimento em caso de troca de múltiplos docentes
         * (caso uam turma tenha 2 ou mais alocações).
         */
        const dropMovimentos: Movimento[] = [];

        if (!atribuicao.docentes?.length) {
          dropMovimentos.push({ turmaId: turma.id, docente: "" });
        }
        for (const docente of atribuicao.docentes) {
          //const atrib = baseSolution.atribuicoes.find((atribuicao) = atribuicao.id_disciplina === turma.id)
          dropMovimentos.push({ turmaId: turma.id, docente: docente });
        }

        atribuicao.docentes = [docente.nome];

        const vizinho: Vizinho = {
          isTabu: false,
          movimentos: {
            add: [{ turmaId: turma.id, docente: docente.nome }],
            drop: dropMovimentos,
          },
          atribuicoes: solucaoAtual,
        };

        vizinhos.push(vizinho);
      }
    }

    return vizinhos;
  }
}
