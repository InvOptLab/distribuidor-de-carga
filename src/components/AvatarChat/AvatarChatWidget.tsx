import React, { useState, useRef } from "react";
import { Fab, Box, Tooltip } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { ChatDialog } from "./ChatDialog";
import Draggable from "react-draggable";
import { useAvatarChat } from "@/context/AvatarChat/AvatarChatContext";

export const AvatarChatWidget = () => {
  const { openChat } = useAvatarChat();
  const [isDragging, setIsDragging] = useState(false);

  // Deve ser 'null' por padrão
  const nodeRef = useRef(null);

  return (
    <>
      <Draggable
        // Isso que impede o erro "className"
        nodeRef={nodeRef}
        onDrag={() => setIsDragging(true)}
        onStop={() => {
          setTimeout(() => setIsDragging(false), 0);
        }}
      >
        <Box
          // Isso conecta a ref ao DOM
          ref={nodeRef}
          sx={{
            position: "fixed",
            bottom: 32,
            left: 32,
            zIndex: 1000,
            cursor: "move",
          }}
        >
          <Tooltip title="Falar com Assistente">
            <Fab
              color="primary"
              aria-label="Abrir chat"
              onClick={() => {
                if (!isDragging) {
                  openChat();
                }
              }}
            >
              <SmartToyIcon />
            </Fab>
          </Tooltip>
        </Box>
      </Draggable>

      <ChatDialog />
    </>
  );
};
