"use client";

import type React from "react";
import {
  Box,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Typography,
  Card,
  Tabs,
  Tab,
  Paper,
  Container,
} from "@mui/material";
import { useState } from "react";
import OverviewTab from "./_components/OverviewTab";
import ConstraintsTab from "./_components/ConstraintsTab";
import ConfigurationsTab from "./_components/ConfigurationsTab";
import SingleSolutionWorkloadChart from "./_components/SingleSolutionWorkloadChart";
import { useGlobalContext } from "@/context/Global";
import NoDataFound from "@/components/NoDataFound";
import { useTranslations } from "next-intl";

import DashboardIcon from "@mui/icons-material/Dashboard";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BalanceIcon from "@mui/icons-material/Balance";
import SettingsIcon from "@mui/icons-material/Settings";
import { AVAILABLE_ALGORITHMS } from "../types/algorithm-types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`statistics-tabpanel-${index}`}
      aria-labelledby={`statistics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Statistics() {
  const t = useTranslations("Pages.Statistics");
  const { historicoSolucoes } = useGlobalContext();
  const [solutionId, setSolutionId] = useState("");
  const [currentTab, setCurrentTab] = useState(0);

  const { docentes, disciplinas } = useGlobalContext();
  const hasData = docentes.length && disciplinas.length;

  const handleChange = (event: SelectChangeEvent) => {
    setSolutionId(event.target.value as string);
    setCurrentTab(0); // Reset to first tab when changing solution
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const selectedSolution = solutionId
    ? historicoSolucoes.get(solutionId)
    : undefined;

  const getFriendlyAlgorithmName = (name: string | undefined) => {
    if (!name) return "Algoritmo";
    switch (name) {
      case "manual-insert":
        return "Inserção Manual";
      case "integer-solver":
        return "Solver Matemático Exato";
      case "tabu-search":
        return "Busca Tabu";
      case "simulated-annealing":
        return "Simulated Annealing";
      default:
        const found = AVAILABLE_ALGORITHMS.find(a => a.id === name || a.name === name);
        return found ? found.name : name;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          alignItems: "center",
        }}
      >
        {!hasData ? (
          <NoDataFound />
        ) : (
          <Paper
            elevation={2}
            sx={{
              padding: { xs: 2, md: 3 },
              borderRadius: 3,
              width: "100%",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              backgroundColor: "background.paper",
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight="600" color="primary.main">
                {t("dashboardTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("dashboardSubtitle")}
              </Typography>
            </Box>
            <FormControl sx={{ minWidth: 300 }}>
              <Select
                id="solution-select"
                value={solutionId}
                displayEmpty
                onChange={handleChange}
                disabled={historicoSolucoes.size === 0}
                sx={{
                  borderRadius: 2,
                  backgroundColor: "grey.50",
                }}
              >
                <MenuItem value="" disabled>
                  <em>{t("chooseSolution")}</em>
                </MenuItem>
                {Array.from(historicoSolucoes.values()).map((value) => (
                  <MenuItem key={`menu-item-${value.id}`} value={value.id}>
                    {value.datetime} - {getFriendlyAlgorithmName(value.algorithm?.name)}
                  </MenuItem>
                ))}
              </Select>
              {historicoSolucoes.size === 0 && (
                <FormHelperText>{t("noSolutionFound")}</FormHelperText>
              )}
            </FormControl>
          </Paper>
        )}

        {solutionId && selectedSolution && (
          <Box sx={{ width: "100%" }}>
            <Card elevation={2} sx={{ mb: 1, borderRadius: 2 }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                aria-label="statistics tabs"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  "& .MuiTab-root": {
                    minHeight: 64,
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "1rem",
                  },
                }}
              >
                <Tab 
                  icon={<DashboardIcon />} 
                  iconPosition="start" 
                  label={t("tabs.overview")} 
                  id="statistics-tab-0" 
                />
                <Tab 
                  icon={<WarningAmberIcon />} 
                  iconPosition="start" 
                  label={t("tabs.constraints")} 
                  id="statistics-tab-1" 
                />
                <Tab 
                  icon={<BalanceIcon />} 
                  iconPosition="start" 
                  label={t("tabs.workloadAnalysis")} 
                  id="statistics-tab-2" 
                />
                <Tab 
                  icon={<SettingsIcon />} 
                  iconPosition="start" 
                  label={t("tabs.configurations")} 
                  id="statistics-tab-3" 
                />
              </Tabs>
            </Card>

            <TabPanel value={currentTab} index={0}>
              <OverviewTab key={`overview-${solutionId}`} solucao={selectedSolution} />
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
              <ConstraintsTab key={`constraints-${solutionId}`} solucao={selectedSolution} />
            </TabPanel>

            <TabPanel value={currentTab} index={2}>
              <SingleSolutionWorkloadChart
                key={`workload-${solutionId}`}
                solution={selectedSolution}
              />
            </TabPanel>

            <TabPanel value={currentTab} index={3}>
              <ConfigurationsTab key={`config-${solutionId}`} solucao={selectedSolution} />
            </TabPanel>
          </Box>
        )}
      </Box>
    </Container>
  );
}
