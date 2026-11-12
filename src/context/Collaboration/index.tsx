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
import * as roomsApi from "./roomsApi";
import { RoomError, type RoomErrorCode } from "./roomsApi";
import { diffDocentes, isEmptyDelta, type AssignmentDelta } from "./sync";

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

export const hashPassword = async (password: string) => {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

// Tipos
export type RoomConfig = {
  guestsCanEdit: boolean;
  guestsCanFilter: boolean;
  isPrivate?: boolean;
  /** Só usado ao criar a sala; nunca é lido de volta do servidor. */
  passwordHash?: string;
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
  /** JSON de um AssignmentDelta (ou, de versões antigas, de uma Atribuicao). */
  assignment: string;
  action: "add" | "remove" | "update";
  timestamp: number;
};

/** Sessão guardada na aba para voltar à sala depois de recarregar a página. */
type StoredSession = {
  roomId: string;
  roomName: string;
  userName: string;
  userId: string;
  isOwner: boolean;
  ownerToken: string | null;
  passwordHash?: string;
};

const SESSION_KEY = "collab-session";
const HEARTBEAT_MS = 30_000;

function readSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function writeSession(session: StoredSession | null) {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // sessionStorage indisponível: apenas não sobrevive ao recarregar
  }
}

type CollaborationContextType = {
  isInRoom: boolean;
  isOwner: boolean;
  /** Pode alterar dados da sala (líder, ou convidado com guestsCanEdit). */
  canEdit: boolean;
  /** O líder está conectado (sempre true para o próprio líder). */
  ownerOnline: boolean;
  /** Já recebemos a primeira lista de presença do canal. */
  presenceReady: boolean;
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
  joinRoom: (
    roomName: string,
    userName: string,
    password?: string,
  ) => Promise<void>;
  leaveRoom: () => Promise<void>;
  updateConfig: (newConfig: RoomConfig) => Promise<void>;
  broadcastMouse: (x: number, y: number) => void;
  broadcastDataUpdate: (data: any, type?: "FULL_DATA" | "PARTIAL_DATA") => void;
  /**
   * Envia a mudança de uma turma como delta (quem entrou/saiu), calculado a
   * partir da lista anterior e da nova.
   */
  broadcastAssignmentChange: (
    id_disciplina: string,
    prevDocentes: string[],
    nextDocentes: string[],
  ) => void;
  broadcastSelectionChange: (index: number) => void;
  /** Convidado: pede o estado ao líder. Líder: reenvia o próprio estado a todos. */
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
  // Mantém o mesmo id ao recarregar a aba, para voltar à sala como o mesmo usuário
  const [userId] = useState(() => {
    if (typeof window === "undefined") return uuidv4();
    return readSession()?.userId ?? uuidv4();
  });
  const [userName, setUserName] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const ownerTokenRef = useRef<string | null>(null);

  // Configuração padrão atualizada
  const [config, setConfig] = useState<RoomConfig>({
    guestsCanEdit: false,
    guestsCanFilter: false,
  });

  // Estados de Realtime
  const [cursors, setCursors] = useState<Record<string, UserCursor>>({});
  const [usersInRoom, setUsersInRoom] = useState(0);
  const [ownerOnline, setOwnerOnline] = useState(false);
  const [presenceReady, setPresenceReady] = useState(false);
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

  const errorMessage = (code: RoomErrorCode, fallback?: string) => {
    switch (code) {
      case "ROOM_NOT_FOUND":
        return t("roomNotFound");
      case "PASSWORD_REQUIRED":
        return t("passwordRequired");
      case "WRONG_PASSWORD":
        return t("incorrectPassword");
      case "NAME_TAKEN":
        return t("nameAlreadyExistis");
      case "ROOM_NAME_TAKEN":
        return t("roomNameTaken");
      default:
        return fallback ?? code;
    }
  };

  const rethrow = (e: unknown): never => {
    if (e instanceof RoomError) throw new Error(errorMessage(e.code, e.message));
    throw e;
  };

  const resetLocalState = () => {
    setRoomId(null);
    setRoomName(null);
    setIsOwner(false);
    setCursors({});
    setUsersInRoom(0);
    setOwnerOnline(false);
    setPresenceReady(false);
    ownerTokenRef.current = null;
    writeSession(null);
  };

  // =========================================================
  // SAIR DA SALA
  // =========================================================
  const leaveRoomLogic = async (
    mode: "leave" | "kicked",
    current?: { roomId: string | null; isOwner: boolean },
  ) => {
    const rId = current?.roomId ?? roomId;
    const owner = current?.isOwner ?? isOwner;

    if (channelRef.current) {
      if (mode === "leave" && owner) {
        // Avisa os convidados antes de apagar (o evento do banco pode não chegar)
        await channelRef.current
          .send({ type: "broadcast", event: "ROOM_ENDED", payload: {} })
          .catch(() => {});
      }
      channelRef.current.untrack();
      channelReadyRef.current = false;
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (mode === "leave" && rId) {
      try {
        if (owner) await roomsApi.endRoom(rId, ownerTokenRef.current);
        else await roomsApi.leaveRoom(rId, userId);
      } catch (e) {
        console.warn("Falha ao sair da sala:", e);
      }
    }

    resetLocalState();
    router.push("/salas");
  };

  // =========================================================
  // CONEXÃO REALTIME
  // =========================================================
  const enterRealtime = async (rId: string, uName: string, owner: boolean) => {
    const channel = supabase.channel(`room:${rId}`, {
      config: { presence: { key: userId } },
    });

    const kicked = () => {
      alert(t("ownerEndedRoom"));
      leaveRoomLogic("kicked", { roomId: rId, isOwner: owner });
    };

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const presences = Object.values(state).map((p: any) => p[0]);
        setUsersInRoom(presences.length);
        setOwnerOnline(owner || presences.some((p: any) => p.isOwner));
        setPresenceReady(true);

        // Atualiza a lista de usuários sem destruir as posições X/Y em movimento
        setCursors((prev) => {
          const updated = { ...prev };

          // 1. Adiciona novos usuários na porta de entrada (0,0)
          presences.forEach((p: any) => {
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
          const activeIds = presences.map((p: any) => p.userId);
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
      .on("broadcast", { event: "REQUEST_DATA" }, () => {
        if (owner) {
          dataRequestCallbacksRef.current.forEach((cb) => cb());
        }
      })
      // Permissões e encerramento chegam por broadcast do líder (funciona com
      // RLS ligado, quando o canal não recebe eventos da tabela rooms)
      .on("broadcast", { event: "ROOM_CONFIG" }, ({ payload }) => {
        if (payload?.config) setConfig(payload.config);
      })
      .on("broadcast", { event: "ROOM_ENDED" }, () => {
        if (!owner) kicked();
      })
      // Mantidos para projetos sem o script de segurança aplicado
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${rId}`,
        },
        (payload) => {
          const { passwordHash: _omit, ...cfg } = (payload.new as any).config ?? {};
          setConfig(cfg);
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
          if (channelRef.current === channel) kicked();
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

  // =========================================================
  // LÓGICA DE CRIAR SALA
  // =========================================================
  const createRoom = async (
    rName: string,
    uName: string,
    initialConfig?: RoomConfig,
  ) => {
    const { passwordHash, ...roomConfig } = initialConfig || {
      guestsCanEdit: false,
      guestsCanFilter: false,
    };

    const { room, ownerToken } = await roomsApi
      .createRoom({
        name: rName,
        ownerId: userId,
        ownerName: uName,
        config: roomConfig,
        passwordHash,
      })
      .catch(rethrow);

    ownerTokenRef.current = ownerToken;
    setRoomId(room.id);
    setRoomName(room.name);
    setUserName(uName);
    setIsOwner(true);
    setConfig(room.config);
    writeSession({
      roomId: room.id,
      roomName: room.name,
      userName: uName,
      userId,
      isOwner: true,
      ownerToken,
    });

    await enterRealtime(room.id, uName, true);
  };

  // =========================================================
  // LÓGICA DE ENTRAR NA SALA
  // =========================================================
  const joinRoom = async (rName: string, uName: string, password?: string) => {
    const passwordHash = password ? await hashPassword(password) : undefined;

    const room = await roomsApi
      .joinRoom({ roomName: rName, userId, userName: uName, passwordHash })
      .catch(rethrow);

    setRoomId(room.id);
    setRoomName(room.name);
    setUserName(uName);
    setIsOwner(false);
    setConfig(room.config);
    writeSession({
      roomId: room.id,
      roomName: room.name,
      userName: uName,
      userId,
      isOwner: false,
      ownerToken: null,
      passwordHash,
    });

    await enterRealtime(room.id, uName, false);
  };

  // =========================================================
  // VOLTAR À SALA APÓS RECARREGAR A PÁGINA
  // =========================================================
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const session = readSession();
    if (!session || session.userId !== userId) return;

    (async () => {
      try {
        const room = session.isOwner
          ? await roomsApi.rejoinOwner({
              roomId: session.roomId,
              ownerId: session.userId,
              ownerToken: session.ownerToken,
            })
          : await roomsApi.joinRoom({
              roomName: session.roomName,
              userId: session.userId,
              userName: session.userName,
              passwordHash: session.passwordHash,
            });

        ownerTokenRef.current = session.ownerToken;
        setRoomId(room.id);
        setRoomName(room.name);
        setUserName(session.userName);
        setIsOwner(session.isOwner);
        setConfig(room.config);
        await enterRealtime(room.id, session.userName, session.isOwner);
      } catch (e) {
        // Sala encerrada ou expirada enquanto a página recarregava
        console.warn("Não foi possível voltar à sala:", e);
        writeSession(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Batimento: mantém o nome reservado enquanto a aba está aberta
  useEffect(() => {
    if (!roomId) return;
    roomsApi.touchParticipant(roomId, userId);
    const id = setInterval(
      () => roomsApi.touchParticipant(roomId, userId),
      HEARTBEAT_MS,
    );
    return () => clearInterval(id);
  }, [roomId, userId]);

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

  const leaveRoom = async () => leaveRoomLogic("leave");

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
    const saved = await roomsApi
      .updateRoomConfig(roomId, ownerTokenRef.current, newConfig)
      .catch(rethrow);
    setConfig(saved);
    channelRef.current?.send({
      type: "broadcast",
      event: "ROOM_CONFIG",
      payload: { config: saved },
    });
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
    (id_disciplina: string, prevDocentes: string[], nextDocentes: string[]) => {
      if (!channelRef.current) return;
      const delta: AssignmentDelta = diffDocentes(
        id_disciplina,
        prevDocentes,
        nextDocentes,
      );
      if (isEmptyDelta(delta)) return;

      const payload: AssignmentUpdatePayload = {
        type: "ASSIGNMENT_CHANGE",
        assignment: JSON.stringify(delta),
        action: "update",
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
    if (!channelRef.current) return;

    if (isOwner) {
      // Líder: reenvia o próprio estado (dados + filtros) para todos
      dataRequestCallbacksRef.current.forEach((cb) => cb());
      return;
    }

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

  const isInRoom = !!roomId;

  return (
    <CollaborationContext.Provider
      value={{
        isInRoom,
        isOwner,
        canEdit: !isInRoom || isOwner || !!config.guestsCanEdit,
        ownerOnline: isOwner || ownerOnline,
        presenceReady,
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
