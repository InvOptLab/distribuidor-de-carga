import { useState } from "react";
import {
  Paper,
  TextField,
  IconButton,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export interface ParameterComponentProps {
  name: string;
  value?: number;
  description?: string;
  isActive: boolean;
  setValue: (newValue: number) => void;
  setIsActive?: (newState: boolean) => void;
  showInformations: (
    message: string,
    type: "success" | "info" | "warning" | "error",
    closeTime?: number
  ) => void;
}

export default function ParameterComponent({
  name,
  value,
  description = "",
  isActive,
  setValue,
  setIsActive,
  showInformations,
}: ParameterComponentProps) {
  const [inputValue, setInputValue] = useState<string>(value?.toString() || "");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    const parsedValue = parseFloat(newValue);
    if (!isNaN(parsedValue)) {
      setValue(parsedValue);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 2,
        borderRadius: 2,
        width: "100%",
        maxWidth: 500,
        backgroundColor: isActive ? "background.paper" : "grey.200",
      }}
    >
      {/* Nome do Parâmetro */}
      <Typography variant="subtitle1" fontWeight="bold">
        {name}
      </Typography>

      {/* Campo numérico */}
      <TextField
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        variant="outlined"
        size="small"
        sx={{ width: 100 }}
        disabled={!isActive}
      />

      {/* Botão de Informações */}
      {description && (
        <Tooltip title={description} enterDelay={300} leaveDelay={200}>
          <IconButton
            color="info"
            onClick={() => showInformations(description, "info", 10)}
          >
            <InfoOutlinedIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Switch de Ativação */}
      {setIsActive && (
        <Switch checked={isActive} onChange={() => setIsActive(!isActive)} />
      )}
    </Paper>
  );
}
