"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
  Collapse,
  IconButton,
  Avatar,
  Badge,
  styled,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import ClassIcon from "@mui/icons-material/Class";
import { CommunityMetric, NodeType } from "@/complexNetworks/domain/types";
import { BipartiteGraph } from "@/complexNetworks/core/BipartiteGraph";

// Helper para o botão de expandir
const ExpandMore = styled((props: any) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

interface CommunityDetailsProps {
  graph: BipartiteGraph;
  communities: CommunityMetric[];
}

export default function CommunityDetails({
  graph,
  communities,
}: CommunityDetailsProps) {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        Detalhamento dos Grupos
        <Chip
          label={`${communities.length} Comunidades`}
          color="primary"
          variant="outlined"
        />
      </Typography>

      <Grid container spacing={3}>
        {communities.map((community, index) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={community.id}>
            <CommunityCard community={community} graph={graph} index={index} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// Sub-componente para o Card Individual
function CommunityCard({
  community,
  graph,
  index,
}: {
  community: CommunityMetric;
  graph: BipartiteGraph;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  // Separar membros em Docentes e Turmas
  const members = community.nodes
    .map((nodeId) => graph.getNode(nodeId))
    .filter((n) => n !== undefined);
  const docentes = members.filter((n) => n!.type === NodeType.DOCENTE);
  const turmas = members.filter((n) => n!.type === NodeType.TURMA);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card
      elevation={3}
      sx={{ height: "fit-content", borderTop: 6, borderColor: community.color }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: community.color }} aria-label="recipe">
            {index + 1}
          </Avatar>
        }
        action={
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        }
        title={
          <Typography variant="h6" component="div">
            {community.label || `Comunidade ${index + 1}`}
          </Typography>
        }
        subheader={
          <Box display="flex" gap={1} mt={0.5}>
            <Chip
              icon={<PersonIcon />}
              label={`${docentes.length} Docentes`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<ClassIcon />}
              label={`${turmas.length} Turmas`}
              size="small"
              variant="outlined"
            />
          </Box>
        }
      />

      {/* Resumo Visível (Primeiros 3 itens de cada) */}
      <CardContent sx={{ py: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Principais Membros:
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={0.5}>
          {docentes.slice(0, 3).map((d) => (
            <Chip
              key={d!.id}
              label={d!.label}
              size="small"
              sx={{ opacity: 0.9 }}
            />
          ))}
          {docentes.length > 3 && (
            <Chip
              label={`+${docentes.length - 3}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Divider sx={{ my: 1 }}>
            <Chip label="Docentes" size="small" />
          </Divider>
          <List
            dense
            sx={{
              maxHeight: 200,
              overflow: "auto",
              bgcolor: "background.paper",
            }}
          >
            {docentes.map((d) => (
              <ListItem key={d!.id}>
                <PersonIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "text.secondary" }}
                />
                <ListItemText primary={d!.label} />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 1 }}>
            <Chip label="Disciplinas" size="small" />
          </Divider>
          <List
            dense
            sx={{
              maxHeight: 200,
              overflow: "auto",
              bgcolor: "background.paper",
            }}
          >
            {turmas.map((t) => (
              <ListItem key={t!.id}>
                <ClassIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "text.secondary" }}
                />
                <ListItemText primary={t!.label} secondary={`ID: ${t!.id}`} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Collapse>
    </Card>
  );
}
