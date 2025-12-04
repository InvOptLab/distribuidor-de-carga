import {
  Atribuicao,
  Disciplina,
  Docente,
  Formulario,
  ObjectiveComponentParams,
} from "../communs/interfaces/interfaces";
import { modelSCP } from "../metodos/MILP/MILP";
import { OptimizationModel, Term } from "../metodos/MILP/optimization_model";

export default abstract class ObjectiveComponent<
  T extends ObjectiveComponentParams[] | any
> {
  /**
   * Nome dado a componente da função objetivo
   */
  readonly name: string;

  /**
   * Detalhes sobre o componente da função objetivo.
   */
  description: string;

  isActive: boolean;

  /**
   * Multiplicador que será aplicado ao custo (resultado final).
   */
  multiplier: number;

  /**
   * Tipo do componente. Esse valor será utilizado posteriormente para sabermos se iremos
   * somar o valor ao acumulado da função objetivo ou subtrairemos.
   */
  type: "min" | "max";

  public params: T;

  constructor(
    name: string,
    isActive: boolean,
    type: "min" | "max",
    description: string | undefined,
    multiplier: number | undefined
  ) {
    this.name = name;
    this.isActive = isActive;
    this.description = description
      ? description
      : "Nenhuma descrição informada";
    this.multiplier = multiplier ? multiplier : 1;
    this.type = type;
  }

  /**
   * Função que calculará o custo do componente da função objetivo.
   * Caso não implementado, o método apresenta uma implementação padrão, entretanto, ele não se adequa a implementação default
   * esperada.
   *
   * @param atribuicoes Conjunto que representa os docentes atribuídos as turmas.
   * @param formularios Conjunto contendo as prioridades que os docentes atribuíram as turmas.
   */
  abstract calculate(
    atribuicoes: Atribuicao[],
    formularios: Formulario[],
    docentes: Docente[],
    turmas: Disciplina[]
  ): number;

  /**
   * (NOVO) Método para formulação do componente na função objetivo do MILP.
   * Retorna os termos que devem ser somados/subtraídos.
   */
  abstract milpFormulation(
    model: OptimizationModel,
    modelData: modelSCP
  ): Term[];
}
