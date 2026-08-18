import { Document } from "langchain";

export interface LLMResponse {
  content: string;
  toolCalls?: {
    name: string;
    args: Record<string, any>;
  }[];
}

export interface ILLMProvider {
  /**
   * Gera uma resposta baseada no contexto fornecido e possivelmente invoca ferramentas
   */
  generateResponse(
    query: string,
    context: Document[],
    locale?: string,
  ): Promise<LLMResponse>;
}
