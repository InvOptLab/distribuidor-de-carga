import { Paper, IconButton, Switch, Tooltip, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export interface NeighborhoodComponentProps {
  name: string;
  description?: string;
  isActive: boolean;
  setIsActive?: (newState: boolean) => void;
  showInformations: (
    message: string,
    type: "success" | "info" | "warning" | "error",
    closeTime?: number
  ) => void;
}

export default function NeighborhoodComponent({
  name,
  description = "",
  isActive,
  setIsActive,
  showInformations,
}: NeighborhoodComponentProps) {
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
      {/* Nome do Componente */}
      <Typography variant="subtitle1" fontWeight="bold">
        {name}
      </Typography>

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
