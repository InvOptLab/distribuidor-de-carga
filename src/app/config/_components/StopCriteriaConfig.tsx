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
import { IteracoesMaximas } from "@/algoritmo/communs/StopCriteria/IteracoesMaximas";
import { IteracoesSemModificacao } from "@/algoritmo/communs/StopCriteria/IteracoesSemModificacao";
import IteracoesSemMelhoraAvaliacao from "@/algoritmo/communs/StopCriteria/IteracoesSemMelhoraAvaliacao";

export default function StopCriteriaConfig() {
  const { stopFunctions, setStopFunctions } = useAlgorithmContext();
  const { addAlerta } = useAlertsContext();

  const handleToggle = (key: string, currentState: boolean) => {
    setStopFunctions((prev) => {
      const newMap = new Map(prev);
      const func = newMap.get(key);
      if (func) {
        newMap.set(key, { ...func, isActive: !currentState });
      }
      return newMap;
    });
  };

  const handleValueChange = (key: string, newValue: number) => {
    setStopFunctions((prev) => {
      const newMap = new Map(prev);
      const func = newMap.get(key);
      if (func) {
        if (func.instance instanceof IteracoesMaximas) {
          func.instance.maxIteracoes = newValue;
        } else if (func.instance instanceof IteracoesSemModificacao) {
          func.instance.limiteIteracoesSemModificacao = newValue;
        } else if (func.instance instanceof IteracoesSemMelhoraAvaliacao) {
          func.instance.limiteIteracoesSemMelhoraAvaliacao = newValue;
        }
        newMap.set(key, func);
      }
      return newMap;
    });
  };

  const getValue = (func: any) => {
    if (func.instance instanceof IteracoesMaximas) {
      return func.instance.maxIteracoes;
    } else if (func.instance instanceof IteracoesSemModificacao) {
      return func.instance.limiteIteracoesSemModificacao;
    } else if (func.instance instanceof IteracoesSemMelhoraAvaliacao) {
      return func.instance.limiteIteracoesSemMelhoraAvaliacao;
    }
    return 0;
  };

  const getFieldLabel = (func: any) => {
    if (func.instance instanceof IteracoesMaximas) {
      return "Máximo de Iterações";
    } else if (func.instance instanceof IteracoesSemModificacao) {
      return "Iterações sem Modificação";
    } else if (func.instance instanceof IteracoesSemMelhoraAvaliacao) {
      return "Iterações sem Melhora";
    }
    return "Valor";
  };

  const activeCount = Array.from(stopFunctions.values()).filter(
    (f) => f.isActive
  ).length;

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 1 }}>
        <Typography variant="body2">
          Os critérios de parada determinam quando o algoritmo deve encerrar a
          busca.
        </Typography>
      </Alert>
      <Alert severity="warning" sx={{ mb: 1 }}>
        <Typography variant="body2">
          Pelo menos um critério deve estar ativo para evitar execução infinita.
        </Typography>
      </Alert>

      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h6">Critérios Ativos:</Typography>
        <Chip
          label={`${activeCount} de ${stopFunctions.size}`}
          color={activeCount > 0 ? "success" : "error"}
          variant="outlined"
        />
      </Box>

      <Grid container spacing={2}>
        {Array.from(stopFunctions.entries()).map(([key, func]) => (
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

                <TextField
                  label={getFieldLabel(func)}
                  type="number"
                  value={getValue(func)}
                  onChange={(e) =>
                    handleValueChange(key, Number.parseInt(e.target.value) || 0)
                  }
                  disabled={!func.isActive}
                  fullWidth
                  inputProps={{ min: 1 }}
                  sx={{ mb: 2 }}
                />

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
                    Pelo menos um critério deve permanecer ativo
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
