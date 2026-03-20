"use client";

import React from "react";
import {
  Box,
  Container,
  Button,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useAccessibility } from "@/context/Accessibility";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const AccessibilityBar: React.FC = () => {
  const t = useTranslations("Accessibility");
  const { increaseFont, decreaseFont, toggleContrast } = useAccessibility();
  const pathname = usePathname();
  const router = useRouter();

  // Função para trocar o idioma mantendo a rota atual
  const handleLanguageChange = (locale: string) => {
    if (!pathname) return;
    const segments = pathname.split("/");
    // O Next-intl no modo 'always' mantém o locale no índice 1 (ex: /pt-BR/atribuicoes)
    segments[1] = locale;
    router.push(segments.join("/"));
  };

  return (
    <Box
      sx={{
        backgroundColor: "#262626", // Fundo escuro padrão para contraste
        color: "#FFFFFF",
        py: 0.5,
        fontSize: "0.875rem",
        zIndex: 2000,
        position: "relative",
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Esquerda: Links de Salto (Skip Links) */}
        <Box
          sx={{ display: "flex", gap: { xs: 1, sm: 3 }, alignItems: "center" }}
        >
          <Button
            component="a"
            href="#main-content"
            disableRipple
            sx={{
              color: "#FFF",
              textTransform: "none",
              fontSize: "0.875rem",
              p: 0,
              minWidth: "auto",
              "&:hover": { textDecoration: "underline", color: "#FFF333" },
              "&:focus-visible": {
                outline: "2px solid #FFF333",
                outlineOffset: "2px",
              },
            }}
          >
            {t("goToContent")} (1)
          </Button>
          <Button
            component="a"
            href="#main-nav"
            disableRipple
            sx={{
              color: "#FFF",
              textTransform: "none",
              fontSize: "0.875rem",
              p: 0,
              minWidth: "auto",
              "&:hover": { textDecoration: "underline", color: "#FFF333" },
              "&:focus-visible": {
                outline: "2px solid #FFF333",
                outlineOffset: "2px",
              },
            }}
          >
            {t("goToMenu")} (2)
          </Button>
        </Box>

        {/* Direita: Controles de Fonte, Contraste e Idioma */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title={t("decreaseFontSize")}>
              <Button
                onClick={decreaseFont}
                sx={{
                  color: "#FFF",
                  minWidth: "auto",
                  p: 0.5,
                  fontSize: "0.875rem",
                  "&:hover": { color: "#FFF333" },
                }}
              >
                A-
              </Button>
            </Tooltip>
            <Tooltip title={t("increaseFontSize")}>
              <Button
                onClick={increaseFont}
                sx={{
                  color: "#FFF",
                  minWidth: "auto",
                  p: 0.5,
                  fontSize: "0.875rem",
                  "&:hover": { color: "#FFF333" },
                }}
              >
                A+
              </Button>
            </Tooltip>
            <Tooltip title={t("highContrast")}>
              <Button
                onClick={toggleContrast}
                sx={{
                  color: "#FFF",
                  minWidth: "auto",
                  p: 0.5,
                  fontSize: "0.875rem",
                  ml: 1,
                  textTransform: "none",
                  "&:hover": { color: "#FFF333" },
                }}
              >
                {t("contrast")}
              </Button>
            </Tooltip>
          </Box>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: "rgba(255,255,255,0.3)", my: 0.5 }}
          />

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              onClick={() => handleLanguageChange("pt-BR")}
              disableRipple
              sx={{
                color: pathname?.startsWith("/pt-BR") ? "#FFF333" : "#FFF",
                minWidth: "auto",
                p: 0,
                fontSize: "0.875rem",
                textTransform: "none",
                fontWeight: pathname?.startsWith("/pt-BR") ? "bold" : "normal",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              PT
            </Button>
            <span
              style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem" }}
            >
              |
            </span>
            <Button
              onClick={() => handleLanguageChange("en")}
              disableRipple
              sx={{
                color: pathname?.startsWith("/en") ? "#FFF333" : "#FFF",
                minWidth: "auto",
                p: 0,
                fontSize: "0.875rem",
                textTransform: "none",
                fontWeight: pathname?.startsWith("/en") ? "bold" : "normal",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              EN
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AccessibilityBar;
