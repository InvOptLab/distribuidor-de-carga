"use client";

import { askAssistantAction } from "@/actions/chat-action";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
} from "react";

// Definição dos tipos
export type MessageSender = "user" | "bot";

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date;
}

interface AvatarChatContextType {
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  messages: Message[];
  isTyping: boolean; // <--- NOVO: Estado para saber se o bot está pensando
  sendMessage: (text: string) => Promise<string | undefined>; // Retorna a resposta (ou undefined se erro)
  clearChat: () => void;
  isSearching: boolean;
  setSearching: React.Dispatch<React.SetStateAction<boolean>>;
}

const AvatarChatContext = createContext<AvatarChatContextType | undefined>(
  undefined
);

export const AvatarChatProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // <--- Estado de loading
  const [isSearching, setSearching] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Olá! Eu sou o assistente virtual do Distribuidor de Carga. Como posso te ajudar hoje?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);
  const toggleMute = () => setIsMuted((prev) => !prev);
  const clearChat = () => setMessages([]);

  const sendMessage = async (text: string): Promise<string | undefined> => {
    if (!text.trim()) return;

    setSearching(true);

    // 1. Adiciona mensagem do usuário na tela (Optimistic UI)
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true); // Ativa animação de "pensando" se você tiver

    try {
      // 2. Chama a Server Action (Backend RAG)
      const response = await askAssistantAction(text);

      if (!response.success || !response.answer) {
        throw new Error(response.error || "Erro desconhecido");
      }

      // 3. Adiciona resposta do bot
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      return response.answer; // <--- Retorna o texto para o componente poder "Falar"
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Desculpe, tive um problema de conexão. Pode repetir?",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return "Desculpe, tive um problema de conexão."; // Retorno de erro para áudio
    } finally {
      setIsTyping(false);
      setSearching(false);
    }
  };

  const value = useMemo(
    () => ({
      isChatOpen,
      openChat,
      closeChat,
      isMuted,
      toggleMute,
      messages,
      sendMessage,
      isTyping,
      clearChat,
      isSearching,
      setSearching,
    }),
    [isChatOpen, isMuted, messages, isTyping, isSearching]
  );

  return (
    <AvatarChatContext.Provider value={value}>
      {children}
    </AvatarChatContext.Provider>
  );
};

export const useAvatarChat = () => {
  const context = useContext(AvatarChatContext);
  if (!context) {
    throw new Error("useAvatarChat must be used within an AvatarChatProvider");
  }
  return context;
};
