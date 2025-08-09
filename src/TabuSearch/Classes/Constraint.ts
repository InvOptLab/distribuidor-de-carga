import {
  Atribuicao,
  Celula,
  Disciplina,
  Docente,
  TipoTrava,
} from "@/context/Global/utils";

// export interface ConstraintInterface {
//   readonly name: string;
//   isHard: boolean;
//   penalty: number;
// }

interface ConstraintInterface {
  name: string;
  tipo: "Hard" | "Soft";
  penalidade: string;
  descricao: string;
  constraint: new (...args: any[]) => Constraint;
}

/**
 * Classe que será tomada como base para qualquer restrição que for criada para qualquer método dentro do sistema.
 * Ela obrigará que todas as informações e métodos basicos sejam criados.
 *
 * A ideia é que possamos escolher qual será o comportamento da restrição, podendo ser alterado.
 */
export default abstract class Constraint {
  /**
   * Propriedades
   */
  /**
   * Nome dado a resttição
   */
  readonly name: string;

  /**
   * Detalhes sobre a restrição
   */
  description: string;

  /**
   * Se `true` o comportamento selecionado deve ser this.hard(), caso contrário this.soft().
   */
  isHard: boolean;

  /**
   * Nome do algoritmo que a restrição pertence
   * @ Irei avaliar a necessidade de apresentar o algoritmo na classe Restrição
   */
  //algorithm: string;

  /**
   * Penalidade que será atribuída a função `soft`
   */
  penalty: number;

  /**
   * Indica se a restrição está ativa
   */
  isActive: boolean;

  /**
   * Construtor
   */
  constructor(
    name: string,
    description: string,
    /*algorithm: string,*/ isHard: boolean,
    penalty: number,
    isActive: boolean = true
  ) {
    this.name = name;
    this.description = description;
    /*this.algorithm = algorithm;*/
    this.isHard = isHard;
    this.penalty = penalty;
    this.isActive = isActive;
  }

  /**
   * Métodos
   */
  soft?(
    atribuicoes?: Atribuicao[],
    docentes?: Docente[],
    disciplinas?: Disciplina[],
    travas?: Celula[]
  ): number;
  hard?(
    atribuicoes?: Atribuicao[],
    docentes?: Docente[],
    disciplinas?: Disciplina[],
    travas?: Celula[]
  ): boolean;

  abstract toObject(): ConstraintInterface;

  /**
   * Método responsável por retornar a quantidade de vezes que a restrição é quebrada em um conjunto
   * de atribuições.
   * Uma forma simples de implementar esse método é chamar o método `this.soft` e dividir o resultado
   * pelo valor da penalidade `this.penalty`, resultando em exatamenta a quantidade de vezes que
   * a restrição foi quebrada.
   * **Vale ressaltar que para essa ideia funcionar, o valhor de `this.penalty` deve ser diferente de 0.**
   * @example
   *  return this.soft(atribuicoes) / this.penalty
   * @returns {Array<string, number} Quantidade de vezes que a restrição foi quebrada com um
   * título para representa-lo.
   * @example
   * return [{label: docentes, qtd: 5}, {label: turmas, qtd: 1]
   */
  occurrences?(
    atribuicoes: Atribuicao[],
    docentes?: Docente[],
    disciplinas?: Disciplina[],
    travas?: Celula[]
  ): { label: string; qtd: number }[];
}

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

  soft(atribuicoes?: Atribuicao[]): number {
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
    return docentes.length > 0 && !docentes.includes(null);
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
}

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
    atribuicoes?: Atribuicao[],
    docentes?: Docente[],
    disciplinas?: Disciplina[]
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
    atribuicoes?: Atribuicao[],
    docentes?: Docente[],
    disciplinas?: Disciplina[]
  ): boolean {
    if (atribuicoes !== undefined) {
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
}

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
    atribuicoes?: Atribuicao[],
    docentes?: Docente[]
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
    atribuicoes?: Atribuicao[],
    docentes?: Docente[],
    disciplinas?: Disciplina[]
  ): boolean {
    /**
     * Se a disciplina não foi informado quer dizer que estamos verificando todo o contexto
     */
    if (disciplinas === undefined && atribuicoes !== undefined) {
      for (const docente of docentes) {
        const docenteAtribuicoes = atribuicoes.filter((atribuicao) =>
          atribuicao.docentes.includes(docente.nome)
        );

        for (const atribuicao of docenteAtribuicoes) {
          if (!docente.formularios.has(atribuicao.id_disciplina)) {
            return false;
          }
        }
      }
    } else {
      //Caso o docente seja null
      if (docentes.some((docente) => !docente)) {
        return false;
      }

      // Se a disciplina foi informado quer dizer que estamos verificando um contexto específico
      for (const docente of docentes) {
        for (const disciplia of disciplinas) {
          if (!docente.formularios.has(disciplia.id)) {
            return false;
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
      constraint: AtribuicaoSemFormulario,
    };
  }
}

/**
 * Penaliza a quantidade de carga de trabalho baseada nos saldos dos docentes.
 */
export class CargaDeTrabalho extends Constraint {
  constructor(
    name: string,
    description: string,
    /*algorithm: string,*/
    isHard: boolean,
    penalty: number
  ) {
    super(name, description, isHard, penalty);
  }

  soft(atribuicoes: Atribuicao[], docentes: Docente[]): number {
    let avaliacao: number = 0;
    /**
     * Contar a quantidade de atribuições por docente
     */
    const qtdAtribDocentes = new Map<string, number>();
    for (const docente of docentes) {
      const qtd = atribuicoes.filter((atribuicao) =>
        atribuicao.docentes.includes(docente.nome)
      ).length;
      qtdAtribDocentes.set(docente.nome, qtd);
    }

    /**
     * Penalização com base no saldo
     */
    for (const docente of docentes) {
      if (qtdAtribDocentes.get(docente.nome) > 2) {
        avaliacao -= this.penalty * (docente.saldo < -1.0 ? 0.75 : 1.0);
      } else if (qtdAtribDocentes.get(docente.nome) < 1) {
        avaliacao -= this.penalty * (docente.saldo > 1.0 ? 1.0 : 0.75);
      }
    }

    return avaliacao;
  }

  toObject(): ConstraintInterface {
    return {
      name: this.name,
      descricao: this.description,
      tipo: this.isHard ? "Hard" : "Soft",
      penalidade: String(this.penalty),
      constraint: CargaDeTrabalho,
    };
  }
}

/**
 * Restrição para não permitir a geração de movimentos em turmsa ou docentes com travas
 */
export class ValidaTravas extends Constraint {
  constructor(
    name: string,
    description: string,
    /*algorithm: string,*/
    isHard: boolean,
    penalty: number
  ) {
    super(name, description, isHard, penalty);
  }

  hard(
    atribuicoes?: Atribuicao[],
    docentes?: Docente[],
    disciplinas?: Disciplina[],
    travas?: Celula[]
  ): boolean {
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
        return false;
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
        return false;
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
}
