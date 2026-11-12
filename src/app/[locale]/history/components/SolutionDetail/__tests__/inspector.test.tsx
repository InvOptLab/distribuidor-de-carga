// @vitest-environment jsdom
import type React from "react";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../../../../../messages/pt-BR.json";
import { TipoInsercao, type HistoricoSolucao } from "@/context/Global/utils";
import { docente, form, turma } from "@/app/[locale]/atribuicoes/model/__tests__/fixtures";
import { buildSolutionDetail } from "../../../model/solutionDetail";
import EntityDetail, { INSPECT_FOLLOW_DELAY_MS } from "../EntityDetail";
import EntityInspector from "../EntityInspector";
import { useDetailKeyboard } from "../useDetailKeyboard";

// Os cards da grade importam o barril de ícones (milhares de arquivos); não estão sob teste aqui
vi.mock("@/app/[locale]/atribuicoes/_components/HoveredCourse", () => ({
  default: (props: { disciplina: { id: string } }) => <div data-testid="course-card">{props.disciplina.id}</div>,
}));
vi.mock("@/app/[locale]/atribuicoes/_components/HoveredDocente", () => ({
  default: (props: { docente: { nome: string } }) => <div data-testid="docente-card">{props.docente.nome}</div>,
}));

vi.mock("@/context/Accessibility", () => ({
  useAccessibility: () => ({ isHighContrast: false }),
}));

afterEach(cleanup);

const entry: HistoricoSolucao = {
  id: "s",
  datetime: "",
  tipoInsercao: TipoInsercao.Manual,
  solucao: {
    atribuicoes: [
      { id_disciplina: "T1", docentes: ["Ana"] },
      { id_disciplina: "T2", docentes: ["Ana"] },
    ],
  },
  contexto: {
    docentes: [docente("Ana", { saldo: 1 }), docente("Bruno")],
    disciplinas: [turma("T1", { conflitos: new Set(["T2"]) }), turma("T2", { conflitos: new Set(["T1"]) }), turma("T3")],
    travas: [],
    maxPriority: 4,
    formularios: [form("Ana", "T1", 1), form("Ana", "T3", 4)],
  },
};
const detail = buildSolutionDetail(entry);
const ana = { kind: "docente" as const, id: "Ana" };

function wrap(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="pt-BR" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("EntityDetail: regra única de 4.2", () => {
  it("clicar numa relação abre no inspetor e não insere nada na tabela", () => {
    const onInspect = vi.fn();
    const onFocusEntity = vi.fn();
    wrap(
      <EntityDetail detail={detail} entity={ana} locale="pt-BR" onInspect={onInspect} onFocusEntity={onFocusEntity} />,
    );
    const before = screen.getAllByRole("row").length;
    fireEvent.click(screen.getByTestId("relation-T3"));
    expect(onInspect).toHaveBeenCalledWith({ kind: "turma", id: "T3" }, "explicit");
    expect(onFocusEntity).not.toHaveBeenCalled();
    expect(screen.getAllByRole("row")).toHaveLength(before);
  });

  it("duplo clique e Enter fazem o pivô (Focar)", () => {
    const onFocusEntity = vi.fn();
    wrap(
      <EntityDetail detail={detail} entity={ana} locale="pt-BR" onInspect={vi.fn()} onFocusEntity={onFocusEntity} />,
    );
    fireEvent.doubleClick(screen.getByTestId("relation-T1"));
    fireEvent.keyDown(screen.getByTestId("relation-T2"), { key: "Enter" });
    expect(onFocusEntity.mock.calls).toEqual([[{ kind: "turma", id: "T1" }], [{ kind: "turma", id: "T2" }]]);
  });

  it("↓ move o foco e o inspetor acompanha com atraso", () => {
    vi.useFakeTimers();
    const onInspect = vi.fn();
    wrap(<EntityDetail detail={detail} entity={ana} locale="pt-BR" onInspect={onInspect} onFocusEntity={vi.fn()} />);
    const first = screen.getByTestId("relation-T1");
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByTestId("relation-T2"));
    expect(onInspect).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(INSPECT_FOLLOW_DELAY_MS);
    });
    expect(onInspect).toHaveBeenCalledWith({ kind: "turma", id: "T2" }, "follow");
    vi.useRealTimers();
  });

  it("marca a linha que está no inspetor", () => {
    wrap(
      <EntityDetail detail={detail} entity={ana} locale="pt-BR" inspectedId="T2" onInspect={vi.fn()} onFocusEntity={vi.fn()} />,
    );
    expect(screen.getByTestId("relation-T2").getAttribute("aria-selected")).toBe("true");
    expect(screen.getByTestId("relation-T1").getAttribute("aria-selected")).toBe("false");
  });
});

describe("EntityInspector", () => {
  it("mostra a relação e Focar faz o pivô; voltar limpa o inspetor", () => {
    const onFocusEntity = vi.fn();
    const onBack = vi.fn();
    wrap(
      <EntityInspector
        detail={detail}
        entity={ana}
        inspect={{ kind: "turma", id: "T2" }}
        onBack={onBack}
        onFocusEntity={onFocusEntity}
      />,
    );
    expect(screen.getByLabelText("Relação").textContent).toContain("choca com T1");
    expect(screen.getByTestId("course-card").textContent).toBe("T2");
    fireEvent.click(screen.getByRole("button", { name: "Focar" }));
    expect(onFocusEntity).toHaveBeenCalledWith({ kind: "turma", id: "T2" });
    fireEvent.click(screen.getByRole("button", { name: "Voltar para Ana" }));
    expect(onBack).toHaveBeenCalled();
  });

  it("sem relação aberta mostra a própria entidade, sem Focar", () => {
    wrap(<EntityInspector detail={detail} entity={ana} inspect={null} onBack={vi.fn()} onFocusEntity={vi.fn()} />);
    expect(screen.getByRole("complementary", { name: "Inspetor: Ana" })).toBeTruthy();
    expect(screen.getByTestId("docente-card").textContent).toBe("Ana");
    expect(screen.queryByRole("button", { name: "Focar" })).toBeNull();
  });
});

describe("useDetailKeyboard: Esc em camadas", () => {
  it("fecha sobreposto/pilha antes do diálogo; backdrop fecha o diálogo", () => {
    const onEscape = vi.fn();
    const base = { onEscape, onNavigate: vi.fn(), onRestore: vi.fn() };
    const { result, rerender } = renderHook((layer: Parameters<typeof useDetailKeyboard>[0]["escapeLayer"]) =>
      useDetailKeyboard({ ...base, escapeLayer: layer }),
    { initialProps: { kind: "overlay" } as never });
    result.current.handleClose({}, "escapeKeyDown");
    rerender({ kind: "stack", level: "inspector" } as never);
    result.current.handleClose({}, "escapeKeyDown");
    rerender(null as never);
    result.current.handleClose({}, "escapeKeyDown");
    result.current.handleClose({}, "backdropClick");
    expect(onEscape.mock.calls.map((c) => c[0])).toEqual([
      "closeOverlay",
      "stackBack",
      "closeDialog",
      "closeDialog",
    ]);
  });
});
