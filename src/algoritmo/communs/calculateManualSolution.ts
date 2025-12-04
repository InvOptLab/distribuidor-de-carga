import Constraint from "../abstractions/Constraint";
import ObjectiveComponent from "../abstractions/ObjectiveComponent";
import { ObjectiveFunction } from "../classes/ObjectiveFunction";
import { Statistics } from "../classes/Statistics";
import {
  Atribuicao,
  Celula,
  Context,
  Disciplina,
  Docente,
  Formulario,
  Solucao,
} from "./interfaces/interfaces";

/**
 * Calcula a avaliação e gera as estatísticas para um conjunto de atribuições manual.
 * Isso evita a necessidade de instanciar um algoritmo completo.
 *
 * @returns Um objeto 'Solucao' contendo a avaliação e as estatísticas.
 */
export async function calculateManualSolution(
  atribuicoes: Atribuicao[],
  docentes: Docente[],
  turmas: Disciplina[],
  travas: Celula[],
  formularios: Formulario[],
  softConstraints: Map<string, Constraint<any>>,
  hardConstraints: Map<string, Constraint<any>>,
  objectives: ObjectiveComponent<any>[],
  maxPriority: number
): Promise<Solucao> {
  // Instanciar a ObjectiveFunction para calcular a parte dos objetivos
  const objFunction = new ObjectiveFunction(objectives, "max");

  // Calcular a avaliação
  let avaliacao = objFunction.calculate(
    atribuicoes,
    formularios,
    docentes,
    turmas
  );

  // Adicionar as penalidades das restrições flexíveis
  for (const constraint of softConstraints.values()) {
    if (constraint.isActive && constraint.soft) {
      avaliacao += constraint.soft(atribuicoes, docentes, turmas, travas);
    }
  }

  // Gerar as Estatísticas
  const statistics = new Statistics();

  // Criar o contexto completo necessário para as estatísticas
  const context: Context = {
    atribuicoes: atribuicoes,
    docentes: docentes,
    turmas: turmas,
    travas: travas,
    prioridades: formularios,
    maiorPrioridade: maxPriority ? maxPriority + 1 : undefined,
  };

  // Gerar os histogramas e dados finais
  statistics.generateFinalStatistics(atribuicoes, context, {
    hard: hardConstraints,
    soft: softConstraints,
  });

  // Preencher os dados não-iterativos
  statistics.tempoExecucao = 0;
  statistics.iteracoes = 0; // 0 iterações para um save manual
  statistics.interrupcao = false;
  statistics.avaliacaoPorIteracao.set(0, avaliacao); // Salva apenas o valor final

  // 4. Retornar o objeto Solucao completo
  const solucaoManual: Solucao = {
    atribuicoes: atribuicoes,
    avaliacao: avaliacao,
    estatisticas: statistics,
    algorithm: undefined, // Indica que é um save manual, não vindo de um algoritmo
  };

  return solucaoManual;
}
