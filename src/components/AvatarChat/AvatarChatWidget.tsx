import React from "react";
import { Fab, Box, Tooltip } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { ChatDialog } from "./ChatDialog";
import { useAvatarChat } from "@/context/AvatarChat/AvatarChatContext";

/**
 * Este é o widget completo.
 * 1. Renderiza o Botão Flutuante (FAB) para abrir o chat.
 * 2. Renderiza o <ChatDialog /> (que é controlado pelo contexto).
 */
export const AvatarChatWidget = () => {
  const { openChat } = useAvatarChat();

  return (
    <>
      {/* 1. O Botão Flutuante (FAB) */}
      <Box
        sx={{
          position: "fixed",
          bottom: 32,
          // right: 32,
          left: 32,
          zIndex: 1000, // Garante que fique acima de outros elementos
        }}
      >
        <Tooltip title="Falar com Assistente">
          <Fab color="primary" aria-label="Abrir chat" onClick={openChat}>
            <SmartToyIcon />
          </Fab>
        </Tooltip>
      </Box>

      {/* 2. O Diálogo (controlado internamente pelo contexto) */}
      <ChatDialog />
    </>
  );
};
