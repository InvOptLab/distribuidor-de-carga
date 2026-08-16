"use client";

import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Box,
  CircularProgress,
  Paper,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { useTranslations } from "next-intl";

interface UploadProgressProps {
  steps: string[];
}

export default function UploadProgress({ steps }: UploadProgressProps) {
  const t = useTranslations("Pages.InputFile.UploadProgress");
  const totalSteps = 7; // Total de passos esperados
  const progress = (steps.length / totalSteps) * 100;

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography variant="h6" fontWeight="bold">
            {t("title")}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {steps.length} de {totalSteps} passos concluídos
          </Typography>
        </Box>

        <List dense>
          {steps.map((step, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary={step} />
            </ListItem>
          ))}
          {steps.length < totalSteps && (
            <ListItem>
              <ListItemIcon>
                <HourglassEmptyIcon color="action" />
              </ListItemIcon>
              <ListItemText primary="Processando..." secondary="Aguarde..." />
            </ListItem>
          )}
        </List>
      </CardContent>
    </Card>
  );
}
