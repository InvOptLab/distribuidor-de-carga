import { Context } from "vm";
import { NeighborhoodFunction } from "../../abstractions/NeighborhoodFunction";
import Constraint from "../../abstractions/Constraint";
import { Disciplina, Movimento, Vizinho } from "../interfaces/interfaces";
import { podeAtribuir } from "../utils";

export class Swap extends NeighborhoodFunction {
  constructor(name: string, description: string | undefined) {
    super(name, description);
  }

  async generate(
    context: Context,
    hardConstraints: Map<string, Constraint<any>>,
    baseSolution: Vizinho
  ): Promise<Vizinho[]> {
    const vizinhos: Vizinho[] = [];

    /**
     * Devemos percorrer a lista de turmas, uma vez para selecionar uma Pivot, e uma segunda vez para
     * selecionar a Atual.
     * A troca será realizada entre essas duas.
     */
    for (let i = 0; i < context.turmas.length; i++) {
      const turmaPivot: Disciplina = context.turmas[i];

      /**
       * Encontrar todos os docentes atribuídos a turma pivot.
       */
      const docentesPivot = baseSolution.atribuicoes.find(
        (atribuicao) => atribuicao.id_disciplina === turmaPivot.id
      )?.docentes;
      if (!docentesPivot) {
        continue;
      }

      for (let j = i + 1; j < context.turmas.length; j++) {
        const turmaAtual: Disciplina = context.turmas[j];
        /**
         * Encontrar todos os docentes atribuídos a turma atual.
         */
        const docentesAtual = baseSolution.atribuicoes.find(
          (atribuicao) => atribuicao.id_disciplina === turmaAtual.id
        )?.docentes;

        if (!docentesAtual) {
          continue;
        }

        let trocaValida = true;

        for (const _docente of docentesPivot) {
          const docente = context.docentes.find((doc) => doc.nome === _docente);
          trocaValida =
            trocaValida &&
            podeAtribuir(
              docente,
              turmaAtual,
              context.travas,
              hardConstraints,
              baseSolution
            );
        }

        for (const _docente of docentesAtual) {
          const docente = context.docentes.find((doc) => doc.nome === _docente);
          trocaValida =
            trocaValida &&
            podeAtribuir(
              docente,
              turmaPivot,
              context.travas,
              hardConstraints,
              baseSolution
            );
        }
        //&& !compareArrays(docentesPivot, docentesAtual);

        if (trocaValida) {
          const atribuicoes = structuredClone(baseSolution.atribuicoes);

          const atrib1 = atribuicoes.find(
            (a) => a.id_disciplina === turmaPivot.id
          );
          const atrib2 = atribuicoes.find(
            (a) => a.id_disciplina === turmaAtual.id
          );

          // Realizar a troca de docentes entre as duas disciplinas
          atrib1.docentes = docentesAtual;
          atrib2.docentes = docentesPivot;

          /**
           * Gera separadamente cada movimento em caso de troca de múltiplos docentes
           * (caso uam turma tenha 2 ou mais alocações).
           */
          const addMovimentos: Movimento[] = [];
          for (const docente of docentesAtual) {
            addMovimentos.push({ turmaId: turmaPivot.id, docente: docente });
          }
          if (docentesAtual.length === 0) {
            addMovimentos.push({ turmaId: turmaPivot.id, docente: "" });
          }
          for (const docente of docentesPivot) {
            addMovimentos.push({ turmaId: turmaAtual.id, docente: docente });
          }
          if (docentesPivot.length === 0) {
            addMovimentos.push({ turmaId: turmaAtual.id, docente: "" });
          }

          const dropMovimentos: Movimento[] = [];
          for (const docente of docentesPivot) {
            dropMovimentos.push({ turmaId: turmaPivot.id, docente: docente });
          }
          if (docentesAtual.length === 0) {
            dropMovimentos.push({ turmaId: turmaPivot.id, docente: "" });
          }
          for (const docente of docentesAtual) {
            dropMovimentos.push({ turmaId: turmaAtual.id, docente: docente });
          }
          if (docentesAtual.length === 0) {
            dropMovimentos.push({ turmaId: turmaAtual.id, docente: "" });
          }

          const vizinho: Vizinho = {
            atribuicoes: atribuicoes,
            isTabu: false,
            movimentos: { add: addMovimentos, drop: dropMovimentos },
          };

          vizinhos.push(vizinho);
        }
      }
    }

    return vizinhos;
  }
}
