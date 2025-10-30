import React from "react";
import { Avatar } from "@mui/material";

interface AvatarIconProps {
  isSpeaking: boolean;
}

/**
 * Exibe o avatar.
 * Troca entre uma imagem estática (idle) e um GIF (talking)
 * baseado na propriedade `isSpeaking`.
 */
export const AvatarIcon = ({ isSpeaking }: AvatarIconProps) => {
  const AVATAR_SIZE = 120; // Tamanho em pixels

  // Você deve colocar essas imagens na sua pasta /public
  const idleSrc = "./chat/avatar-idle.png";
  const talkingSrc = "./chat/avatar-talking.gif";

  const src = isSpeaking ? talkingSrc : idleSrc;

  return (
    <Avatar
      src={src}
      alt="Assistente Virtual"
      sx={{
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        margin: "0 auto", // Centraliza
        // Adiciona uma 'key' para forçar o React a recarregar o GIF do início
        // sempre que o estado 'isSpeaking' mudar para true
        key: isSpeaking ? "speaking" : "idle",
      }}
    />
  );
};
