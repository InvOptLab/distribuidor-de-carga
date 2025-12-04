import { modelSCP } from "@/algoritmo/metodos/MILP/MILP";
import { OptimizationModel } from "@/algoritmo/metodos/MILP/optimization_model";
import Constraint from "../../abstractions/Constraint";
import {
  Atribuicao,
  Celula,
  ConstraintInterface,
  Disciplina,
  Docente,
  TipoTrava,
} from "../interfaces/interfaces";
import { LpSum } from "@/algoritmo/metodos/MILP/utils";

/**
 * Restrição para não permitir a geração de movimentos em turmsa ou docentes com travas
 */
export class ValidaTravas extends Constraint<any> {
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

  hard(
    atribuicoes: Atribuicao[],
    docentes: Docente[],
    disciplinas: Disciplina[],
    travas: Celula[]
  ): boolean {
    /**
     * Trava no Docente
     */
    for (const docente of docentes) {
      if (
        travas.some(
          (trava) =>
            trava.nome_docente === docente.nome &&
            trava.tipo_trava === TipoTrava.Row
        )
      ) {
        return false;
      }
    }

    /**
     * Trava na Turma
     */
    for (const turma of disciplinas) {
      if (
        travas.some(
          (trava) =>
            trava.id_disciplina === turma.id &&
            trava.tipo_trava === TipoTrava.Column
        )
      ) {
        return false;
      }
    }

    /**
     * Verifica Docente na Turma
     *
     * Se o docente for diferente do qual está na trava, deve ser falso.
     */

    for (const docente of docentes) {
      for (const turma of disciplinas) {
        if (
          travas.some(
            (trava) =>
              trava.id_disciplina === turma.id &&
              trava.nome_docente !== docente.nome &&
              trava.tipo_trava === TipoTrava.Cell
          )
        ) {
          return false;
        } else if (
          travas.some(
            (trava) =>
              trava.id_disciplina === turma.id &&
              atribuicoes.find((atrib) => atrib.id_disciplina === turma.id)
                ?.docentes.length === 0 &&
              trava.tipo_trava === TipoTrava.Cell
          )
        ) {
          return false;
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
      constraint: ValidaTravas,
    };
  }

  occurrences(
    atribuicoes: Atribuicao[],
    docentes?: Docente[],
    disciplinas?: Disciplina[],
    travas?: Celula[]
  ): { label: string; qtd: number }[] {
    const data: { label: string; qtd: number }[] = [];
    let qtdTravasTurma: number = 0;
    let qtdTravasDocente: number = 0;
    let qtdTravasCelula: number = 0;
    /**
     * Validar as travas presentes no docente
     */
    for (const docente of docentes) {
      if (
        travas.some(
          (trava) =>
            trava.nome_docente === docente.nome &&
            trava.tipo_trava === TipoTrava.Row
        )
      ) {
        qtdTravasDocente += 1;
      }
    }

    /**
     * Valida se a trava está na turma
     */
    for (const turma of disciplinas) {
      if (
        travas.some(
          (trava) =>
            trava.id_disciplina === turma.id &&
            trava.tipo_trava === TipoTrava.Column
        )
      ) {
        qtdTravasTurma += 1;
      }
    }

    /**
     * Valida se a trava não está na célula
     */
    for (const turma of disciplinas) {
      for (const docente of docentes) {
        if (
          travas.some(
            (trava) =>
              trava.id_disciplina === turma.id &&
              trava.nome_docente === docente.nome
          )
        ) {
          qtdTravasCelula += 1;
        }
      }
    }

    data.push(
      { label: "Travas Docentes", qtd: qtdTravasDocente },
      { label: "Travas Turmas", qtd: qtdTravasTurma },
      { label: "Travas Células", qtd: qtdTravasCelula }
    );
    return data;
  }

  milpHardFormulation(model: OptimizationModel, modelData: modelSCP): void {
    modelData.D.forEach((i) =>
      modelData.T.forEach((j) => {
        if (modelData.m[i][j] == 1) {
          model.addConstraint(
            `trava_${i}_${j}`,
            LpSum([modelData.x[i][j]]),
            "==",
            modelData.a[i][j]
          );
        }
      })
    );
  }
}
