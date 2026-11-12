import type {
  Disciplina,
  Docente,
  Formulario,
  Horario,
} from "@/algoritmo/communs/interfaces/interfaces";

export function docente(nome: string, extra: Partial<Docente> = {}): Docente {
  return {
    nome,
    ativo: true,
    saldo: 0,
    formularios: new Map(),
    trava: false,
    ...extra,
  };
}

export function turma(id: string, extra: Partial<Disciplina> = {}): Disciplina {
  return {
    id,
    codigo: id.split("-")[0],
    turma: 1,
    nome: `Turma ${id}`,
    horario: "",
    horarios: [] as Horario[],
    cursos: "",
    ementa: "",
    nivel: "Graduação",
    prioridade: 0,
    noturna: false,
    ingles: false,
    ativo: true,
    conflitos: new Set<string>(),
    trava: false,
    grupo: "",
    ...extra,
  };
}

export function form(
  nome_docente: string,
  id_disciplina: string,
  prioridade: number,
): Formulario {
  return { nome_docente, id_disciplina, prioridade };
}
