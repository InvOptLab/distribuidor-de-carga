import { ILLMProvider } from "./interfaces/ILLMProvider";
import { IVectorStoreRepository } from "./interfaces/IVectorStoreRepository";

export class RAGService {
  constructor(
    private vectorStore: IVectorStoreRepository,
    private llmProvider: ILLMProvider,
  ) {}

  async askQuestion(question: string): Promise<string> {
    await this.vectorStore.initialize();

    const relevantDocs = await this.vectorStore.search(question);

    const answer = await this.llmProvider.generateResponse(
      question,
      relevantDocs,
    );

    return answer;
  }
}
