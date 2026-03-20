"use client";

import AuthProfile, { type IAuthProfileProps } from "@/components/AuthProfile";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Link,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import {
  GitHub,
  Article,
  CheckCircle,
  Code,
  School,
} from "@mui/icons-material";
import InsightsIcon from "@mui/icons-material/Insights";
import AnimatedLogo from "@/components/AnimatedLogo";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Pages.Home");

  const autores: IAuthProfileProps[] = [
    {
      name: "José Eduardo Saroba Bieco",
      email: "jose.bieco@usp.br",
      lattes: "http://lattes.cnpq.br/1790961525430099",
      institution: "USP",
      institute: "ICMC",
      // department: "SME",
      role: t("authors.roles.masterStudent"),
      researchArea: t("authors.researchAreas.combinatorialOptimization"),
      // Adicione os links opcionais se disponíveis:
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
      // Adicione os links opcionais se disponíveis:
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
      // Adicione os links opcionais se disponíveis:
      linkedin: "https://www.linkedin.com/in/marcos-furlan-18151734/",
      orcid: "0000-0002-8952-063X",
      googleScholar:
        "https://scholar.google.com/citations?user=da3F3P8AAAAJ&hl=en",
      avatarUrl:
        "https://scholar.googleusercontent.com/citations?view_op=medium_photo&user=da3F3P8AAAAJ&citpid=1",
    },
  ];

  // const funcionalidades = [
  //   "Atribuição automática de docentes a turmas usando Busca Tabu",
  //   "Consideração de preferências e prioridades dos docentes",
  //   "Configuração do processo de otimização",
  //   "Gerenciamento de conflitos de horários",
  //   "Visualização em formato de planilha Excel-like",
  //   "Exportação de resultados para Excel",
  //   "Análise de saldo de carga didática dos docentes",
  // ];

  const tecnologias = [
    "Next.js 16",
    "React 19",
    "TypeScript",
    "Material UI",
    "Recharts",
    "Busca Tabu (Metaheurística)",
    "MILP (HiGHS)",
  ];

  // Array de chaves para as funcionalidades
  const featureKeys = ["f1", "f2", "f3", "f4", "f5", "f6", "f7"] as const;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box display="flex" flexDirection="column" gap={6}>
        {/* Hero Section */}
        <Box textAlign="center">
          <Box display="flex" justifyContent="center" marginBottom={4}>
            <AnimatedLogo />
          </Box>

          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            gutterBottom
            sx={{
              background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("title")}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            {t("subtitle")}
          </Typography>
          <Box display="flex" gap={2} justifyContent="center" sx={{ mt: 3 }}>
            <Chip
              icon={<School />}
              label={t("badges.masterProject")}
              color="primary"
            />
            <Chip
              icon={<InsightsIcon />}
              label={t("badges.optimization")}
              color="success"
            />
          </Box>
        </Box>

        {/* Sobre o Projeto */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {t("about.title")}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" component="p">
              {t("about.p1")}
            </Typography>
            <Typography variant="body1">{t("about.p2")}</Typography>
          </CardContent>
        </Card>

        {/* Funcionalidades */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {t("features.title")}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {featureKeys.map((func, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Box display="flex" alignItems="flex-start">
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary={t(`features.items.${func}`)} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Tecnologias e Repositório */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={2} sx={{ height: "100%" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Code color="primary" />
                  <Typography variant="h5" fontWeight="bold">
                    {t("technologies.title")}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {tecnologias.map((tech, index) => (
                    <Chip key={index} label={tech} variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={2} sx={{ height: "100%" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <GitHub color="primary" />
                  <Typography variant="h5" fontWeight="bold">
                    {t("repository.title")}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" component="p">
                  {t("repository.description")}
                </Typography>
                <Link
                  href="https://github.com/InvOptLab/distribuidor-de-carga"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    fontWeight: "bold",
                  }}
                >
                  <GitHub />
                  InvOptLab/distribuidor-de-carga
                </Link>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Publicações */}
        <Card elevation={2}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Article color="primary" />
              <Typography variant="h5" fontWeight="bold">
                {t("publications.title")}
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Paper elevation={1} sx={{ p: 3, bgcolor: "grey.50" }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {t("publications.sbpo2025.articleTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary" component="p">
                {t("publications.sbpo2025.articleEvent")}
              </Typography>
              <Link
                href="https://proceedings.science/sbpo-2025/trabalhos/uma-ferramenta-baseada-em-busca-tabu-para-alocacao-de-docentes?lang=pt-br&check_logged_in=1"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: "block", mb: 2, fontWeight: "bold" }}
              >
                {t("publications.accessLink")}
              </Link>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                <strong>{t("publications.citationLabel")}</strong> BIECO, José
                Eduardo Saroba; NETO, Elias Salomão Helou. Uma Ferramenta
                Baseada em Busca Tabu para Alocação de Docentes. In: BOOK OF
                ABSTRACTS OF THE LVII BRAZILIAN SYMPOSIUM ON OPERATIONS
                RESEARCH, 2025, Gramado. Anais eletrônicos..., Galoá, 2025.
                Disponível em:{" "}
                &lt;https://proceedings.science/sbpo-2025/trabalhos/uma-ferramenta-baseada-em-busca-tabu-para-alocacao-de-docentes?lang=pt-br&gt;
                Acesso em: 26 Out. 2025.
              </Typography>
            </Paper>
          </CardContent>
        </Card>

        {/* Autores */}
        <Box>
          <Typography
            variant="h4"
            component="h2"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            {t("authors.title")}
          </Typography>
          <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
            {autores.map((autor) => (
              <Grid key={autor.email}>
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
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
