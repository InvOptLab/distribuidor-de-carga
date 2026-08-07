import { NeighborhoodFunction } from "../../abstractions/NeighborhoodFunction";
import Constraint from "../../abstractions/Constraint";
import { Movimento, Vizinho, Context } from "../interfaces/interfaces";
import { podeAtribuir } from "../utils";

/**
 * O processo `StochasticMove` é responsável por fazer Múltiplas alterações (N)
 * num único passo (iteração) para gerar um novo Vizinho.
 * A quantidade de alterações N é definida estocasticamente.
 */
export class StochasticMove extends NeighborhoodFunction {
  readonly _name = "StochasticMove";

  public sampleSize: number;

  constructor(
    name: string,
    description: string | undefined,
    sampleSize: number = 1,
  ) {
    super(name, description);
    this.sampleSize = sampleSize;
  }

  /**
   * Helper para embaralhar um array in-place usando Fisher-Yates
   */
  private shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  async generate(
    context: Context,
    hardConstraints: Map<string, Constraint<any>>,
    baseSolution: Vizinho,
  ): Promise<Vizinho[]> {
    const vizinhos: Vizinho[] = [];

    // Proteção infinita: só tentamos no máximo X vezes gerar a amostragem pra evitar deadlocks.
    const MAX_TENTATIVAS = this.sampleSize * 100;
    let tentativas = 0;

    while (vizinhos.length < this.sampleSize && tentativas < MAX_TENTATIVAS) {
      tentativas++;

      // Grau de Perturbação Estocástico: Sorteia N entre 1 e o total de docentes (com limite razoável das turmas)
      const maxN = Math.min(context.docentes.length, context.turmas.length);
      if (maxN <= 0) break; // Sem turmas ou docentes

      const N = Math.floor(Math.random() * maxN) + 1;

      // Clona a solução
      const solucaoAtual = structuredClone(baseSolution.atribuicoes);
      const dropMovimentos: Movimento[] = [];
      const addMovimentos: Movimento[] = [];

      // Sorteia N turmas distintas e N docentes (para atribuir um a cada turma sorteada)
      const turmasEmbaralhadas = this.shuffleArray(context.turmas).slice(0, N);

      let geracaoInvalida = false;

      for (const turma of turmasEmbaralhadas) {
        // Pega um docente aleatório
        const docenteAleatorio =
          context.docentes[Math.floor(Math.random() * context.docentes.length)];

        // Verifica se podemos fazer essa atribuição isoladamente usando as hardConstraints e travas
        if (
          !podeAtribuir(
            docenteAleatorio,
            turma,
            context.travas,
            hardConstraints,
            baseSolution,
            context.turmas,
          )
        ) {
          geracaoInvalida = true;
          break; // Hard constraint violada, descartamos esse vizinho inteiro
        }

        const atribuicaoDaTurma = solucaoAtual.find(
          (a) => a.id_disciplina === turma.id,
        );
        if (!atribuicaoDaTurma) continue;

        // Efetua Drops
        if (!atribuicaoDaTurma.docentes?.length) {
          dropMovimentos.push({ turmaId: turma.id, docente: "" });
        } else {
          for (const doc of atribuicaoDaTurma.docentes) {
            dropMovimentos.push({ turmaId: turma.id, docente: doc });
          }
        }

        // Efetua Adds
        atribuicaoDaTurma.docentes = [docenteAleatorio.nome];
        addMovimentos.push({
          turmaId: turma.id,
          docente: docenteAleatorio.nome,
        });
      }

      // Se a geração for válida, empacotamos o Vizinho
      if (!geracaoInvalida) {
        const vizinho: Vizinho = {
          isTabu: false,
          movimentos: {
            add: addMovimentos,
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
