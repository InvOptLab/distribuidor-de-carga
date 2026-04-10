// scripts/ingest.ts
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai"; // Importação necessária para o TaskType
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import path from "path";
import fs from "fs";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// Configurações
const BATCH_SIZE = 5;
const DELAY_BETWEEN_BATCHES = 2000;

async function main() {
  console.log("🚀 Iniciando Ingestão (Modelo: gemini-embedding-001)...");

  // 1. Configuração
  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const googleKey = process.env.GOOGLE_API_KEY;

  if (!sbUrl || !sbKey || !googleKey) {
    throw new Error("Variáveis de ambiente faltando (.env.local)");
  }

  // 2. Clientes
  const client = createClient(sbUrl, sbKey);

  const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "gemini-embedding-001", // Modelo mais novo e estável
    apiKey: googleKey,
    taskType: TaskType.RETRIEVAL_DOCUMENT, // Diz ao Google que isso é um documento para ser buscado
    title: "Manual do Sistema", // Opcional: ajuda o modelo a contextualizar
  });

  const vectorStore = new SupabaseVectorStore(embeddings, {
    client,
    tableName: "documents",
    queryName: "match_documents",
  });

  // 3. Carregar PDF
  const pdfPath = path.resolve(process.cwd(), "manual.pdf");
  if (!fs.existsSync(pdfPath)) throw new Error("PDF não encontrado na raiz.");

  console.log(`📄 Lendo PDF...`);
  const loader = new PDFLoader(pdfPath);
  const rawDocs = await loader.load();

  // 4. Chunking
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splitDocs = await splitter.splitDocuments(rawDocs);

  // Filtra textos curtos/vazios
  const docsToProcess = splitDocs.filter(
    (doc) => doc.pageContent && doc.pageContent.replace(/\s/g, "").length > 20,
  );

  console.log(`✂️  ${docsToProcess.length} trechos válidos. Iniciando...`);

  // 5. Loop de Ingestão
  for (let i = 0; i < docsToProcess.length; i += BATCH_SIZE) {
    const batchDocs = docsToProcess.slice(i, i + BATCH_SIZE);
    const batchTexts = batchDocs.map((d) => d.pageContent.replace(/\n/g, " ")); // Remove quebras de linha excessivas

    process.stdout.write(`   Lote ${Math.ceil((i + 1) / BATCH_SIZE)}: `);

    try {
      // Gera vetores
      const vectors = await embeddings.embedDocuments(batchTexts);

      // Validação
      const validVectors: number[][] = [];
      const validDocs: any[] = [];

      vectors.forEach((vec, index) => {
        if (vec && vec.length > 0) {
          validVectors.push(vec);
          validDocs.push(batchDocs[index]);
        } else {
          console.warn(
            `\n⚠️  Vetor VAZIO retornado pelo Google. Texto original: "${batchTexts[
              index
            ].substring(0, 50)}..."`,
          );
        }
      });

      if (validVectors.length > 0) {
        await vectorStore.addVectors(validVectors, validDocs);
        console.log(`✅ Salvo (${validVectors.length} docs)`);
      } else {
        console.log("⚠️  Nenhum vetor válido neste lote.");
      }
    } catch (error: any) {
      console.log("❌ Erro");
      console.error(`   Detalhe: ${error.message}`);

      // Se for erro de cota, espera mais tempo
      if (error.message.includes("429")) {
        console.log("   ⏳ Rate Limit. Aguardando 20s...");
        await new Promise((r) => setTimeout(r, 20000));
      }
    }

    await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
  }

  console.log("\n🎉 Processo finalizado!");
}

main().catch((err) => console.error(err));
