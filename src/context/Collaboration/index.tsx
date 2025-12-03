"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { supabase } from "@/lib/supabaseClient"; // Seu cliente singleton
import { usePathname, useRouter } from "next/navigation";
import { RealtimeChannel } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid"; // npm install uuid e @types/uuid

// Tipos
export type RoomConfig = {
  guestsCanEdit: boolean;
};

type UserCursor = {
  x: number;
  y: number;
  color: string;
  name: string;
  userId: string;
  pathname: string; // Importante para o filtro de página
};

type CollaborationContextType = {
  isInRoom: boolean;
  isOwner: boolean;
  roomName: string | null;
  userName: string | null;
  usersInRoom: number;
  config: RoomConfig;
  cursors: Record<string, UserCursor>;
  createRoom: (roomName: string, userName: string) => Promise<void>;
  joinRoom: (roomName: string, userName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  updateConfig: (newConfig: RoomConfig) => Promise<void>;
  broadcastMouse: (x: number, y: number) => void;
  broadcastDataUpdate: (payload: any) => void;
};

const CollaborationContext = createContext<CollaborationContextType>({} as any);

export const CollaborationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();

  // Estados Locais
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [userId] = useState(() => uuidv4()); // ID único da sessão do navegador
  const [userName, setUserName] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [config, setConfig] = useState<RoomConfig>({ guestsCanEdit: false });

  // Estados de Realtime
  const [cursors, setCursors] = useState<Record<string, UserCursor>>({});
  const [usersInRoom, setUsersInRoom] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const myColor = useRef(
    "#" + Math.floor(Math.random() * 16777215).toString(16)
  );

  // =========================================================
  // 1. LÓGICA DE CRIAR SALA
  // =========================================================
  const createRoom = async (rName: string, uName: string) => {
    // Insere no banco (O banco valida se o nome é único)
    const { data, error } = await supabase
      .from("rooms")
      .insert({ name: rName, owner_id: userId, owner_name: uName })
      .select()
      .single();

    if (error) throw new Error(error.message);

    setRoomId(data.id);
    setRoomName(data.name);
    setUserName(uName);
    setIsOwner(true);
    setConfig(data.config);

    await enterRealtime(data.id, uName);
  };

  // =========================================================
  // 2. LÓGICA DE ENTRAR NA SALA
  // =========================================================
  const joinRoom = async (rName: string, uName: string) => {
    // Busca a sala
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("name", rName)
      .single();

    if (roomError || !room) throw new Error("Sala não encontrada.");

    // Tenta entrar (O banco valida nome único via participants table)
    const { error: partError } = await supabase
      .from("participants")
      .insert({ room_id: room.id, user_id: userId, name: uName });

    if (partError) throw new Error("Nome de usuário já existe nesta sala.");

    setRoomId(room.id);
    setRoomName(room.name);
    setUserName(uName);
    setIsOwner(false);
    setConfig(room.config);

    await enterRealtime(room.id, uName);
  };

  // =========================================================
  // 3. CONEXÃO REALTIME (Mouses + Eventos)
  // =========================================================
  const enterRealtime = async (rId: string, uName: string) => {
    // Canal específico da sala
    const channel = supabase.channel(`room:${rId}`, {
      config: { presence: { key: userId } },
    });

    channel
      // A) OUVIR PRESENÇA (Mouses + Contagem)
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const activeUsers = Object.keys(state).length;
        setUsersInRoom(activeUsers);

        // Mapeia cursores
        const newCursors: Record<string, UserCursor> = {};
        Object.values(state).forEach((pres: any) => {
          const p = pres[0];
          if (p.userId !== userId && p.pathname === window.location.pathname) {
            newCursors[p.userId] = p;
          }
        });
        setCursors(newCursors);
      })
      // B) OUVIR COMANDOS DE DADOS (Sync)
      .on("broadcast", { event: "DATA_UPDATE" }, (payload) => {
        console.log("📥 Dados recebidos do dono:", payload);
        // AQUI VOCÊ CONECTA COM SEU CONTEXTO DE TIMETABLE
        // Ex: updateLocalGrid(payload.data);
      })
      // C) OUVIR CONFIGURAÇÕES
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${rId}`,
        },
        (payload) => {
          setConfig(payload.new.config);
        }
      )
      // D) OUVIR SALA DELETADA (Kick)
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${rId}`,
        },
        () => {
          alert("O dono encerrou a sala.");
          leaveRoomLogic(false); // Sai sem tentar deletar do banco
        }
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            userId,
            name: uName,
            color: myColor.current,
            x: 0,
            y: 0,
            pathname: window.location.pathname,
          });
        }
      });

    channelRef.current = channel;
  };

  // Atualiza a 'pathname' no presence quando navega
  useEffect(() => {
    if (channelRef.current && userName) {
      channelRef.current.track({
        userId,
        name: userName,
        color: myColor.current,
        x: 0,
        y: 0,
        pathname,
      });
    }
  }, [pathname]);

  // =========================================================
  // 4. SAIR DA SALA
  // =========================================================
  const leaveRoomLogic = async (deleteFromDb = true) => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    if (deleteFromDb && roomId) {
      if (isOwner) {
        // Se dono sai, deleta a sala (Cascade apaga participantes)
        await supabase.from("rooms").delete().eq("id", roomId);
      } else {
        // Se convidado sai, deleta participante
        await supabase
          .from("participants")
          .delete()
          .eq("room_id", roomId)
          .eq("user_id", userId);
      }
    }

    // Reset local
    setRoomId(null);
    setRoomName(null);
    setIsOwner(false);
    setCursors({});
    router.push("/salas"); // Volta pra lista
  };

  const leaveRoom = async () => leaveRoomLogic(true);

  // =========================================================
  // 5. UTILITÁRIOS (Mouse e Config)
  // =========================================================
  const broadcastMouse = (x: number, y: number) => {
    if (channelRef.current) {
      // Atualiza meu estado no Presence (Supabase faz o throttle)
      channelRef.current.track({
        userId,
        name: userName,
        color: myColor.current,
        x,
        y,
        pathname,
      });
    }
  };

  const updateConfig = async (newConfig: RoomConfig) => {
    if (!isOwner || !roomId) return;
    await supabase.from("rooms").update({ config: newConfig }).eq("id", roomId);
  };

  const broadcastDataUpdate = async (data: any) => {
    if (!channelRef.current) return;
    channelRef.current.send({
      type: "broadcast",
      event: "DATA_UPDATE",
      payload: data,
    });
  };

  return (
    <CollaborationContext.Provider
      value={{
        isInRoom: !!roomId,
        isOwner,
        roomName,
        userName,
        usersInRoom,
        config,
        cursors,
        createRoom,
        joinRoom,
        leaveRoom,
        updateConfig,
        broadcastMouse,
        broadcastDataUpdate,
      }}
    >
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => useContext(CollaborationContext);
