import Algorithm from "@/algoritmo/abstractions/Algorithm";
import { Horario, Solucao } from "@/algoritmo/communs/interfaces/interfaces";
export interface Docente {
  nome: string;
  saldo?: number;
  ativo: boolean;
  formularios: Map<string, number>; // id_disciplina, prioridade
  trava: boolean; //flag trava: boolean, que será alterada quando uma linha inteira for travada.
  // Pensar se faz sentido colocar um Set com as Disciplinas que o docente foi alocado
  comentario?: string;
  agrupar?: string; //"Indiferente" | "Agrupar" | "Espalhar" | "";
}

export interface DisciplinaETL {
  codigo: string;
  turma: number;
  nome: string;
  horario: string;
  cursos: string;
  ementa: string;
  id: string;
  nivel: string;
  prioridade: number;
  noturna: boolean;
  ingles: boolean;
  docentes?: string[];
  ativo: boolean;
  horarios?: Horario[];
  grupo?: string;
  carga?: number;
}

export interface Disciplina {
  id: string;
  codigo: string;
  turma: number;
  nome: string;
  horario: string;
  horarios: Horario[];
  cursos: string;
  ementa: string;
  nivel: string;
  prioridade: number;
  noturna: boolean;
  ingles: boolean;
  docentes?: string[];
  ativo: boolean;
  conflitos: Set<string>; // Ids das disciplinas que apresentam choque de horário
  trava: boolean; // flag trava: boolean, que será alterada quando uma coluna inteira for travada.
  // Pensar se faz sentido colocar um Set com os Docentes alocados para a Disciplina
  grupo: string; // Caso não tenha deve ser ums string vazia
  carga?: number;
}

export interface Atribuicao {
  id_disciplina: string;
  docentes: string[];
}

export interface Formulario {
  id_disciplina: string;
  nome_docente: string;
  prioridade: number;
}

export enum TipoTrava {
  NotTrava, //
  Column,
  Row,
  Cell,
  ColumnCell, // Identificar se, após a coluna ser destravada, a célula deve continuar travada
  RowCell, // Identificar se, após a linha ser destravada, a célula deve continuar travada
}

export interface Celula {
  id_disciplina?: string;
  nome_docente?: string;
  tipo_trava?: TipoTrava;
  trava?: boolean;
}

export interface ContextoExecucao {
  docentes: Docente[];
  disciplinas: Disciplina[];
  travas: Celula[];
  maxPriority: number;
  formularios: Formulario[];
}

export interface Estatisticas {
  tempoExecucao: number;
  iteracoes: number;
  interrupcao: boolean;
  avaliacaoPorIteracao: Map<number, number>;
  tempoPorIteracao: Map<number, number>;
  docentesPrioridade?: Map<number, number>; // Quantidade de docentes por prioridade (histograma)
  qtdOcorrenciasRestricoes?: Map<string, { label: string; qtd: number }[]>;
}

export enum TipoInsercao {
  Algoritmo = "Algoritmo",
  Manual = "Manual",
  Importação = "Importação",
}

export interface HistoricoSolucao {
  id: string;
  datetime: string;
  solucao: Solucao;
  tipoInsercao: TipoInsercao;
  contexto: ContextoExecucao;
  algorithm?: Algorithm<any>;
}

/**
 * Verifica se um objeto é do tipo Disciplina
 * @param obj Objeto a ser verificado
 * @returns Objeto do tipo Disciplina
 */
export function isDisciplina(obj: Docente | Disciplina): obj is Disciplina {
  return "id" in obj;
}

/**
 * Verifica se o objeto fornecido é do tipo Horario.
 * @param obj O objeto a ser verificado.
 * @returns Booleano indicando se o objeto é um Horario.
 */
export function isHorario(obj: string | Horario): obj is Horario {
  return (
    typeof obj !== "string" &&
    obj !== null &&
    typeof obj === "object" &&
    "dia" in obj &&
    "inicio" in obj &&
    "fim" in obj
  );
}

