import { modelSCP } from "@/algoritmo/metodos/MILP/MILP";
import {
  OptimizationModel,
  Term,
} from "@/algoritmo/metodos/MILP/optimization_model";
import Constraint from "../../abstractions/Constraint";
import {
  Atribuicao,
  ConstraintInterface,
  Disciplina,
  Docente,
} from "../interfaces/interfaces";
import { LpSum } from "@/algoritmo/metodos/MILP/utils";

export class ChoqueDeHorarios extends Constraint<any> {
  constructor(
    name: string,
    description: string,
    isHard: boolean,
    penalty: number,
    isActive: boolean,
    parametros: any
  ) {
    super(name, description, isHard, penalty, isActive);

    this.params = parametros;
  }

  soft(
    atribuicoes: Atribuicao[],
    docentes: Docente[],
    disciplinas: Disciplina[]
  ): number {
    let avaliacao: number = 0;

    // Penalizar solução para cada choque de horários encontrados nas atribuições dos docentes
    for (const docente of docentes) {
      // Lista com os Ids das disciplinas
      const atribuicoesDocente: string[] = atribuicoes
        .filter((atribuicao) => atribuicao.docentes.includes(docente.nome))
        .map((atribuicao) => atribuicao.id_disciplina);

      // Comparar as atribuições para ver se a `Disciplia.conflitos` não incluem umas as outras
      for (let i = 0; i < atribuicoesDocente.length; i++) {
        const disciplinaPivo: Disciplina = disciplinas.find(
          (disciplina) => disciplina.id === atribuicoesDocente[i]
        );

        for (let j = i + 1; j < atribuicoesDocente.length; j++) {
          const disciplinaAtual: Disciplina = disciplinas.find(
            (disciplina) => disciplina.id === atribuicoesDocente[j]
          );

          if (disciplinaPivo.conflitos.has(disciplinaAtual.id)) {
            // k2 penaliza conflitos
            avaliacao -= this.penalty;
          }
        }
      }
    }

    return avaliacao;
  }

  hard(
    atribuicoes: Atribuicao[],
    docentes: Docente[],
    turmas: Disciplina[]
  ): boolean {
    if (atribuicoes !== undefined) {
      for (const docente of docentes) {
        const docenteAtribuicoes = atribuicoes.filter((atribuicao) =>
          atribuicao.docentes.includes(docente.nome)
        );

        for (const turma of turmas) {
          for (const docAtrib of docenteAtribuicoes) {
            if (turma.conflitos.has(docAtrib.id_disciplina)) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  toObject(): ConstraintInterface {
    return {
      name: this.name,
      descricao: this.description,
      tipo: this.isHard ? "Hard" : "Soft",
      penalidade: String(this.penalty),
      constraint: ChoqueDeHorarios,
    };
  }

  occurrences(
    atribuicoes: Atribuicao[],
    docentes: Docente[],
    disciplinas: Disciplina[]
  ): { label: string; qtd: number }[] {
    const data: { label: string; qtd: number }[] = [];

    if (this.penalty !== 0 && !this.hard) {
      const softEvaluation = this.soft(atribuicoes, docentes, disciplinas);

      data.push({
        label: "Choque de Horários",
        qtd: Math.abs(softEvaluation / this.penalty),
      });
    } else {
      let qtd: number = 0;

      // Incrementa o contador para cada choque de horários encontrados nas atribuições dos docentes
      for (const docente of docentes) {
        // Lista com os Ids das disciplinas
        const atribuicoesDocente: string[] = atribuicoes
          .filter((atribuicao) => atribuicao.docentes.includes(docente.nome))
          .map((atribuicao) => atribuicao.id_disciplina);

        // Comparar as atribuições para ver se a `Disciplia.conflitos` não incluem umas as outras
        for (let i = 0; i < atribuicoesDocente.length; i++) {
          const disciplinaPivo: Disciplina = disciplinas.find(
            (disciplina) => disciplina.id === atribuicoesDocente[i]
          );

          for (let j = i + 1; j < atribuicoesDocente.length; j++) {
            const disciplinaAtual: Disciplina = disciplinas.find(
              (disciplina) => disciplina.id === atribuicoesDocente[j]
            );

            if (disciplinaPivo.conflitos.has(disciplinaAtual.id)) {
              qtd += 1;
            }
          }
        }
      }
      data.push({ label: "Choque de Horários", qtd: qtd });
    }

    return data;
  }

  milpHardFormulation(model: OptimizationModel, modelData: modelSCP): void {
    modelData.D.forEach((i) =>
      modelData.F.forEach(([j, k]) => {
        const lhs = LpSum([
          { variable: modelData.x[i][j], coefficient: 1 },
          { variable: modelData.x[i][k], coefficient: 1 },
        ]);
        model.addConstraint(`conflito_horario_${i}_${j}_${k}`, lhs, "<=", 1);
      })
    );
  }

  milpSoftFormulation(
    model: OptimizationModel,
    modelData: modelSCP
  ): { objectiveTerms: Term[] } {
    /**
     * Restrição
     */
    modelData.D.forEach((i) =>
      modelData.F.forEach(([j, k]) => {
        const v_ijk = modelData.v[i][j][k]!;
        const lhs = LpSum([
          { variable: modelData.x[i][j], coefficient: 1 },
          { variable: modelData.x[i][k], coefficient: 1 },
          { variable: v_ijk, coefficient: -1 },
        ]);
        model.addConstraint(`conflito_horario_${i}_${j}_${k}`, lhs, "<=", 1);
      })
    );

    /**
     * Componente na função objetivo
     */
    const objectiveTerms: Term[] = [];

    modelData.D.forEach((i) =>
      modelData.F.forEach(([j, k]) => {
        objectiveTerms.push({
          variable: modelData.v[i][j][k],
          coefficient: this.penalty,
        });
      })
    );

    return { objectiveTerms };
  }
}
