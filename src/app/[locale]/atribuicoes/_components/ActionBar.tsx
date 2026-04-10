"use client";
import {
  AppBar,
  Toolbar,
  Button,
  Tooltip,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import DownloadIcon from "@mui/icons-material/Download";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";

interface ActionBarProps {
  onExecute: () => void;
  onClean: () => void;
  onDownload: () => void;
  onSave: () => void;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
}

/**
 * Barra de ações global da página de atribuições.
 * Contém os botões principais de ação e o botão para abrir/fechar os filtros.
 */
export default function ActionBar({
  onExecute,
  onClean,
  onDownload,
  onSave,
  onToggleFilters,
  hasActiveFilters,
}: ActionBarProps) {
  const { solucaoAtual } = useSolutionHistory();

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Grade de Atribuições
        </Typography>

        <Box display="flex" gap={1} alignItems="center">
          <Tooltip title="Filtros" arrow>
            <IconButton
              onClick={onToggleFilters}
              color={hasActiveFilters ? "primary" : "default"}
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Executar algoritmo" arrow>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={onExecute}
            >
              Executar
            </Button>
          </Tooltip>

          <Tooltip title="Limpar atribuições" arrow>
            <Button
              variant="outlined"
              startIcon={<CleaningServicesIcon />}
              onClick={onClean}
            >
              Limpar
            </Button>
          </Tooltip>

          <Tooltip title="Download JSON" arrow>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={onDownload}
            >
              Download
            </Button>
          </Tooltip>

          <Tooltip
            title={
              solucaoAtual.idHistorico !== undefined
                ? "Solução já salva no histórico"
                : "Salvar no histórico"
            }
            arrow
          >
            <span>
              <Button
                variant="outlined"
                startIcon={<SaveAltIcon />}
                onClick={onSave}
                disabled={solucaoAtual.idHistorico !== undefined}
              >
                Salvar
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
