import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const atribuirDocenteTool = tool(
  async (input) => `Execução delegada ao cliente para atribuir docente ${input.nome_docente} à turma ${input.identificador_turma}`,
  {
    name: "atribuir_docente",
    description: "Atribui um docente a uma turma/disciplina específica.",
    schema: z.object({
      nome_docente: z.string().describe("O nome ou parte do nome do docente a ser atribuído"),
      identificador_turma: z.string().describe("O código exato (ex: MAT01) ou o nome da turma/disciplina"),
    }),
  }
);

export const removerAtribuicaoTool = tool(
  async (input) => `Execução delegada ao cliente para remover docente ${input.nome_docente} da turma ${input.identificador_turma}`,
  {
    name: "remover_atribuicao",
    description: "Remove um docente previamente alocado de uma disciplina/turma específica.",
    schema: z.object({
      nome_docente: z.string().describe("O nome ou parte do nome do docente a ser removido"),
      identificador_turma: z.string().describe("O código exato (ex: MAT01) ou o nome da turma/disciplina"),
    }),
  }
);

export const travarAtribuicaoTool = tool(
  async (input) => `Execução delegada ao cliente para travar a atribuição da turma ${input.identificador_turma}`,
  {
    name: "travar_atribuicao",
    description: "Trava uma turma inteira ou a atribuição de um docente para uma turma.",
    schema: z.object({
      nome_docente: z.string().optional().describe("Opcional. Nome do docente. Se vazio, trava a turma toda."),
      identificador_turma: z.string().describe("O código exato ou o nome da turma a ser travada"),
    }),
  }
);

export const destravarAtribuicaoTool = tool(
  async (input) => `Execução delegada ao cliente para destravar a atribuição da turma ${input.identificador_turma}`,
  {
    name: "destravar_atribuicao",
    description: "Remove a trava (destrava) de uma turma inteira ou a atribuição de um docente para uma turma.",
    schema: z.object({
      nome_docente: z.string().optional().describe("Opcional. Nome do docente. Se vazio, destrava a turma toda."),
      identificador_turma: z.string().describe("O código exato ou o nome da turma a ser destravada"),
    }),
  }
);

export const limparAtribuicoesDocenteTool = tool(
  async (input) => `Execução delegada ao cliente para limpar atribuições de ${input.nome_docente}`,
  {
    name: "limpar_atribuicoes_docente",
    description: "Retira o docente de todas as turmas nas quais ele já foi atribuído.",
    schema: z.object({
      nome_docente: z.string().describe("O nome ou parte do nome do docente"),
    }),
  }
);

export const alterarStatusDocenteTool = tool(
  async (input) => `Execução delegada ao cliente para alterar status de ${input.nome_docente}`,
  {
    name: "alterar_status_docente",
    description: "Ativa ou desativa um docente no sistema.",
    schema: z.object({
      nome_docente: z.string().describe("O nome ou parte do nome do docente"),
      ativar: z.boolean().describe("true para ativar, false para desativar"),
    }),
  }
);

export const consultarEstadoDocenteTool = tool(
  async (input) => `Execução delegada ao cliente para gerar relatório de ${input.nome_docente}`,
  {
    name: "consultar_estado_docente",
    description: "Verifica e responde quais são as turmas atuais que um docente está ministrando ou seu status.",
    schema: z.object({
      nome_docente: z.string().describe("O nome ou parte do nome do docente"),
    }),
  }
);

export const consultarEstadoTurmaTool = tool(
  async (input) => `Execução delegada ao cliente para gerar relatório da turma ${input.identificador_turma}`,
  {
    name: "consultar_estado_turma",
    description: "Verifica e responde quais docentes já foram alocados em uma turma específica.",
    schema: z.object({
      identificador_turma: z.string().describe("O código exato (ex: MAT01) ou o nome da turma/disciplina"),
    }),
  }
);

export const aiTools = [
  atribuirDocenteTool,
  removerAtribuicaoTool,
  travarAtribuicaoTool,
  destravarAtribuicaoTool,
  limparAtribuicoesDocenteTool,
  alterarStatusDocenteTool,
  consultarEstadoDocenteTool,
  consultarEstadoTurmaTool
];

