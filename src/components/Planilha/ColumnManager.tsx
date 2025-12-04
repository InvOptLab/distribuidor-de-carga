"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { DragIndicator as DragIcon } from "@mui/icons-material";
import { ColumnConfig } from "@/types/column-config";

interface ColumnManagerProps {
  /**
   * Se o diálogo está aberto
   */
  open: boolean;

  /**
   * Callback para fechar o diálogo
   */
  onClose: () => void;

  /**
   * Lista de todas as colunas
   */
  columns: ColumnConfig[];

  /**
   * Callback para alternar visibilidade de uma coluna
   */
  onToggleColumn: (columnId: string) => void;

  /**
   * Callback para reordenar colunas
   */
  onReorderColumns: (fromIndex: number, toIndex: number) => void;
}

/**
 * Componente para gerenciar visibilidade e ordem das colunas
 */
export function ColumnManager({
  open,
  onClose,
  columns,
  onToggleColumn,
  onReorderColumns,
}: ColumnManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const visibleColumns = columns
    .filter((c) => c.visible)
    .sort((a, b) => a.order - b.order);

  const hiddenColumns = columns.filter((c) => !c.visible);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    onReorderColumns(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gerenciar Colunas</DialogTitle>
      <DialogContent>
        {/* Colunas visíveis */}
        <Box sx={{ marginBottom: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ marginBottom: 1, fontWeight: 600 }}
          >
            Colunas Visíveis
          </Typography>
          <List dense>
            {visibleColumns.map((column, index) => (
              <ListItem
                key={column.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  marginBottom: 0.5,
                  backgroundColor:
                    draggedIndex === index
                      ? "action.hover"
                      : "background.paper",
                  cursor: "move",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
                secondaryAction={
                  <Checkbox
                    edge="end"
                    checked={true}
                    onChange={() => onToggleColumn(column.id)}
                  />
                }
              >
                <IconButton
                  size="small"
                  sx={{ marginRight: 1, cursor: "grab" }}
                >
                  <DragIcon />
                </IconButton>
                <ListItemText primary={column.label} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Colunas ocultas */}
        {hiddenColumns.length > 0 && (
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ marginBottom: 1, fontWeight: 600 }}
            >
              Colunas Ocultas
            </Typography>
            <List dense>
              {hiddenColumns.map((column) => (
                <ListItem
                  key={column.id}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    marginBottom: 0.5,
                    opacity: 0.6,
                  }}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      checked={false}
                      onChange={() => onToggleColumn(column.id)}
                    />
                  }
                >
                  <ListItemText primary={column.label} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
