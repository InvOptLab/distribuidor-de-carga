import Constraint from "@/TabuSearch/Classes/Constraint";
import {
  Atribuicao,
  Celula as Trava,
  Disciplina,
  TipoTrava,
  Docente,
} from "@/context/Global/utils";

export interface Solucao {
  atribuicoes: Atribuicao[];
  avaliacao?: number;
}

// /**
//  * Função que transforma a `string` horário em um objeto.
//  * @param horario `String` original representando os horários de aula.
//  * @returns Uma lista da interface `Horario` contendo o(s) dia(s) de aula com horário de início e fim.
//  */
// function parseHorario(horario: string): Horario[] {
//   // Remove os caracteres de escape HTML e separa por <br>
//   const horariosLimpos = horario.replace(/<\/?[^>]+(>|$)/g, "").split("&emsp;");

//   const horarios: Horario[] = [];

//   horariosLimpos.forEach((horario) => {
//     // Verifica se a string contém dia e horário
//     const regex = /([\wÀ-ÿ]{3,4}\.)\s(\d{2}:\d{2})\/(\d{2}:\d{2})/;
//     const match = horario.match(regex);

//     if (match) {
//       const [, dia, inicio, fim] = match; // Extrai dia, horário de início e fim
//       horarios.push({ dia: dia as Horario["dia"], inicio, fim });
//     }
//   });

//   return horarios;
// }

// /**
//  * Função que executará a formatação dos horários de aulas das disciplinas.
//  * @param disciplinas Lista do tipo `DisciplinaETL` contendo todas as disciplinas que serão informadas no algoritmo.
//  * @returns Uma lista do tipo `Disciplina` contendo todos os ajustes nos horários.
//  */
// export function ajustaHorarioDisciplinas(
//   disciplinas: DisciplinaETL[]
// ): Disciplina[] {
//   const newDisciplinas: Disciplina[] = [];

//   // Para cada disciplina, verificar se o horário já está definido; se estiver, transformar a string no objeto da interface Horario
//   for (const disciplina of disciplinas) {
//     if (typeof disciplina.horario === "string") {
//       // Converte a string de horários para o objeto esperado
//       const horarios = parseHorario(disciplina.horario);

//       // Desestrutura o objeto e substitui o campo 'horarios'
//       const newDisciplina: Disciplina = {
//         ...disciplina,
//         horarios: horarios, // Atribui o novo valor de horários
//       };

//       // Adiciona a nova disciplina à lista
//       newDisciplinas.push(newDisciplina);
//     }
//   }

//   return newDisciplinas;
// }

// /**
//  * Função auxiliar para verificar se dois horários se sobrepõem
//  * @param horario1 Horário referente a disciplina 1
//  * @param horario2 Horário referente a disciplina 2
//  * @returns Booleano que indica se existe um conflito de horários entre as duas disciplinas.
//  */
// export function horariosSobrepoem(
//   horario1: Horario,
//   horario2: Horario
// ): boolean {
//   return (
//     horario1.dia === horario2.dia && // Mesmo dia
//     ((horario1.inicio < horario2.fim && horario1.fim > horario2.inicio) || // Sobreposição parcial ou total
//       horario1.inicio === horario2.fim || // Horários coincidentes (fim de uma é o início da outra)
//       horario1.fim === horario2.inicio)
//   );
// }

/**
 * Função para verificar igualdade entre duas atribuições.
 * @param atr1 Atribuição 1.
 * @param atr2 Atribuição 2.
 * @returns Booleano indicando se as atribuições são iguais.
 */
function atribuicoesIguais(atr1: Atribuicao, atr2: Atribuicao): boolean {
  return (
    atr1.id_disciplina === atr2.id_disciplina &&
    atr1.docentes.length === atr2.docentes.length &&
    atr1.docentes.every((docente, idx) => docente === atr2.docentes[idx])
  );
}

