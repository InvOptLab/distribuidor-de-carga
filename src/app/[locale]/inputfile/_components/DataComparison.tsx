"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Paper,
  Grid,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SaveIcon from "@mui/icons-material/Save";
import WarningIcon from "@mui/icons-material/Warning";
import { useTranslations } from "next-intl";

interface DataComparisonProps {
  currentData: {
    docentes: number;
    disciplinas: number;
    atribuicoes: number;
  };
  onCreateBackup: () => void;
}

export default function DataComparison({
  currentData,
  onCreateBackup,
}: DataComparisonProps) {
  const t = useTranslations("Pages.InputFile.DataComparison");

  return (
    <Paper elevation={3}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}>
          <WarningIcon color="warning" />
          <Typography variant="h6" fontWeight="bold">
            {t("title")}
          </Typography>
        </Box>

        <Alert severity="warning" sx={{ mb: 2, color: "text.primary" }}>
          {t("warning")}
        </Alert>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 4 }}>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight="bold">
                {currentData.docentes}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("professors")}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight="bold">
                {currentData.disciplinas}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("classes")}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight="bold">
                {currentData.atribuicoes}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("assignments")}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={onCreateBackup}
            fullWidth
          >
            {t("backup")}
          </Button>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: "block" }}
        >
          {t("recommendation")}
        </Typography>
      </CardContent>
    </Paper>
  );
}
