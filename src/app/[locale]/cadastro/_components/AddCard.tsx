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
        component="button"
        onClick={onClick}
        sx={{
          height: "100%",
          minHeight: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "2px dashed",
          borderColor: "primary.light",
          backgroundColor: "background.paper",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "primary.main",
            opacity: 0,
            transition: "opacity 0.3s",
            zIndex: 0,
          },
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "primary.light",
            transform: "translateY(-8px)",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
            "& .add-icon": {
              transform: "scale(1.1) rotate(90deg)",
              color: "white",
            },
            "& .add-text": {
              color: "primary.dark",
              fontWeight: 600,
            },
          },
          "&:active": {
            transform: "translateY(-4px)",
          },
        }}
      >
        <CardContent sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              className="add-icon"
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "primary.main",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                fontSize: 32,
              }}
            >
              <AddIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                className="add-text"
                variant="subtitle1"
                fontWeight={500}
                color="text.primary"
                sx={{
                  transition: "all 0.3s",
                }}
              >
                Adicionar Novo
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                {tooltip}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Tooltip>
  );
}
