import { Atribuicao, Docente } from "@/context/Global/utils";
import Constraint from "../Classes/Constraint";
import { ConstraintInterface } from "../Interfaces/utils";

export class DisciplinaSemDocente extends Constraint {
  constructor(
    name: string,
    description: string,
    /*algorithm: string,*/
    isHard: boolean,
    penalty: number
  ) {
    super(name, description, isHard, penalty);
  }

  soft(atribuicoes: Atribuicao[]): number {
    let avaliacao: number = 0;

    for (const atribuicao of atribuicoes) {
      if (atribuicao.docentes.length === 0) {
        avaliacao -= this.penalty;
      }
    }

    return avaliacao;
  }

  hard(atribuicoes?: Atribuicao[], docentes?: Docente[]): boolean {
    /**
     * A restrição precisou ser feita desta forma pois na função `podeAtribuir` o valor do docente quando a chamada vem da
     * função `gerarVizinhoComRemocao` se é passado o parâmetro Docente como null. A `podeAtribuir` passa [null].
     */
    return (
      docentes.filter((doc) => doc !== null && doc !== undefined).length > 0
    );
  }

  toObject(): ConstraintInterface {
    return {
      name: this.name,
      descricao: this.description,
      tipo: this.isHard ? "Hard" : "Soft",
      penalidade: String(this.penalty),
      constraint: DisciplinaSemDocente,
    };
  }

  occurrences(atribuicoes: Atribuicao[]): { label: string; qtd: number }[] {
    const data: { label: string; qtd: number }[] = [];

    if (this.penalty !== 0 && !this.hard) {
      const softEvaluation = this.soft(atribuicoes);

      data.push({
        label: "Sem Docente",
        qtd: Math.abs(softEvaluation / this.penalty),
      });
    } else {
      let qtd: number = 0;

      for (const atribuicao of atribuicoes) {
        if (atribuicao.docentes.length === 0) {
          qtd += 1;
        }
      }
      data.push({
        label: "Sem Docente",
        qtd: qtd,
      });
    }

    return data;
  }
}
