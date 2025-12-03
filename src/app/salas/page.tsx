"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { supabase } from "@/lib/supabaseClient";
import { useCollaboration } from "@/context/Collaboration";
import { useRouter } from "next/navigation";

export default function LobbyPage() {
  const { createRoom, joinRoom, isInRoom } = useCollaboration();
  const router = useRouter();

  const [rooms, setRooms] = useState<any[]>([]);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isJoinOpen, setJoinOpen] = useState(false);

  const [inputRoomName, setInputRoomName] = useState("");
  const [inputUserName, setInputUserName] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  // Se já estiver em sala, redireciona para a grade
  useEffect(() => {
    if (isInRoom) router.push("/atribuicoes");
  }, [isInRoom, router]);

  const fetchRooms = async () => {
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setRooms(data);
  };

  useEffect(() => {
    fetchRooms();
    // Subscribe para atualizações da lista em tempo real
    const channel = supabase
      .channel("lobby")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms" },
        fetchRooms
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreate = async () => {
    try {
      await createRoom(inputRoomName, inputUserName);
      setCreateOpen(false);
    } catch (e: any) {
      alert("Erro: " + e.message);
    }
  };

  const handleJoin = async () => {
    if (!selectedRoom) return;
    try {
      await joinRoom(selectedRoom, inputUserName);
      setJoinOpen(false);
    } catch (e: any) {
      alert("Erro: " + e.message);
    }
  };

  const openJoin = (rName: string) => {
    setSelectedRoom(rName);
    setJoinOpen(true);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, margin: "0 auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4">Salas de Colaboração</Typography>
        <Box>
          <IconButton onClick={fetchRooms} sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
          >
            Criar Sala
          </Button>
        </Box>
      </Box>

      <Paper elevation={2}>
        <List>
          {rooms.length === 0 && (
            <Typography
              sx={{ p: 4, textAlign: "center", color: "text.secondary" }}
            >
              Nenhuma sala ativa no momento. Crie a primeira!
            </Typography>
          )}
          {rooms.map((room) => (
            <ListItem key={room.id} divider>
              <ListItemText
                primary={room.name}
                secondary={`Dono: ${room.owner_name}`}
              />
              <ListItemSecondaryAction>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<LoginIcon />}
                  onClick={() => openJoin(room.name)}
                >
                  Entrar
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* DIALOG CRIAR */}
      <Dialog open={isCreateOpen} onClose={() => setCreateOpen(false)}>
        <DialogTitle>Nova Sala</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da Sala (Único)"
            fullWidth
            value={inputRoomName}
            onChange={(e) => setInputRoomName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Seu Nome (Líder)"
            fullWidth
            value={inputUserName}
            onChange={(e) => setInputUserName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} variant="contained">
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG ENTRAR */}
      <Dialog open={isJoinOpen} onClose={() => setJoinOpen(false)}>
        <DialogTitle>Entrar em {selectedRoom}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Seu Nome (Único na sala)"
            fullWidth
            value={inputUserName}
            onChange={(e) => setInputUserName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinOpen(false)}>Cancelar</Button>
          <Button onClick={handleJoin} variant="contained">
            Entrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
