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
  isMuted: boolean;
  toggleMute: () => void;
}

const AvatarChatContext = createContext<AvatarChatContextType | undefined>(
  undefined
);

export const AvatarChatProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const newMuteState = !prev;
      // Se estiver mutando, cancela qualquer fala atual
      if (newMuteState) {
        window.speechSynthesis.cancel();
      }
      return newMuteState;
    });
  };

  const value = useMemo(
    () => ({
      isChatOpen,
      openChat,
      closeChat,
      isMuted,
      toggleMute,
    }),
    [isChatOpen, isMuted]
  );

  return (
    <AvatarChatContext.Provider value={value}>
      {children}
    </AvatarChatContext.Provider>
  );
};

export const useAvatarChat = () => {
  const context = useContext(AvatarChatContext);
  if (context === undefined) {
    throw new Error("useAvatarChat must be used within a AvatarChatProvider");
  }
  return context;
};
