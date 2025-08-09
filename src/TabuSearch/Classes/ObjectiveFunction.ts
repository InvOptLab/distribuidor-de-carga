import { Atribuicao, Docente, Formulario } from "@/context/Global/utils";
import { ObjectiveComponent } from "./Abstract/ObjectiveComponent";

/**
 * Classe que representa o custo da função objetivo.
 * Depois pode ser pensado se as penalizações devem vir para essa classe.
 */
export class ObjectiveFunction {
  /**
   * Componentes da função objetivo. Os componentes serão responsáveis por apresentar os custos a serem
   * processados pela função objetivo. Os valores serão somados ou subitraídos dependendo do tipo do componente
   * e da função objetivo.
   */
  public components: Map<string, ObjectiveComponent> = new Map<
    string,
    ObjectiveComponent
  >();

  /**
   * Tipo principal da função objetivo.
   * Caso o tipo seja "min" e o componente seja "max", o custo gerado por esse componente deve ser subtraído, caso seja "min", somado.
   * Já se o tipo seja "max" e o componente "max", deverá ser somado, e se for "min", subitraído.
   */
  protected type: "min" | "max";

  constructor(objectiveComponents: ObjectiveComponent[], type: "min" | "max") {
    this.type = type;

    for (const component of objectiveComponents) {
      this.components.set(component.name, component);
    }
  }

  /**
   * Calcula o valor final da função objetivo baseado nos componentes.
   *
   * Verificar melhor esse pensamento depois (com o Elias)
   * ObjF - Type - "max":
   *    ObjC - "min" -> subtraio
   *    ObjC - "max" -> soma
   *
   *  ObjF - Type - "min":
   *    ObjC - "min" -> soma
   *    ObjC - "max" -> soma
   *
   * @param atribuicoes
   * @param formularios
   * @param docentes
   * @returns
   */
  calculate(
    atribuicoes: Atribuicao[],
    formularios: Formulario[],
    docentes: Docente[]
  ): number {
    let valor = 0;

    for (const component of this.components.values()) {
      // if (this.type === "max") {
      //   if (component.type === "max") {
      //     valor += component.calculate(atribuicoes, formularios, docentes);
      //   } else {
      //     valor -= component.calculate(atribuicoes, formularios, docentes); // Implica que quanto menor o valor, melhor será para o problema de max
      //   }
      // }
      valor += component.calculate(atribuicoes, formularios, docentes);
    }

    return valor;
  }
}
