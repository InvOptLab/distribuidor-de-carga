"use client";

import type React from "react";
import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useMemo,
} from "react";
import { askAssistantAction } from "@/actions/chat-action";

// Definição dos tipos
export type MessageSender = "user" | "bot";

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date;
}

type ChatSize = "small" | "medium" | "large";

interface AvatarChatContextType {
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  messages: Message[];
  isTyping: boolean;
  sendMessage: (text: string) => Promise<string | undefined>;
  clearChat: () => void;
  isSearching: boolean;
  setSearching: React.Dispatch<React.SetStateAction<boolean>>;
  chatSize: ChatSize;
  setChatSize: React.Dispatch<React.SetStateAction<ChatSize>>;
  cycleSize: () => void;
}

const AvatarChatContext = createContext<AvatarChatContextType | undefined>(
  undefined
);

export const AvatarChatProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSearching, setSearching] = useState(false);
  const [chatSize, setChatSize] = useState<ChatSize>("medium");

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

  const clearChat = () =>
    setMessages([
      {
        id: "welcome",
        text: "Olá! Eu sou o assistente virtual do Distribuidor de Carga. Como posso te ajudar hoje?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);

  const cycleSize = () => {
    setChatSize((prev) => {
      if (prev === "small") return "medium";
      if (prev === "medium") return "large";
      return "small";
    });
  };

  const sendMessage = async (text: string): Promise<string | undefined> => {
    if (!text.trim()) return;

    setSearching(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await askAssistantAction(text);

      if (!response.success || !response.answer) {
        throw new Error(response.error || "Erro desconhecido");
      }

      // Adiciona resposta do bot
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      return response.answer; // Retorna o texto para o componente poder "Falar"
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
      chatSize,
      setChatSize,
      cycleSize,
    }),
    [isChatOpen, isMuted, messages, isTyping, isSearching, chatSize]
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