/**
 * Função que transforma a `string` horário em um objeto.
 * @param horario `String` original representando os horários de aula.
 * @returns Uma lista da interface `Horario` contendo o(s) dia(s) de aula com horário de início e fim.
 */
function parseHorario(horario: string): Horario[] {
  // Remove os caracteres de escape HTML e separa por <br>
  const horariosLimpos = horario.replace(/<\/?[^>]+(>|$)/g, "").split("&emsp;");

  const horarios: Horario[] = [];

  horariosLimpos.forEach((horario) => {
    // Verifica se a string contém dia e horário
    const regex = /([\wÀ-ÿ]{3,4}\.)\s(\d{2}:\d{2})\/(\d{2}:\d{2})/;
    const match = horario.match(regex);

    if (match) {
      const [, dia, inicio, fim] = match; // Extrai dia, horário de início e fim
      horarios.push({ dia: dia as Horario["dia"], inicio, fim });
    }
  });

  return horarios;
}

/**
 * Função que executará a formatação dos horários de aulas das disciplinas.
 * @param disciplinas Lista do tipo `DisciplinaETL` contendo todas as disciplinas que serão informadas no algoritmo.
 * @returns Uma lista do tipo `Disciplina` contendo todos os ajustes nos horários.
 */
export function ajustaDisciplinas(
  version: string,
  disciplinas: DisciplinaETL[]
): Disciplina[] {
  const newDisciplinas: Disciplina[] = [];

  let newDisciplina;
  // Para cada disciplina, verificar se o horário já está definido; se estiver, transformar a string no objeto da interface Horario
  for (const disciplina of disciplinas) {
    if (
      typeof disciplina.horario === "string" &&
      !version.includes("2") /*!= "2.0"*/
    ) {
      // Converte a string de horários para o objeto esperado
      const horarios = parseHorario(disciplina.horario);

      // Desestrutura o objeto e substitui o campo 'horarios'
      newDisciplina = {
        ...disciplina,
        horarios: horarios, // Atribui o novo valor de horários
        conflitos: new Set(),
        trava: false,
      };
    } else {
      // Desestrutura o objeto e substitui o campo 'horarios'
      newDisciplina = {
        ...disciplina,
        conflitos: new Set(),
        trava: false,
      };
    }
    // Adiciona a nova disciplina à lista
    newDisciplinas.push(newDisciplina);
  }

  return newDisciplinas;
}

/**
 * Função auxiliar para verificar se dois horários se sobrepõem
 * @param horario1 Horário referente a disciplina 1
 * @param horario2 Horário referente a disciplina 2
 * @returns Booleano que indica se existe um conflito de horários entre as duas disciplinas.
 */
export function horariosSobrepoem(
  horario1: Horario,
  horario2: Horario
): boolean {
  return (
    horario1.dia === horario2.dia && // Mesmo dia
    ((horario1.inicio < horario2.fim && horario1.fim > horario2.inicio) || // Sobreposição parcial ou total
      horario1.inicio === horario2.fim || // Horários coincidentes (fim de uma é o início da outra)
      horario1.fim === horario2.inicio)
  );
}

/**
 * Função utilizada para clonar um state da aplicação.
 * @param arr State da aplicação a ser clonado.
 * @returns Uma lista do mesmo tipo do parâmetro informado.
 */
export function cloneDeepArray<T>(arr: T[]): T[] {
  return arr.map((item) => cloneDeep(item));
}

/**
 * Função utilizada para clonar um objeto ou array.
 * @param obj Objeto ou array a ser clonado.
 * @returns Uma cópia do objeto ou array fornecido.
 */
export function cloneDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj; // Retorna o valor primitivo (não um objeto)
  }

  if (Array.isArray(obj)) {
    return cloneDeepArray(obj) as T; // Clona cada item do array
  }

  // Cria um novo objeto e clona cada propriedade recursivamente
  const result = Object.create(Object.getPrototypeOf(obj)) as T;
  for (const key of Object.keys(obj)) {
    (result as any)[key] = cloneDeep((obj as any)[key]);
  }
  return result;
}

