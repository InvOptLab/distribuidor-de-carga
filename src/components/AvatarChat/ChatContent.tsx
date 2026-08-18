"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Fade,
  keyframes,
  TextField,
  Chip
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { AvatarIcon } from "./AvatarIcon";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useAvatarChat } from "@/context/AvatarChat/AvatarChatContext";
import { useLocale, useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

const formatTime = (date: Date) => {
  // TODO: Implementar as modificações necessárias para exibir baseado na localidade do usuário
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

  const locale = useLocale();

  const { isAvatarSpeaking, speak, stop } = useTextToSpeech();
  const [userInput, setUserInput] = useState("");
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = useTranslations("Assistant");

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxHeight = 120;
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [userInput]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput.trim() || isTyping || isAvatarSpeaking) return;

    const textToSend = userInput;
    setUserInput("");
    stop();

    const botResponse = await sendMessage(textToSend);

    if (botResponse && !isMuted) {
      speak(botResponse, locale);
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
          {messages.length === 1 && messages[0].id === "welcome" && (
            <Fade in timeout={500}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, justifyContent: 'flex-start' }}>
                <Chip 
                  size="small" 
                  label="Quais turmas do professor X?" 
                  onClick={() => { setUserInput("Quais turmas o professor está ministrando?"); }} 
                  sx={{ backgroundColor: "primary.50", color: "primary.main", '&:hover': { backgroundColor: "primary.100" } }}
                />
                <Chip 
                  size="small" 
                  label="Atribuir Docente à turma" 
                  onClick={() => { setUserInput("Atribua o docente X à turma Y"); }} 
                  sx={{ backgroundColor: "primary.50", color: "primary.main", '&:hover': { backgroundColor: "primary.100" } }}
                />
                <Chip 
                  size="small" 
                  label="Limpar turmas do professor" 
                  onClick={() => { setUserInput("Limpe todas as turmas do professor Z"); }} 
                  sx={{ backgroundColor: "primary.50", color: "primary.main", '&:hover': { backgroundColor: "primary.100" } }}
                />
              </Box>
            </Fade>
          )}

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
                      msg.sender === "user" ? "primary.main" : 
                      msg.sender === "action" ? "success.light" : "grey.100",
                    color:
                      msg.sender === "user" ? "primary.contrastText" :
                      msg.sender === "action" ? "success.contrastText" : "text.primary",
                    borderRadius: 2,
                    borderTopRightRadius: msg.sender === "user" ? 4 : 16,
                    borderTopLeftRadius: msg.sender === "user" ? 16 : 4,
                    boxShadow:
                      msg.sender === "user"
                        ? "0 2px 8px rgba(25, 118, 210, 0.2)"
                        : "0 2px 8px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Box sx={{ "& p": { margin: 0 }, "& ul, & ol": { pl: 2, margin: 0, mt: 1 }, "& li": { mb: 0.5 } }}>
                    {msg.sender === "action" ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleOutlineIcon fontSize="small" />
                        <Typography variant="body2">{msg.text}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" component="div" sx={{ wordBreak: 'break-word' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text}
                        </ReactMarkdown>
                      </Typography>
                    )}
                  </Box>
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
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              backgroundColor: "white",
              borderRadius: 3,
              border: "2px solid",
              borderColor: "divider",
              transition: "all 0.2s ease",
              px: 2,
              py: 1,
              "&:hover": {
                borderColor: "grey.400",
              },
              "&:focus-within": {
                borderColor: "primary.main",
              },
            }}
          >
            <TextField
              multiline
              maxRows={4}
              variant="standard"
              fullWidth
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              disabled={isTyping || isAvatarSpeaking}
              placeholder={t("Actions.askQuestion")}
              InputProps={{
                disableUnderline: true,
                sx: { 
                  fontSize: "0.9rem", 
                  lineHeight: 1.5, 
                  py: 0.5,
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none',
                }
              }}
            />
            <Tooltip title={t("Actions.sendMessage")} arrow>
              <span>
                <IconButton
                  type="submit"
                  disabled={
                    isTyping || isAvatarSpeaking || userInput.trim() === ""
                  }
                  sx={{
                    ml: 1,
                    flexShrink: 0,
                    width: 36,
                    height: 36,
                    backgroundColor: userInput.trim()
                      ? "primary.main"
                      : "grey.200",
                    color: userInput.trim() ? "white" : "grey.500",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: userInput.trim()
                        ? "primary.dark"
                        : "grey.300",
                    },
                    "&:disabled": {
                      backgroundColor: "grey.200",
                      color: "grey.400",
                    },
                  }}
                >
                  <SendIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.disabled",
              mt: 0.5,
              display: "block",
              textAlign: "center",
            }}
          >
            {t("Actions.newLine")}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