/**
 * Função para verificar se as atribuições do vizinho estão na lista tabu
 * @param listaTabu Lista com os N últimos conjuntos de atribuições realizadas.
 * @param atribuicoes Conjunto de novas atribuições geradas.
 * @returns Booleano que representa se o conjunto de atribuições já está na lista tabu.
 */
export function estaNaListaTabu(
  listaTabu: Atribuicao[][],
  atribuicoes: Atribuicao[]
): boolean {
  return listaTabu.some((tabuSet) =>
    // Verifica se todas as atribuições do conjunto estão na lista tabu
    atribuicoes.every((atr) =>
      tabuSet.some((tabu) => atribuicoesIguais(tabu, atr))
    )
  );
}

/**
 * Função para adicionar o conjunto de atribuições do melhor vizinho à lista tabu e manter o limite.
 * @param {Atribuicao[][]} listaTabu Lista com os N últimos conjuntos de atribuições realizadas.
 * @param {Atribuicao[]} atribuicoes Novo conjunto de atribuições realizadas.
 * @param {Number} sizeTabu Tamanho da lista Tabu.
 */
export function atualizarListaTabu(
  listaTabu: Atribuicao[][],
  atribuicoes: Atribuicao[],
  sizeTabu: number
): void {
  listaTabu.push(atribuicoes); // Adiciona o novo conjunto de atribuições à lista tabu

  // Verifica o limite da lista tabu e remove o conjunto mais antigo, se necessário
  if (listaTabu.length > sizeTabu) {
    listaTabu.shift(); // Remove o conjunto mais antigo para manter o limite
  }
}

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

/**
 * Função para checar se um docente pode ser alocado a uma disciplina
 * @param {Docente} docente
 * @param {Disciplina} disciplina
 * @param {Trava[]} travas
 * @param {Atribuicao[]} atribuicoes
 * @param {Disciplina[]} disciplinas
 * @returns {Boolean} Indicação se a atribuição do docente X à disciplina Y pode ser realizada.
 */
export function podeAtribuir(
  docente: Docente,
  disciplina: Disciplina,
  travas: Trava[],
  hardConstraints: Map<string, Constraint>
): boolean {
  /**
   * Aqui será o melhor lugar para as hardConstraints
   */
  if (
    docente !== null &&
    travas.some(
      (trava) =>
        trava.id_disciplina === disciplina.id &&
        trava.nome_docente === docente.nome
    )
  ) {
    return false;
  }

  /*// Verifica se o docente apresenta um formulário para a disciplina
  if (!docente.formularios.has(disciplina.id)) {
    return false;
  }*/

  for (const _constraint of hardConstraints.keys()) {
    const constraint = hardConstraints.get(_constraint);
    if (!constraint.hard(undefined, [docente], [disciplina])) {
      return false;
    }
  }

  return true;
}

/**
 * Verifica se uma disciplina está inválida para atribuições.
 * @param {Disciplina} disciplina A disciplina a ser verificada.
 * @param {Trava[]} travas Lista de travas.
 * @returns {boolean} True se a disciplina não puder ser manipulada.
 */
export function disciplinaInvalida(
  disciplina: Disciplina,
  travas: Trava[]
): boolean {
  return (
    !disciplina.ativo ||
    travas.some(
      (trava) =>
        trava.id_disciplina === disciplina.id &&
        trava.tipo_trava === TipoTrava.Column
    )
  );
}

/**
 * Verifica se um docente está inválido para atribuições em uma disciplina.
 * @param {Docente} docente O docente a ser verificado.
 * @param {Disciplina} disciplina A disciplina a ser atribuída.
 * @param {Trava[]} travas Lista de travas.
 * @returns {boolean} True se o docente não puder ser manipulado.
 */
export function docenteInvalido(
  docente: Docente,
  disciplina: Disciplina,
  travas: Trava[]
): boolean {
  return (
    !docente.ativo ||
    travas.some(
      (trava) =>
        trava.nome_docente === docente.nome &&
        trava.id_disciplina === disciplina.id
    )
  );
}

/**
 *
 * @param docente
 * @param disciplina
 * @param travas
 * @returns
 */
