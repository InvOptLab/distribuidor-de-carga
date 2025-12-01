import { ILLMProvider } from "../interfaces/ILLMProvider";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Document } from "langchain";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export class GoogleGeminiProvider implements ILLMProvider {
  private model: ChatGoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not defined in environment variables");
    }

    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0,
      apiKey: apiKey,
    });
  }

  async generateResponse(query: string, context: Document[]): Promise<string> {
    // Transforma o array de documentos em uma string única
    const contextText = context.map((doc) => doc.pageContent).join("\n---\n");

    const prompt = ChatPromptTemplate.fromTemplate(`
      Você é um assistente especialista na plataforma Distribuidor de Carga.
      Responda a pergunta do usuário baseando-se APENAS no contexto abaixo.
      Se a resposta não estiver no contexto, diga educadamente que não possui essa informação.

      Contexto:
      {context}

      Pergunta:
      {question}
    `);

    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

    const response = await chain.invoke({
      context: contextText,
      question: query,
    });

    return response;
  }
}
