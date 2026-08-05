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
import { useTranslations } from "next-intl";

export default function StopCriteriaConfig() {
  const { stopFunctions, setStopFunctions } = useAlgorithmContext();
  const { addAlerta } = useAlertsContext();
  const t = useTranslations("Config.StopCriteria");

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
      return t("maxIterations");
    } else if (func.instance instanceof IteracoesSemModificacao) {
      return t("iterationsNoMod");
    } else if (func.instance instanceof IteracoesSemMelhoraAvaliacao) {
      return t("iterationsNoImp");
    }
    return t("value");
  };

  const activeCount = Array.from(stopFunctions.values()).filter(
    (f) => f.isActive
  ).length;

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 1 }}>
        <Typography variant="body2">
          {t("info")}
        </Typography>
      </Alert>
      <Alert severity="warning" sx={{ mb: 1 }}>
        <Typography variant="body2">
          {t("warning")}
        </Typography>
      </Alert>

      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h6">{t("activeCriteria")}</Typography>
        <Chip
          label={t("activeCount", { active: activeCount, total: stopFunctions.size })}
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
                      func.instance.description || t("noDescription")
                    }
                  >
                    <IconButton
                      size="small"
                      onClick={() =>
                        addAlerta(
                          func.instance.description ||
                            t("noDescription"),
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
                  {func.instance.description || t("noDescription")}
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
                  label={func.isActive ? t("active") : t("inactive")}
                />

                {func.isActive && activeCount === 1 && (
                  <Typography
                    variant="caption"
                    color="warning.main"
                    display="block"
                    sx={{ mt: 1 }}
                  >
                    {t("minActiveWarning")}
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