export function checaTravaCelula(
  docente: string,
  disciplina: string,
  travas: Trava[]
) {
  return (
    travas.filter(
      (trava) =>
        trava.id_disciplina === disciplina && trava.nome_docente === docente
    ).length > 0
  );
}

/**
 * Gera vizinhos ao atribuir docentes a uma disciplina.
 * @param {Atribuicao[]} solucaoAtual A solução atual.
 * @param {Docente[]} docentes Lista de docentes disponíveis.
 * @param {Disciplina} disciplina A disciplina alvo.
 * @param {Atribuicao[][]} listaTabu Lista de soluções tabu.
 * @param {Trava[]} travas Lista de travas.
 * @returns {Atribuicao[][]} Lista de vizinhos gerados ao atribuir docentes.
 */
export function gerarVizinhoComDocente(
  solucaoAtual: Atribuicao[],
  docentes: Docente[],
  disciplina: Disciplina,
  travas: Trava[],
  listaTabu: Atribuicao[][],
  hardConstraints: Map<string, Constraint>
): Atribuicao[][] {
  const novosVizinhos: Atribuicao[][] = [];

  for (const docente of docentes) {
    if (!podeAtribuir(docente, disciplina, travas, hardConstraints)) {
      continue;
    }

    const vizinho = structuredClone(solucaoAtual);
    const atrib = vizinho.find((a) => a.id_disciplina === disciplina.id);
    atrib.docentes = [docente.nome];

    if (!estaNaListaTabu(listaTabu, vizinho)) {
      novosVizinhos.push(vizinho);
    }
    novosVizinhos.push(vizinho);
  }

  return novosVizinhos;
}

/**
 * Gera um vizinho ao remover um docente de uma disciplina.
 * @param {Atribuicao[]} solucaoAtual A solução atual.
 * @param {Disciplina} disciplina A disciplina alvo.
 * @param {Atribuicao[][]} listaTabu Lista de soluções tabu.
 * @returns {Atribuicao[][]} Lista de vizinhos gerados ao remover docentes.
 */
export function gerarVizinhoComRemocao(
  solucaoAtual: Atribuicao[],
  disciplina: Disciplina,
  listaTabu: Atribuicao[][],
  travas: Trava[],
  hardConstraints: Map<string, Constraint>
): Atribuicao[][] {
  const novosVizinhos: Atribuicao[][] = [];

  /**
   * Acredito ser necessário adicionar a chamada para a função `podeAtribuir` para que seja possível verificar e tornar
   * possível a restrição (hard) 'Disciplina sem docente'.
   */
  if (!podeAtribuir(null, disciplina, travas, hardConstraints)) {
    return novosVizinhos;
  }

  const atribAtual = solucaoAtual.find(
    (a) => a.id_disciplina === disciplina.id
  );

  if (atribAtual?.docentes.length > 0) {
    // Generalizar
    // if(atribAtual.docentes.some(nome => checaTravaCelula(nome, atribAtual.id_disciplina, travas))) {
    //   return novosVizinhos;;
    // }

    const vizinho = structuredClone(solucaoAtual);
    const atrib = vizinho.find((a) => a.id_disciplina === disciplina.id);
    atrib.docentes = [];

    if (!estaNaListaTabu(listaTabu, vizinho)) {
      novosVizinhos.push(vizinho);
    }
    novosVizinhos.push(vizinho);
  }

  return novosVizinhos;
}

/**
 * Gera vizinhos ao tentar trocar docentes entre disciplinas.
 * @param {Atribuicao[]} solucaoAtual A solução atual.
 * @param {Disciplina} disciplinaPivo A disciplina "pivô" da troca.
 * @param {Disciplina[]} disciplinas Lista de todas as disciplinas.
 * @param {Docente[]} docentes Lista de todos os docentes.
 * @param {Trava[]} travas Lista de travas.
 * @param {Atribuicao[][]} listaTabu Lista de soluções tabu.
 * @returns {Atribuicao[][]} Lista de vizinhos gerados ao trocar docentes.
 */
