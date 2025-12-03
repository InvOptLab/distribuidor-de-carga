import { ILLMProvider } from "./interfaces/ILLMProvider";
import { IVectorStoreRepository } from "./interfaces/IVectorStoreRepository";

export class RAGService {
  constructor(
    private vectorStore: IVectorStoreRepository,
    private llmProvider: ILLMProvider
  ) {}

  async askQuestion(question: string): Promise<string> {
    // 1. Garantir que a base está carregada
    await this.vectorStore.initialize();

    // 2. Buscar contexto relevante
    const relevantDocs = await this.vectorStore.search(question);

    // 3. Gerar resposta usando o LLM
    const answer = await this.llmProvider.generateResponse(
      question,
      relevantDocs
    );

    return answer;
  }
}
