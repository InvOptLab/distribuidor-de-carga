import { GoogleGeminiProvider } from "./implementations/GoogleGeminiProvider";
import { LangChainMemoryStore } from "./implementations/LangChainMemoryStore";
import { RAGService } from "./RAGService";

// Singleton para manter os dados na memória enquanto o servidor estiver rodando
let vectorStoreInstance: LangChainMemoryStore | null = null;

function getVectorStore(): LangChainMemoryStore {
  if (!vectorStoreInstance) {
    vectorStoreInstance = new LangChainMemoryStore();
  }
  return vectorStoreInstance;
}

export function createRAGService(): RAGService {
  const vectorStore = getVectorStore();
  const llmProvider = new GoogleGeminiProvider();

  return new RAGService(vectorStore, llmProvider);
}
