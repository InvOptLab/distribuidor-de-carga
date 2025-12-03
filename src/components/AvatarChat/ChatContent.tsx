"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Fade,
  keyframes,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { AvatarIcon } from "./AvatarIcon";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useAvatarChat } from "@/context/AvatarChat/AvatarChatContext";

const typingAnimation = keyframes`
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
`;

const TypingIndicator = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, p: 1 }}>
    {[0, 1, 2].map((i) => (
      <Box
        key={i}
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "primary.main",
          animation: `${typingAnimation} 1.4s ease-in-out infinite`,
          animationDelay: `${i * 0.2}s`,
        }}
      />
    ))}
  </Box>
);

const formatMessage = (text: string): React.ReactNode => {
  // Regex para capturar **texto** (negrito) e _texto_ (itálico)
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);

  return parts.map((part, index) => {
    // Negrito: **texto**
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    // Itálico: _texto_
    if (part.startsWith("_") && part.endsWith("_")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface ChatContentProps {
  avatarSize?: number;
}

export const ChatContent = ({ avatarSize = 80 }: ChatContentProps) => {
  const { messages, sendMessage, isTyping, isSearching, clearChat, isMuted } =
    useAvatarChat();

  const { isAvatarSpeaking, speak, stop } = useTextToSpeech();
  const [userInput, setUserInput] = useState("");
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput.trim() || isTyping || isAvatarSpeaking) return;

    const textToSend = userInput;
    setUserInput("");
    stop();

    const botResponse = await sendMessage(textToSend);

    if (botResponse && !isMuted) {
      speak(botResponse);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        p: 2,
        backgroundColor: "#fafafa",
        overflow: "hidden",
      }}
    >
      <Box sx={{ flexShrink: 0, mb: 1, textAlign: "center" }}>
        <AvatarIcon
          isSpeaking={isAvatarSpeaking || isTyping}
          isSearching={isSearching}
          size={avatarSize}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            flexShrink: 0,
            mb: 1,
          }}
        >
          <Tooltip title="Limpar conversa" arrow>
            <IconButton
              size="small"
              onClick={clearChat}
              sx={{
                color: "text.secondary",
                "&:hover": { color: "error.main" },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Paper
          ref={chatHistoryRef}
          elevation={0}
          sx={{
            flex: 1,
            minHeight: 0,
            p: 2,
            overflowY: "auto",
            backgroundColor: "white",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            transition: "all 0.3s ease",
            "&::-webkit-scrollbar": {
              width: 6,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "grey.100",
              borderRadius: 3,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "grey.400",
              borderRadius: 3,
              "&:hover": {
                backgroundColor: "grey.500",
              },
            },
          }}
        >
          {messages.map((msg) => (
            <Fade key={msg.id} in timeout={300}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                  mb: 2,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    px: 2,
                    maxWidth: "85%",
                    backgroundColor:
                      msg.sender === "user" ? "primary.main" : "grey.100",
                    color:
                      msg.sender === "user"
                        ? "primary.contrastText"
                        : "text.primary",
                    borderRadius: 2,
                    borderTopRightRadius: msg.sender === "user" ? 4 : 16,
                    borderTopLeftRadius: msg.sender === "user" ? 16 : 4,
                    boxShadow:
                      msg.sender === "user"
                        ? "0 2px 8px rgba(25, 118, 210, 0.2)"
                        : "0 2px 8px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {formatMessage(msg.text)}
                  </Typography>
                </Paper>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.disabled",
                    mt: 0.5,
                    px: 1,
                    fontSize: "0.7rem",
                  }}
                >
                  {formatTime(msg.timestamp)}
                </Typography>
              </Box>
            </Fade>
          ))}

          {isTyping && (
            <Box
              sx={{ display: "flex", justifyContent: "flex-start", mb: 1.5 }}
            >
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: "grey.100",
                  borderRadius: 2,
                  borderTopLeftRadius: 4,
                }}
              >
                <TypingIndicator />
              </Paper>
            </Box>
          )}
        </Paper>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ flexShrink: 0, mt: 2 }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Digite sua pergunta..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isTyping || isAvatarSpeaking}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: "white",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 12px rgba(25, 118, 210, 0.15)",
                },
              },
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Enviar mensagem" arrow>
                      <span>
                        <IconButton
                          type="submit"
                          color="primary"
                          disabled={
                            isTyping ||
                            isAvatarSpeaking ||
                            userInput.trim() === ""
                          }
                          sx={{
                            transition: "all 0.2s ease",
                            "&:not(:disabled):hover": {
                              transform: "scale(1.1)",
                            },
                          }}
                        >
                          <SendIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};
