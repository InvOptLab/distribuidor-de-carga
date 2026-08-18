"use server";

import { createRAGService } from "@/services/ai/aiFactory";

export interface ChatResponse {
  success: boolean;
  answer?: string;
  error?: string;
  toolCalls?: {
    name: string;
    args: Record<string, any>;
  }[];
}

export async function askAssistantAction(
  message: string,
  locale: string = "pt-BR",
): Promise<ChatResponse> {
  try {
    if (!message.trim()) {
      return { success: false, error: "A mensagem não pode estar vazia." };
    }

    const ragService = createRAGService();

    const response = await ragService.askQuestion(message, locale);

    return { 
      success: true, 
      answer: response.content,
      toolCalls: response.toolCalls
    };
  } catch (error) {
    console.error("Erro na Server Action:", error);
    return {
      success: false,
      error: "Ocorreu um erro ao processar sua pergunta. Tente novamente.",
    };
  }
}
