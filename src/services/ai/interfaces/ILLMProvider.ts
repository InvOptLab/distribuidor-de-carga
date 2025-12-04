import { Document } from "langchain";

export interface ILLMProvider {
  /**
   * Gera uma resposta baseada no contexto fornecido
   */
  generateResponse(query: string, context: Document[]): Promise<string>;
}
