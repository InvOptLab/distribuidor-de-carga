import { describe, expect, it, vi } from "vitest";

// O cliente real exige variáveis de ambiente; aqui só testamos a classificação de erros
vi.mock("@/lib/supabaseClient", () => ({ supabase: {} }));

import { isMissingFunction } from "../roomsApi";

describe("isMissingFunction", () => {
  it("reconhece função RPC ausente (script não aplicado)", () => {
    expect(
      isMissingFunction({
        code: "PGRST202",
        message: "Could not find the function public.create_room(...)",
      }),
    ).toBe(true);
  });

  it("não confunde erro dentro da função com função ausente", () => {
    // Caso real: pgcrypto fora do search_path. Antes isso caía no acesso
    // direto e aparecia como "permission denied for table rooms".
    expect(
      isMissingFunction({
        code: "42883",
        message: "function gen_random_bytes(integer) does not exist",
      }),
    ).toBe(false);
    expect(
      isMissingFunction({ code: "42501", message: "permission denied" }),
    ).toBe(false);
  });

  it("sem erro", () => {
    expect(isMissingFunction(null)).toBe(false);
  });
});
