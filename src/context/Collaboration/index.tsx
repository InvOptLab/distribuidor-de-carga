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
import {
  Atribuicao,
  Celula,
  Disciplina,
  Docente,
  Formulario,
} from "@/algoritmo/communs/interfaces/interfaces";
import { useAlertsContext } from "../Alerts";

export const serializeContextData = (data: any) => {
  return {
    ...data,
    // Converte Map de formulários dentro de cada Docente para Array
    docentes: data.docentes.map((d: any) => ({
      ...d,
      formularios: d.formularios ? Array.from(d.formularios.entries()) : [],
    })),
    // Converte Set de conflitos dentro de cada Disciplina para Array
    disciplinas: data.disciplinas.map((d: any) => ({
      ...d,
      conflitos: d.conflitos ? Array.from(d.conflitos) : [],
    })),
  };
};

export const deserializeContextData = (data: any) => {
  const result = { ...data };

  // Verifica se o campo existe antes de tentar mapear
  if (data.docentes) {
    result.docentes = data.docentes.map((d: any) => ({
      ...d,
      formularios: new Map(d.formularios),
    }));
  }

  if (data.disciplinas) {
    result.disciplinas = data.disciplinas.map((d: any) => ({
      ...d,
      conflitos: new Set(d.conflitos),
    }));
  }

  return result;
};

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
  pathname: string;
  isOwner?: boolean;
};

type DataUpdatePayload = {
  type: "FULL_DATA" | "PARTIAL_DATA";
  data: {
    docentes: Docente[];
    disciplinas: Disciplina[];
    atribuicoes: Atribuicao[];
    formularios: Formulario[];
    travas: Celula[];
  };
  timestamp: number;
};

