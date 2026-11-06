"use client";

import { Box, Button, Typography } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import GridOnIcon from "@mui/icons-material/GridOn";
import { useTranslations } from "next-intl";

/** Estado vazio do histórico. */
export default function EmptyHistory({
  onGoToGrid,
}: {
  onGoToGrid: () => void;
}) {
  const t = useTranslations("Pages.History.empty");
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 2,
        minHeight: "60vh",
        px: 2,
      }}
    >
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: "action.hover",
          color: "text.secondary",
        }}
      >
        <HistoryIcon sx={{ fontSize: 48 }} />
      </Box>
      <Typography variant="h5" component="h1">
        {t("title")}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480 }}>
        {t("body")}
      </Typography>
      <Button
        variant="contained"
        startIcon={<GridOnIcon />}
        onClick={onGoToGrid}
      >
        {t("goToGrid")}
      </Button>
    </Box>
  );
}
