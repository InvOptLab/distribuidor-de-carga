import { GoogleGeminiProvider } from "./implementations/GoogleGeminiProvider";
// import { LangChainMemoryStore } from "./implementations/LangChainMemoryStore"; // Antigo
import { SupabaseVectorStoreRepo } from "./implementations/SupabaseVectorStore"; // Novo
import { RAGService } from "./RAGService";

// Singleton não é estritamente necessário para conexão stateless,
// mas ajuda a não re-instanciar o cliente do Supabase a cada request.
let vectorStoreInstance: SupabaseVectorStoreRepo | null = null;

function getVectorStore(): SupabaseVectorStoreRepo {
  if (!vectorStoreInstance) {
    vectorStoreInstance = new SupabaseVectorStoreRepo();
  }
  return vectorStoreInstance;
}

export function createRAGService(): RAGService {
  const vectorStore = getVectorStore();
  const llmProvider = new GoogleGeminiProvider();

  return new RAGService(vectorStore, llmProvider);
}
