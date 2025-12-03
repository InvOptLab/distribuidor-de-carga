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
  // Speed,
  // Psychology,
  School,
} from "@mui/icons-material";
import InsightsIcon from "@mui/icons-material/Insights";
import AnimatedLogo from "@/components/AnimatedLogo";

export default function Home() {
  const autores: IAuthProfileProps[] = [
    {
      name: "José Eduardo Saroba Bieco",
      email: "jose.bieco@usp.br",
      lattes: "http://lattes.cnpq.br/1790961525430099",
      institution: "USP",
      institute: "ICMC",
      // department: "SME",
      role: "Aluno de Mestrado",
      researchArea: "Otimização Combinatória",
      // Adicione os links opcionais se disponíveis:
      linkedin: "https://www.linkedin.com/in/josebieco",
      orcid: "0009-0009-3773-9005",
      googleScholar:
        "https://scholar.google.com/citations?hl=pt-BR&user=uqZV3EkAAAAJ",
    },
    {
      name: "Elias Salomão Helou Neto",
      email: "elias@icmc.usp.br",
      lattes: "http://lattes.cnpq.br/5434724108176150",
      institution: "USP",
      institute: "ICMC",
      department: "SME",
      role: "Orientador",
      researchArea:
        "Problemas Inversos, Otimização Convexa e Matemática Aplicada",
      // Adicione os links opcionais se disponíveis:
      linkedin: "https://www.linkedin.com/in/elias-salomao-helou-neto",
      orcid: "0000-0001-5157-3851",
      googleScholar:
        "https://scholar.google.com/citations?hl=pt-BR&user=GjgcpdAAAAAJ",
    },
  ];

  const funcionalidades = [
    "Atribuição automática de docentes a turmas usando Busca Tabu",
    "Consideração de preferências e prioridades dos docentes",
    "Configuração do processo de otimização",
    "Gerenciamento de conflitos de horários",
    "Visualização em formato de planilha Excel-like",
    "Exportação de resultados para Excel",
    "Análise de saldo de carga didática dos docentes",
  ];

  const tecnologias = [
    "Next.js 16",
    "React 19",
    "TypeScript",
    "Material UI",
    "Recharts",
    "Busca Tabu (Metaheurística)",
  ];

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
            Distribuidor de Carga Docente
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Uma ferramenta baseada em Busca Tabu para alocação otimizada de
            docentes
          </Typography>
          <Box display="flex" gap={2} justifyContent="center" sx={{ mt: 3 }}>
            <Chip
              icon={<School />}
              label="Projeto de Mestrado"
              color="primary"
            />
            <Chip icon={<InsightsIcon />} label="Otimização" color="success" />
            {/* <Chip
              icon={<Psychology />}
              label="Pesquisa Operacional"
              color="secondary"
            /> */}
          </Box>
        </Box>

        {/* Sobre o Projeto */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Sobre o Projeto
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              Este projeto faz parte de uma pesquisa de mestrado desenvolvida no
              Instituto de Ciências Matemáticas e de Computação (ICMC) da
              Universidade de São Paulo (USP). O objetivo é desenvolver uma
              ferramenta computacional que auxilie no processo de atribuição de
              docentes a turmas, considerando preferências, restrições de
              horários e balanceamento de carga didática.
            </Typography>
            <Typography variant="body1">
              A ferramenta utiliza a metaheurística Busca Tabu para encontrar
              soluções de alta qualidade para este problema de otimização
              combinatória, que é conhecido por sua complexidade computacional.
            </Typography>
          </CardContent>
        </Card>

        {/* Funcionalidades */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Funcionalidades Principais
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {funcionalidades.map((func, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Box display="flex" alignItems="flex-start">
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary={func} />
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
                    Tecnologias
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
                    Repositório
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" paragraph>
                  O código-fonte do projeto está disponível no GitHub:
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
                Publicações
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Paper elevation={1} sx={{ p: 3, bgcolor: "grey.50" }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Uma Ferramenta Baseada em Busca Tabu para Alocação de Docentes
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                LVII Simpósio Brasileiro de Pesquisa Operacional (SBPO 2025)
              </Typography>
              <Link
                href="https://proceedings.science/sbpo-2025/trabalhos/uma-ferramenta-baseada-em-busca-tabu-para-alocacao-de-docentes?lang=pt-br&check_logged_in=1"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: "block", mb: 2, fontWeight: "bold" }}
              >
                Acessar artigo completo
              </Link>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                <strong>Citação:</strong> BIECO, José Eduardo Saroba; NETO,
                Elias Salomão Helou. Uma Ferramenta Baseada em Busca Tabu para
                Alocação de Docentes. In: BOOK OF ABSTRACTS OF THE LVII
                BRAZILIAN SYMPOSIUM ON OPERATIONS RESEARCH, 2025, Gramado. Anais
                eletrônicos..., Galoá, 2025. Disponível em:{" "}
                &lt;https://proceedings.science/sbpo-2025/trabalhos/uma-ferramenta-baseada-em-busca-tabu-para-alocacao-de-docentes?lang=pt-br&gt;
                Acesso em: 26 Out. 2025.
              </Typography>
            </Paper>
          </CardContent>
        </Card>

        {/* Como Usar */}
        {/* <Card elevation={2}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Speed color="primary" />
              <Typography variant="h5" fontWeight="bold">
                Como Usar
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemText
                  primary="1. Cadastre os docentes e suas preferências"
                  secondary="Informe os dados dos docentes e as disciplinas de interesse"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="2. Configure as disciplinas e horários"
                  secondary="Defina as turmas, horários e requisitos de cada disciplina"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="3. Execute o algoritmo de otimização"
                  secondary="A Busca Tabu encontrará uma solução de alta qualidade"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="4. Visualize e exporte os resultados"
                  secondary="Analise a atribuição gerada e exporte para Excel"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card> */}

        {/* Autores */}
        <Box>
          <Typography
            variant="h4"
            component="h2"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            Autores
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
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
