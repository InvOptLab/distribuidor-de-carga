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
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BackupIcon from "@mui/icons-material/Backup";
import WarningIcon from "@mui/icons-material/Warning";

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
  return (
    <Card elevation={3}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <WarningIcon color="warning" />
          Dados Atuais
        </Typography>

        <Alert severity="warning" sx={{ mb: 2, color: "text.primary" }}>
          Você já possui dados carregados. Carregar um novo arquivo irá
          substituí-los.
        </Alert>

        <Typography variant="subtitle2" gutterBottom>
          Dados atualmente carregados:
        </Typography>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <PersonIcon color="primary" />
            </ListItemIcon>
            <Box style={{ display: "flex", flexDirection: "column" }}>
              <ListItemText primary="Docentes" sx={{ marginBottom: 0 }} />
              <Chip
                label={`${currentData.docentes} carregados`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SchoolIcon color="secondary" />
            </ListItemIcon>
            <Box style={{ display: "flex", flexDirection: "column" }}>
              <ListItemText primary="Disciplinas" sx={{ marginBottom: 0 }} />
              <Chip
                label={`${currentData.disciplinas} carregadas`}
                size="small"
                color="secondary"
                variant="outlined"
              />
            </Box>
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AssignmentIcon color="success" />
            </ListItemIcon>
            <Box style={{ display: "flex", flexDirection: "column" }}>
              <ListItemText primary="Atribuições" sx={{ marginBottom: 0 }} />
              <Chip
                label={`${currentData.atribuicoes} realizadas`}
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
          </ListItem>
        </List>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<BackupIcon />}
            onClick={onCreateBackup}
            fullWidth
          >
            Criar Backup dos Dados Atuais
          </Button>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: "block" }}
        >
          Recomendamos criar um backup antes de carregar novos dados para evitar
          perda de informações.
        </Typography>
      </CardContent>
    </Card>
  );
}
