import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Stack,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";
import { AvatarIcon } from "./AvatarIcon";
import { QA } from "@/context/AvatarChat/avatarChatData";

// Definição da Resposta de Fallback
const fallbackResponse: Omit<QA, "id"> = {
  question: "Fallback",
  answer:
    "Desculpe, eu não consegui entender. Você pode tentar reformular a pergunta?",
};

type Message = {
  sender: "user" | "avatar";
  text: string;
};

/**
 * Este componente contém APENAS o 'miolo' do chat:
 * Avatar, Histórico de Mensagens e Input.
 * Ele não controla a própria visibilidade.
 */
export const ChatContent = () => {
  // Hooks de lógica do chat
  const { isAvatarSpeaking, speak } = useTextToSpeech();
  const { findBestMatch } = useFuzzySearch();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  // Efeito de auto-scroll
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  // Lógica de envio
  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    const trimmedInput = userInput.trim();
    if (trimmedInput === "" || isAvatarSpeaking) {
      return;
    }
    const match = findBestMatch(trimmedInput);
    const response = match ? match : fallbackResponse;
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: trimmedInput },
      { sender: "avatar", text: response.answer },
    ]);
    speak(response.answer);
    setUserInput("");
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ padding: 1, display: "flex", justifyContent: "center" }}>
          <AvatarIcon isSpeaking={isAvatarSpeaking} />
        </Box>

        {/* HISTÓRICO DE MENSAGENS */}
        <Paper
          ref={chatHistoryRef}
          elevation={0}
          sx={{
            height: 250,
            overflowY: "auto",
            padding: 2,
            background: "#f9f9f9",
            border: "1px solid #eee",
          }}
        >
          {messages.length === 0 ? (
            <Typography>Faça uma pergunta para começar.</Typography>
          ) : (
            messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.sender === "user" ? "flex-end" : "flex-start",
                  marginBottom: 1,
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    padding: "8px 12px",
                    maxWidth: "80%",
                    backgroundColor:
                      msg.sender === "user" ? "primary.main" : "grey.200",
                    color:
                      msg.sender === "user"
                        ? "primary.contrastText"
                        : "text.primary",
                    borderRadius: "16px",
                    borderTopRightRadius:
                      msg.sender === "user" ? "4px" : "16px",
                    borderTopLeftRadius: msg.sender === "user" ? "16px" : "4px",
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                </Paper>
              </Box>
            ))
          )}
        </Paper>

        {/* INPUT DO USUÁRIO */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Digite sua pergunta..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isAvatarSpeaking}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="submit"
                      color="primary"
                      disabled={isAvatarSpeaking || userInput.trim() === ""}
                      aria-label="Enviar pergunta"
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
};
