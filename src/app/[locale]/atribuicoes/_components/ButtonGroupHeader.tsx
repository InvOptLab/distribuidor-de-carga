import React from "react";
import { Stack, IconButton, Tooltip, Divider, alpha } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import DownloadIcon from "@mui/icons-material/Download";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";

interface ButtonGroupHeaderProps {
  onExecute: () => void;
  onClean: () => void;
  download: () => void;
  saveAlterations: () => void;
}

/**
 * Componente compactado de ações para o CollapsibleHeader.
 */
const ButtonGroupHeader: React.FC<ButtonGroupHeaderProps> = ({
  onExecute,
  onClean,
  download,
  saveAlterations,
}) => {
  const { solucaoAtual } = useSolutionHistory();

  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      // Remove margens extras que o Grid poderia causar
      sx={{ m: 0, p: 0 }}
    >
      {/* Ação Principal: Ganha destaque visual por ser a ação primária da tela */}
      <Tooltip title="Executar Algoritmo" arrow>
        <IconButton
          onClick={onExecute}
          size="small"
          sx={{
            color: "primary.main",
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            "&:hover": {
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.2),
            },
            borderRadius: 1, // Levemente quadrado para diferenciar dos redondos
          }}
        >
          <PlayArrowIcon />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />

      {/* Ações Secundárias: Minimalistas */}
      <Tooltip title="Limpar Atribuições" arrow>
        <IconButton onClick={onClean} size="small">
          <CleaningServicesIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Fazer Download" arrow>
        <IconButton onClick={download} size="small">
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip
        title={
          solucaoAtual.idHistorico !== undefined
            ? "Solução já salva"
            : "Salvar no Histórico"
        }
        arrow
      >
        <span>
          <IconButton
            onClick={saveAlterations}
            size="small"
            color={
              solucaoAtual.idHistorico === undefined ? "primary" : "default"
            }
            disabled={solucaoAtual.idHistorico !== undefined}
          >
            <SaveAltIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
};

export default ButtonGroupHeader;
