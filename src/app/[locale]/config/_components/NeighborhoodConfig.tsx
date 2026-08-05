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
import { useTranslations } from "next-intl";

export default function NeighborhoodConfig() {
  const { neighborhoodFunctions, setNeighborhoodFunctions } =
    useAlgorithmContext();
  const { addAlerta } = useAlertsContext();
  const t = useTranslations("Pages.Config.Neighborhood");

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
          {t("info")}
        </Typography>
      </Alert>
      <Alert severity="warning" sx={{ mb: 1 }}>
        <Typography variant="body2">
          {t("warning")}
        </Typography>
      </Alert>

      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h6">{t("activeFunctions")}</Typography>
        <Chip
          label={t("activeCount", { active: activeCount, total: neighborhoodFunctions.size })}
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
