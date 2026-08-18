import { ILLMProvider, LLMResponse } from "../interfaces/ILLMProvider";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Document } from "langchain";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { aiTools } from "../tools";

export class GoogleGeminiProvider implements ILLMProvider {
  private model: ChatGoogleGenerativeAI;
  private modelWithTools: any;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not defined in environment variables");
    }

    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0.3,
      apiKey: apiKey,
    });
    
    this.modelWithTools = this.model.bindTools(aiTools);
  }

  async generateResponse(
    query: string,
    context: Document[],
    locale: string = "pt-BR",
  ): Promise<LLMResponse> {
    const contextText = context.map((doc) => doc.pageContent).join("\n---\n");

    const prompt = ChatPromptTemplate.fromTemplate(`
      Você é um assistente especialista na plataforma Distribuidor de Carga.
      
      Se o usuário pedir para realizar uma ação (como atribuir um docente a uma turma ou travar uma atribuição), USE A FERRAMENTA ADEQUADA! Não se preocupe se o contexto não possuir informações sobre isso.
      
      Caso contrário, responda a pergunta do usuário baseando-se APENAS no contexto abaixo.
      Se a resposta não estiver no contexto e não for uma chamada de ferramenta, diga educadamente que não possui essa informação. 
      MUITO IMPORTANTE: A sua resposta DEVE ser escrita no idioma correspondente a este código (locale): {locale}.

      Contexto:
      {context}

      Pergunta:
      {question}
    `);

    const formattedPrompt = await prompt.format({
      context: contextText,
      question: query,
      locale: locale,
    });

    const response = await this.modelWithTools.invoke(formattedPrompt);
    
    const result: LLMResponse = { content: "" };
    
    if (response.tool_calls && response.tool_calls.length > 0) {
      result.toolCalls = response.tool_calls.map((tc: any) => ({
        name: tc.name,
        args: tc.args,
      }));
    } else {
      result.content = response.content as string;
    }

    return result;
  }
}
