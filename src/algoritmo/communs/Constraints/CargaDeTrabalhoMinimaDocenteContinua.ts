import { modelSCP } from "@/algoritmo/metodos/MILP/MILP";
import {
  OptimizationModel,
  Term,
} from "@/algoritmo/metodos/MILP/optimization_model";
import Constraint from "../../abstractions/Constraint";
import {
  Atribuicao,
  Celula,
  ConstraintInterface,
  Disciplina,
  Docente,
  IParameter,
} from "../interfaces/interfaces";
import { LpSum } from "@/algoritmo/metodos/MILP/utils";

/**
 * Forma do parâmtro que será utilizada na classe
 */
export type LimiteMinimoContinua = {
  minLimit: IParameter<number>;
};

type constructorLimiteMinimoContinua = {
  minLimit: number;
};

/**
 * Penaliza caso docentes não atinjam a carga de trabalho mínima de forma contínua.
 */
export class CargaDeTrabalhoMinimaDocenteContinua extends Constraint<LimiteMinimoContinua> {
  readonly _name = "CargaDeTrabalhoMinimaDocenteContinua";

  constructor(
    name: string,
    description: string,
    isHard: boolean,
    penalty: number,
    isActive: boolean,
    parametros: constructorLimiteMinimoContinua,
  ) {
    super(name, description, isHard, penalty, isActive);

    this.params = {
      minLimit: {
        value: parametros.minLimit,
        name: "Carga didática mínimo contínua.",
        description:
          "O número mínimo de carga didática que pode ser atribuída a um docente, penalizado continuamente pelo deficit.",
      },
    };
  }

  soft(
    atribuicoes: Atribuicao[],
    docentes: Docente[],
    turmas: Disciplina[],
  ): number {
    let avaliacao: number = 0;
    
    /**
     * Contabilizar pela carga da turma e não pela quantidade de atribuições.
     */
    const cargaDocente = new Map<string, number>();
    for (const docente of docentes) {
      let carga = 0;
      const atribuicoesDocente = atribuicoes.filter((atribuicao) =>
        atribuicao.docentes.includes(docente.nome),
      );

      for (const atribuicao of atribuicoesDocente) {
        const turma = turmas.find((t) => t.id === atribuicao.id_disciplina);
        if (turma) {
          carga += turma.carga;
        }
      }
      cargaDocente.set(docente.nome, carga);
    }

    /**
     * Penalização com base no saldo e proporcional ao quanto falta para atingir a carga mínima.
     */
    for (const docente of docentes) {
      if (cargaDocente.get(docente.nome) < this.params.minLimit.value) {
        avaliacao -= this.penalty * (docente.saldo > 2.0 ? 0.75 : 1.0) * (this.params.minLimit.value - cargaDocente.get(docente.nome));
      }
    }

    return avaliacao;
  }

  hard(
    atribuicoes?: Atribuicao[],
    docentes?: Docente[],
    disciplinasAtribuidas?: Disciplina[],
    travas?: Celula[],
    disciplinas?: Disciplina[],
  ): boolean {
    /**
     * Quer dizer que estou removendo um docente de uma turma
     */
    if (docentes.length === 0) {
      for (const disciplina of disciplinasAtribuidas) {
        const docentesAtribuidos = atribuicoes.find(
          (atribuicao) => atribuicao.id_disciplina === disciplina.id,
        ).docentes;

        for (const _docente of docentesAtribuidos) {
          const atribuicoesClone = structuredClone(atribuicoes);

          const novaAtribuicao = atribuicoesClone.find(
            (atribuicao) => atribuicao.id_disciplina === disciplina.id,
          );
          novaAtribuicao.docentes = novaAtribuicao.docentes.filter(
            (nome) => nome !== _docente,
          );

          const docente = docentes.find((docente) => docente.nome === _docente);

          if (
            docente &&
            this.calculaCargaDidatica(docente, atribuicoesClone, disciplinas) <
              this.params.minLimit.value
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  private calculaCargaDidatica(
    docente: Docente,
    atribuicoes: Atribuicao[],
    disciplinas: Disciplina[],
  ) {
    const atribuicoesDocente = atribuicoes.filter((atribuicao) =>
      atribuicao.docentes.includes(docente.nome),
    );

    let cargaDocente = 0;

    for (const atribuicao of atribuicoesDocente) {
      cargaDocente += disciplinas.find(
        (disciplina) => disciplina.id === atribuicao.id_disciplina,
      ).carga;
    }
    return cargaDocente;
  }

  toObject(): ConstraintInterface {
    return {
      name: this.name,
      descricao: this.description,
      tipo: this.isHard ? "Hard" : "Soft",
      penalidade: String(this.penalty),
      constraint: CargaDeTrabalhoMinimaDocenteContinua,
    };
  }

  occurrences(
    atribuicoes: Atribuicao[],
    docentes?: Docente[],
    turmas?: Disciplina[],
  ): { label: string; qtd: number }[] {
    const data: { label: string; qtd: number }[] = [];
    let qtdMenosUm: number = 0;

    const cargaDocente = new Map<string, number>();
    for (const docente of docentes) {
      let carga = 0;
      const atribuicoesDocente = atribuicoes.filter((atribuicao) =>
        atribuicao.docentes.includes(docente.nome),
      );

      for (const atribuicao of atribuicoesDocente) {
        const turma = turmas.find((t) => t.id === atribuicao.id_disciplina);
        if (turma) {
          carga += turma.carga;
        }
      }
      cargaDocente.set(docente.nome, carga);
    }

    for (const docente of docentes) {
      if (cargaDocente.get(docente.nome) < this.params.minLimit.value) {
        qtdMenosUm += 1;
      }
    }

    data.push(
      {
        label: `Carga Menor que ${this.params.minLimit.value} (contínua).`,
        qtd: qtdMenosUm,
      }
    );

    return data;
  }

  milpHardFormulation(model: OptimizationModel, modelData: modelSCP): void {
    modelData.D.forEach((i) => {
      const terms = modelData.T.map((j) => ({
        variable: modelData.x[i][j],
        coefficient: modelData.c[j],
      }));
      model.addConstraint(
        `carga_minima_continua_hard_${i}`,
        LpSum(terms),
        ">=",
        this.params.minLimit.value,
      );
    });
  }

  milpSoftFormulation(
    model: OptimizationModel,
    modelData: modelSCP,
  ): { objectiveTerms: Term[] } {
    /**
     * Restrição: (Σ c_j * x_i,j) + y_i >= L_inf
     * Ou seja, se (Σ c_j * x_i,j) for menor que L_inf, y_i compensará.
     */
    modelData.D.forEach((i) => {
      const terms = modelData.T.map((j) => ({
        variable: modelData.x[i][j],
        coefficient: modelData.c[j],
      }));
      terms.push({ variable: modelData.y[i], coefficient: 1 });
      model.addConstraint(
        `carga_minima_continua_soft_${i}`,
        LpSum(terms),
        ">=",
        this.params.minLimit.value,
      );
    });

    /**
     * Componente na função objetivo
     */
    const objectiveTerms: Term[] = [];

    modelData.D.forEach((i) =>
      objectiveTerms.push({
        variable: modelData.y[i],
        coefficient: this.penalty * modelData.omega[i],
      }),
    );

    return { objectiveTerms };
  }
}
