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
  Switch,
  FormControlLabel,
  styled,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import ClassIcon from "@mui/icons-material/Class";
import { CommunityMetric, NodeType } from "@/complexNetworks/domain/types";
import { BipartiteGraph } from "@/complexNetworks/core/BipartiteGraph";

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
  hiddenCommunities: string[]; // <--- Recebe a lista de ocultos
  onToggleCommunity: (id: string) => void; // <--- Recebe a função de toggle
}

export default function CommunityDetails({
  graph,
  communities,
  hiddenCommunities,
  onToggleCommunity,
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
          label={`${communities.length - hiddenCommunities.length} Visíveis`}
          color="primary"
          variant="outlined"
        />
      </Typography>

      <Grid container spacing={3}>
        {communities.map((community, index) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={community.id}>
            <CommunityCard
              community={community}
              graph={graph}
              index={index}
              isVisible={!hiddenCommunities.includes(community.id)} // <--- Verifica se está visível
              onToggle={() => onToggleCommunity(community.id)} // <--- Ação
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// Props atualizadas do Card
interface CommunityCardProps {
  community: CommunityMetric;
  graph: BipartiteGraph;
  index: number;
  isVisible: boolean;
  onToggle: () => void;
}

function CommunityCard({
  community,
  graph,
  index,
  isVisible,
  onToggle,
}: CommunityCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Filtra membros...
  const members = community.nodes
    .map((nodeId) => graph.getNode(nodeId))
    .filter((n) => n !== undefined);
  const docentes = members.filter((n) => n!.type === NodeType.DOCENTE);
  const turmas = members.filter((n) => n!.type === NodeType.TURMA);

  return (
    <Card
      elevation={isVisible ? 3 : 1}
      sx={{
        height: "fit-content",
        borderTop: 6,
        borderColor: isVisible ? community.color : "action.disabledBackground", // Cor cinza se inativo
        opacity: isVisible ? 1 : 0.6, // Transparência visual
        transition: "all 0.3s ease",
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            sx={{ bgcolor: isVisible ? community.color : "grey.500" }}
            aria-label="recipe"
          >
            {index + 1}
          </Avatar>
        }
        action={
          <Box display="flex" alignItems="center">
            {/* O Switch de Ativar/Desativar */}
            <FormControlLabel
              control={
                <Switch
                  checked={isVisible}
                  onChange={onToggle}
                  size="small"
                  color="primary"
                />
              }
              label={isVisible ? "Ativo" : "Inativo"}
              labelPlacement="start"
              sx={{ mr: 1, "& .MuiTypography-root": { fontSize: "0.8rem" } }}
            />

            <ExpandMore
              expand={expanded}
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </Box>
        }
        title={
          <Typography
            variant="h6"
            component="div"
            color={isVisible ? "text.primary" : "text.disabled"}
          >
            {community.label || `Comunidade ${index + 1}`}
          </Typography>
        }
        subheader={
          // ... (conteúdo igual) ...
          <Box display="flex" gap={1} mt={0.5}>
            <Chip
              icon={<PersonIcon />}
              label={`${docentes.length}`}
              size="small"
              variant="outlined"
              disabled={!isVisible}
            />
            <Chip
              icon={<ClassIcon />}
              label={`${turmas.length}`}
              size="small"
              variant="outlined"
              disabled={!isVisible}
            />
          </Box>
        }
      />

      {/* ... (Restante do CardContent e Collapse igual ao anterior) ... */}
      <CardContent sx={{ py: 1 }}>
        {/* Apenas adicione a verificação isVisible se quiser esconder o conteúdo também, 
             mas geralmente deixar transparente (opacity) já basta. */}
        {/* ... código existente ... */}
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
              disabled={!isVisible}
            />
          ))}
          {/* ... */}
        </Box>
      </CardContent>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        {/* ... Conteúdo expandido (Listas) ... */}
        <CardContent>
          {/* Copie o conteúdo das listas do código anterior aqui */}
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
                <ListItemText
                  primary={d!.label}
                  sx={{ color: isVisible ? "text.primary" : "text.disabled" }}
                />
              </ListItem>
            ))}
          </List>
          {/* Repetir para turmas... */}
        </CardContent>
      </Collapse>
    </Card>
  );
}