type AssignmentUpdatePayload = {
  type: "ASSIGNMENT_CHANGE";
  assignment: any;
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
    initialConfig?: RoomConfig
  ) => Promise<void>;
  joinRoom: (roomName: string, userName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  updateConfig: (newConfig: RoomConfig) => Promise<void>;
  broadcastMouse: (x: number, y: number) => void;
  broadcastDataUpdate: (
    data: {
      docentes: Docente[];
      disciplinas: Disciplina[];
      atribuicoes: Atribuicao[];
      formularios: Formulario[];
      travas: Celula[];
    },
    type?: "FULL_DATA" | "PARTIAL_DATA"
  ) => void;
  broadcastAssignmentChange: (
    assignment: any,
    action: "add" | "remove" | "update"
  ) => void;
  requestDataFromOwner: () => void;
  onDataUpdate: (callback: (payload: DataUpdatePayload) => void) => () => void;
  onAssignmentChange: (
    callback: (payload: AssignmentUpdatePayload) => void
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

  // Estados Locais
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [userId] = useState(() => uuidv4());
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

  // Contexto de Alertas
  const { addAlerta } = useAlertsContext();

  const dataUpdateCallbacksRef = useRef<
    Set<(payload: DataUpdatePayload) => void>
  >(new Set());
  const assignmentChangeCallbacksRef = useRef<
    Set<(payload: AssignmentUpdatePayload) => void>
  >(new Set());
  const dataRequestCallbacksRef = useRef<Set<() => void>>(new Set());

  // =========================================================
  // LÓGICA DE CRIAR SALA
  // =========================================================
  const createRoom = async (
    rName: string,
    uName: string,
    initialConfig?: RoomConfig
  ) => {
    const roomConfig = initialConfig || { guestsCanEdit: false };

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
    setConfig(data.config || { guestsCanEdit: false });

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

    if (roomError || !room) throw new Error("Sala não encontrada.");

    const { error: partError } = await supabase
      .from("participants")
      .insert({ room_id: room.id, user_id: userId, name: uName });

    if (partError) throw new Error("Nome de usuário já existe nesta sala.");

    setRoomId(room.id);
    setRoomName(room.name);
    setUserName(uName);
    setIsOwner(false);
    setConfig(room.config || { guestsCanEdit: false });

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

        const newCursors: Record<string, UserCursor> = {};
        Object.values(state).forEach((pres: any) => {
          const p = pres[0];
          if (p.userId !== userId && p.pathname === window.location.pathname) {
            newCursors[p.userId] = p;
          }
        });
        setCursors(newCursors);
      })
      .on("broadcast", { event: "DATA_UPDATE" }, ({ payload }) => {
        console.log("📥 Dados recebidos:", payload);
        dataUpdateCallbacksRef.current.forEach((cb) =>
          cb(payload as DataUpdatePayload)
        );
      })
      .on("broadcast", { event: "ASSIGNMENT_CHANGE" }, ({ payload }) => {
        console.log("📥 Atribuição alterada:", payload);
        assignmentChangeCallbacksRef.current.forEach((cb) =>
          cb(payload as AssignmentUpdatePayload)
        );
      })
      .on("broadcast", { event: "REQUEST_DATA" }, ({ payload }) => {
        if (owner) {
          console.log("📥 Solicitação de dados recebida de:", payload.userId);
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
        }
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
          alert("O dono encerrou a sala.");
          addAlerta("O dono encerrou a sala.", "error");
          leaveRoomLogic(false);
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
        isOwner,
      });
    }
  }, [pathname, userName, isOwner, userId]);

  // =========================================================
  // SAIR DA SALA
  // =========================================================
  const leaveRoomLogic = async (deleteFromDb = true) => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);

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
  // UTILITÁRIOS (Mouse e Config)
  // =========================================================
  const broadcastMouse = (x: number, y: number) => {
    if (channelRef.current) {
      channelRef.current.track({
        userId,
        name: userName,
        color: myColor.current,
        x,
        y,
        pathname,
        isOwner,
      });
    }
  };

  const updateConfig = async (newConfig: RoomConfig) => {
    if (!isOwner || !roomId) return;
    await supabase.from("rooms").update({ config: newConfig }).eq("id", roomId);
  };

  // =========================================================
  // FUNÇÕES DE SINCRONIZAÇÃO
  // =========================================================

  // Broadcast de atualização de dados (líder -> todos)
  const broadcastDataUpdate = useCallback(
    (
      data: {
        docentes: Docente[];
        disciplinas: Disciplina[];
        atribuicoes: Atribuicao[];
        formularios: Formulario[];
        travas: Celula[];
      },
      type: "FULL_DATA" | "PARTIAL_DATA" = "FULL_DATA"
    ) => {
      if (!channelRef.current) return;

      const payload: DataUpdatePayload = {
        type,
        data,
        timestamp: Date.now(),
      };

      channelRef.current.send({
        type: "broadcast",
        event: "DATA_UPDATE",
        payload,
      });

      console.log("📤 Dados enviados:", payload);
    },
    []
  );

  // Broadcast de mudança de atribuição (qualquer -> todos)
  const broadcastAssignmentChange = useCallback(
    (assignment: any, action: "add" | "remove" | "update") => {
      if (!channelRef.current) return;

      const payload: AssignmentUpdatePayload = {
        type: "ASSIGNMENT_CHANGE",
        assignment,
        action,
        timestamp: Date.now(),
      };

      channelRef.current.send({
        type: "broadcast",
        event: "ASSIGNMENT_CHANGE",
        payload,
      });

      console.log("📤 Atribuição enviada:", payload);
    },
    []
  );

  // Solicitar dados ao dono (convidado -> líder)
  const requestDataFromOwner = useCallback(() => {
    if (!channelRef.current || isOwner) return;

    channelRef.current.send({
      type: "broadcast",
      event: "REQUEST_DATA",
      payload: { userId, userName },
    });

    console.log("📤 Solicitando dados ao líder...");
  }, [isOwner, userId, userName]);

  // Registrar callback para atualizações de dados
  const onDataUpdate = useCallback(
    (callback: (payload: DataUpdatePayload) => void) => {
      dataUpdateCallbacksRef.current.add(callback);
      return () => {
        dataUpdateCallbacksRef.current.delete(callback);
      };
    },
    []
  );

  // Registrar callback para mudanças de atribuição
  const onAssignmentChange = useCallback(
    (callback: (payload: AssignmentUpdatePayload) => void) => {
      assignmentChangeCallbacksRef.current.add(callback);
      return () => {
        assignmentChangeCallbacksRef.current.delete(callback);
      };
    },
    []
  );

  // Registrar callback para solicitações de dados (usado pelo líder)
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
        requestDataFromOwner,
        onDataUpdate,
        onAssignmentChange,
        onDataRequest,
      }}
    >
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => useContext(CollaborationContext);
