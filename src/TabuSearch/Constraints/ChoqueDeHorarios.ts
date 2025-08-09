import { Atribuicao, Disciplina, Docente } from "@/context/Global/utils";
import { ConstraintInterface } from "../Interfaces/utils";
import Constraint from "../Classes/Constraint";

export class ChoqueDeHorarios extends Constraint {
  constructor(
    name: string,
    description: string,
    /*algorithm: string,*/
    isHard: boolean,
    penalty: number
  ) {
    super(name, description, isHard, penalty);
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
    // if (atribuicoes !== undefined) {
    //   // Penalizar solução para cada choque de horários encontrados nas atribuições dos docentes
    //   for (const docente of docentes) {
    //     // Lista com os Ids das disciplinas
    //     const atribuicoesDocente: string[] = atribuicoes
    //       .filter((atribuicao) => atribuicao.docentes.includes(docente.nome))
    //       .map((atribuicao) => atribuicao.id_disciplina);

    //     // Comparar as atribuições para ver se a `Disciplia.conflitos` não incluem umas as outras
    //     for (let i = 0; i < atribuicoesDocente.length; i++) {
    //       const disciplinaPivo: Disciplina = turmas.find(
    //         (disciplina) => disciplina.id === atribuicoesDocente[i]
    //       );

    //       for (let j = i + 1; j < atribuicoesDocente.length; j++) {
    //         const disciplinaAtual: Disciplina = turmas.find(
    //           (disciplina) => disciplina.id === atribuicoesDocente[j]
    //         );

    //         if (disciplinaPivo.conflitos.has(disciplinaAtual.id)) {
    //           // k2 penaliza conflitos
    //           return false;
    //         }
    //       }
    //     }
    //   }
    // }

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

    /**
     * TODO: Repensar para quando essa restrição for para verificar apenas um docente com uma disciplina
     */

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
}
