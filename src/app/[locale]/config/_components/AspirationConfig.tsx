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
  TextField,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useAlgorithmContext } from "@/context/Algorithm";
import { useAlertsContext } from "@/context/Alerts";
import SameObjective from "@/algoritmo/metodos/TabuSearch/AspirationCriteria/SameObjective";

export default function AspirationConfig() {
  const { aspirationFunctions, setAspirationFunctions } = useAlgorithmContext();
  const { addAlerta } = useAlertsContext();

  const handleToggle = (key: string, currentState: boolean) => {
    setAspirationFunctions((prev) => {
      const newMap = new Map(prev);
      const func = newMap.get(key);
      if (func) {
        newMap.set(key, { ...func, isActive: !currentState });
      }
      return newMap;
    });
  };

  const handleValueChange = (key: string, newValue: number) => {
    setAspirationFunctions((prev) => {
      const newMap = new Map(prev);
      const func = newMap.get(key);
      if (func && func.instance instanceof SameObjective) {
        func.instance.iteracoesParaAceitacao = newValue;
        newMap.set(key, func);
      }
      return newMap;
    });
  };

  const activeCount = Array.from(aspirationFunctions.values()).filter(
    (f) => f.isActive
  ).length;

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Os critérios de aspiração permitem aceitar soluções tabu em situações
          especiais, como quando representam uma melhoria significativa ou
          atendem a condições específicas.
        </Typography>
      </Alert>

      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h6">Critérios Ativos:</Typography>
        <Chip
          label={`${activeCount} de ${aspirationFunctions.size}`}
          color={activeCount > 0 ? "primary" : "default"}
          variant="outlined"
        />
      </Box>

      <Grid container spacing={2}>
        {Array.from(aspirationFunctions.entries()).map(([key, func]) => (
          <Grid size={{ xs: 12, sm: 6 }} key={key}>
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

                {func.instance instanceof SameObjective && (
                  <TextField
                    label="Iterações para Aceitação"
                    type="number"
                    value={func.instance.iteracoesParaAceitacao}
                    onChange={(e) =>
                      handleValueChange(
                        key,
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                    disabled={!func.isActive}
                    fullWidth
                    inputProps={{ min: 1 }}
                    helperText="Número de iterações necessárias com o mesmo objetivo"
                    sx={{ mb: 2 }}
                  />
                )}

                <FormControlLabel
                  control={
                    <Switch
                      checked={func.isActive}
                      onChange={() => handleToggle(key, func.isActive)}
                    />
                  }
                  label={func.isActive ? "Ativo" : "Inativo"}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
