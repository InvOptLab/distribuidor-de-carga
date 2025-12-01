"use server"; // <--- Isso é mágico. Diz ao Next.js que esta função roda SOMENTE no servidor.

import { createRAGService } from "@/services/ai/aiFactory";

export interface ChatResponse {
  success: boolean;
  answer?: string;
  error?: string;
}

export async function askAssistantAction(
  message: string
): Promise<ChatResponse> {
  try {
    console.log("Pergunta");
    if (!message.trim()) {
      return { success: false, error: "A mensagem não pode estar vazia." };
    }

    // 1. Instancia o serviço (Singleton Pattern já está na Factory)
    const ragService = createRAGService();

    // 2. Executa a lógica de negócio
    const answer = await ragService.askQuestion(message);

    // 3. Retorna os dados puros (Next.js serializa automaticamente)
    return { success: true, answer };
  } catch (error) {
    console.error("Erro na Server Action:", error);
    return {
      success: false,
      error: "Ocorreu um erro ao processar sua pergunta. Tente novamente.",
    };
  }
}
