"use client";

import React from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  alpha,
  useTheme,
} from "@mui/material";
import { Chapter } from "../_types/docs";

interface RightSidebarProps {
  selectedChapter: Chapter;
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedChapter,
  activeSection,
  scrollToSection,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: 220,
        position: "sticky",
        top: "80px",
        height: "calc(100vh - 80px)", // Garante que a barra caiba sem gerar duplo scroll
        pt: 4,
        pr: 3,
        display: { xs: "none", lg: "block" },
        alignSelf: "flex-start",
      }}
    >
      <Typography
        variant="overline"
        sx={{
          fontSize: "0.6875rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "text.secondary",
          mb: 2,
          display: "block",
        }}
      >
        Nesta página
      </Typography>
      <List disablePadding>
        {selectedChapter.sections.map((section) => (
          <ListItemButton
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            sx={{
              py: 0.75,
              px: 1.5,
              borderRadius: 1.5,
              borderLeft: "2px solid",
              borderColor:
                activeSection === section.id ? "primary.main" : "transparent",
              bgcolor:
                activeSection === section.id
                  ? alpha(theme.palette.primary.main, 0.04)
                  : "transparent",
            }}
          >
            <ListItemText
              primary={section.title}
              primaryTypographyProps={{
                fontSize: "0.8125rem",
                fontWeight: activeSection === section.id ? 600 : 400,
                color:
                  activeSection === section.id
                    ? "primary.main"
                    : "text.secondary",
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};