export function gerarTrocasDeDocentes(
  solucaoAtual: Atribuicao[],
  disciplinaPivo: Disciplina,
  index: number,
  disciplinas: Disciplina[],
  docentes: Docente[],
  travas: Trava[],
  listaTabu: Atribuicao[][],
  hardConstraints: Map<string, Constraint>
): Atribuicao[][] {
  const novosVizinhos: Atribuicao[][] = [];
  const atribDocentePivo = solucaoAtual.find(
    (a) => a.id_disciplina === disciplinaPivo.id
  );

  // Se a disciplina Pivo não tiver docentes atribuídos, não há o que trocar
  if (!atribDocentePivo || atribDocentePivo.docentes.length === 0)
    return novosVizinhos;

  // Encontrar todos os docentes alocados na disciplina Pivo
  const docentesPivo = atribDocentePivo.docentes
    .map((nome) => docentes.find((d) => d.nome === nome))
    .filter(Boolean) as Docente[];
  if (
    docentesPivo.some((docente) =>
      docenteInvalido(docente, disciplinaPivo, travas)
    )
  )
    return novosVizinhos;

  // Ver as travas, se tiver trava continuar
  // if(docentesPivo.some(docente => checaTravaCelula(docente.nome, disciplinaPivo.id, travas))) {
  //   return novosVizinhos;
  // }

  // Percorrer todas as disciplinas e tentar realizar a troca de docentes
  /*for (const disciplinaAtual of disciplinas)*/
  for (let j = index + 1; j < disciplinas.length; j++) {
    const disciplinaAtual = disciplinas[j];

    if (
      disciplinaPivo.id === disciplinaAtual.id ||
      disciplinaInvalida(disciplinaAtual, travas)
    ) {
      continue;
    }

    const atribDocenteAtual = solucaoAtual.find(
      (a) => a.id_disciplina === disciplinaAtual.id
    );
    const docentesAtual =
      (atribDocenteAtual?.docentes
        .map((nome) => docentes.find((d) => d.nome === nome))
        .filter(Boolean) as Docente[]) || [];

    if (
      docentesAtual.some((docente) =>
        docenteInvalido(docente, disciplinaAtual, travas)
      )
    ) {
      continue;
    }

    // Verificar se a troca pode ser realizada: todos os docentes do Pivo podem ir para a Atual e vice-versa
    const trocaValida =
      docentesPivo.every((docente) =>
        podeAtribuir(docente, disciplinaAtual, travas, hardConstraints)
      ) &&
      docentesAtual.every((docente) =>
        podeAtribuir(docente, disciplinaPivo, travas, hardConstraints)
      ) &&
      !compareArrays(docentesPivo, docentesAtual);

    if (trocaValida) {
      const vizinho = structuredClone(solucaoAtual);

      const atrib1 = vizinho.find((a) => a.id_disciplina === disciplinaPivo.id);
      const atrib2 = vizinho.find(
        (a) => a.id_disciplina === disciplinaAtual.id
      );

      // Realizar a troca de docentes entre as duas disciplinas
      atrib1.docentes = docentesAtual.map((d) => d.nome);
      atrib2.docentes = docentesPivo.map((d) => d.nome);

      if (!estaNaListaTabu(listaTabu, vizinho)) {
        novosVizinhos.push(vizinho);
      }
      novosVizinhos.push(vizinho);
    }
  }

  return novosVizinhos;
}

/**
 * Compara duas listas. (``atribuicoesIguais``)
 * @param array1
 * @param array2
 * @returns
 */
