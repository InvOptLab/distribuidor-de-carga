"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme,
  alpha,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function OnboardingDialog() {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const theme = useTheme();
  const router = useRouter();

  const t = useTranslations("Components.OnboardingDialog");

  useEffect(() => {
    // Verifica a chave do checkbox no localStorage
    const hideOnboarding = localStorage.getItem("hideOnboarding");

    if (hideOnboarding !== "true") {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    // Só salva no cache do navegador se ele marcou a opção
    if (dontShowAgain) {
      localStorage.setItem("hideOnboarding", "true");
    }
    setOpen(false);
  };

  const handleStartTour = () => {
    handleClose();
    router.push("/guia"); // Redireciona para a página de documentação
  };

  const handleLoadData = () => {
    handleClose();
    router.push("/inputfile");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: 1.5,
            boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.2)}`,
          },
        },
      }}
    >
      <DialogTitle component="div" sx={{ pb: 1, textAlign: "center" }}>
        <Box
          sx={{
            display: "inline-flex",
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
            borderRadius: "50%",
            p: 2,
            mb: 2,
          }}
        >
          <WavingHandIcon sx={{ fontSize: 40 }} />
        </Box>
        <Typography variant="h5" component="div" fontWeight="800">
          {t("title")}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 1, textAlign: "center" }}>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, fontSize: "1.1rem" }}
        >
          {t("description")}
        </Typography>
        <Typography variant="body2" color="text.primary" fontWeight="500">
          {t("question")}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, flexDirection: "column", gap: 1.5 }}>
        <Button
          onClick={handleStartTour}
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          startIcon={<PlayArrowIcon />}
          disableElevation
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 3,
            py: 1.5,
          }}
        >
          {t("startTourBtn")}
        </Button>

        <Button
          onClick={handleLoadData}
          variant="outlined"
          color="secondary"
          fullWidth
          size="large"
          startIcon={<UploadFileIcon />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 3,
            py: 1.5,
            m: "0 !important",
          }}
        >
          {t("loadDataBtn")}
        </Button>

        <Button
          onClick={handleClose}
          color="inherit"
          fullWidth
          sx={{ textTransform: "none", fontWeight: 500, mt: 1 }}
        >
          {t("skipBtn")}
        </Button>

        {/* Checkbox para controle de visibilidade */}
        <Box
          sx={{
            mt: 2,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                {t("dontShowAgain")}
              </Typography>
            }
            sx={{ m: 0 }}
          />
        </Box>
      </DialogActions>
    </Dialog>
  );
}
