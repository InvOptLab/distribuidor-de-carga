import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";

// Tipo do cursor de um usuário
export type UserCursor = {
  x: number;
  y: number;
  color: string;
  name: string;
  userId: string;
};

// Cores aleatórias para diferenciar usuários
const COLORS = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#F033FF",
  "#FF33A8",
  "#33FFF5",
];
const MY_COLOR = COLORS[Math.floor(Math.random() * COLORS.length)];
const MY_ID = Math.random().toString(36).substr(2, 9); // ID temporário de sessão

export const useRealtimeRoom = (roomId: string = "sala-global") => {
  const [otherCursors, setOtherCursors] = useState<Record<string, UserCursor>>(
    {}
  );
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // 1. Criar Canal
    const channel = supabase.channel(roomId, {
      config: {
        presence: {
          key: MY_ID,
        },
      },
    });

    // 2. Ouvir atualizações de "Presence" (Quem entrou/saiu/moveu)
    channel
      .on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState();
        const cursors: Record<string, UserCursor> = {};

        // Converte o estado bruto do Supabase para nosso formato limpo
        Object.keys(newState).forEach((key) => {
          if (key !== MY_ID) {
            // Pega o último status reportado por esse usuário
            const userState = newState[key][0] as unknown as UserCursor;
            if (userState) {
              cursors[key] = userState;
            }
          }
        });

        setOtherCursors(cursors);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Assim que conectar, avisa que estou aqui
          await channel.track({
            x: 0,
            y: 0,
            color: MY_COLOR,
            name: "Coordenador " + MY_ID.slice(0, 3), // Futuramente pegue do Auth
            userId: MY_ID,
          });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Função para eu mover meu mouse
  const moveMyCursor = async (x: number, y: number) => {
    if (channelRef.current) {
      // Envia minha nova posição para a sala
      // O Supabase faz o throttle automático configurado no passo 1
      await channelRef.current.track({
        x,
        y,
        color: MY_COLOR,
        name: "Coordenador " + MY_ID.slice(0, 3),
        userId: MY_ID,
      });
    }
  };

  // Função para enviar uma ação (ex: Atribuição)
  const broadcastAction = async (event: string, payload: any) => {
    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: event,
        payload: payload,
      });
    }
  };

  return {
    otherCursors,
    moveMyCursor,
    broadcastAction,
    channel: channelRef.current, // Exportamos o canal caso queira ouvir eventos específicos fora
  };
};
