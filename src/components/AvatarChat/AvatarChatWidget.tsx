"use client";

import { useState, useRef } from "react";
import {
  Fab,
  Box,
  Tooltip,
  Paper,
  Typography,
  IconButton,
  Zoom,
  Divider,
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import MinimizeIcon from "@mui/icons-material/Minimize";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { ChatContent } from "./ChatContent";
import Draggable from "react-draggable";
import { useAvatarChat } from "@/context/AvatarChat/AvatarChatContext";

const SIZE_CONFIG = {
  small: { width: 320, height: 380, avatarSize: 80 },
  medium: { width: 380, height: 520, avatarSize: 120 },
  large: { width: 450, height: 680, avatarSize: 160 },
};

export const AvatarChatWidget = () => {
  const {
    isChatOpen,
    openChat,
    closeChat,
    isMuted,
    toggleMute,
    chatSize,
    cycleSize,
  } = useAvatarChat();

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

  const currentSize = SIZE_CONFIG[chatSize];

  const SizeIcon =
    chatSize === "small"
      ? OpenInFullIcon
      : chatSize === "medium"
      ? AspectRatioIcon
      : MinimizeIcon;

  const sizeTooltip =
    chatSize === "small"
      ? "Aumentar chat"
      : chatSize === "medium"
      ? "Maximizar chat"
      : "Diminuir chat";

  return (
    <Draggable
      nodeRef={nodeRef}
      onDrag={() => setIsDragging(true)}
      onStop={() => {
        setTimeout(() => setIsDragging(false), 0);
      }}
      bounds="parent"
    >
      <Box
        ref={nodeRef}
        sx={{
          position: "fixed",
          bottom: 32,
          left: 32,
          zIndex: 1300,
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <Zoom in={isChatOpen} unmountOnExit>
          <Paper
            elevation={8}
            sx={{
              width: currentSize.width,
              mb: 1,
              borderRadius: 3,
              overflow: "hidden",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              backdropFilter: "blur(10px)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                p: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                color: "white",
                cursor: isDragging ? "grabbing" : "grab",
                userSelect: "none",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Tooltip title="Arraste para mover" arrow>
                  <DragIndicatorIcon fontSize="small" sx={{ opacity: 0.7 }} />
                </Tooltip>
                <Typography variant="subtitle1" fontWeight={600}>
                  Assistente Virtual
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Tooltip title={sizeTooltip} arrow>
                  <IconButton
                    onClick={cycleSize}
                    size="small"
                    sx={{
                      color: "white",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "scale(1.1)" },
                    }}
                  >
                    <SizeIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title={isMuted ? "Ativar som" : "Silenciar"} arrow>
                  <IconButton
                    onClick={toggleMute}
                    size="small"
                    sx={{
                      color: "white",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "scale(1.1)" },
                    }}
                  >
                    {isMuted ? (
                      <VolumeOffIcon fontSize="small" />
                    ) : (
                      <VolumeUpIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>

                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ mx: 0.5, borderColor: "rgba(255,255,255,0.3)" }}
                />

                <Tooltip title="Fechar chat" arrow>
                  <IconButton
                    onClick={closeChat}
                    size="small"
                    sx={{
                      color: "white",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "scale(1.1)",
                        backgroundColor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              sx={{
                height: currentSize.height,
                transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "default",
                overflow: "hidden",
              }}
            >
              <ChatContent avatarSize={currentSize.avatarSize} />
            </Box>
          </Paper>
        </Zoom>

        <Tooltip
          title={
            isChatOpen ? "Fechar Assistente" : "Arraste ou clique para abrir"
          }
          arrow
          placement="right"
        >
          <Fab
            color="primary"
            aria-label="Abrir chat"
            onClick={handleFabClick}
            sx={{
              cursor: isDragging ? "grabbing" : "grab",
              transition: "all 0.3s ease",
              boxShadow: isChatOpen
                ? "0 4px 20px rgba(25, 118, 210, 0.4)"
                : "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 6px 24px rgba(25, 118, 210, 0.5)",
              },
            }}
          >
            <Zoom in={isChatOpen} unmountOnExit>
              <CloseIcon />
            </Zoom>
            <Zoom in={!isChatOpen} unmountOnExit>
              <SmartToyIcon />
            </Zoom>
          </Fab>
        </Tooltip>
      </Box>
    </Draggable>
  );
};
