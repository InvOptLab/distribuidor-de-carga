import React from "react";
import { Box, GlobalStyles } from "@mui/material";

// Keyframes (os mesmos de antes)
const keyframes = `
  @keyframes rotateLogo {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes rotateContour {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(-360deg);
    }
  }
`;

/**
 * Componente da Logo Animada (Versão 2)
 * - Efeito neon sempre presente, mas pausado.
 * - Efeito neon e logo giram apenas no hover, continuando da posição parada.
 */
export default function AnimatedLogo() {
  const logoSize = { xs: 120, sm: 150, md: 180 };
  const wrapperPadding = "4px";

  return (
    <>
      <GlobalStyles styles={keyframes} />

      {/* O Container Wrapper */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          padding: wrapperPadding,
          background: "#0d0a14", // Fundo "preto estelar"
          width: logoSize,
          height: logoSize,
          cursor: "pointer", // Adiciona um cursor para indicar interatividade

          // O contorno de néon (::before)
          "&::before": {
            content: '""',
            position: "absolute",
            zIndex: -1,
            inset: "-5px",
            borderRadius: "50%",
            background: `conic-gradient(
              from 90deg,
              #00ffff 20%,
              #00ffff 40%,
              #9f55ff 60%,
              #9f55ff 90%,
              #00ffff 100%
            )`,
            filter: "blur(6px) brightness(1.1)",

            // --- MUDANÇA PRINCIPAL ---
            // A animação está SEMPRE aplicada
            animation: "rotateContour 8s linear infinite",
            // Mas começa PAUSADA
            animationPlayState: "paused",
            // Adiciona uma transição suave para o play/pause
            transition: "animation-play-state 0.3s ease-out",
          },

          // Ativa as animações no HOVER
          "&:hover": {
            // Apenas muda o estado para "running"
            "&::before": {
              animationPlayState: "running",
            },
            "& > img": {
              animationPlayState: "running",
            },
          },
        }}
      >
        {/* A sua Logo (o componente original) */}
        <Box
          component="img"
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",

            // --- MUDANÇA PRINCIPAL ---
            // A animação está SEMPRE aplicada
            animation: "rotateLogo 12s linear infinite",
            // Mas começa PAUSADA
            animationPlayState: "paused",
            // Adiciona uma transição suave para o play/pause
            transition: "animation-play-state 0.3s ease-out",
          }}
          alt="Logo do Distribuidor de Carga."
          src="./images/logo_sem_fundo.png"
        />
      </Box>
    </>
  );
}
