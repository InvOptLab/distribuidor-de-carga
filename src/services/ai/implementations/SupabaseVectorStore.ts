import { IVectorStoreRepository } from "../interfaces/IVectorStoreRepository";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createClient } from "@supabase/supabase-js";
import { Document } from "langchain";
import { TaskType } from "@google/generative-ai";

export class SupabaseVectorStoreRepo implements IVectorStoreRepository {
  private client;
  private embeddings;
  private vectorStore: SupabaseVectorStore | null = null;

  constructor() {
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const googleKey = process.env.GOOGLE_API_KEY;

    if (!sbUrl || !sbKey || !googleKey) {
      throw new Error("Variáveis de ambiente faltando.");
    }

    this.client = createClient(sbUrl, sbKey);
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "text-embedding-004",
      apiKey: googleKey,
      taskType: TaskType.RETRIEVAL_QUERY,
    });
  }

  async initialize(): Promise<void> {
    // 1. Instancia o Vector Store conectado à tabela existente
    // Isso não faz buscas ainda, apenas prepara o objeto
    this.vectorStore = await SupabaseVectorStore.fromExistingIndex(
      this.embeddings,
      {
        client: this.client,
        tableName: "documents",
        queryName: "match_documents",
      }
    );

    // 2. Verifica se o banco já tem dados
    const { count, error } = await this.client
      .from("documents")
      .select("*", { count: "exact", head: true });

    if (error) throw new Error(`Erro Supabase: ${error.message}`);

    // Se já tem dados, paramos por aqui.
    if (count && count > 0) {
      console.log("✅ Supabase já populado. Conectado.");
      return;
    } else {
      throw new Error(`O banco precisa ser populado!`);
    }
  }

  async search(query: string, k: number = 4): Promise<Document[]> {
    if (!this.vectorStore) {
      await this.initialize();
    }
    return await this.vectorStore!.similaritySearch(query, k);
  }
}
