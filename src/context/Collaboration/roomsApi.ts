import { supabase } from "@/lib/supabaseClient";
import type { RoomConfig } from ".";

/**
 * Acesso às salas colaborativas.
 *
 * O caminho principal usa as funções (RPC) de `scripts/Supabase/security.sql`,
 * que validam senha, dono e nomes no servidor e escondem o hash da senha e o id
 * das salas privadas. Enquanto esse script não tiver sido aplicado no projeto,
 * as funções não existem e cada operação cai no acesso direto às tabelas (o
 * comportamento antigo), para o app continuar funcionando.
 */

export interface RoomInfo {
  id: string;
  name: string;
  owner_name: string;
  config: RoomConfig;
}

/** Sala como aparece no lobby. Salas privadas vêm sem `id`. */
export interface LobbyRoom {
  id: string | null;
  name: string;
  owner_name: string;
  config: RoomConfig;
  created_at: string;
}

export type RoomErrorCode =
  | "ROOM_NOT_FOUND"
  | "ROOM_NAME_TAKEN"
  | "PASSWORD_REQUIRED"
  | "WRONG_PASSWORD"
  | "NAME_TAKEN"
  | "NOT_OWNER"
  | "UNKNOWN";

export class RoomError extends Error {
  constructor(
    public code: RoomErrorCode,
    message?: string,
  ) {
    super(message ?? code);
  }
}

const KNOWN_CODES: RoomErrorCode[] = [
  "ROOM_NOT_FOUND",
  "ROOM_NAME_TAKEN",
  "PASSWORD_REQUIRED",
  "WRONG_PASSWORD",
  "NAME_TAKEN",
  "NOT_OWNER",
];

/**
 * Função RPC ausente (script de segurança ainda não aplicado).
 * Só o PGRST202 do PostgREST indica isso. O código 42883 do Postgres NÃO serve:
 * ele também aparece quando algo DENTRO da função falha (ex.: gen_random_bytes
 * fora do search_path), e cair no acesso direto escondia o erro real atrás de
 * "permission denied for table rooms".
 */
export function isMissingFunction(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "PGRST202" ||
    /could not find the function/i.test(error.message ?? "")
  );
}

function toRoomError(error: { code?: string; message?: string }): RoomError {
  const code = KNOWN_CODES.find((c) => error.message?.includes(c));
  return new RoomError(code ?? "UNKNOWN", error.message);
}

/** Remove segredos que versões antigas guardavam dentro de `config`. */
function publicConfig(config: any): RoomConfig {
  const { passwordHash: _omit, ...rest } = config ?? {};
  return {
    guestsCanEdit: !!rest.guestsCanEdit,
    guestsCanFilter: !!rest.guestsCanFilter,
    isPrivate: !!rest.isPrivate,
  };
}

function toRoomInfo(row: any): RoomInfo {
  return {
    id: row.id,
    name: row.name,
    owner_name: row.owner_name,
    config: publicConfig(row.config),
  };
}

// =========================================================
// Lobby
// =========================================================
export async function listRooms(): Promise<LobbyRoom[]> {
  const { data, error } = await supabase
    .from("rooms_lobby")
    .select("*")
    .order("created_at", { ascending: false });
  if (!error && data) {
    return data.map((r: any) => ({ ...r, config: publicConfig(r.config) }));
  }

  // Legado: tabela direta
  const legacy = await supabase
    .from("rooms")
    .select("*")
    .order("created_at", { ascending: false });
  return (legacy.data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    owner_name: r.owner_name,
    config: publicConfig(r.config),
    created_at: r.created_at,
  }));
}

// =========================================================
// Criar
// =========================================================
export async function createRoom(params: {
  name: string;
  ownerId: string;
  ownerName: string;
  config: RoomConfig;
  passwordHash?: string;
}): Promise<{ room: RoomInfo; ownerToken: string | null }> {
  const config = publicConfig(params.config);
  const { data, error } = await supabase.rpc("create_room", {
    p_name: params.name,
    p_owner_id: params.ownerId,
    p_owner_name: params.ownerName,
    p_config: config,
    p_password_hash: params.passwordHash ?? null,
  });
  if (!error) {
    return { room: toRoomInfo(data.room), ownerToken: data.owner_token };
  }
  if (!isMissingFunction(error)) throw toRoomError(error);

  // Legado
  const legacy = await supabase
    .from("rooms")
    .insert({
      name: params.name,
      owner_id: params.ownerId,
      owner_name: params.ownerName,
      config: { ...config, passwordHash: params.passwordHash },
    })
    .select()
    .single();
  if (legacy.error) {
    if (legacy.error.code === "23505") throw new RoomError("ROOM_NAME_TAKEN");
    throw new RoomError("UNKNOWN", legacy.error.message);
  }
  // O líder também ocupa um nome na sala (e conta como participante na limpeza)
  await supabase.from("participants").insert({
    room_id: legacy.data.id,
    user_id: params.ownerId,
    name: params.ownerName,
  });
  return { room: toRoomInfo(legacy.data), ownerToken: null };
}

