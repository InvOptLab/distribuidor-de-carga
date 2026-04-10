"use server";

import { createRAGService } from "@/services/ai/aiFactory";

export interface ChatResponse {
  success: boolean;
  answer?: string;
  error?: string;
}

export async function askAssistantAction(
  message: string,
): Promise<ChatResponse> {
  try {
    if (!message.trim()) {
      return { success: false, error: "A mensagem não pode estar vazia." };
    }

    const ragService = createRAGService();

    const answer = await ragService.askQuestion(message);

    return { success: true, answer };
  } catch (error) {
    console.error("Erro na Server Action:", error);
    return {
      success: false,
      error: "Ocorreu um erro ao processar sua pergunta. Tente novamente.",
    };
  }
}
