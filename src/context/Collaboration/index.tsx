"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { useTranslations } from "next-intl";
import { jsonReplacer } from "../Global/utils";

const stringToColor = (string: string | null) => {
  if (!string) return "#1976d2"; // Cor padrão caso o nome não exista
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

// Tipos
export type RoomConfig = {
  guestsCanEdit: boolean;
  guestsCanFilter: boolean;
};

type UserCursor = {
  x: number;
  y: number;
  color: string;
  name: string;
  userId: string;
  pathname: string;
  isOwner?: boolean;
};

// Payload para mudança de seleção
type SelectionUpdatePayload = {
  type: "SELECTION_CHANGE";
  index: number;
  timestamp: number;
};

type DataUpdatePayload = {
  type: "FULL_DATA" | "PARTIAL_DATA";
  data: string;
  timestamp: number;
};

type AssignmentUpdatePayload = {
  type: "ASSIGNMENT_CHANGE";
  assignment: string;
  action: "add" | "remove" | "update";
  timestamp: number;
};

type CollaborationContextType = {
  isInRoom: boolean;
  isOwner: boolean;
  roomName: string | null;
  userName: string | null;
  usersInRoom: number;
  config: RoomConfig;
  cursors: Record<string, UserCursor>;
  createRoom: (
    roomName: string,
    userName: string,
    initialConfig?: RoomConfig,
  ) => Promise<void>;
  joinRoom: (roomName: string, userName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  updateConfig: (newConfig: RoomConfig) => Promise<void>;
  broadcastMouse: (x: number, y: number) => void;
  broadcastDataUpdate: (data: any, type?: "FULL_DATA" | "PARTIAL_DATA") => void;
  broadcastAssignmentChange: (
    assignment: any,
    action: "add" | "remove" | "update",
  ) => void;
  broadcastSelectionChange: (index: number) => void;
  requestDataFromOwner: () => void;
  onDataUpdate: (callback: (payload: DataUpdatePayload) => void) => () => void;
  onAssignmentChange: (
    callback: (payload: AssignmentUpdatePayload) => void,
  ) => () => void;
  onSelectionChange: (
    callback: (payload: SelectionUpdatePayload) => void,
  ) => () => void;
  onDataRequest: (callback: () => void) => () => void;
};

const CollaborationContext = createContext<CollaborationContextType>({} as any);

export const CollaborationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const t = useTranslations("Collaboration");

  // Estados Locais
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [userId] = useState(() => uuidv4());
  const [userName, setUserName] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  // Configuração padrão atualizada
  const [config, setConfig] = useState<RoomConfig>({
    guestsCanEdit: false,
    guestsCanFilter: false,
  });

  // Estados de Realtime
  const [cursors, setCursors] = useState<Record<string, UserCursor>>({});
  const [usersInRoom, setUsersInRoom] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const dataUpdateCallbacksRef = useRef<
    Set<(payload: DataUpdatePayload) => void>
  >(new Set());
  const assignmentChangeCallbacksRef = useRef<
    Set<(payload: AssignmentUpdatePayload) => void>
  >(new Set());
  const selectionChangeCallbacksRef = useRef<
    Set<(payload: SelectionUpdatePayload) => void>
  >(new Set());
  const dataRequestCallbacksRef = useRef<Set<() => void>>(new Set());

  const channelReadyRef = useRef(false);

  // =========================================================
  // LÓGICA DE CRIAR SALA
  // =========================================================
  const createRoom = async (
    rName: string,
    uName: string,
    initialConfig?: RoomConfig,
  ) => {
    const roomConfig = initialConfig || {
      guestsCanEdit: false,
      guestsCanFilter: false,
    };

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        name: rName,
        owner_id: userId,
        owner_name: uName,
        config: roomConfig,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    setRoomId(data.id);
    setRoomName(data.name);
    setUserName(uName);
    setIsOwner(true);
    setConfig(data.config || { guestsCanEdit: false, guestsCanFilter: false });

    await enterRealtime(data.id, uName, true);
  };

  // =========================================================
  // LÓGICA DE ENTRAR NA SALA
  // =========================================================
  const joinRoom = async (rName: string, uName: string) => {
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("name", rName)
      .single();

    if (roomError || !room) throw new Error(t("roomNotFound"));

    const { error: partError } = await supabase
      .from("participants")
      .insert({ room_id: room.id, user_id: userId, name: uName });

    if (partError) throw new Error(t("nameAlreadyExistis"));

    setRoomId(room.id);
    setRoomName(room.name);
    setUserName(uName);
    setIsOwner(false);
    setConfig(room.config || { guestsCanEdit: false, guestsCanFilter: false });

    await enterRealtime(room.id, uName, false);
  };

  // =========================================================
  // CONEXÃO REALTIME
  // =========================================================
  const enterRealtime = async (rId: string, uName: string, owner: boolean) => {
    const channel = supabase.channel(`room:${rId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const activeUsers = Object.keys(state).length;
        setUsersInRoom(activeUsers);

        // Atualiza a lista de usuários sem destruir as posições X/Y em movimento
        setCursors((prev) => {
          const updated = { ...prev };

          // 1. Adiciona novos usuários na porta de entrada (0,0)
          Object.values(state).forEach((pres: any) => {
            const p = pres[0];
            if (
              p.userId !== userId &&
              p.pathname === window.location.pathname
            ) {
              if (!updated[p.userId]) {
                updated[p.userId] = p;
              }
            }
          });

          // 2. Remove da tela quem saiu da sala
          const activeIds = Object.values(state).map(
            (pres: any) => pres[0].userId,
          );
          Object.keys(updated).forEach((id) => {
            if (!activeIds.includes(id)) {
              delete updated[id];
            }
          });

          return updated;
        });
      })
      // Ouvinte dedicado para renderizar o movimento do mouse
      .on("broadcast", { event: "CURSOR_MOVE" }, ({ payload }) => {
        setCursors((prev) => {
          if (
            payload.userId !== userId &&
            payload.pathname === window.location.pathname
          ) {
            return {
              ...prev,
              [payload.userId]: {
                ...prev[payload.userId], // Mantém dados base
                ...payload, // Atualiza instantaneamente o X e Y
              },
            };
          }
          return prev;
        });
      })
      .on("broadcast", { event: "DATA_UPDATE" }, ({ payload }) => {
        dataUpdateCallbacksRef.current.forEach((cb) =>
          cb(payload as DataUpdatePayload),
        );
      })
      .on("broadcast", { event: "ASSIGNMENT_CHANGE" }, ({ payload }) => {
        assignmentChangeCallbacksRef.current.forEach((cb) =>
          cb(payload as AssignmentUpdatePayload),
        );
      })
      .on("broadcast", { event: "SELECTION_CHANGE" }, ({ payload }) => {
        selectionChangeCallbacksRef.current.forEach((cb) =>
          cb(payload as SelectionUpdatePayload),
        );
      })
      .on("broadcast", { event: "REQUEST_DATA" }, ({ payload }) => {
        if (owner) {
          dataRequestCallbacksRef.current.forEach((cb) => cb());
        }
      })
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
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${rId}`,
        },
        () => {
          alert(t("ownerEndedRoom"));
          leaveRoomLogic(false);
        },
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          channelReadyRef.current = true;
          await channel.track({
            userId,
            name: uName,
            color: stringToColor(uName),
            x: 0,
            y: 0,
            pathname: window.location.pathname,
            isOwner: owner,
          });

          if (!owner) {
            setTimeout(() => {
              channel.send({
                type: "broadcast",
                event: "REQUEST_DATA",
                payload: { userId, userName: uName },
              });
            }, 500);
          }
        }
      });

    channelRef.current = channel;
  };

  useEffect(() => {
    if (channelRef.current && userName && channelReadyRef.current) {
      channelRef.current.track({
        userId,
        name: userName,
        color: stringToColor(userName),
        x: 0,
        y: 0,
        pathname,
        isOwner,
      });
    }
  }, [pathname, userName, isOwner, userId]);

  // =========================================================
  // SAIR DA SALA
  // =========================================================
  const leaveRoomLogic = async (deleteFromDb = true) => {
    if (channelRef.current) {
      channelRef.current.untrack();
      channelReadyRef.current = false;
      supabase.removeChannel(channelRef.current);
    }

    if (deleteFromDb && roomId) {
      if (isOwner) {
        await supabase.from("rooms").delete().eq("id", roomId);
      } else {
        await supabase
          .from("participants")
          .delete()
          .eq("room_id", roomId)
          .eq("user_id", userId);
      }
    }

    setRoomId(null);
    setRoomName(null);
    setIsOwner(false);
    setCursors({});
    router.push("/salas");
  };

  const leaveRoom = async () => leaveRoomLogic(true);

  // =========================================================
  // UTILITÁRIOS
  // =========================================================
  const broadcastMouse = (x: number, y: number) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "CURSOR_MOVE",
        payload: {
          userId,
          name: userName,
          color: stringToColor(userName),
          x,
          y,
          pathname,
          isOwner,
        },
      });
    }
  };

  const updateConfig = async (newConfig: RoomConfig) => {
    if (!isOwner || !roomId) return;
    await supabase.from("rooms").update({ config: newConfig }).eq("id", roomId);
  };

  const broadcastDataUpdate = useCallback(
    (data: any, type: "FULL_DATA" | "PARTIAL_DATA" = "FULL_DATA") => {
      if (!channelRef.current) return;

      const payload: DataUpdatePayload = {
        type,
        data: JSON.stringify(data, jsonReplacer), // Serializa com a mesma regra do Storage
        timestamp: Date.now(),
      };

      channelRef.current.send({
        type: "broadcast",
        event: "DATA_UPDATE",
        payload,
      });
    },
    [],
  );

  const broadcastAssignmentChange = useCallback(
    (assignment: any, action: "add" | "remove" | "update") => {
      if (!channelRef.current) return;

      const payload: AssignmentUpdatePayload = {
        type: "ASSIGNMENT_CHANGE",
        assignment: JSON.stringify(assignment, jsonReplacer), // Serializa a atribuição
        action,
        timestamp: Date.now(),
      };

      channelRef.current.send({
        type: "broadcast",
        event: "ASSIGNMENT_CHANGE",
        payload,
      });
    },
    [],
  );

  const broadcastSelectionChange = useCallback((index: number) => {
    if (!channelRef.current) return;
    channelRef.current.send({
      type: "broadcast",
      event: "SELECTION_CHANGE",
      payload: { type: "SELECTION_CHANGE", index, timestamp: Date.now() },
    });
  }, []);

  const requestDataFromOwner = useCallback(() => {
    if (!channelRef.current || isOwner) return;

    channelRef.current.send({
      type: "broadcast",
      event: "REQUEST_DATA",
      payload: { userId, userName },
    });
  }, [isOwner, userId, userName]);

  const onDataUpdate = useCallback(
    (callback: (payload: DataUpdatePayload) => void) => {
      dataUpdateCallbacksRef.current.add(callback);
      return () => {
        dataUpdateCallbacksRef.current.delete(callback);
      };
    },
    [],
  );

  const onAssignmentChange = useCallback(
    (callback: (payload: AssignmentUpdatePayload) => void) => {
      assignmentChangeCallbacksRef.current.add(callback);
      return () => {
        assignmentChangeCallbacksRef.current.delete(callback);
      };
    },
    [],
  );

  const onSelectionChange = useCallback(
    (callback: (payload: SelectionUpdatePayload) => void) => {
      selectionChangeCallbacksRef.current.add(callback);
      return () => {
        selectionChangeCallbacksRef.current.delete(callback);
      };
    },
    [],
  );

  const onDataRequest = useCallback((callback: () => void) => {
    dataRequestCallbacksRef.current.add(callback);
    return () => {
      dataRequestCallbacksRef.current.delete(callback);
    };
  }, []);

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
        broadcastAssignmentChange,
        broadcastSelectionChange,
        requestDataFromOwner,
        onDataUpdate,
        onAssignmentChange,
        onSelectionChange,
        onDataRequest,
      }}
    >
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => useContext(CollaborationContext);
