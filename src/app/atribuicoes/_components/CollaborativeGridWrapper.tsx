"use client";

import React, { useRef } from "react";
import { useCollaboration } from "@/context/Collaboration";
import { Paper, Typography, Button, Box } from "@mui/material";

// O cursor visual (Avatar do colega)
const RemoteCursor = ({ cursor }: { cursor: any }) => (
  <div
    style={{
      position: "absolute",
      left: cursor.x,
      top: cursor.y,
      pointerEvents: "none", // O clique passa através dele
      zIndex: 9999,
      transition: "all 0.1s ease-out",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    }}
  >
    {/* Seta */}
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
        fill={cursor.color}
        stroke="white"
        strokeWidth="1"
      />
    </svg>
    {/* Nome */}
    <span
      style={{
        backgroundColor: cursor.color,
        color: "white",
        padding: "2px 6px",
        borderRadius: "4px",
        fontSize: "10px",
        whiteSpace: "nowrap",
      }}
    >
      {cursor.name}
    </span>
  </div>
);

interface Props {
  children: React.ReactNode; // Aqui vai entrar o seu TimetableGrid
}

export const CollaborativeGridWrapper = ({ children }: Props) => {
  const { isInRoom, isOwner, cursors, broadcastMouse, leaveRoom, usersInRoom } =
    useCollaboration();

  const containerRef = useRef<HTMLDivElement>(null);

  // Se não estiver em sala, apenas renderiza a grade normal sem wrapper
  if (!isInRoom) return <>{children}</>;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Calcula X/Y relativo ao container da tabela
      broadcastMouse(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {/* BARRA DE STATUS DA SALA */}
      <Paper
        elevation={0}
        sx={{
          p: 1,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: isOwner ? "#e3f2fd" : "#fff3e0", // Azul se dono, Laranja se convidado
          border: "1px solid",
          borderColor: isOwner ? "primary.main" : "warning.main",
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="subtitle2" color="primary">
            🔴 Sala Ao Vivo
          </Typography>
          <Typography variant="body2">
            👤 <b>{usersInRoom}</b> online
          </Typography>
          <Typography
            variant="caption"
            sx={{ bgcolor: "rgba(0,0,0,0.05)", px: 1, borderRadius: 1 }}
          >
            Você é: {isOwner ? "👑 LÍDER" : "👀 Convidado"}
          </Typography>
        </Box>

        <Button size="small" color="inherit" onClick={leaveRoom}>
          Sair da Sala
        </Button>
      </Paper>

      {/* ÁREA DA GRADE COM RASTREAMENTO */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        style={{ position: "relative" }} // Essencial para o absolute dos cursores
      >
        {/* Renderiza a Grade Original */}
        {children}

        {/* Renderiza os Cursores por cima */}
        {Object.values(cursors).map((c) => (
          <RemoteCursor key={c.userId} cursor={c} />
        ))}
      </div>
    </Box>
  );
};
