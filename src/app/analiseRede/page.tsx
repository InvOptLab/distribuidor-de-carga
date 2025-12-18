"use client";

import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import { useNetworkHealth } from "./hooks/useNetworkHealth";
import NetworkDashboard from "./_components/NetworkDashboard";
import NetworkVisualizer from "./_components/NetworkVisualizer";
import Link from "next/link";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import HubIcon from "@mui/icons-material/Hub";
import CommunityDetails from "./_components/CommunityDetails";

export default function NetworkAnalysisPage() {
  const { report, graph, isLoading, hasData } = useNetworkHealth();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          color="primary"
        >
          Análise de Robustez da Grade
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Diagnóstico e Visualização de Redes Complexas.
        </Typography>
      </Box>

      {!hasData ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
          mt={10}
        >
          <Alert severity="info" variant="outlined">
            Não há dados carregados para análise.
          </Alert>
          <Link href="/inputfile" passHref>
            <Button variant="contained" startIcon={<CloudUploadIcon />}>
              Carregar Dados
            </Button>
          </Link>
        </Box>
      ) : isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : report && graph ? (
        <>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              aria-label="network analysis tabs"
            >
              <Tab
                icon={<AnalyticsIcon />}
                label="Diagnóstico (Dashboard)"
                iconPosition="start"
              />
              <Tab
                icon={<HubIcon />}
                label="Visualização da Rede"
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Conteúdo das Abas */}
          {tabIndex === 0 && <NetworkDashboard report={report} />}

          {tabIndex === 1 && (
            <>
              {/* O Visualizador Gráfico */}
              <NetworkVisualizer graph={graph} report={report} />

              {/* Só mostramos os detalhes se houver comunidades detectadas */}
              {report.communities.length > 0 && (
                <CommunityDetails
                  graph={graph}
                  communities={report.communities}
                />
              )}
            </>
          )}
        </>
      ) : (
        <Alert severity="error">Erro ao processar a rede.</Alert>
      )}
    </Container>
  );
}