/**
 * Função que retorna os itens ativos (onde ativo === true) de um array de objetos.
 * @param obj Array de objetos que possuem a propriedade 'ativo'.
 * @returns Um novo array filtrado apenas com os itens onde 'ativo' é true.
 */
export function getActives<T extends { ativo: boolean }>(obj: T[]): T[] {
  // Retorna um array filtrado apenas com os itens onde ativo é true
  return obj.filter((item) => item.ativo);
}

/**
 * Função responsável por realizar todos os pré-processamentos necessários nos parâmetros da função de busca tabu
 * @param disciplinas Disciplinas a serem filtradas e copiadas para não alterar o state global.
 * @param docentes Docentes a serem filtrados.
 * @param formularios Formularios a serem filtrados, apenas com disciplinas e docentes ativos.
 * @param travas Travas a serem filtradas, apenas com disciplinas e docentes ativos.
 * @param atribuicoes Atribuições a serem filtradas, mantendo apenas disciplinas ativas e removendo da lista de docentes os não ativos.
 * @returns Um objeto com todos os parâmetros processados.
 */
export function processData(
  disciplinas: Disciplina[],
  docentes: Docente[],
  formularios: Formulario[],
  travas: Celula[],
  atribuicoes: Atribuicao[]
) {
  const processedDisciplinas: Disciplina[] = structuredClone(
    getActives(disciplinas)
  );
  const processedDocentes: Docente[] = getActives(docentes);

  // Pré-processar as disciplinas e docentes ativos em um mapa para acesso rápido
  const disciplinasAtivas = new Set(
    disciplinas
      .filter((disciplina) => disciplina.ativo)
      .map((disciplina) => disciplina.id)
  );
  const docentesAtivos = new Set(
    docentes.filter((docente) => docente.ativo).map((docente) => docente.nome)
  );

  // Filtrar os formularios com base nas disciplinas e docentes ativos
  const processedFormularios: Formulario[] = formularios.filter(
    (formulario) =>
      disciplinasAtivas.has(formulario.id_disciplina) &&
      docentesAtivos.has(formulario.nome_docente)
  );

  // Filtrar as travas com base nas disciplinas e docentes ativos
  const processedTravas: Celula[] = travas.filter(
    (trava) =>
      disciplinasAtivas.has(trava.id_disciplina) &&
      docentesAtivos.has(trava.nome_docente)
  );

  // Filtrar as atribuições com base nas disciplinas e docentes ativos
  const processedAtribuicoes: Atribuicao[] = atribuicoes
    .filter((atribuicao) => disciplinasAtivas.has(atribuicao.id_disciplina)) // Mantém apenas atribuições com disciplinas ativas
    .map((atribuicao) => {
      // Filtrar os docentes ativos em cada atribuição
      return {
        ...atribuicao,
        docentes: atribuicao.docentes.filter((docente) =>
          docentesAtivos.has(docente)
        ), // Mantém apenas os docentes ativos
      };
    });

  // p -> Processados
  return {
    pDisciplinas: processedDisciplinas,
    pDocentes: processedDocentes,
    pFormularios: processedFormularios,
    pTravas: processedTravas,
    pAtribuicoes: processedAtribuicoes,
  };
}

export function getActiveFormularios(
  formularios: Formulario[],
  disciplinas: Disciplina[],
  docentes: Docente[]
) {
  const disciplinasAtivas = getActives(disciplinas).map((obj) => obj.id);
  const docentesAtivos = getActives(docentes).map((obj) => obj.nome);

  return formularios.filter(
    (formulario) =>
      disciplinasAtivas.includes(formulario.id_disciplina) &&
      docentesAtivos.includes(formulario.nome_docente)
  );
}
