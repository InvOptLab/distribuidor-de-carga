import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { useTranslations } from "next-intl";

interface ConstraintDiagnosticsProps {
  ocorrencias: Map<
    string,
    {
      label: string;
      qtd: number;
      items?: string[];
    }[]
  >;
}

export default function ConstraintDiagnostics({
  ocorrencias,
}: ConstraintDiagnosticsProps) {
  const t = useTranslations("Pages.Statistics.Constraints");

  // Coletar apenas as restrições que possuem casos problemáticos (items com tamanho > 0)
  const problematicConstraints: {
    constraintName: string;
    label: string;
    qtd: number;
    items: string[];
  }[] = [];

  ocorrencias.forEach((constraintsArray, constraintName) => {
    constraintsArray.forEach((constraint) => {
      if (constraint.qtd > 0 && constraint.items && constraint.items.length > 0) {
        problematicConstraints.push({
          constraintName,
          label: constraint.label,
          qtd: constraint.qtd,
          items: constraint.items,
        });
      }
    });
  });

  if (problematicConstraints.length === 0) {
    return null; // Não renderizar se não houver problemas com detalhes
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontWeight: 600,
          color: "text.primary",
        }}
      >
        <ErrorOutlineIcon color="error" /> {t("diagnosticsTitle")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("diagnosticsSubtitle")}
      </Typography>

      {problematicConstraints.map((problem, index) => (
        <Accordion
          key={`diagnostic-accordion-${index}`}
          elevation={1}
          sx={{
            mb: 1,
            borderRadius: 2,
            "&:before": { display: "none" },
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: "error.50",
              borderBottom: "1px solid",
              borderColor: "error.100",
              "& .MuiAccordionSummary-content": {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <WarningAmberIcon color="error" />
              <Typography variant="subtitle1" fontWeight="500" color="error.dark">
                {problem.constraintName}
              </Typography>
            </Box>
            <Chip
              label={`${problem.qtd} ${t("reportedCases")}`}
              color="error"
              size="small"
              sx={{ fontWeight: "bold" }}
            />
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Paper elevation={0}>
              <Box sx={{ px: 3, py: 2, backgroundColor: "grey.50" }}>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  color="text.secondary"
                  gutterBottom
                >
                  {problem.label}
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <List dense disablePadding>
                  {problem.items.map((item, itemIdx) => (
                    <ListItem key={`problem-item-${index}-${itemIdx}`} disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <ArrowRightIcon fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
