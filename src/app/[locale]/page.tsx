"use client";

import { useEffect, useRef } from "react";
import AuthProfile, { type IAuthProfileProps } from "@/components/AuthProfile";
import {
  Container,
  Typography,
  Box,
  CardContent,
  Grid,
  Link,
  Chip,
  Divider,
  Button,
} from "@mui/material";
import {
  GitHub,
  Article,
  School,
  PlayArrow,
  AutoAwesome,
  Tune,
  EventAvailable,
  ViewList,
  SaveAlt,
  Analytics,
  Extension,
} from "@mui/icons-material";
import NextLink from "next/link";
import InsightsIcon from "@mui/icons-material/Insights";
import AnimatedLogo from "@/components/AnimatedLogo";
import { useTranslations } from "next-intl";
import styles from "./home.module.css";

export default function Home() {
  const t = useTranslations("Pages.Home");

  // Hook para acionar IntersectionObserver manual (fallback para Scroll Driven Animation)
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Configura o IntersectionObserver se não houver suporte nativo completo ao scroll-timeline ou pra simplificar browsers
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.active);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    const elements = document.querySelectorAll(`.${styles.reveal}`);
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const autores: IAuthProfileProps[] = [
    {
      name: "José Eduardo Saroba Bieco",
      email: "jose.bieco@usp.br",
      lattes: "http://lattes.cnpq.br/1790961525430099",
      institution: "USP",
      institute: "ICMC",
      role: t("authors.roles.masterStudent"),
      researchArea: t("authors.researchAreas.combinatorialOptimization"),
      linkedin: "https://www.linkedin.com/in/josebieco",
      orcid: "0009-0009-3773-9005",
      googleScholar:
        "https://scholar.google.com/citations?hl=pt-BR&user=uqZV3EkAAAAJ",
      avatarUrl:
        "https://scholar.googleusercontent.com/citations?view_op=medium_photo&user=uqZV3EkAAAAJ&citpid=2",
    },
    {
      name: "Elias Salomão Helou Neto",
      email: "elias@icmc.usp.br",
      lattes: "http://lattes.cnpq.br/5434724108176150",
      institution: "USP",
      institute: "ICMC",
      department: "SME",
      role: t("authors.roles.advisor"),
      researchArea: t("authors.researchAreas.inverseProblems"),
      linkedin: "https://www.linkedin.com/in/elias-salomao-helou-neto",
      orcid: "0000-0001-5157-3851",
      googleScholar:
        "https://scholar.google.com/citations?hl=pt-BR&user=GjgcpdAAAAAJ",
      avatarUrl:
        "https://scholar.googleusercontent.com/citations?view_op=medium_photo&user=GjgcpdAAAAAJ&citpid=2",
    },
    {
      name: "Marcos Mansano Furlan",
      email: "mafurlan@icmc.usp.br",
      lattes: "http://lattes.cnpq.br/6488098979363222",
      institution: "USP",
      institute: "ICMC",
      department: "SME",
      role: t("authors.roles.coadvisor"),
      researchArea: t("authors.researchAreas.lotSizing"),
      linkedin: "https://www.linkedin.com/in/marcos-furlan-18151734/",
      orcid: "0000-0002-8952-063X",
      googleScholar:
        "https://scholar.google.com/citations?user=da3F3P8AAAAJ&hl=en",
      avatarUrl:
        "https://scholar.googleusercontent.com/citations?view_op=medium_photo&user=da3F3P8AAAAJ&citpid=1",
    },
  ];

  const tecnologias = [
    "Next.js 16",
    "React 19",
    "TypeScript",
    "Material UI",
    "Recharts",
    "Busca Tabu",
    "MILP (HiGHS)",
  ];

  const featureKeys = ["f1", "f2", "f3", "f4", "f5", "f6", "f7"] as const;

  // Icon mapping for features to make cards more vibrant
  const featureIcons: Record<string, React.ReactNode> = {
    f1: <AutoAwesome fontSize="large" />,
    f2: <Tune fontSize="large" />,
    f3: <Extension fontSize="large" />,
    f4: <EventAvailable fontSize="large" />,
    f5: <ViewList fontSize="large" />,
    f6: <SaveAlt fontSize="large" />,
    f7: <Analytics fontSize="large" />,
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", pb: 8 }}>
      {/* Background animado e fluido ocupando toda a página */}
      <Box
        className={styles.meshGradient}
        sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Container Principal flutuando sobre o background */}
      <Container
        maxWidth="lg"
        sx={{ pt: { xs: 8, md: 12 }, position: "relative", zIndex: 1 }}
      >
        <Box display="flex" flexDirection="column" gap={8}>
          {/* Hero Section */}
          <Box
            className={`${styles.glass} ${styles.scrollAnim} ${styles.reveal}`}
            sx={{ p: { xs: 4, md: 8 }, textAlign: "center" }}
          >
            <Box display="flex" justifyContent="center" marginBottom={4}>
              <AnimatedLogo />
            </Box>

            <Typography
              variant="h2"
              component="h1"
              fontWeight="900"
              gutterBottom
              sx={{
                background:
                  "linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #42a5f5 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-1px",
              }}
            >
              {t("title")}
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                mt: 2,
                mb: 4,
                maxWidth: "800px",
                mx: "auto",
                fontWeight: 400,
              }}
            >
              {t("subtitle")}
            </Typography>

            <Box display="flex" gap={2} justifyContent="center" sx={{ mb: 4 }}>
              <Chip
                icon={<School />}
                label={t("badges.masterProject")}
                color="primary"
                variant="filled"
                sx={{ fontWeight: "bold" }}
              />
              <Chip
                icon={<InsightsIcon />}
                label={t("badges.optimization")}
                color="success"
                variant="filled"
                sx={{ fontWeight: "bold" }}
              />
            </Box>

            <Box display="flex" gap={3} justifyContent="center" flexWrap="wrap">
              <Button
                component={NextLink}
                href="/guia"
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                sx={{
                  borderRadius: "50px",
                  px: 4,
                  py: 1.5,
                  fontWeight: "bold",
                  boxShadow: "0 8px 24px rgba(25, 118, 210, 0.4)",
                }}
              >
                Explorar a Plataforma
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<GitHub />}
                href="https://github.com/InvOptLab/distribuidor-de-carga"
                target="_blank"
                sx={{
                  borderRadius: "50px",
                  px: 4,
                  py: 1.5,
                  fontWeight: "bold",
                  background: "rgba(255,255,255,0.7)",
                }}
              >
                Código Aberto
              </Button>
            </Box>
          </Box>

          {/* Sobre o Projeto */}
          <Box
            className={`${styles.glassCard} ${styles.scrollAnim} ${styles.reveal}`}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Typography
                variant="h4"
                fontWeight="800"
                gutterBottom
                color="primary.dark"
              >
                {t("about.title")}
              </Typography>
              <Typography
                variant="body1"
                component="p"
                sx={{ fontSize: "1.1rem", lineHeight: 1.7, mb: 2 }}
              >
                {t("about.p1")}
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontSize: "1.1rem", lineHeight: 1.7 }}
              >
                {t("about.p2")}
              </Typography>
            </CardContent>
          </Box>

          {/* Funcionalidades */}
          <Box>
            <Typography
              variant="h4"
              fontWeight="800"
              gutterBottom
              color="primary.dark"
              align="center"
              sx={{ mb: 5 }}
            >
              {t("features.title")}
            </Typography>
            <Grid container spacing={3}>
              {featureKeys.map((func, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Box
                    className={`${styles.glassCard} ${styles.scrollAnim} ${styles.reveal}`}
                    sx={{ p: 3, height: "100%" }}
                  >
                    <Box className={styles.featureIconWrapper}>
                      {featureIcons[func]}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {t(`features.items.${func}`)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Nova Seção: Como Funciona */}
          <Box className={`${styles.scrollAnim} ${styles.reveal}`}>
            <Typography variant="h4" fontWeight="800" align="center" gutterBottom color="primary.dark" sx={{ mb: 4 }}>
              {t("howItWorks.title")}
            </Typography>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box className={styles.glassCard} sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="h1" color="primary.light" sx={{ opacity: 0.3, fontWeight: 900, mb: 1 }}>1</Typography>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>{t("howItWorks.step1Title")}</Typography>
                  <Typography variant="body2" color="text.secondary">{t("howItWorks.step1Desc")}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box className={styles.glassCard} sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="h1" color="primary.light" sx={{ opacity: 0.3, fontWeight: 900, mb: 1 }}>2</Typography>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>{t("howItWorks.step2Title")}</Typography>
                  <Typography variant="body2" color="text.secondary">{t("howItWorks.step2Desc")}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box className={styles.glassCard} sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="h1" color="primary.light" sx={{ opacity: 0.3, fontWeight: 900, mb: 1 }}>3</Typography>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>{t("howItWorks.step3Title")}</Typography>
                  <Typography variant="body2" color="text.secondary">{t("howItWorks.step3Desc")}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Tecnologias */}
          <Box
            className={`${styles.glassCard} ${styles.scrollAnim} ${styles.reveal}`}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <AutoAwesome color="primary" fontSize="large" />
                <Typography variant="h4" fontWeight="800" color="primary.dark">
                  {t("technologies.title")}
                </Typography>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={2}>
                {tecnologias.map((tech, index) => (
                  <Chip
                    key={index}
                    label={tech}
                    sx={{
                      fontSize: "1rem",
                      px: 1,
                      py: 2.5,
                      background: "rgba(25, 118, 210, 0.1)",
                      color: "#0d47a1",
                      fontWeight: "bold",
                      border: "1px solid rgba(25, 118, 210, 0.2)",
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Box>

          {/* Publicações (Banner Acadêmico Edge-to-Edge Simulado) */}
          <Box
            className={`${styles.eventBanner} ${styles.scrollAnim} ${styles.reveal}`}
          >
            <Box className={styles.eventContent} sx={{ p: { xs: 4, md: 6 } }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Article fontSize="large" sx={{ color: "#64b5f6" }} />
                <Typography variant="h4" fontWeight="800">
                  {t("publications.title")}
                </Typography>
              </Box>

              <Box
                sx={{
                  background: "rgba(0, 0, 0, 0.4)",
                  borderRadius: 3,
                  p: 4,
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {t("publications.sbpo2025.articleTitle")}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#90caf9", mb: 2 }}
                >
                  {t("publications.sbpo2025.articleEvent")}
                </Typography>

                <Link
                  href="https://proceedings.science/sbpo-2025/trabalhos/uma-ferramenta-baseada-em-busca-tabu-para-alocacao-de-docentes?lang=pt-br&check_logged_in=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "inline-block",
                    mb: 4,
                    fontWeight: "bold",
                    color: "#ffffff",
                    textDecoration: "none",
                    borderBottom: "2px solid #64b5f6",
                    pb: 0.5,
                    transition: "all 0.2s",
                    "&:hover": { color: "#64b5f6", borderColor: "#ffffff" },
                  }}
                >
                  {t("publications.accessLink")} ➔
                </Link>

                <Typography
                  variant="body2"
                  sx={{
                    fontStyle: "italic",
                    opacity: 0.8,
                    borderLeft: "4px solid #64b5f6",
                    pl: 2,
                  }}
                >
                  <strong>{t("publications.citationLabel")}</strong> BIECO, José
                  Eduardo Saroba; NETO, Elias Salomão Helou. Uma Ferramenta
                  Baseada em Busca Tabu para Alocação de Docentes. In: BOOK OF
                  ABSTRACTS OF THE LVII BRAZILIAN SYMPOSIUM ON OPERATIONS
                  RESEARCH, 2025, Gramado. Anais eletrônicos..., Galoá, 2025.
                  Disponível em:{" "}
                  &lt;https://proceedings.science/sbpo-2025/trabalhos/uma-ferramenta-baseada-em-busca-tabu-para-alocacao-de-docentes?lang=pt-br&gt;
                  Acesso em: 26 Out. 2025.
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Autores */}
          <Box className={`${styles.scrollAnim} ${styles.reveal}`}>
            <Typography
              variant="h4"
              component="h2"
              align="center"
              fontWeight="900"
              gutterBottom
              color="primary.dark"
              sx={{ mb: 5 }}
            >
              {t("authors.title")}
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              {autores.map((autor) => (
                <Grid size={{ xs: 12, md: 4 }} key={autor.email}>
                  <Box
                    sx={{
                      height: "100%",
                      transition: "transform 0.3s ease",
                      "&:hover": { transform: "translateY(-10px)" },
                    }}
                  >
                    <AuthProfile
                      name={autor.name}
                      email={autor.email}
                      lattes={autor.lattes}
                      institution={autor.institution}
                      institute={autor.institute}
                      department={autor.department}
                      role={autor.role}
                      researchArea={autor.researchArea}
                      googleScholar={autor.googleScholar}
                      linkedin={autor.linkedin}
                      orcid={autor.orcid}
                      avatarUrl={autor.avatarUrl}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
