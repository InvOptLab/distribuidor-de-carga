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
import CommunityDetails from "./_components/CommunityDetails";
import Link from "next/link";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import HubIcon from "@mui/icons-material/Hub";

export default function NetworkAnalysisPage() {
  const { report, graph, isLoading, hasData } = useNetworkHealth();
  const [tabIndex, setTabIndex] = useState(0);

  // Comunidades Ocultas ---
  // Usamos lógica de "quem está oculto" para começar exibindo tudo por padrão (lista vazia)
  const [hiddenCommunities, setHiddenCommunities] = useState<string[]>([]);

  const handleToggleCommunity = (communityId: string) => {
    setHiddenCommunities(
      (prev) =>
        prev.includes(communityId)
          ? prev.filter((id) => id !== communityId) // Se já estava oculto, remove da lista (mostra)
          : [...prev, communityId] // Se estava visível, adiciona na lista (oculta)
    );
  };

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
            <Tabs value={tabIndex} onChange={handleTabChange}>
              <Tab
                icon={<AnalyticsIcon />}
                label="Diagnóstico"
                iconPosition="start"
              />
              <Tab
                icon={<HubIcon />}
                label="Visualização da Rede"
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {tabIndex === 0 && <NetworkDashboard report={report} />}

          {tabIndex === 1 && (
            <>
              {/* Passamos o estado de ocultação para o Visualizador filtrar os nós */}
              <NetworkVisualizer
                graph={graph}
                report={report}
                hiddenCommunities={hiddenCommunities} // <--- NOVO PROP
              />

              {report.communities.length > 0 && (
                /* Passamos a função de toggle para o Card ativar/desativar */
                <CommunityDetails
                  graph={graph}
                  communities={report.communities}
                  hiddenCommunities={hiddenCommunities} // <--- NOVO PROP
                  onToggleCommunity={handleToggleCommunity} // <--- NOVO PROP
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
