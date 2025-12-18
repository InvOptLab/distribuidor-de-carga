"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Paper,
  Typography,
  useTheme,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ScienceIcon from "@mui/icons-material/Science"; // Ícone para simulação
import {
  RobustnessReport,
  NodeType,
  SimulationResult,
} from "@/complexNetworks/domain/types";
import { BipartiteGraph } from "@/complexNetworks/core/BipartiteGraph";
import { useNetworkHealth } from "../hooks/useNetworkHealth"; // Importar para pegar o simulador

// Importação dinâmica (ForceGraph)
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <Box p={5} display="flex" justifyContent="center">
      <CircularProgress />
    </Box>
  ),
});

interface NetworkVisualizerProps {
  graph: BipartiteGraph;
  report: RobustnessReport;
  hiddenCommunities: string[];
}

export default function NetworkVisualizer({
  graph,
  report,
  hiddenCommunities,
}: NetworkVisualizerProps) {
  const theme = useTheme();
  const { simulateCascadingFailure } = useNetworkHealth(); // Pegamos a função de simulação

  const [viewMode, setViewMode] = useState<"risk" | "community" | "simulation">(
    "risk"
  );
  const [simulationResult, setSimulationResult] =
    useState<SimulationResult | null>(null);

  // States de dimensão (código existente...)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({ width: containerRef.current.clientWidth, height: 600 });
    }
  }, []);

  // Handler para clique na aresta (Link)
  const handleLinkClick = useCallback(
    (link: any) => {
      if (viewMode !== "simulation") return;

      // A biblioteca pode retornar o objeto do nó ou só o ID, garantimos o ID
      const sourceId =
        typeof link.source === "object" ? link.source.id : link.source;
      const targetId =
        typeof link.target === "object" ? link.target.id : link.target;

      // Descobrir quem é Docente e quem é Turma (o grafo é não direcionado, pode vir invertido)
      let teacherId = sourceId;
      let classId = targetId;

      const nodeSource = graph.getNode(sourceId);
      if (nodeSource?.type === NodeType.TURMA) {
        teacherId = targetId;
        classId = sourceId;
      }

      // Executa simulação
      const result = simulateCascadingFailure(teacherId, classId);
      setSimulationResult(result || null);
    },
    [graph, viewMode, simulateCascadingFailure]
  );

  // Limpar simulação ao mudar de modo
  useEffect(() => {
    if (viewMode !== "simulation") setSimulationResult(null);
  }, [viewMode]);

  // Transforma os dados do BipartiteGraph para o formato do react-force-graph
  const graphData = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];

    // Otimização: Criar um mapa rápido de ID da Comunidade -> Cor
    // Isso evita usar .find() dentro do loop de nós, melhorando muito a performance
    const communityColorMap = new Map<string, string>();
    if (report && report.communities) {
      report.communities.forEach((c) => communityColorMap.set(c.id, c.color));
    }

    // Helper: Verifica se o nó deve ser exibido
    const isNodeVisible = (nodeId: string) => {
      const communityId = report.nodeCommunities.get(nodeId);
      // Se tiver comunidade E ela estiver na lista de ocultas -> False
      if (communityId && hiddenCommunities.includes(communityId)) {
        return false;
      }
      return true;
    };

    // Helper: Define cores para o modo de simulação
    const getSimulationColor = (id: string) => {
      if (!simulationResult) return theme.palette.action.disabled;

      // 1. Nós Foco (Causa)
      if (
        id === simulationResult.sourceTeacherId ||
        id === simulationResult.targetClassId
      ) {
        return theme.palette.info.main; // Azul
      }

      // 2. Nós Afetados (Consequência)
      const affected = simulationResult.affectedNodes.find((n) => n.id === id);
      if (affected) {
        return affected.status === "ORPHAN" ? "#FF0000" : "#FFA500"; // Vermelho ou Laranja
      }

      // 3. Todo o resto (Ghost effect)
      return "#eeeeee";
    };

    // --- 1. PROCESSAMENTO DOS NÓS ---
    // Filtramos primeiro para garantir que só processamos o que é visível
    const visibleDocentes = graph
      .getAllDocentes()
      .filter((d) => isNodeVisible(d.id));
    const visibleTurmas = graph
      .getAllTurmas()
      .filter((t) => isNodeVisible(t.id));

    const allVisibleNodes = [...visibleDocentes, ...visibleTurmas];

    allVisibleNodes.forEach((n) => {
      let color = theme.palette.grey[500];
      let val = 1;

      // Lógica de Cores baseada no Modo
      if (viewMode === "simulation") {
        if (simulationResult) {
          color = getSimulationColor(n.id);
          if (color !== "#eeeeee") val = 3; // Destaque de tamanho nos afetados
        } else {
          // Estado neutro da simulação
          color =
            n.type === NodeType.DOCENTE
              ? theme.palette.primary.light
              : theme.palette.secondary.light;
        }
      } else if (viewMode === "community") {
        // Otimização aplicada aqui: Busca direta no Map
        const communityId = report.nodeCommunities.get(n.id);
        if (communityId && communityColorMap.has(communityId)) {
          color = communityColorMap.get(communityId)!;
        } else {
          color = "#ccc";
        }
        val = n.type === NodeType.DOCENTE ? graph.getDegree(n.id) : 1;
      } else {
        // Risk Mode (Padrão)
        const isCritical = report.criticalTeachers.some(
          (c) => c.docenteId === n.id
        );
        const isLeaf = report.leafNodes.includes(n.id);

        if (n.type === NodeType.DOCENTE) {
          color = isCritical
            ? theme.palette.error.main
            : theme.palette.primary.main;
        } else {
          color = isLeaf
            ? theme.palette.warning.main
            : theme.palette.secondary.main;
        }
        val = n.type === NodeType.DOCENTE ? graph.getDegree(n.id) : 1;
      }

      nodes.push({
        id: n.id,
        name: n.label,
        group: n.type,
        val,
        color,
      });
    });

    // --- 2. PROCESSAMENTO DOS LINKS ---
    // Criamos um Set para verificação O(1) de quem está visível
    const visibleNodeIds = new Set(nodes.map((n) => n.id));
    const processedEdges = new Set<string>();

    // Iteramos apenas sobre os docentes que sabemos que estão visíveis
    // (Isso corrige o bug de iterar sobre graph.getAllDocentes() sem checar visibilidade)
    visibleDocentes.forEach((docente) => {
      const neighbors = graph.getNeighbors(docente.id);

      neighbors.forEach((turmaId) => {
        // Só cria o link se o ALVO (Turma) também estiver visível
        if (visibleNodeIds.has(turmaId)) {
          const edgeId = `${docente.id}-${turmaId}`;

          if (!processedEdges.has(edgeId)) {
            let linkColor = theme.palette.divider;
            let linkWidth = 1;

            // Estilização do Link na Simulação
            if (viewMode === "simulation" && simulationResult) {
              const isSelectedEdge =
                docente.id === simulationResult.sourceTeacherId &&
                turmaId === simulationResult.targetClassId;

              if (isSelectedEdge) {
                linkColor = theme.palette.info.main;
                linkWidth = 4;
              } else {
                linkColor = "rgba(0,0,0,0.05)"; // Quase invisível
              }
            }

            links.push({
              source: docente.id,
              target: turmaId,
              color: linkColor,
              width: linkWidth,
            });
            processedEdges.add(edgeId);
          }
        }
      });
    });

    return { nodes, links };
  }, [graph, report, theme, viewMode, simulationResult, hiddenCommunities]);

  return (
    <Box position="relative">
      {" "}
      {/* Container Relativo para posicionar o Card Flutuante */}
      <Paper
        ref={containerRef}
        elevation={3}
        sx={{
          mt: 3,
          p: 1,
          backgroundColor: theme.palette.mode === "dark" ? "#111" : "#fafafa",
        }}
      >
        {/* Header de Controle */}
        <Box
          p={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography variant="h6">Visualizador de Rede</Typography>
            <Typography variant="caption" color="text.secondary">
              {viewMode === "simulation"
                ? "MODO SIMULAÇÃO: Clique em uma linha de conexão para testar o impacto."
                : "Visualize a estrutura e saúde da grade."}
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newView) => newView && setViewMode(newView)}
            size="small"
          >
            <ToggleButton value="risk">Risco</ToggleButton>
            <ToggleButton value="community">Comunidades</ToggleButton>
            <ToggleButton value="simulation" color="warning">
              <ScienceIcon sx={{ mr: 1, fontSize: 18 }} />
              Simular
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {dimensions.width > 0 && (
          <ForceGraph2D
            width={dimensions.width}
            height={600}
            graphData={graphData}
            nodeLabel="name"
            nodeRelSize={6}
            // Propriedades Dinâmicas
            linkColor={(link: any) => link.color}
            linkWidth={(link: any) => link.width}
            // Interações
            onLinkClick={handleLinkClick}
            linkHoverPrecision={8}
            // No modo simulação, o cursor muda ao passar no link
            linkCanvasObjectMode={() =>
              viewMode === "simulation" ? "after" : undefined
            }
          />
        )}
      </Paper>
      {/* --- PAINEL FLUTUANTE DE RESULTADO --- */}
      {viewMode === "simulation" && simulationResult && (
        <Card
          sx={{
            position: "absolute",
            top: 100,
            right: 20,
            width: 350,
            zIndex: 10,
            boxShadow: 6,
            borderLeft: 6,
            borderColor: simulationResult.isSafe
              ? "success.main"
              : "error.main",
          }}
        >
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Typography variant="subtitle2" color="text.secondary">
                RESULTADO DA SIMULAÇÃO
              </Typography>
              <IconButton
                size="small"
                onClick={() => setSimulationResult(null)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography variant="h6" sx={{ mt: 1, lineHeight: 1.2 }}>
              Travar{" "}
              <b>{graph.getNode(simulationResult.sourceTeacherId)?.label}</b> na
              turma{" "}
              <b>{graph.getNode(simulationResult.targetClassId)?.label}</b>
            </Typography>

            <Divider sx={{ my: 2 }} />

            {simulationResult.isSafe ? (
              <Chip label="Impacto Sistêmico Baixo" color="success" />
            ) : (
              <Box>
                <Typography color="error" fontWeight="bold" gutterBottom>
                  ⚠️ Efeito Cascata Detectado!
                </Typography>
                <Typography variant="body2" paragraph>
                  Essa ação impede o professor de pegar outras turmas, gerando
                  os seguintes problemas:
                </Typography>

                {simulationResult.affectedNodes.map((node) => (
                  <Box
                    key={node.id}
                    mb={1}
                    p={1}
                    bgcolor="background.default"
                    borderRadius={1}
                  >
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" fontWeight="bold">
                        {node.label}
                      </Typography>
                      {node.status === "ORPHAN" ? (
                        <Chip label="Ficará Órfã" size="small" color="error" />
                      ) : (
                        <Chip
                          label="Ficará Crítica"
                          size="small"
                          color="warning"
                        />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Opções de professores caem de {node.previousDegree} para{" "}
                      {node.newDegree}.
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
