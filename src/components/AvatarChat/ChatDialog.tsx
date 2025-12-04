import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  IconButton,
  Stack,
  Paper,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";
import { AvatarIcon } from "./AvatarIcon";
import { QA } from "@/context/AvatarChat/avatarChatData";
import { useAvatarChat } from "@/context/AvatarChat/AvatarChatContext";

// --- Definição da Resposta de Fallback ---
// É mais limpo definir isso fora do componente
const fallbackResponse: Omit<QA, "id"> = {
  question: "Fallback", // Apenas para uso interno
  answer:
    "Desculpe, eu não consegui entender. Você pode tentar reformular a pergunta?",
};

type Message = {
  sender: "user" | "avatar";
  text: string;
};

/**
 * O componente principal da interface de chat (Popup/Dialog).
 */
export const ChatDialog = () => {
  // --- 1. Hooks de Gerenciamento ---
  const { isChatOpen, closeChat, isSearching, setSearching } = useAvatarChat();
  const { isAvatarSpeaking, speak } = useTextToSpeech();
  const { findBestMatch } = useFuzzySearch();

  // --- 2. Estado Interno ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");

  // --- Ref para Auto-Scroll ---
  // Esta ref é usada para rolar o chat para baixo automaticamente
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  // Efeito para rolar para a última mensagem
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]); // Dispara toda vez que a lista de mensagens mudar

  // --- Lógica Envio ---
  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    setSearching(true);
    // Previne o reload da página, um erro comum!
    if (e) e.preventDefault();

    const trimmedInput = userInput.trim();
    if (trimmedInput === "" || isAvatarSpeaking) {
      return; // Não envia nada se estiver vazio ou se o avatar estiver falando
    }

    // Encontra a melhor correspondência
    const match = findBestMatch(trimmedInput);

    // Define a resposta (a correspondência ou o fallback)
    const response = match ? match : fallbackResponse;

    // Atualiza o histórico de mensagens
    // Adiciona a pergunta do usuário E a resposta do avatar de uma vez
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: trimmedInput },
      { sender: "avatar", text: response.answer },
    ]);

    // Inicia a fala (TTS)
    speak(response.answer);

    // Limpa o input
    setUserInput("");

    setSearching(false);
  };

  return (
    <Dialog open={isChatOpen} onClose={closeChat} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Assistente Virtual
        <IconButton onClick={closeChat} aria-label="Fechar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {/* 1. O AVATAR */}
          <Box sx={{ padding: 2, display: "flex", justifyContent: "center" }}>
            <AvatarIcon
              isSpeaking={isAvatarSpeaking}
              isSearching={isSearching}
            />
          </Box>

          {/* HISTÓRICO DE MENSAGENS */}
          <Paper
            ref={chatHistoryRef} // Aplicando a ref para o auto-scroll
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
              <Typography
                variant="body2"
                color="textSecondary"
                align="center"
                sx={{ p: 2 }}
              >
                Faça uma pergunta para começar.
              </Typography>
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
                        msg.sender === "user" ? "primary.light" : "grey.200",
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
              // Desabilita o input ENQUANTO o avatar fala
              disabled={isAvatarSpeaking}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="submit" // Faz o botão enviar o form
                      color="primary"
                      // Desabilita o botão se estiver falando OU se o input estiver vazio
                      disabled={isAvatarSpeaking || userInput.trim() === ""}
                      aria-label="Enviar pergunta"
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
