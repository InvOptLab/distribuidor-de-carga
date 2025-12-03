import React, { useState } from "react";
import { Avatar } from "@mui/material";

interface AvatarIconProps {
  isSpeaking: boolean;
  isSearching: boolean;
}

/**
 * Exibe o avatar.
 * Troca entre uma imagem estática (idle) e um GIF (talking)
 * baseado na propriedade `isSpeaking`.
 */
export const AvatarIcon = ({ isSpeaking, isSearching }: AvatarIconProps) => {
  const AVATAR_SIZE = 120; // Tamanho em pixels

  // Você deve colocar essas imagens na sua pasta /public
  const idleSrc = "./chat/avatar-idle.png";
  const idleSrcSmiling = "./chat/avatar-idle-smiling.png";
  const talkingSrc = "./chat/avatar-talking.gif";
  const searchingSrc = "./chat/avatar-searching.gif";

  const [isHovering, setIsHovering] = useState(false);

  // Prioridade: Procurando (Searching) > Falando (Speaking) > Mouse em cima (Hover) > Parado (Idle)
  const src = isSearching
    ? searchingSrc
    : isSpeaking
    ? talkingSrc
    : isHovering
    ? idleSrcSmiling
    : idleSrc;

  // const imageKey = isSpeaking ? "speaking" : isHovering ? "smiling" : "idle";

  return (
    <Avatar
      src={src}
      // Adicionar uma key para reiniciar o GIF quando o estado muda
      key={isSearching ? "searching" : isSpeaking ? "speaking" : "idle"}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      alt="Assistente Virtual"
      sx={{
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        margin: "0 auto",
        // bgcolor: "transparent",
        // "& img": { objectFit: "contain" },
      }}
    />
  );
};
