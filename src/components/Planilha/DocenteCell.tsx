"use client";

import { useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { DocenteSelectionDialog } from "./DocenteSelectionDialog";
import {
  Disciplina,
  Docente,
  Formulario,
} from "@/algoritmo/communs/interfaces/interfaces";

interface DocenteCellProps {
  /**
   * Disciplina associada à célula
   */
  disciplina: Disciplina;

  /**
   * Lista de docentes atribuídos à disciplina
   */
  docentesAtribuidos: string[];

  /**
   * Lista de todos os docentes ativos disponíveis
   */
  docentesDisponiveis: Docente[];

  /**
   * Lista de formulários (prioridades)
   */
  formularios: Formulario[];

  /**
   * Callback quando os docentes são alterados
   */
  onChange: (docentes: string[]) => void;
}

/**
 * Componente de célula para exibir e editar docentes
 * Exibe múltiplos docentes em uma lista com scroll e botão para adicionar
 */
export function DocenteCell({
  disciplina,
  docentesAtribuidos,
  docentesDisponiveis,
  formularios,
  onChange,
}: DocenteCellProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  /**
   * Abre o dialog de seleção
   */
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  /**
   * Fecha o dialog de seleção
   */
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  /**
   * Confirma a seleção de docentes
   */
  const handleConfirm = (docentes: string[]) => {
    onChange(docentes);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          padding: "4px 8px",
          minHeight: "60px",
        }}
      >
        {/* Lista de docentes atribuídos */}
        <Box
          sx={{
            flex: 1,
            maxHeight: "80px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            // Estilo da scrollbar
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: "3px",
            },
          }}
        >
          {docentesAtribuidos.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.875rem" }}
            >
              Nenhum docente
            </Typography>
          ) : (
            docentesAtribuidos.map((docente, index) => (
              <Typography
                key={`${docente}-${index}`}
                variant="body2"
                sx={{
                  fontSize: "0.875rem",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  backgroundColor: "primary.light",
                  color: "primary.contrastText",
                }}
              >
                {docente}
              </Typography>
            ))
          )}
        </Box>

        {/* Botão para adicionar docentes */}
        <Tooltip title="Adicionar docente" arrow>
          <IconButton
            onClick={handleOpenDialog}
            size="small"
            color="primary"
            sx={{
              border: "1px dashed",
              borderColor: "primary.main",
              "&:hover": {
                backgroundColor: "primary.light",
              },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Dialog de seleção de docentes */}
      <DocenteSelectionDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        disciplina={disciplina}
        docentesAtribuidos={docentesAtribuidos}
        todosDocentes={docentesDisponiveis}
        formularios={formularios}
        onConfirm={handleConfirm}
      />
    </>
  );
}
