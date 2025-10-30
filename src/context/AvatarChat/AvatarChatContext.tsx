import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
} from "react";

interface AvatarChatContextType {
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
}

// Cria o contexto com um valor padrão undefined
const AvatarChatContext = createContext<AvatarChatContextType | undefined>(
  undefined
);

/**
 * Provedor do Contexto do Chat do Avatar.
 * Envolva sua aplicação (no _app.tsx) com este componente.
 */
export const AvatarChatProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  // Memoiza o valor do contexto para evitar re-renderizações desnecessárias
  const value = useMemo(
    () => ({
      isChatOpen,
      openChat,
      closeChat,
    }),
    [isChatOpen]
  );

  return (
    <AvatarChatContext.Provider value={value}>
      {children}
    </AvatarChatContext.Provider>
  );
};

/**
 * Hook customizado para acessar o contexto do chat.
 * Garante que está sendo usado dentro de um <AvatarChatProvider>.
 */
export const useAvatarChat = () => {
  const context = useContext(AvatarChatContext);
  if (context === undefined) {
    throw new Error("useAvatarChat must be used within a AvatarChatProvider");
  }
  return context;
};
