import React, { createContext, useContext, useState, ReactNode } from "react";

// 1. Defina os tipos dos dados que o contexto irá armazenar
interface HistoryComponenteInterface {
  idSolutionRowOpen: Map<string, boolean>;
  setopenIdSolutionRowOpen: React.Dispatch<
    React.SetStateAction<Map<string, boolean>>
  >;
}

// 2. Crie o contexto com um valor default opcional
const HistoryComponenteContext = createContext<HistoryComponenteInterface>({
  idSolutionRowOpen: new Map<string, boolean>(),
  setopenIdSolutionRowOpen: () => {},
});

// 3. Crie o provider
interface MyProviderProps {
  children: ReactNode;
}

export const HistorySolutionProvider: React.FC<MyProviderProps> = ({
  children,
}) => {
  const [idSolutionRowOpen, setopenIdSolutionRowOpen] = useState(
    new Map<string, boolean>()
  );

  return (
    <HistoryComponenteContext.Provider
      value={{
        idSolutionRowOpen: idSolutionRowOpen,
        setopenIdSolutionRowOpen: setopenIdSolutionRowOpen,
      }}
    >
      {children}
    </HistoryComponenteContext.Provider>
  );
};

// 4. Hook personalizado para consumir o contexto com segurança
export const useHistoryComponentContext =
  () /* Pode ser tipado para tornar mais claro oque esperar */ => {
    const context = useContext(HistoryComponenteContext);
    if (context === undefined) {
      throw new Error("useMyContext deve ser usado dentro de um MyProvider");
    }

    function toggleIdSolutionRowState(id: string) {
      context.setopenIdSolutionRowOpen((prev) => {
        const newMap = new Map(prev); // nova referência
        const currentState = newMap.get(id) ?? false;
        newMap.set(id, !currentState);
        return newMap;
      });
    }

    return { ...context, toggleIdSolutionRowState };
  };
