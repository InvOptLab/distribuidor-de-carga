import { IVectorStoreRepository } from "../interfaces/IVectorStoreRepository";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "langchain";
import path from "path";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

export class LangChainMemoryStore implements IVectorStoreRepository {
  private vectorStore: MemoryVectorStore | null = null;
  private embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "text-embedding-004",
  });

  async initialize(): Promise<void> {
    if (this.vectorStore) return; // Singleton pattern: carrega apenas uma vez

    console.log("🔄 Inicializando Vector Store em memória...");

    // Caminho absoluto para garantir que o Next.js ache o arquivo em runtime
    const pdfPath = path.join(process.cwd(), "manual.pdf");

    const loader = new PDFLoader(pdfPath);
    const rawDocs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(rawDocs);

    this.vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      this.embeddings
    );
    console.log("✅ Vector Store carregada!");
  }

  async search(query: string, k: number = 4): Promise<Document[]> {
    if (!this.vectorStore) {
      await this.initialize();
    }
    // Retorna os documentos mais similares
    return await this.vectorStore!.similaritySearch(query, k);
  }
}
