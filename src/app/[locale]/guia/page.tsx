"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Drawer,
  IconButton,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  PlayArrow as PlayArrowIcon,
  Article as ArticleIcon,
  SmartToy as SmartToyIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";

import { Module, Chapter } from "./_types/docs";
import { getDocumentationData } from "./_data/documentation";
import { ContentRenderer } from "./_components/ContentRenderer";
import { LeftSidebar } from "./_components/LeftSidebar";
import { RightSidebar } from "./_components/RightSidebar";
import { useTranslations, useLocale } from "next-intl";

export default function HelpCenterPage() {
  const theme = useTheme();
  const t = useTranslations("Pages.Guia");
  const locale = useLocale();
  const documentationData = useMemo(() => getDocumentationData(locale), [locale]);

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([
    documentationData[0].id,
  ]);
  const [selectedModule, setSelectedModule] = useState<Module>(
    documentationData[0],
  );
  const [selectedChapter, setSelectedChapter] = useState<Chapter>(
    documentationData[0].chapters[0],
  );
  const [activeSection, setActiveSection] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    );
  };

  const handleChapterSelect = (module: Module, chapter: Chapter) => {
    setSelectedModule(module);
    setSelectedChapter(chapter);
    setMobileDrawerOpen(false);
    // Usa o topo do documento de forma limpa
    document.documentElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleScroll = useCallback(() => {
    const sections = selectedChapter.sections;

    // Detecta qual seção está visível baseando-se na posição real na viewport
    for (let i = sections.length - 1; i >= 0; i--) {
      const element = document.getElementById(sections[i].id);
      if (element) {
        const rect = element.getBoundingClientRect();
        // 150px de compensação por causa do header fixo
        if (rect.top <= 150) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    }
  }, [selectedChapter.sections]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
            }
          });
        },
        // O rootMargin diz quando o elemento deve ser ativado.
        // Aqui configuramos para disparar quando a seção passa um pouco abaixo do menu de topo.
        { rootMargin: "-120px 0px -60% 0px" },
      );

      selectedChapter.sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          observer.observe(element);
        }
      });

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedChapter]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // O scrollIntoView funciona independente de qual div ou window está rolando.
      // E respeita o scrollMarginTop que colocamos no componente de Heading!
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ============================================================================
  // LÓGICA DE BUSCA
  // ============================================================================
  const filteredDocumentation = useMemo(() => {
    if (!searchQuery.trim()) return documentationData;

    const query = searchQuery.toLowerCase();

    return documentationData
      .map((module) => {
        // Verifica se o título do módulo tem o termo
        const moduleMatches = module.title.toLowerCase().includes(query);

        // Filtra os capítulos do módulo
        const matchingChapters = module.chapters.filter((chapter) => {
          // O título do capítulo tem o termo?
          if (chapter.title.toLowerCase().includes(query)) return true;

          // O conteúdo interno do capítulo tem o termo?
          return chapter.content.some((block) => {
            if (block.content && block.content.toLowerCase().includes(query))
              return true;
            if (block.title && block.title.toLowerCase().includes(query))
              return true;
            if (
              block.items &&
              block.items.some((item) => item.toLowerCase().includes(query))
            )
              return true;
            return false;
          });
        });

        // Se o módulo ou algum capítulo tem o termo, nós o mantemos
        if (moduleMatches || matchingChapters.length > 0) {
          return {
            ...module,
            // Se o módulo deu match mas nenhum capítulo deu, mostra todos os capítulos dele
            chapters:
              moduleMatches && matchingChapters.length === 0
                ? module.chapters
                : matchingChapters,
          };
        }

        return null;
      })
      .filter(Boolean) as Module[]; // Remove os nulls
  }, [searchQuery, documentationData]);

  // Expande automaticamente os módulos quando houver uma busca
  useEffect(() => {
    if (searchQuery.trim() && filteredDocumentation.length > 0) {
      setExpandedModules(filteredDocumentation.map((m) => m.id));
    }
  }, [searchQuery, filteredDocumentation]);

  return (
    <Box sx={{ display: "flex", bgcolor: "background.default" }}>
      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: 300 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            {t("title")}
          </Typography>
          <IconButton onClick={() => setMobileDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <LeftSidebar
          documentationData={documentationData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          expandedModules={expandedModules}
          toggleModule={toggleModule}
          selectedModule={selectedModule}
          selectedChapter={selectedChapter}
          handleChapterSelect={handleChapterSelect}
        />
      </Drawer>

      {/* Desktop Left Sidebar  */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "sticky",
          top: 0,
          height: "100vh",
          flexShrink: 0,
          alignSelf: "flex-start",
        }}
      >
        <LeftSidebar
          documentationData={filteredDocumentation}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          expandedModules={expandedModules}
          toggleModule={toggleModule}
          selectedModule={selectedModule}
          selectedChapter={selectedChapter}
          handleChapterSelect={handleChapterSelect}
        />
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
      >
        {/* Header e Breadcrumbs */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid",
            borderColor: "divider",
            px: { xs: 2, md: 4 },
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              sx={{ display: { xs: "flex", md: "none" } }}
              onClick={() => setMobileDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={selectedModule.title}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: "primary.main",
                  fontWeight: 600,
                }}
              />
              <Typography color="text.secondary">/</Typography>
              <Typography variant="body2" fontWeight={500} color="text.primary">
                {selectedChapter.title}
              </Typography>
            </Box>
          </Box>
          {/* Botão de IA removido daqui para evitar conflitos com o Widget Global */}
        </Box>

        {/* Scrollable Content - Removido o overflowY="auto" */}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box sx={{ flex: 1, maxWidth: 800, px: { xs: 3, md: 6 }, py: 4 }}>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ mb: 1, color: "primary.main" }}
            >
              {selectedChapter.title}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 4,
                pb: 4,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Chip
                icon={<ArticleIcon />}
                label={t("sectionsCount", { count: selectedChapter.content.length })}
                size="small"
                variant="outlined"
              />
            </Box>

            {/* RENDERIZAÇÃO DINÂMICA DO JSON */}
            {selectedChapter.content.map((block, index) => (
              <ContentRenderer key={index} block={block} />
            ))}
          </Box>

          {/* Desktop Right Sidebar */}
          <RightSidebar
            selectedChapter={selectedChapter}
            activeSection={activeSection}
            scrollToSection={scrollToSection}
          />
        </Box>
      </Box>
    </Box>
  );
}
