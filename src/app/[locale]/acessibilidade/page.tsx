"use client";

import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Divider,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
  Button,
} from "@mui/material";
import {
  Accessibility,
  CheckCircle,
  ExpandMore,
  Keyboard,
  FormatSize,
  Contrast,
  Translate,
  RecordVoiceOver,
  TouchApp,
  Visibility,
  Navigation,
  Info,
  OpenInNew,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useAccessibility } from "@/context/Accessibility";

// Componente para demonstrar recursos de acessibilidade
interface AccessibilityFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  howToUse: string;
  demoAction?: () => void;
  demoLabel?: string;
}

const AccessibilityFeatureCard: React.FC<AccessibilityFeatureCardProps> = ({
  icon,
  title,
  description,
  howToUse,
  demoAction,
  demoLabel,
}) => {
  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
      role="article"
      aria-labelledby={`feature-${title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Box
            sx={{
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              borderRadius: "50%",
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-hidden="true"
          >
            {icon}
          </Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            id={`feature-${title.replace(/\s+/g, "-").toLowerCase()}`}
          >
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" component="p">
          {description}
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: "grey.100",
            borderRadius: 2,
            borderLeft: "4px solid",
            borderLeftColor: "primary.main",
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            {howToUse}
          </Typography>
        </Paper>
        {demoAction && demoLabel && (
          <Button
            variant="outlined"
            size="small"
            onClick={demoAction}
            sx={{ mt: 2 }}
            aria-label={demoLabel}
          >
            {demoLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para exibir conformidade WCAG
interface WcagCriterionProps {
  id: string;
  name: string;
  level: "A" | "AA" | "AAA";
  description: string;
  implementation: string;
}

const WcagCriterionRow: React.FC<WcagCriterionProps> = ({
  id,
  name,
  level,
  description,
  implementation,
}) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "A":
        return "success";
      case "AA":
        return "primary";
      case "AAA":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <TableRow
      sx={{ "&:hover": { bgcolor: "action.hover" } }}
      role="row"
      aria-label={`${id} - ${name}`}
    >
      <TableCell>
        <Typography variant="body2" fontWeight="bold">
          {id}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{name}</Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={level}
          size="small"
          color={getLevelColor(level) as "success" | "primary" | "secondary"}
          aria-label={`Level ${level}`}
        />
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <CheckCircle color="success" fontSize="small" aria-hidden="true" />
          <Typography variant="body2">{implementation}</Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default function AccessibilityPage() {
  const t = useTranslations("Pages.Accessibility");
  const { increaseFont, decreaseFont, toggleContrast } = useAccessibility();

  // Feature keys para mapeamento
  const featureKeys = [
    "skipLinks",
    "fontSize",
    "highContrast",
    "keyboardNav",
    "screenReader",
    "vlibras",
    "i18n",
    "focusIndicator",
  ] as const;

  // WCAG Criteria keys
  const wcagKeys = [
    "nonTextContent",
    "infoRelationships",
    "meaningfulSequence",
    "useOfColor",
    "contrastMinimum",
    "resizeText",
    "keyboard",
    "focusOrder",
    "linkPurpose",
    "languageOfPage",
    "focusVisible",
    "consistentNav",
    "errorIdentification",
    "labelsInstructions",
  ] as const;

  // Ícones para cada recurso
  const featureIcons: Record<string, React.ReactNode> = {
    skipLinks: <Navigation />,
    fontSize: <FormatSize />,
    highContrast: <Contrast />,
    keyboardNav: <Keyboard />,
    screenReader: <RecordVoiceOver />,
    vlibras: <RecordVoiceOver />,
    i18n: <Translate />,
    focusIndicator: <Visibility />,
  };

  // Demo actions para recursos interativos
  const getDemoAction = (key: string) => {
    switch (key) {
      case "fontSize":
        return increaseFont;
      case "highContrast":
        return toggleContrast;
      default:
        return undefined;
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 6 }}
      component="main"
      role="main"
      aria-label={t("title")}
    >
      <Box display="flex" flexDirection="column" gap={6}>
        {/* Hero Section */}
        <Box textAlign="center">
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={2}
            mb={3}
          >
            <Box
              sx={{
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                borderRadius: "50%",
                p: 2,
                display: "flex",
              }}
              aria-hidden="true"
            >
              <Accessibility sx={{ fontSize: 48 }} />
            </Box>
          </Box>
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            gutterBottom
            sx={{
              background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("title")}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            {t("subtitle")}
          </Typography>
          <Box display="flex" gap={2} justifyContent="center" sx={{ mt: 3 }}>
            <Chip
              icon={<Accessibility />}
              label="WCAG 2.1"
              color="primary"
              aria-label="Web Content Accessibility Guidelines 2.1"
            />
            <Chip
              icon={<CheckCircle />}
              label={t("badges.levelAA")}
              color="success"
              aria-label={t("badges.levelAA")}
            />
          </Box>
        </Box>

        {/* Introdução */}
        <Card elevation={2} role="region" aria-labelledby="intro-heading">
          <CardContent>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              id="intro-heading"
            >
              {t("intro.title")}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" component="p">
              {t("intro.p1")}
            </Typography>
            <Typography variant="body1">{t("intro.p2")}</Typography>
          </CardContent>
        </Card>

        {/* Recursos de Acessibilidade */}
        <Box component="section" aria-labelledby="features-heading">
          <Typography
            variant="h4"
            component="h2"
            fontWeight="bold"
            gutterBottom
            id="features-heading"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <TouchApp color="primary" aria-hidden="true" />
            {t("features.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary" component="p">
            {t("features.description")}
          </Typography>

          <Grid container spacing={3}>
            {featureKeys.map((key) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={key}>
                <AccessibilityFeatureCard
                  icon={featureIcons[key]}
                  title={t(`features.items.${key}.title`)}
                  description={t(`features.items.${key}.description`)}
                  howToUse={t(`features.items.${key}.howToUse`)}
                  demoAction={getDemoAction(key)}
                  demoLabel={
                    getDemoAction(key)
                      ? t(`features.items.${key}.demo`)
                      : undefined
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Atalhos de Teclado */}
        <Card elevation={2} role="region" aria-labelledby="shortcuts-heading">
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Keyboard color="primary" aria-hidden="true" />
              <Typography variant="h5" fontWeight="bold" id="shortcuts-heading">
                {t("shortcuts.title")}
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="body1" component="p">
              {t("shortcuts.description")}
            </Typography>

            <TableContainer component={Paper} elevation={0}>
              <Table aria-label={t("shortcuts.tableLabel")}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight="bold">
                        {t("shortcuts.columns.shortcut")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">
                        {t("shortcuts.columns.action")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {["tab", "shiftTab", "enter", "escape", "num1", "num2"].map(
                    (shortcutKey) => (
                      <TableRow key={shortcutKey}>
                        <TableCell>
                          <Chip
                            label={t(`shortcuts.items.${shortcutKey}.key`)}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: "monospace" }}
                          />
                        </TableCell>
                        <TableCell>
                          {t(`shortcuts.items.${shortcutKey}.action`)}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Conformidade WCAG */}
        <Box component="section" aria-labelledby="wcag-heading">
          <Typography
            variant="h4"
            component="h2"
            fontWeight="bold"
            gutterBottom
            id="wcag-heading"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <CheckCircle color="success" aria-hidden="true" />
            {t("wcag.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary" component="p">
            {t("wcag.description")}
          </Typography>

          {/* Accordion por Princípio WCAG */}
          {["perceivable", "operable", "understandable" /*, "robust"*/].map(
            (principle) => (
              <Accordion
                key={principle}
                defaultExpanded={principle === "perceivable"}
                sx={{ mb: 2 }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls={`${principle}-content`}
                  id={`${principle}-header`}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h6" fontWeight="bold">
                      {t(`wcag.principles.${principle}.title`)}
                    </Typography>
                    <Chip
                      label={t(`wcag.principles.${principle}.criteriaCount`)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="p"
                  >
                    {t(`wcag.principles.${principle}.description`)}
                  </Typography>
                  <TableContainer component={Paper} elevation={0}>
                    <Table
                      size="small"
                      aria-label={t(`wcag.principles.${principle}.tableLabel`)}
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell width="10%">
                            <Typography fontWeight="bold">
                              {t("wcag.columns.id")}
                            </Typography>
                          </TableCell>
                          <TableCell width="20%">
                            <Typography fontWeight="bold">
                              {t("wcag.columns.criterion")}
                            </Typography>
                          </TableCell>
                          <TableCell width="10%">
                            <Typography fontWeight="bold">
                              {t("wcag.columns.level")}
                            </Typography>
                          </TableCell>
                          <TableCell width="30%">
                            <Typography fontWeight="bold">
                              {t("wcag.columns.description")}
                            </Typography>
                          </TableCell>
                          <TableCell width="30%">
                            <Typography fontWeight="bold">
                              {t("wcag.columns.implementation")}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {wcagKeys
                          .filter(
                            (key) =>
                              t.raw(`wcag.criteria.${key}.principle`) ===
                              principle,
                          )
                          .map((key) => (
                            <WcagCriterionRow
                              key={key}
                              id={t(`wcag.criteria.${key}.id`)}
                              name={t(`wcag.criteria.${key}.name`)}
                              level={
                                t(`wcag.criteria.${key}.level`) as
                                  | "A"
                                  | "AA"
                                  | "AAA"
                              }
                              description={t(
                                `wcag.criteria.${key}.description`,
                              )}
                              implementation={t(
                                `wcag.criteria.${key}.implementation`,
                              )}
                            />
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ),
          )}
        </Box>

        {/* Recursos Adicionais */}
        <Card elevation={2} role="region" aria-labelledby="resources-heading">
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Info color="primary" aria-hidden="true" />
              <Typography variant="h5" fontWeight="bold" id="resources-heading">
                {t("resources.title")}
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              {["wcagGuide", "vlibrasInfo", "accessibilityStatement"].map(
                (resource) => (
                  <Grid size={{ xs: 12, md: 4 }} key={resource}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 3,
                        height: "100%",
                        transition: "transform 0.2s",
                        "&:hover": { transform: "translateY(-2px)" },
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {t(`resources.items.${resource}.title`)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        component="p"
                      >
                        {t(`resources.items.${resource}.description`)}
                      </Typography>
                      <Link
                        href={t(`resources.items.${resource}.link`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          fontWeight: "bold",
                        }}
                        aria-label={`${t(
                          `resources.items.${resource}.title`,
                        )} - ${t("resources.openNewTab")}`}
                      >
                        {t("resources.learnMore")}
                        <OpenInNew fontSize="small" aria-hidden="true" />
                      </Link>
                    </Paper>
                  </Grid>
                ),
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            borderRadius: 3,
          }}
          role="region"
          aria-labelledby="feedback-heading"
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            id="feedback-heading"
          >
            {t("feedback.title")}
          </Typography>
          <Typography variant="body1" component="p">
            {t("feedback.description")}
          </Typography>
          <Link
            href="https://github.com/InvOptLab/distribuidor-de-carga/issues"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: "inherit",
              textDecoration: "underline",
              fontWeight: "bold",
              "&:hover": { opacity: 0.8 },
            }}
            aria-label={t("feedback.linkLabel")}
          >
            {t("feedback.linkText")}
            <OpenInNew
              fontSize="small"
              sx={{ ml: 0.5, verticalAlign: "middle" }}
              aria-hidden="true"
            />
          </Link>
        </Paper>
      </Box>
    </Container>
  );
}
