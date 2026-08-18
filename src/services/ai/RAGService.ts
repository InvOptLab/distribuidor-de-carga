import { ILLMProvider, LLMResponse } from "./interfaces/ILLMProvider";
import { IVectorStoreRepository } from "./interfaces/IVectorStoreRepository";

export class RAGService {
  constructor(
    private vectorStore: IVectorStoreRepository,
    private llmProvider: ILLMProvider,
  ) {}

  async askQuestion(
    question: string,
    locale: string = "pt-BR",
  ): Promise<LLMResponse> {
    await this.vectorStore.initialize();

    const relevantDocs = await this.vectorStore.search(question);

    const response = await this.llmProvider.generateResponse(
      question,
      relevantDocs,
      locale,
    );

    return response;
  }
}
