"use client";

import { useState } from "react";
import { Avatar, Box, keyframes } from "@mui/material";

interface AvatarIconProps {
  isSpeaking: boolean;
  isSearching: boolean;
  size?: number;
}

const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const searchingAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

export const AvatarIcon = ({
  isSpeaking,
  isSearching,
  size = 100,
}: AvatarIconProps) => {
  const [isHovering, setIsHovering] = useState(false);

  // Usando placeholder para simular os avatares

  const idleSrc = "./chat/avatar-idle.png";
  const idleSrcSmiling = "./chat/avatar-idle-smiling.png";
  const talkingSrc = "./chat/avatar-talking.gif";
  const searchingSrc = "./chat/avatar-searching.gif";

  const src = isSearching
    ? searchingSrc
    : isSpeaking
    ? talkingSrc
    : isHovering
    ? idleSrcSmiling
    : idleSrc;

  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {(isSpeaking || isSearching) && (
        <Box
          sx={{
            position: "absolute",
            width: size + 20,
            height: size + 20,
            borderRadius: "50%",
            background: isSearching
              ? "radial-gradient(circle, rgba(255,152,0,0.3) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(25,118,210,0.3) 0%, transparent 70%)",
            animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
          }}
        />
      )}
      <Avatar
        src={src}
        key={isSearching ? "searching" : isSpeaking ? "speaking" : "idle"}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        alt="Assistente Virtual"
        sx={{
          width: size,
          height: size,
          margin: "0 auto",
          border: "3px solid",
          borderColor: isSearching
            ? "warning.main"
            : isSpeaking
            ? "primary.main"
            : "grey.300",
          transition: "all 0.3s ease",
          animation: isSearching
            ? `${searchingAnimation} 1s ease-in-out infinite`
            : "none",
          "&:hover": {
            borderColor: "primary.main",
            transform: "scale(1.05)",
          },
        }}
      />
    </Box>
  );
};
