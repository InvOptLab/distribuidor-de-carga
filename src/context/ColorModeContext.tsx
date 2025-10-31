import { createContext, useContext } from "react";

// Definimos o "formato" do nosso contexto
export interface IColorModeContext {
  toggleColorMode: () => void;
  mode: "light" | "dark";
}

// Criamos o contexto com um valor padrão (que será substituído pelo Provider)
export const ColorModeContext = createContext<IColorModeContext>({
  toggleColorMode: () => {},
  mode: "light",
});

// Hook customizado para facilitar o uso do contexto
export const useColorMode = () => useContext(ColorModeContext);
