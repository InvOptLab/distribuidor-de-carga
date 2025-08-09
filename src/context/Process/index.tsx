import { createContext, useContext, useEffect, useState } from "react";
import { useGlobalContext } from "../Global";
import {
  Disciplina,
  Docente,
  horariosSobrepoem,
  TipoTrava,
} from "../Global/utils";

type Trava = {
  ativa: boolean;
  tipo_trava?: TipoTrava;
};

export interface Cell {
  // Representa cada célula da tabela
  id_disciplina: string;
  nome_docente: string;
  trava: Trava;
  prioridade: number; // Prioridade dada do docente a disciplina
}

interface ProcessInterface {
  disciplinas: Map<string, Disciplina>;
  setDisciplinas: React.Dispatch<React.SetStateAction<Map<string, Disciplina>>>;
  docentes: Map<string, Docente>;
  setDocentes: React.Dispatch<React.SetStateAction<Map<string, Docente>>>;
}

const ProcessContext = createContext<ProcessInterface>({
  disciplinas: new Map<string, Disciplina>(),
  setDisciplinas: () => [],
  docentes: new Map<string, Docente>(),
  setDocentes: () => [],
});

/**
 * Contexto que será responsável por ter as informações que serão enviadas para a execução do algoritmo,
 * como também, exibidas no componente Timetable.
 * A ideia é facilitar e remodelar a forma como está sendo tratada a informação.
 * Esse contexto terá apenas dados ativos e "ajustados" conferme necessário.
 *
 * Exemplo:
 *  As disciplinas tem uma lista de conflitos, tendo em vista que a disciplina A tem conflito com a B e C,
 * se a B for inativada, a lista de conflitos da disciplina A deve ser atualizado devido ao fato de que essa não modificação
 * acarretará em problemas na execução do algoritmo.
 *
 * Essec omponente também apresnetará estruturas disferentes do contexto Global, visando uma maior performânce e facilidade
 * para acessar as informações.
 */
export function ProcessWrapper({ children }: { children: React.ReactNode }) {
  const { disciplinas: globalDisciplinas, docentes: globalDocentes } =
    useGlobalContext();
  const [disciplinas, setDisciplinas] = useState<Map<string, Disciplina>>(
    new Map<string, Disciplina>()
  );
  const [docentes, setDocentes] = useState<Map<string, Docente>>(
    new Map<string, Docente>()
  );

  useEffect(() => {
    if (globalDisciplinas.length > 0) {
      // Atualizar a variável disciplinas
      // TODO: implementar um algoritmo de Diff para otimizar o processo, atualizando apenas aquilo que será necessário
      const newDiciplinas: Map<string, Disciplina> = new Map<
        string,
        Disciplina
      >();

      // Preenche a lista de conflitos por disciplina
      // Vale ressaltar que, Horário de A e B conflitam, adicionar B em A e A em B, assim pode-se utilizar o j sendo i + 1 (próximo)
      for (let i = 0; i < globalDisciplinas.length; i++) {
        // Verifica se a disciplina pivo está inativa
        if (!globalDisciplinas[i].ativo) {
          continue;
        }

        // Verifica se a disciplina pivo já foi criada
        if (!newDiciplinas.has(globalDisciplinas[i].id)) {
          // Inicializa uma nova disciplina para a pivo
          newDiciplinas.set(globalDisciplinas[i].id, {
            ...globalDisciplinas[i],
            conflitos: new Set<string>(),
          });
        }

        const disciplinaPivo: Disciplina = newDiciplinas.get(
          globalDisciplinas[i].id
        );

        // Itera sob as demais disciplinas
        for (let j = i + 1; j < globalDisciplinas.length; j++) {
          // Verifica se a disciplina atual está inativa
          if (!globalDisciplinas[j].ativo) {
            continue;
          }

          // Verifica se a disciplina pivo já foi criada
          if (!newDiciplinas.has(globalDisciplinas[j].id)) {
            // Inicializa uma nova disciplina para a atual
            newDiciplinas.set(globalDisciplinas[j].id, {
              ...globalDisciplinas[j],
              conflitos: new Set<string>(),
            });
          }

          const disciplinaAtual: Disciplina = newDiciplinas.get(
            globalDisciplinas[j].id
          );

          // Iteração para os horários e verificação de conflitos
          for (const horarioPivo of disciplinaPivo.horarios) {
            for (const horarioAtual of disciplinaAtual.horarios) {
              if (horariosSobrepoem(horarioPivo, horarioAtual)) {
                disciplinaPivo.conflitos.add(disciplinaAtual.id);
                disciplinaAtual.conflitos.add(disciplinaPivo.id);
              }
            }
          }
        }
      }
      setDisciplinas(newDiciplinas);
    }
  }, [globalDisciplinas]);

  useEffect(() => {
    if (globalDocentes.length > 0) {
      // Atualizar os docentes
      const newDocentes: Map<string, Docente> = new Map<string, Docente>();

      for (const docente of globalDocentes) {
        // Verifica se o docente está ativo
        if (!docente.ativo) {
          continue;
        }

        // Criar um novo docente tendo em vista que o Map `formulários` deve apresentar somente as disciplinas ativas
        // Verificar se o state `disciplinas` deste componente existe
        let newDocente: Docente;
        if (disciplinas.size > 0) {
          const formulariosDisciplinasAtivas: Map<string, number> = new Map();

          // Verifica as disciplinas do formulário
          docente.formularios.forEach((value, key) => {
            if (disciplinas.has(key)) {
              formulariosDisciplinasAtivas.set(key, value); // Adiciona ao novo Map se a chave existir em disciplinas
            }
          });
          newDocente = {
            ...docente,
            formularios: formulariosDisciplinasAtivas,
          };
        } else {
          newDocente = { ...docente };
        }

        newDocentes.set(newDocente.nome, newDocente);
      }
      setDocentes(newDocentes);
    }
  }, [disciplinas, globalDocentes]);

  return (
    <ProcessContext.Provider
      value={{ disciplinas, setDisciplinas, docentes, setDocentes }}
    >
      {children}
    </ProcessContext.Provider>
  );
}

export function useProcessContext() {
  return useContext(ProcessContext);
}
