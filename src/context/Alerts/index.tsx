import CustomAlert from "@/components/CustomAlert";
import { Stack } from "@mui/material";
import { createContext, useContext, useState } from "react";

export interface Alerta {
  id: number;
  type: "success" | "info" | "warning" | "error";
  message: string;
  closeTime?: number;
  //handleClose?: () => void;
}

interface AlertasInterface {
  alertas: Map<number, Alerta>;
  setAlertas: React.Dispatch<React.SetStateAction<Map<number, Alerta>>>;
}

const AlertsContext = createContext<AlertasInterface>({
  alertas: new Map<number, Alerta>(),
  setAlertas: () => [],
});

export function AlertsWrapper({ children }: { children: React.ReactNode }) {
  const [alertas, setAlertas] = useState<Map<number, Alerta>>(
    new Map<number, Alerta>()
  );
  // {id: 1, message: 'teste 1', type: "info", closeTime: 100}, {id: 2, message: 'teste 2', type: "info", closeTime: 100}

  /**
   * Remove um objeto do state de alertas.
   * @param index Index do objeto dentro do state.
   */
  const removeAlert = (id: number) => {
    setAlertas((prevAlertas) => {
      const newAlerts = new Map(prevAlertas);
      newAlerts.delete(id);
      return newAlerts;
    });
  };

  /**
   * Cria uma lista de alertas que devem ser renderizados
   */
  const renderAlertas = () => {
    const render = [];
    alertas.forEach((alerta, key) => {
      render.push(
        <CustomAlert
          key={key}
          type={alerta.type}
          message={alerta.message}
          id={key}
          closeTime={alerta.closeTime ? alerta.closeTime : 3}
          handleClose={() => removeAlert(key)} // Remove o alerta quando for fechado
        />
      );
    });

    return render;
  };

  return (
    <AlertsContext.Provider
      value={{
        alertas,
        setAlertas,
      }}
    >
      {children}
      <Stack position="fixed" bottom={16} right={16} zIndex={10} spacing={1}>
        {renderAlertas()}
      </Stack>
    </AlertsContext.Provider>
  );
}

export function useAlertsContext() {
  const context = useContext(AlertsContext);

  /**
   * Hook para adicionar um novo alerta no state.
   * @param {string} message Mensagem que será exibida pelo alerta.
   * @param {"success" | "info" | "warning" | "error"} type Tipo da mensagem.
   * @param {number} closeTime: Tempo (em ms) para que o alerta seja fechado.
   */
  function addAlerta(
    message: string,
    type: "success" | "info" | "warning" | "error",
    closeTime?: number
  ) {
    context.setAlertas((prevAlertas) => {
      const newAlerts = new Map(prevAlertas);
      const id = new Date().getTime();
      newAlerts.set(id, {
        id,
        message,
        type,
        closeTime,
      });
      return newAlerts;
    });
  }
  return { ...context, addAlerta };
}
