"use client";

import React from "react";
import {
  Box,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  alpha,
  useTheme,
  Typography,
} from "@mui/material";
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Article as ArticleIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Help as HelpIcon,
  SearchOff as SearchOffIcon,
} from "@mui/icons-material";
import { Module, Chapter } from "../_types/docs";
import { useTranslations } from "next-intl";

const iconMap: Record<string, React.ReactNode> = {
  article: <ArticleIcon />,
  dashboard: <DashboardIcon />,
  people: <PeopleIcon />,
  assignment: <AssignmentIcon />,
  settings: <SettingsIcon />,
  analytics: <AnalyticsIcon />,
  help: <HelpIcon />,
};

interface LeftSidebarProps {
  documentationData: Module[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  expandedModules: string[];
  toggleModule: (moduleId: string) => void;
  selectedModule: Module;
  selectedChapter: Chapter;
  handleChapterSelect: (module: Module, chapter: Chapter) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  documentationData,
  searchQuery,
  setSearchQuery,
  expandedModules,
  toggleModule,
  selectedModule,
  selectedChapter,
  handleChapterSelect,
}) => {
  const theme = useTheme();
  const t = useTranslations("Pages.Guia.LeftSidebar");

  return (
    <Box
      sx={{
        width: 280,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", py: 2 }}>
        {/* Caso a busca não encontre nenhum resultado */}
        {documentationData.length === 0 && (
          <Box
            sx={{ textAlign: "center", py: 5, px: 2, color: "text.secondary" }}
          >
            <SearchOffIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2" fontWeight={500}>
              {t("noResults")}
            </Typography>
            <Typography variant="caption">
              {t("tryOtherTerms")}
            </Typography>
          </Box>
        )}

        {/* Lista de Módulos e Capítulos Filtrados */}
        <List disablePadding>
          {documentationData.map((module) => (
            <Box key={module.id}>
              <ListItemButton
                onClick={() => toggleModule(module.id)}
                sx={{ py: 1.5, px: 2.5 }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color:
                      selectedModule.id === module.id
                        ? "primary.main"
                        : "text.secondary",
                  }}
                >
                  {iconMap[module.icon] || <ArticleIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={module.title}
                  slotProps={{
                    primary: {
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color:
                        selectedModule.id === module.id
                          ? "primary.main"
                          : "text.primary",
                    },
                  }}
                />
                {expandedModules.includes(module.id) ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
              </ListItemButton>

              <Collapse in={expandedModules.includes(module.id)}>
                <List disablePadding sx={{ pl: 2 }}>
                  {module.chapters.map((chapter) => (
                    <ListItemButton
                      key={chapter.id}
                      selected={selectedChapter.id === chapter.id}
                      onClick={() => handleChapterSelect(module, chapter)}
                      sx={{
                        py: 1,
                        px: 2.5,
                        ml: 2,
                        borderRadius: 2,
                        mb: 0.5,
                        "&.Mui-selected": {
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          borderLeft: "3px solid",
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <ListItemText
                        primary={chapter.title}
                        slotProps={{
                          primary: {
                            fontSize: "0.8125rem",
                            fontWeight:
                              selectedChapter.id === chapter.id ? 600 : 400,
                            color:
                              selectedChapter.id === chapter.id
                                ? "primary.main"
                                : "text.secondary",
                          },
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </Box>
          ))}
        </List>
      </Box>
    </Box>
  );
};
