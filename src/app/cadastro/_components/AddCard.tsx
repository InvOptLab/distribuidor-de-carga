"use client";

import {
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

interface AddCardProps {
  tooltip: string;
  onClick: () => void;
}

export default function AddCard({ tooltip, onClick }: AddCardProps) {
  return (
    <Tooltip title={tooltip}>
      <Card
        sx={{
          height: "100%",
          minHeight: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "2px dashed",
          borderColor: "divider",
          backgroundColor: "transparent",
          transition: "all 0.2s",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "action.hover",
            transform: "translateY(-4px)",
          },
        }}
        onClick={onClick}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <IconButton
              color="primary"
              sx={{
                width: 56,
                height: 56,
                backgroundColor: "primary.light",
                "&:hover": { backgroundColor: "primary.main", color: "white" },
              }}
            >
              <AddIcon fontSize="large" color="action" />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              Adicionar
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Tooltip>
  );
}