// =========================================================
// Entrar (idempotente para o mesmo userId, para voltar após recarregar)
// =========================================================
export async function joinRoom(params: {
  roomName: string;
  userId: string;
  userName: string;
  passwordHash?: string;
}): Promise<RoomInfo> {
  const { data, error } = await supabase.rpc("join_room", {
    p_room_name: params.roomName,
    p_user_id: params.userId,
    p_name: params.userName,
    p_password_hash: params.passwordHash ?? null,
  });
  if (!error) return toRoomInfo(data);
  if (!isMissingFunction(error)) throw toRoomError(error);

  // Legado
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("*")
    .eq("name", params.roomName)
    .single();
  if (roomError || !room) throw new RoomError("ROOM_NOT_FOUND");

  if (room.config?.isPrivate) {
    if (!params.passwordHash) throw new RoomError("PASSWORD_REQUIRED");
    if (params.passwordHash !== room.config.passwordHash) {
      throw new RoomError("WRONG_PASSWORD");
    }
  }

  const { error: partError } = await supabase
    .from("participants")
    .insert({ room_id: room.id, user_id: params.userId, name: params.userName });

  if (partError) {
    // Mesmo usuário voltando (recarregou a página): não é conflito
    const { data: existing } = await supabase
      .from("participants")
      .select("user_id")
      .eq("room_id", room.id)
      .eq("name", params.userName)
      .maybeSingle();
    if (existing?.user_id !== params.userId) throw new RoomError("NAME_TAKEN");
  }
  return toRoomInfo(room);
}

/** Líder voltando após recarregar a página. */
export async function rejoinOwner(params: {
  roomId: string;
  ownerId: string;
  ownerToken: string | null;
}): Promise<RoomInfo> {
  if (params.ownerToken) {
    const { data, error } = await supabase.rpc("rejoin_owner", {
      p_room_id: params.roomId,
      p_owner_token: params.ownerToken,
    });
    if (!error) return toRoomInfo(data);
    if (!isMissingFunction(error)) throw toRoomError(error);
  }
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", params.roomId)
    .eq("owner_id", params.ownerId)
    .single();
  if (error || !data) throw new RoomError("ROOM_NOT_FOUND");
  return toRoomInfo(data);
}

// =========================================================
// Presença no banco (para liberar nomes de quem fechou a aba)
// =========================================================
export async function touchParticipant(roomId: string, userId: string) {
  const { error } = await supabase.rpc("touch_participant", {
    p_room_id: roomId,
    p_user_id: userId,
  });
  // Sem o script aplicado não há batimento; ignora silenciosamente
  if (error && !isMissingFunction(error)) {
    console.warn("touch_participant:", error.message);
  }
}

// =========================================================
// Sair / encerrar / configurar
// =========================================================
export async function leaveRoom(roomId: string, userId: string) {
  const { error } = await supabase.rpc("leave_room", {
    p_room_id: roomId,
    p_user_id: userId,
  });
  if (!error || !isMissingFunction(error)) return;
  await supabase
    .from("participants")
    .delete()
    .eq("room_id", roomId)
    .eq("user_id", userId);
}

export async function endRoom(roomId: string, ownerToken: string | null) {
  if (ownerToken) {
    const { error } = await supabase.rpc("end_room", {
      p_room_id: roomId,
      p_owner_token: ownerToken,
    });
    if (!error) return;
    if (!isMissingFunction(error)) throw toRoomError(error);
  }
  await supabase.from("rooms").delete().eq("id", roomId);
}

export async function updateRoomConfig(
  roomId: string,
  ownerToken: string | null,
  config: RoomConfig,
): Promise<RoomConfig> {
  const next = publicConfig(config);
  if (ownerToken) {
    const { data, error } = await supabase.rpc("update_room_config", {
      p_room_id: roomId,
      p_owner_token: ownerToken,
      p_config: next,
    });
    if (!error) return publicConfig(data);
    if (!isMissingFunction(error)) throw toRoomError(error);
  }
  // Legado: preserva o hash que versões antigas guardavam em config
  const { data: current } = await supabase
    .from("rooms")
    .select("config")
    .eq("id", roomId)
    .single();
  const merged = { ...(current?.config ?? {}), ...next };
  await supabase.from("rooms").update({ config: merged }).eq("id", roomId);
  return publicConfig(merged);
}
