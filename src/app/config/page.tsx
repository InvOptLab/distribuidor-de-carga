"use client";
import {
  Box,
  Container,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type React from "react";
import { useState } from "react";
import TabuListConfig from "./_components/TabuListConfig";
import ConstraintsConfig from "./_components/ConstraintsConfig";
import NeighborhoodConfig from "./_components/NeighborhoodConfig";
import StopCriteriaConfig from "./_components/StopCriteriaConfig";
import AspirationConfig from "./_components/AspirationConfig";
import ObjectiveConfig from "./_components/ObjectiveConfig";

export default function Configuracoes() {
  const [expandedPanels, setExpandedPanels] = useState<string[]>([
    "tabu-list",
    "constraints",
  ]);

  const handlePanelChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedPanels((prev) =>
        isExpanded ? [...prev, panel] : prev.filter((p) => p !== panel)
      );
    };

  const configSections = [
    {
      id: "tabu-list",
      title: "Lista Tabu",
      description: "Configure o tipo e tamanho da lista tabu",
      component: <TabuListConfig />,
      icon: "🚫",
    },
    {
      id: "constraints",
      title: "Restrições",
      description: "Gerencie restrições hard e soft do algoritmo",
      component: <ConstraintsConfig />,
      icon: "⚖️",
    },
    {
      id: "objectiveCost",
      title: "Custos da Função Objetivo",
      description:
        "Configure os custos que serão considerados na função objetivo",
      component: <ObjectiveConfig />,
      icon: "🎯",
    },
    {
      id: "neighborhood",
      title: "Geração da Vizinhança",
      description: "Configure as funções de geração de vizinhança",
      component: <NeighborhoodConfig />,
      icon: "🔄",
    },
    {
      id: "stop-criteria",
      title: "Critérios de Parada",
      description: "Defina quando o algoritmo deve parar",
      component: <StopCriteriaConfig />,
      icon: "⏹️",
    },
    {
      id: "aspiration",
      title: "Critérios de Aspiração",
      description: "Configure critérios para aceitar soluções tabu",
      component: <AspirationConfig />,
      icon: "✨",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Configurações do Algoritmo
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Ajuste os parâmetros do algoritmo Busca Tabu para otimizar os
          resultados
        </Typography>
      </Paper>

      <Box sx={{ width: "100%" }}>
        {/* eslint-disable-next-line @typescript-eslint/no-unused-vars*/}
        {configSections.map((section, _index) => (
          <Accordion
            key={section.id}
            expanded={expandedPanels.includes(section.id)}
            onChange={handlePanelChange(section.id)}
            sx={{
              mb: 2,
              "&:before": {
                display: "none",
              },
              boxShadow: 2,
              borderRadius: 2,
              "&.Mui-expanded": {
                margin: "0 0 16px 0",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                borderRadius: expandedPanels.includes(section.id)
                  ? "8px 8px 0 0"
                  : "8px",
                minHeight: 64,
                "&.Mui-expanded": {
                  minHeight: 64,
                },
                "& .MuiAccordionSummary-content": {
                  alignItems: "center",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" sx={{ fontSize: "1.5rem" }}>
                  {section.icon}
                </Typography>
                <Box>
                  <Typography variant="h6" component="div">
                    {section.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {section.description}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              {section.component}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
}
