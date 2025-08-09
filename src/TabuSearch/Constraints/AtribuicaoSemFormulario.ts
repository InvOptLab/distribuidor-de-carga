import { Atribuicao, Disciplina, Docente } from "@/context/Global/utils";
import { ConstraintInterface } from "../Interfaces/utils";
import Constraint from "../Classes/Constraint";

export class AtribuicaoSemFormulario extends Constraint {
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
    docentes: Docente[]
    //disciplinas?: Disciplina[]
  ): number {
    let avaliacao: number = 0;

    // for (const docente of docentes) {
    //   const docenteAtribuicoes = atribuicoes.filter((atribuicao) =>
    //     atribuicao.docentes.includes(docente.nome)
    //   );

    //   for (const atribuicao of docenteAtribuicoes) {
    //     if (!docente.formularios.has(atribuicao.id_disciplina)) {
    //       avaliacao -= this.penalty;
    //     }
    //   }
    // }
    for (const atribuicao of atribuicoes) {
      for (const docenteAtribuido of atribuicao.docentes) {
        const docente = docentes.find((obj) => obj.nome === docenteAtribuido);

        if (!docente.formularios.has(atribuicao.id_disciplina)) {
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
    /**
     * Se a disciplina não foi informado quer dizer que estamos verificando todo o contexto
     */
    // if (disciplinas === undefined && atribuicoes !== undefined) {
    //   for (const docente of docentes) {
    //     const docenteAtribuicoes = atribuicoes.filter((atribuicao) =>
    //       atribuicao.docentes.includes(docente.nome)
    //     );

    //     for (const atribuicao of docenteAtribuicoes) {
    //       if (!docente.formularios.has(atribuicao.id_disciplina)) {
    //         return false;
    //       }
    //     }
    //   }
    // } else {
    // //Caso o docente seja null
    // if (docentes.some((docente) => !docente)) {
    //   return false;
    // }

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

          if (!docente.formularios.has(atribuicao.id_disciplina)) {
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
