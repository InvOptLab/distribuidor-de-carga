import {
  type Celula,
  type Disciplina,
  type Docente,
  TipoTrava,
} from "@/algoritmo/communs/interfaces/interfaces";

function isSameLock(a: Celula, b: Celula): boolean {
  return (
    a.id_disciplina === b.id_disciplina &&
    a.nome_docente === b.nome_docente &&
    a.tipo_trava === b.tipo_trava
  );
}

export function hasLock(travas: Celula[], trava: Celula): boolean {
  return travas.some((obj) => isSameLock(obj, trava));
}

/**
 * Qualquer trava (Cell, RowCell ou ColumnCell) na célula impede atribuir/remover (B7).
 */
export function isCellLocked(
  travas: Celula[],
  nome_docente: string,
  id_disciplina: string,
): boolean {
  return travas.some(
    (trava) =>
      trava.id_disciplina === id_disciplina &&
      trava.nome_docente === nome_docente,
  );
}

/**
 * Adiciona ou remove uma trava `Cell` (B9). Outras travas na mesma célula continuam.
 */
export function setCellLock(
  travas: Celula[],
  nome_docente: string,
  id_disciplina: string,
  locked: boolean,
): Celula[] {
  const trava: Celula = {
    id_disciplina,
    nome_docente,
    tipo_trava: TipoTrava.Cell,
  };
  const exists = hasLock(travas, trava);
  if (locked) return exists ? travas : [...travas, trava];
  return exists ? travas.filter((obj) => !isSameLock(obj, trava)) : travas;
}

export function toggleCellLock(
  travas: Celula[],
  nome_docente: string,
  id_disciplina: string,
): Celula[] {
  const exists = hasLock(travas, {
    id_disciplina,
    nome_docente,
    tipo_trava: TipoTrava.Cell,
  });
  return setCellLock(travas, nome_docente, id_disciplina, !exists);
}

export function isColumnLocked(travas: Celula[], id_disciplina: string) {
  return travas.some(
    (obj) =>
      obj.id_disciplina === id_disciplina &&
      obj.tipo_trava === TipoTrava.Column,
  );
}

export function isRowLocked(travas: Celula[], nome_docente: string) {
  return travas.some(
    (obj) =>
      obj.nome_docente === nome_docente && obj.tipo_trava === TipoTrava.Row,
  );
}

/**
 * Trava `Column` + `ColumnCell` para TODOS os docentes (inclusive inativos), ou
 * remove apenas as travas Column/ColumnCell daquela turma (B9, B10).
 */
export function setColumnLock(
  travas: Celula[],
  id_disciplina: string,
  docentes: Docente[],
  locked: boolean,
): Celula[] {
  const exists = isColumnLocked(travas, id_disciplina);
  if (locked) {
    if (exists) return travas;
    const travar: Celula[] = docentes.map((docente) => ({
      id_disciplina,
      nome_docente: docente.nome,
      tipo_trava: TipoTrava.ColumnCell,
    }));
    travar.push({ id_disciplina, tipo_trava: TipoTrava.Column });
    return [...travas, ...travar];
  }
  if (!exists) return travas;
  return travas.filter(
    (obj) =>
      (obj.tipo_trava !== TipoTrava.ColumnCell &&
        obj.tipo_trava !== TipoTrava.Column) ||
      obj.id_disciplina != id_disciplina,
  );
}

export function toggleColumnLock(
  travas: Celula[],
  id_disciplina: string,
  docentes: Docente[],
): Celula[] {
  return setColumnLock(
    travas,
    id_disciplina,
    docentes,
    !isColumnLocked(travas, id_disciplina),
  );
}

/**
 * Trava `Row` + `RowCell` para TODAS as turmas (inclusive inativas), ou remove
 * apenas as travas Row/RowCell daquele docente (B9, B10).
 */
export function setRowLock(
  travas: Celula[],
  nome_docente: string,
  disciplinas: Disciplina[],
  locked: boolean,
): Celula[] {
  const exists = isRowLocked(travas, nome_docente);
  if (locked) {
    if (exists) return travas;
    const travar: Celula[] = disciplinas.map((disciplina) => ({
      id_disciplina: disciplina.id,
      nome_docente,
      tipo_trava: TipoTrava.RowCell,
    }));
    travar.push({ nome_docente, tipo_trava: TipoTrava.Row });
    return [...travas, ...travar];
  }
  if (!exists) return travas;
  return travas.filter(
    (obj) =>
      (obj.tipo_trava !== TipoTrava.RowCell &&
        obj.tipo_trava !== TipoTrava.Row) ||
      obj.nome_docente != nome_docente,
  );
}

export function toggleRowLock(
  travas: Celula[],
  nome_docente: string,
  disciplinas: Disciplina[],
): Celula[] {
  return setRowLock(
    travas,
    nome_docente,
    disciplinas,
    !isRowLocked(travas, nome_docente),
  );
}
