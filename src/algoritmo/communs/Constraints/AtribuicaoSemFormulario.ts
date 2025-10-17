import Constraint from "../../abstractions/Constraint";
import {
  Atribuicao,
  ConstraintInterface,
  Disciplina,
  Docente,
} from "../interfaces/interfaces";

export class AtribuicaoSemFormulario extends Constraint<null> {
  constructor(
    name: string,
    description: string,
    isHard: boolean,
    penalty: number,
    isActive: boolean,
    parametros: null
  ) {
    super(name, description, isHard, penalty, isActive, parametros);
  }

  soft(
    atribuicoes: Atribuicao[],
    docentes: Docente[]
    //disciplinas?: Disciplina[]
  ): number {
    let avaliacao: number = 0;

    for (const atribuicao of atribuicoes) {
      for (const docenteAtribuido of atribuicao.docentes) {
        const docente = docentes.find((obj) => obj.nome === docenteAtribuido);

        if (docente && !docente.formularios.has(atribuicao.id_disciplina)) {
          avaliacao -= this.penalty;
        }
      }
    }

    return avaliacao;
  }

  hard(
    atribuicoes: Atribuicao[],
    docentes: Docente[],
    disciplinas: Disciplina[]
  ): boolean {
    docentes = docentes.filter((doc) => doc !== null && doc !== undefined);

    if (docentes.length === 0) {
      return true;
    }

    // Se a disciplina foi informado quer dizer que estamos verificando um contexto específico
    for (const docente of docentes) {
      for (const disciplia of disciplinas) {
        if (!docente.formularios.has(disciplia.id)) {
          return false;
        }
      }
    }
    //    }
    return true;
  }

  toObject(): ConstraintInterface {
    return {
      name: this.name,
      descricao: this.description,
      tipo: this.isHard ? "Hard" : "Soft",
      penalidade: String(this.penalty),
      constraint: AtribuicaoSemFormulario,
    };
  }

  occurrences(
    atribuicoes: Atribuicao[],
    docentes: Docente[]
  ): { label: string; qtd: number }[] {
    const data: { label: string; qtd: number }[] = [];

    if (this.penalty !== 0 && !this.hard) {
      const softEvaluation = Math.abs(this.soft(atribuicoes, docentes));

      data.push({
        label: "Sem Formulário",
        qtd: softEvaluation / this.penalty,
      });
    } else {
      let qtd = 0;
      for (const atribuicao of atribuicoes) {
        for (const docenteAtribuido of atribuicao.docentes) {
          const docente = docentes.find((obj) => obj.nome === docenteAtribuido);

          if (docente && !docente.formularios.has(atribuicao.id_disciplina)) {
            qtd += 1;
          }
        }
      }
      data.push({
        label: "Sem Formulário",
        qtd: qtd,
      });
    }
    return data ? data : [{ label: "Sem Formulário", qtd: 0 }];
  }
}
