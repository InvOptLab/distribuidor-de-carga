"use client";
import {
  Box,
  Container,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingsIcon from "@mui/icons-material/Settings";
import type React from "react";
import { useState, useMemo } from "react";
import TabuListConfig from "./_components/TabuListConfig";
import ConstraintsConfig from "./_components/ConstraintsConfig";
import NeighborhoodConfig from "./_components/NeighborhoodConfig";
import StopCriteriaConfig from "./_components/StopCriteriaConfig";
import AspirationConfig from "./_components/AspirationConfig";
import ObjectiveConfig from "./_components/ObjectiveConfig";
import { useAlgorithmContext } from "@/context/Algorithm";
import { AlgorithmType, AVAILABLE_ALGORITHMS } from "../types/algorithm-types";

export default function Configuracoes() {
  const { selectedAlgorithm, setSelectedAlgorithm } = useAlgorithmContext();
  const [expandedPanels, setExpandedPanels] = useState<string[]>([
    "constraints",
    "objectiveCost",
  ]);

  const handlePanelChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedPanels((prev) =>
        isExpanded ? [...prev, panel] : prev.filter((p) => p !== panel)
      );
    };

  const handleAlgorithmChange = (event: { target: { value: string } }) => {
    setSelectedAlgorithm(event.target.value as AlgorithmType);
    // Reset expanded panels when algorithm changes
    setExpandedPanels(["constraints", "objectiveCost"]);
  };

  // Get the current algorithm configuration
  const currentAlgorithm = useMemo(
    () => AVAILABLE_ALGORITHMS.find((alg) => alg.id === selectedAlgorithm),
    [selectedAlgorithm]
  );

  // Map section IDs to their components
  const componentMap: Record<string, React.ReactNode> = {
    "tabu-list": <TabuListConfig />,
    constraints: <ConstraintsConfig />,
    objectiveCost: <ObjectiveConfig />,
    neighborhood: <NeighborhoodConfig />,
    "stop-criteria": <StopCriteriaConfig />,
    aspiration: <AspirationConfig />,
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <SettingsIcon sx={{ fontSize: 40, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
              Configurações do Algoritmo
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Selecione o algoritmo e ajuste seus parâmetros para otimizar os
              resultados
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Algorithm Selection */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel id="algorithm-select-label">
              Selecione o Algoritmo
            </InputLabel>
            <Select
              labelId="algorithm-select-label"
              id="algorithm-select"
              value={selectedAlgorithm}
              label="Selecione o Algoritmo"
              onChange={handleAlgorithmChange}
            >
              {AVAILABLE_ALGORITHMS.map((algorithm) => (
                <MenuItem key={algorithm.id} value={algorithm.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography sx={{ fontSize: "1.5rem" }}>
                      {algorithm.icon}
                    </Typography>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {algorithm.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {algorithm.description}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {currentAlgorithm && (
            <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Seções de configuração:
              </Typography>
              {currentAlgorithm.configSections.map((section) => (
                <Chip
                  key={section.id}
                  label={section.title}
                  size="small"
                  icon={
                    <Typography sx={{ fontSize: "1rem" }}>
                      {section.icon}
                    </Typography>
                  }
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Configuration Sections */}
      <Box sx={{ width: "100%" }}>
        {currentAlgorithm?.configSections.map((section) => (
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
              {componentMap[section.id]}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
}
