"use client";
import {
  Box,
  Grid,
  Typography,
  Alert,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useAlgorithmContext } from "@/context/Algorithm";
import { useAlertsContext } from "@/context/Alerts";

export default function NeighborhoodConfig() {
  const { neighborhoodFunctions, setNeighborhoodFunctions } =
    useAlgorithmContext();
  const { addAlerta } = useAlertsContext();

  const handleToggle = (key: string, currentState: boolean) => {
    setNeighborhoodFunctions((prev) => {
      const newMap = new Map(prev);
      const func = newMap.get(key);
      if (func) {
        newMap.set(key, { ...func, isActive: !currentState });
      }
      return newMap;
    });
  };

  const activeCount = Array.from(neighborhoodFunctions.values()).filter(
    (f) => f.isActive
  ).length;

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 1 }}>
        <Typography variant="body2">
          As funções de vizinhança definem como novas soluções são geradas a
          partir da solução atual.
        </Typography>
      </Alert>
      <Alert severity="warning" sx={{ mb: 1 }}>
        <Typography variant="body2">
          Pelo menos uma função deve estar ativa.
        </Typography>
      </Alert>

      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h6">Funções Ativas:</Typography>
        <Chip
          label={`${activeCount} de ${neighborhoodFunctions.size}`}
          color={activeCount > 0 ? "success" : "error"}
          variant="outlined"
        />
      </Box>

      <Grid container spacing={2}>
        {Array.from(neighborhoodFunctions.entries()).map(([key, func]) => (
          <Grid size={{ xs: 12, md: 6 }} key={key}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                opacity: func.isActive ? 1 : 0.6,
                border: func.isActive ? 2 : 1,
                borderColor: func.isActive ? "primary.main" : "divider",
                transition: "all 0.3s ease",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                    {func.instance.name}
                  </Typography>
                  <Tooltip
                    title={
                      func.instance.description || "Sem descrição disponível"
                    }
                  >
                    <IconButton
                      size="small"
                      onClick={() =>
                        addAlerta(
                          func.instance.description ||
                            "Sem descrição disponível",
                          "info",
                          8
                        )
                      }
                    >
                      <InfoIcon fontSize="small" color="info" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, minHeight: 40 }}
                >
                  {func.instance.description || "Descrição não disponível"}
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={func.isActive}
                      onChange={() => handleToggle(key, func.isActive)}
                      disabled={func.isActive && activeCount === 1}
                    />
                  }
                  label={func.isActive ? "Ativo" : "Inativo"}
                />

                {func.isActive && activeCount === 1 && (
                  <Typography
                    variant="caption"
                    color="warning.main"
                    display="block"
                    sx={{ mt: 1 }}
                  >
                    Pelo menos uma função deve permanecer ativa
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
