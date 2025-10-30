import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  IconButton,
  Stack,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { AvatarIcon } from "./AvatarIcon";
import { useAvatarChat } from "@/context/AvatarChat/AvatarChatContext";
import { avatarChatData } from "@/context/AvatarChat/avatarChatData";

type Message = {
  sender: "user" | "avatar";
  text: string;
};

/**
 * O componente principal da interface de chat.
 * Renderizado como um Dialog (popup) do Material-UI.
 */
export const ChatDialog = () => {
  const { isChatOpen, closeChat } = useAvatarChat();
  const { isAvatarSpeaking, speak } = useTextToSpeech();
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSelectQuestion = (question: string, answer: string) => {
    // Adiciona as mensagens ao histórico do chat
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: question },
      { sender: "avatar", text: answer },
    ]);

    // Inicia a fala
    speak(answer);
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
        <IconButton onClick={closeChat}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {/* 1. O AVATAR */}
          <Box sx={{ padding: 2, display: "flex", justifyContent: "center" }}>
            <AvatarIcon isSpeaking={isAvatarSpeaking} />
          </Box>

          {/* 2. HISTÓRICO DE MENSAGENS */}
          <Paper
            elevation={0}
            sx={{
              height: 250,
              overflowY: "auto",
              padding: 2,
              background: "#f9f9f9",
            }}
          >
            {messages.length === 0 && (
              <Typography variant="body2" color="textSecondary" align="center">
                Selecione uma pergunta abaixo para começar.
              </Typography>
            )}
            {messages.map((msg, index) => (
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
                  {msg.text}
                </Paper>
              </Box>
            ))}
          </Paper>

          {/* 3. LISTA DE PERGUNTAS */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Perguntas Frequentes:
            </Typography>
            <Stack spacing={1}>
              {avatarChatData.map((qa) => (
                <Button
                  key={qa.id}
                  variant="outlined"
                  onClick={() => handleSelectQuestion(qa.question, qa.answer)}
                  // Desabilita botões enquanto o avatar está falando
                  disabled={isAvatarSpeaking}
                >
                  {qa.question}
                </Button>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
