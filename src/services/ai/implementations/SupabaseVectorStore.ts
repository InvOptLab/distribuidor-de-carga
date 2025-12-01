import { IVectorStoreRepository } from "../interfaces/IVectorStoreRepository";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createClient } from "@supabase/supabase-js";
import { Document } from "langchain";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import path from "path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

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
      modelName: "embedding-001",
      apiKey: googleKey,
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
    }

    // =========================================================
    // BANCO VAZIO: INÍCIO DA INGESTÃO SEGURA
    // =========================================================
    console.log("📭 Banco vazio. Iniciando ingestão manual...");

    const pdfPath = path.join(process.cwd(), "manual.pdf");
    let rawDocs: Document[] = [];
    try {
      const loader = new PDFLoader(pdfPath);
      rawDocs = await loader.load();
    } catch (err) {
      throw new Error("Erro ao ler PDF. Verifique se manual.pdf está na raiz.");
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(rawDocs);

    // Filtro básico de texto vazio
    const docsToProcess = splitDocs.filter(
      (doc) => doc.pageContent && doc.pageContent.trim().length > 10
    );

    console.log(`✂️  ${docsToProcess.length} trechos para processar.`);

    // --- CONFIGURAÇÃO DO BATCH ---
    const BATCH_SIZE = 5; // Reduzi para 5 para ser mais seguro ainda
    const DELAY = 2000; // 2 segundos entre chamadas

    for (let i = 0; i < docsToProcess.length; i += BATCH_SIZE) {
      const batchDocs = docsToProcess.slice(i, i + BATCH_SIZE);
      const batchTexts = batchDocs.map((d) => d.pageContent);

      console.log(`Processing batch ${i / BATCH_SIZE + 1}...`);

      try {
        // A) GERAÇÃO MANUAL DOS VETORES
        const vectors = await this.embeddings.embedDocuments(batchTexts);

        // B) VALIDAÇÃO E FILTRAGEM (O PULO DO GATO 😺)
        const validDocs: Document[] = [];
        const validVectors: number[][] = [];

        for (let j = 0; j < vectors.length; j++) {
          const vec = vectors[j];
          console.log(vec); // REMOVER DEPOIS
          // Se o vetor existe e tem dimensões (não é vazio)
          if (vec && vec.length > 0) {
            validVectors.push(vec);
            validDocs.push(batchDocs[j]);
          } else {
            console.warn(
              `⚠️ Vetor vazio detectado e ignorado. Trecho: "${batchDocs[
                j
              ].pageContent.slice(0, 30)}..."`
            );
          }
        }

        // C) INSERÇÃO SEGURA (Se sobrou algo válido)
        if (validVectors.length > 0) {
          await this.vectorStore.addVectors(validVectors, validDocs);
          console.log(`✅ Salvo: ${validVectors.length} docs.`);
        }
      } catch (err) {
        console.error("❌ Erro no batch (provável Rate Limit):", err);
        // Se der erro de cota, esperamos mais tempo antes de continuar
        await new Promise((r) => setTimeout(r, 10000));
      }

      // Pausa padrão entre lotes
      await new Promise((r) => setTimeout(r, DELAY));
    }

    console.log("🚀 Ingestão concluída com sucesso!");
  }

  async search(query: string, k: number = 4): Promise<Document[]> {
    if (!this.vectorStore) {
      await this.initialize();
    }
    return await this.vectorStore!.similaritySearch(query, k);
  }
}
