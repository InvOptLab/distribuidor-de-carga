"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Fade,
  Slide,
  IconButton,
  Paper,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import {
  WarningAmber as WarningIcon,
  Restore as RestoreIcon,
  DeleteForever as DeleteIcon,
  Close as CloseIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import { forwardRef } from "react";
import { visuallyHidden } from "@mui/utils";

// Transition component for the dialog
const SlideTransition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Keys to validate inside the localStorage object
const STORAGE_KEYS_TO_VALIDATE = [
  "docentes",
  "disciplinas",
  "atribuicoes",
  "travas",
  "formularios",
  "solucaoAtual",
  "historicoSolucoes",
];

interface SavedDataInfo {
  hasData: boolean;
  itemCount: number;
  lastModified?: string;
}

export default function ClearStorageModal() {
  const t = useTranslations("Components.ClearStorageModal");
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [savedDataInfo, setSavedDataInfo] = useState<SavedDataInfo>({
    hasData: false,
    itemCount: 0,
  });

  const STORAGE_KEY = "distribuidor_carga_sessao";

  // Check if any of the keys inside the storage have actual data
  const validateStorageData = useCallback((): SavedDataInfo => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) {
        return { hasData: false, itemCount: 0 };
      }

      const parsedData = JSON.parse(savedData);
      if (typeof parsedData !== "object" || parsedData === null) {
        return { hasData: false, itemCount: 0 };
      }

      let validItemCount = 0;

      // Check each key that we care about
      for (const key of STORAGE_KEYS_TO_VALIDATE) {
        const value = parsedData[key];

        if (value !== undefined && value !== null) {
          // Check if the value is actually non-empty
          if (Array.isArray(value) && value.length > 0) {
            validItemCount++;
          } else if (
            typeof value === "object" &&
            Object.keys(value).length > 0
          ) {
            if (
              Object.keys(value).includes("atribuicoes") &&
              value.atribuicoes.length === 0
            ) {
              continue;
            } else if (value.value.length === 0) {
              continue;
            }
            validItemCount++;
          } else if (typeof value === "string" && value.trim().length > 0) {
            validItemCount++;
          } else if (typeof value === "number" || typeof value === "boolean") {
            validItemCount++;
          }
        }
      }

      return {
        hasData: validItemCount > 0,
        itemCount: validItemCount,
        lastModified: parsedData.lastModified || parsedData.updatedAt,
      };
    } catch {
      return { hasData: false, itemCount: 0 };
    }
  }, []);

  useEffect(() => {
    setMounted(true);

    const dataInfo = validateStorageData();
    setSavedDataInfo(dataInfo);

    // Only open the modal if there's actual data
    if (dataInfo.hasData) {
      setOpen(true);
    }
  }, [validateStorageData]);

  const handleClear = useCallback(() => {
    setIsClearing(true);

    // Small delay to show the clearing animation
    setTimeout(() => {
      localStorage.removeItem(STORAGE_KEY);
      setOpen(false);
      window.location.reload();
    }, 600);
  }, []);

  const handleContinue = useCallback(() => {
    setOpen(false);
  }, []);

  // Memoized styles for better performance
  const dialogStyles = useMemo(
    () => ({
      "& .MuiDialog-paper": {
        borderRadius: "16px",
        maxWidth: "480px",
        width: "100%",
        margin: "16px",
        overflow: "hidden",
        boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.2)}`,
      },
    }),
    [theme.palette.common.black],
  );

  const headerGradient = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
    }),
    [theme.palette.warning.main, theme.palette.warning.dark],
  );

  // Don't render anything on the server or if there's no data
  if (!mounted || !savedDataInfo.hasData) return null;

  return (
    <Dialog
      open={open}
      onClose={handleContinue}
      // TransitionComponent={SlideTransition}
      slots={{ transition: SlideTransition }}
      aria-labelledby="clear-storage-dialog-title"
      aria-describedby="clear-storage-dialog-description"
      sx={dialogStyles}
      disableEscapeKeyDown={isClearing}
    >
      {/* Header with gradient background */}
      <Box
        sx={{
          ...headerGradient,
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Fade in timeout={500}>
            <Box
              sx={{
                bgcolor: alpha(theme.palette.common.white, 0.2),
                borderRadius: "12px",
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WarningIcon
                sx={{
                  color: theme.palette.common.white,
                  fontSize: 28,
                }}
                aria-hidden="true"
              />
            </Box>
          </Fade>
          <DialogTitle
            id="clear-storage-dialog-title"
            sx={{
              p: 0,
              color: theme.palette.common.white,
              fontWeight: 600,
              fontSize: "1.25rem",
              lineHeight: 1.3,
            }}
          >
            {t("title")}
          </DialogTitle>
        </Box>
        <IconButton
          onClick={handleContinue}
          disabled={isClearing}
          aria-label={t("closeAriaLabel")}
          sx={{
            color: theme.palette.common.white,
            "&:hover": {
              bgcolor: alpha(theme.palette.common.white, 0.15),
            },
            "&:focus-visible": {
              outline: `3px solid ${theme.palette.common.white}`,
              outlineOffset: "2px",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <DialogContentText
          id="clear-storage-dialog-description"
          sx={{
            color: theme.palette.text.primary,
            fontSize: "1rem",
            lineHeight: 1.6,
            mb: 2.5,
          }}
        >
          {t("description")}
        </DialogContentText>

        {/* Info card showing saved data */}
        <Fade in timeout={700}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.info.main, 0.08),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: "12px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <StorageIcon
                sx={{ color: theme.palette.info.main, fontSize: 22 }}
                aria-hidden="true"
              />
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                }}
              >
                {t("savedDataInfo", { count: savedDataInfo.itemCount })}
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          p: 2.5,
          gap: 1.5,
          flexDirection: "column",
        }}
      >
        {/* Continue button */}
        <Button
          onClick={handleContinue}
          disabled={isClearing}
          variant="outlined"
          color="primary"
          startIcon={<RestoreIcon />}
          fullWidth
          sx={{
            py: 1.25,
            px: 3,
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            borderWidth: "2px",
            "&:hover": {
              borderWidth: "2px",
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.text.primary,
            },
            "&:focus-visible": {
              outline: `3px solid ${theme.palette.primary.main}`,
              outlineOffset: "2px",
            },
            order: { xs: 2, sm: 1 },
          }}
          aria-describedby="continue-button-description"
        >
          {t("continueButton")}
        </Button>
        <Box
          id="continue-button-description"
          component="span"
          sx={visuallyHidden}
        >
          {t("continueAriaDescription")}
        </Box>

        {/* Clear button */}
        <Button
          onClick={handleClear}
          disabled={isClearing}
          variant="contained"
          color="error"
          startIcon={isClearing ? null : <DeleteIcon />}
          fullWidth
          disableElevation
          sx={{
            py: 1.25,
            px: 3,
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: theme.palette.error.dark,
              transform: "translateY(-1px)",
              boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.4)}`,
            },
            "&:focus-visible": {
              outline: `3px solid ${theme.palette.error.main}`,
              outlineOffset: "2px",
            },
            "&:active": {
              transform: "translateY(0)",
            },
            order: { xs: 1, sm: 2 },
          }}
          aria-describedby="clear-button-description"
        >
          {isClearing ? t("clearingButton") : t("clearButton")}
        </Button>
        <Box id="clear-button-description" component="span" sx={visuallyHidden}>
          {t("clearAriaDescription")}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
