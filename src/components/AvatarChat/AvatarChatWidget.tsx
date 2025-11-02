import React, { useState, useRef } from "react";
import {
  Fab,
  Box,
  Tooltip,
  Paper,
  Typography,
  IconButton,
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { ChatContent } from "./ChatContent";
import Draggable from "react-draggable";
import { useAvatarChat } from "@/context/AvatarChat/AvatarChatContext";

export const AvatarChatWidget = () => {
  const { isChatOpen, openChat, closeChat, isMuted, toggleMute } =
    useAvatarChat();

  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef(null);

  const handleFabClick = () => {
    if (!isDragging) {
      if (isChatOpen) {
        closeChat();
      } else {
        openChat();
      }
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      onDrag={() => setIsDragging(true)}
      onStop={() => {
        setTimeout(() => setIsDragging(false), 0);
      }}
      handle=".drag-handle"
    >
      <Box
        ref={nodeRef}
        sx={{
          position: "fixed",
          bottom: 32,
          left: 32,
          zIndex: 1000,
        }}
      >
        {isChatOpen && (
          <Paper
            elevation={6}
            sx={{
              width: 340,
              mb: 1,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "primary.main",
                color: "white",
              }}
            >
              <Typography variant="subtitle1" sx={{ ml: 1 }}>
                Assistente Virtual
              </Typography>

              <Box>
                <IconButton
                  onClick={toggleMute}
                  size="small"
                  sx={{ color: "white" }}
                >
                  {isMuted ? (
                    <VolumeOffIcon fontSize="small" />
                  ) : (
                    <VolumeUpIcon fontSize="small" />
                  )}
                </IconButton>

                <IconButton
                  onClick={closeChat}
                  size="small"
                  sx={{ color: "white" }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <ChatContent />
          </Paper>
        )}

        <Tooltip
          title={isChatOpen ? "Fechar Assistente" : "Falar com Assistente"}
        >
          <Fab
            className="drag-handle"
            color="primary"
            aria-label="Abrir chat"
            onClick={handleFabClick}
            sx={{ cursor: "move" }}
          >
            {isChatOpen ? <CloseIcon /> : <SmartToyIcon />}
          </Fab>
        </Tooltip>
      </Box>
    </Draggable>
  );
};