export function compareArrays<T>(array1: T[], array2: T[]): boolean {
  if (array1.length !== array2.length) {
    return false;
  }

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Função utilizada para verificar e ajustar os dados enviados pelo usuário.
 * @param {Atribuicao[]} atribuicoes Atribuições iniciais do algoritmo.
 * @param {Docente[]} docentes Lista com todos os docentes.
 * @param {Disciplina[]} disciplias Lista com todas as disciplinas.
 * @param {Trava[]} travas Lista contendo todas as travas geradas pelo usuário.
 * @returns {Atribuicao[]} Atribuições verificadas e alteradas caso necessário.
 */
export function processarAtribuicaoInicial(
  atribuicoes: Atribuicao[],
  docentes: Docente[],
  disciplias: Disciplina[],
  travas: Trava[]
): Atribuicao[] {
  // Passa por cada atribuição e verifica se ela poderia ter sido feita
  for (const atribuicao of atribuicoes) {
    // Verifica se existe alguma atribuição
    if (atribuicao.docentes.length === 0) {
      continue;
    }

    const disciplia: Disciplina = disciplias.find(
      (disc) => disc.id === atribuicao.id_disciplina
    );

    // Verifica se a disciplina está "válida"
    if (disciplinaInvalida(disciplia, travas)) {
      // Remove a disciplina das atribuições
      //atribuicoes = atribuicoes.filter(atrib => atrib.id_disciplina !== disciplia.id)
      continue;
    }

    const docentesAtribuidos: Docente[] = docentes.filter((docente) =>
      atribuicao.docentes.includes(docente.nome)
    );

    // Verifica se todos os docentes atribuidos a disciplinas são "válidos"
    if (
      docentesAtribuidos.every((docente) =>
        docenteInvalido(docente, disciplia, travas)
      )
    ) {
      continue;
    }

    // TODO 30/09/2024 - Verificar se está correto
    // for(const docente of docentesAtribuidos) {
    //   if(docenteInvalido(docente, disciplia, travas)) {
    //     atribuicoes = atribuicoes.filter(atrib => atrib.docentes.filter(doc => doc !== docente.nome))
    //   }
    // }

    // Alterar a lista de atribuições caso um docente tenha sido atribuído sem formulário
    const newDocentes: string[] = [];
    for (const docente of docentesAtribuidos) {
      if (docente.formularios.has(disciplia.id)) {
        newDocentes.push(docente.nome);
      }
    }

    atribuicao.docentes = newDocentes;
  }

  return atribuicoes;
}

export function comparaSolucoes(
  solucao1: Atribuicao[],
  solucao2: Atribuicao[]
) {
  if (solucao1.length !== solucao2.length) {
    return false;
  }

  for (let i = 0; i < solucao1.length; i++) {
    if (solucao1[i].id_disciplina !== solucao2[i].id_disciplina) {
      return false;
    }
    if (solucao1[i].docentes.length !== solucao2[i].docentes.length) {
      return false;
    }

    for (let j = 0; j < solucao1[i].docentes.length; j++) {
      if (solucao1[i].docentes[j] !== solucao2[i].docentes[j]) {
        return false;
      }
    }
  }

  return true;
}

export function diferencasEntreSolucoes(
  solucao1: Atribuicao[],
  solucao2: Atribuicao[]
) {
  const diferencas = [];

  if (solucao1.length !== solucao2.length) {
    diferencas.push("Diferença nos tamanhos");
  }

  for (let i = 0; i < solucao1.length; i++) {
    if (solucao1[i].id_disciplina !== solucao2[i].id_disciplina) {
      diferencas.push(
        `Ordem errada das Turmas ${solucao1[i].id_disciplina} - ${solucao2[i].id_disciplina}`
      );
    }
    if (solucao1[i].docentes.length !== solucao2[i].docentes.length) {
      diferencas.push(
        `Diferença de tamanho entre os docentes ${solucao1[i].docentes.length} - ${solucao2[i].docentes.length}`
      );
    }

    for (let j = 0; j < solucao1[i].docentes.length; j++) {
      if (solucao1[i].docentes[j] !== solucao2[i].docentes[j]) {
        diferencas.push(
          `Diferença entre Docentes ${solucao1[i].docentes[j]} - ${solucao2[i].docentes[j]} em ${solucao1[i].id_disciplina} - ${solucao2[i].id_disciplina}`
        );
      }
    }
  }

  return diferencas;
}
