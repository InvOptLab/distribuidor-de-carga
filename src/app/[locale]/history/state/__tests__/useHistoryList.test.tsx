// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TipoInsercao, type HistoricoSolucao } from "@/context/Global/utils";
import { docente, turma } from "@/app/[locale]/atribuicoes/model/__tests__/fixtures";

const nav = vi.hoisted(() => ({
  search: "",
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace, back: nav.back }),
  usePathname: () => "/pt-BR/history",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

import { useHistoryList } from "../useHistoryList";

function entry(id: string, tipo: TipoInsercao, avaliacao: number, nomes: string[]): HistoricoSolucao {
  return {
    id,
    datetime: "",
    tipoInsercao: tipo,
    solucao: { atribuicoes: [], avaliacao },
    contexto: {
      docentes: nomes.map((n) => docente(n)),
      disciplinas: [turma("T1")],
      travas: [],
      maxPriority: 3,
      formularios: [],
    },
  };
}

const historico = new Map([
  ["20250101_10_00_00", entry("20250101_10_00_00", TipoInsercao.Manual, 1, ["Ana"])],
  ["20250102_10_00_00", entry("20250102_10_00_00", TipoInsercao.Algoritmo, 3, ["Ana"])],
  ["20250103_10_00_00", entry("20250103_10_00_00", TipoInsercao.Algoritmo, 2, ["Bruno"])],
]);

const lastUrl = (fn: ReturnType<typeof vi.fn>) =>
  new URLSearchParams(String(fn.mock.calls.at(-1)?.[0]).split("?")[1] ?? "");

function setup(search: string) {
  nav.search = search;
  return renderHook(() => useHistoryList(historico, undefined, (r) => r.id));
}

beforeEach(() => {
  nav.push.mockReset();
  nav.replace.mockReset();
  nav.back.mockReset();
});

describe("useHistoryList: parâmetros do diálogo", () => {
  it("lê e escreve `insp` com replace", () => {
    const { result } = setup("detalhe=20250102_10_00_00&ent=turma:T1&insp=docente:Ana");
    expect(result.current.inspect).toEqual({ kind: "docente", id: "Ana" });
    act(() => result.current.setInspect({ kind: "docente", id: "Ana" }));
    expect(nav.push).not.toHaveBeenCalled();
    expect(lastUrl(nav.replace).get("insp")).toBe("docente:Ana");
  });

  it("trocar `ent` usa replace e limpa o inspetor", () => {
    const { result } = setup("detalhe=20250102_10_00_00&ent=turma:T1&insp=docente:Ana");
    act(() => result.current.setEntity({ kind: "docente", id: "Ana" }));
    const url = lastUrl(nav.replace);
    expect(url.get("ent")).toBe("docente:Ana");
    expect(url.has("insp")).toBe(false);
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("abrir usa push; fechar depois de abrir volta no navegador", () => {
    const { result } = setup("");
    act(() => result.current.openDetail("20250101_10_00_00"));
    expect(nav.push).toHaveBeenCalledTimes(1);
    expect(lastUrl(nav.push).get("detalhe")).toBe("20250101_10_00_00");
    act(() => result.current.closeDetail());
    expect(nav.back).toHaveBeenCalledTimes(1);
  });

  it("fechar um link colado (sem push) limpa os parâmetros com replace", () => {
    const { result } = setup("detalhe=20250101_10_00_00&ent=docente:Ana");
    act(() => result.current.closeDetail());
    expect(nav.back).not.toHaveBeenCalled();
    const url = lastUrl(nav.replace);
    expect(url.has("detalhe")).toBe(false);
    expect(url.has("ent")).toBe(false);
  });

  it("navigateDetail segue ordenação e filtro e mantém a entidade quando existe", () => {
    // Só Algoritmo, mais recentes primeiro: [03 (Bruno), 02 (Ana)]
    const { result } = setup("origem=Algoritmo&detalhe=20250103_10_00_00&ent=docente:Bruno");
    expect(result.current.rows.map((r) => r.id)).toEqual(["20250103_10_00_00", "20250102_10_00_00"]);
    act(() => result.current.navigateDetail(1));
    let url = lastUrl(nav.replace);
    expect(url.get("detalhe")).toBe("20250102_10_00_00");
    expect(url.has("ent")).toBe(false); // Bruno não existe na 02
    expect(nav.push).not.toHaveBeenCalled();

    nav.replace.mockReset();
    const second = setup("origem=Algoritmo&detalhe=20250102_10_00_00&ent=docente:Ana");
    act(() => second.result.current.navigateDetail(1)); // já é a última
    expect(nav.replace).not.toHaveBeenCalled();
    act(() => second.result.current.navigateDetail(-1));
    url = lastUrl(nav.replace);
    expect(url.get("detalhe")).toBe("20250103_10_00_00");
    expect(url.get("origem")).toBe("Algoritmo");
  });

  it("limpa ids inválidos com replace", () => {
    setup("detalhe=20250101_10_00_00&ent=docente:Fantasma");
    const url = lastUrl(nav.replace);
    expect(url.get("detalhe")).toBe("20250101_10_00_00");
    expect(url.has("ent")).toBe(false);
  });
});
