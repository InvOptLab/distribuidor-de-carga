"use client";

import type React from "react";

import { useSolutionHistory } from "@/context/SolutionHistory/hooks";
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Typography,
  Card,
  Tabs,
  Tab,
} from "@mui/material";
import { useState } from "react";
import SolutionHistoryDetails from "./_components/SolutionHistoryDetails";
import SingleSolutionWorkloadChart from "./_components/SingleSolutionWorkloadChart";

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
  const { historicoSolucoes } = useSolutionHistory();
  const [solutionId, setSolutionId] = useState("");
  const [currentTab, setCurrentTab] = useState(0);

  const handleChange = (event: SelectChangeEvent) => {
    setSolutionId(event.target.value as string);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const selectedSolution = solutionId
    ? historicoSolucoes.get(solutionId)
    : undefined;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center",
      }}
    >
      {/* Card para seleção de soluções */}
      <Card
        elevation={3}
        sx={{
          padding: 3,
          borderRadius: 3,
          width: "100%",
          maxWidth: 500,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Escolha uma solução para análise
        </Typography>
        <FormControl sx={{ minWidth: "13em", width: "100%" }}>
          <InputLabel id="solution-select-label">Solução</InputLabel>
          <Select
            labelId="solution-select-label"
            id="solution-select"
            value={solutionId}
            label="Solução"
            onChange={handleChange}
            disabled={historicoSolucoes.size === 0}
          >
            {Array.from(historicoSolucoes.values()).map((value) => (
              <MenuItem key={`menu-item-${value.id}`} value={value.id}>
                {value.datetime}
              </MenuItem>
            ))}
          </Select>
          {historicoSolucoes.size === 0 && (
            <FormHelperText>Nenhuma solução encontrada!</FormHelperText>
          )}
        </FormControl>
      </Card>

      {/* Tabs e conteúdo */}
      {solutionId && selectedSolution && (
        <Box sx={{ width: "100%" }}>
          <Card elevation={2} sx={{ mb: 2 }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              aria-label="statistics tabs"
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Tab label="Detalhes da Solução" id="statistics-tab-0" />
              <Tab label="Análise de Carga Didática" id="statistics-tab-1" />
            </Tabs>
          </Card>

          <TabPanel value={currentTab} index={0}>
            <SolutionHistoryDetails
              key={`details-${solutionId}`}
              solucao={selectedSolution}
            />
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <SingleSolutionWorkloadChart
              key={`workload-${solutionId}`}
              solution={selectedSolution}
            />
          </TabPanel>
        </Box>
      )}
    </Box>
  );
}
