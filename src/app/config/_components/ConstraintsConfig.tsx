"use client";
import Restricoes from "@/app/restricoes/page";
import { Box, Typography, Alert } from "@mui/material";

export default function ConstraintsConfig() {
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Restrições Hard:</strong> Devem ser sempre satisfeitas
          (penalidade alta).
          <br />
          <strong>Restrições Soft:</strong> Preferíveis mas não obrigatórias
          (penalidade configurável).
        </Typography>
      </Alert>
      <Restricoes />
    </Box>
  );
}
