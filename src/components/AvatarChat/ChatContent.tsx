import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Stack,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { AvatarIcon } from "./AvatarIcon";
import { useAvatarChat } from "@/context/AvatarChat/AvatarChatContext";

export const ChatContent = () => {
  // Hooks do Contexto (Estado Global)
  const { messages, sendMessage, isTyping, isMuted, isSearching } =
    useAvatarChat();

  // Hooks de UI/Áudio
  const { isAvatarSpeaking, speak } = useTextToSpeech();
  const [userInput, setUserInput] = useState("");
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  // Auto-scroll sempre que mensagens mudarem
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Handler de envio
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput.trim() || isTyping || isAvatarSpeaking) return;

    const textToSend = userInput;
    setUserInput(""); // Limpa o input imediatamente
    stop(); // Para qualquer fala anterior

    // Chama o backend através do contexto e espera a resposta textual
    const botResponse = await sendMessage(textToSend);

    // Se houver resposta e o som não estiver mudo, fala!
    if (botResponse && !isMuted) {
      speak(botResponse);
    }
  };

  return (
    <Box
      sx={{
        // width: 380,
        height: 500,
        display: "flex",
        flexDirection: "column",
        p: 2,
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* --- ÁREA DO AVATAR --- */}
      <Box sx={{ flexShrink: 0, mb: 2, textAlign: "center" }}>
        {/* O Avatar se move se estiver falando (TTS) ou processando (RAG) */}
        <AvatarIcon
          isSpeaking={isAvatarSpeaking || isTyping}
          isSearching={isSearching}
        />
      </Box>

      <Stack spacing={2} sx={{ flexGrow: 1, overflow: "hidden" }}>
        {/* --- HISTÓRICO DE MENSAGENS --- */}
        <Paper
          ref={chatHistoryRef}
          elevation={0}
          sx={{
            flexGrow: 1,
            p: 2,
            overflowY: "auto",
            backgroundColor: "white",
            border: "1px solid #e0e0e0",
            borderRadius: 2,
          }}
        >
          {messages.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 4 }}
            >
              Olá! Como posso ajudar você hoje?
            </Typography>
          ) : (
            messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.sender === "user" ? "flex-end" : "flex-start",
                  mb: 1.5,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    maxWidth: "85%",
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

          {/* Indicador de Digitando (Loading do RAG) */}
          {isTyping && (
            <Box
              sx={{ display: "flex", justifyContent: "flex-start", mb: 1.5 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  backgroundColor: "grey.100",
                  borderRadius: "16px",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={12} />
                  <Typography variant="caption" color="text.secondary">
                    Consultando manual...
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
        </Paper>

        {/* --- INPUT DO USUÁRIO --- */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Digite sua pergunta..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            // Opcional: Desabilitar input enquanto o bot pensa
            disabled={isTyping}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="submit"
                      color="primary"
                      // Desabilita envio se estiver vazio, ou bot pensando/falando
                      disabled={
                        isTyping || isAvatarSpeaking || userInput.trim() === ""
                      }
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
