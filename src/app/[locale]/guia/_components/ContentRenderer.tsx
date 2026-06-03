"use client";

import React, { useState } from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Paper,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Divider,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Circle as CircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { ContentBlock } from "../_types/docs";

interface ContentRendererProps {
  block: ContentBlock;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ block }) => {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();

  switch (block.type) {
    case "heading":
      return (
        <Typography
          id={block.id}
          variant={block.level === 2 ? "h5" : "h6"}
          sx={{
            mt: block.level === 2 ? 5 : 3,
            mb: 2,
            color: "text.primary",
            scrollMarginTop: "100px",
            fontWeight: "bold",
          }}
        >
          {block.content}
        </Typography>
      );

    case "text":
      return (
        <Typography
          variant="body1"
          sx={{ mb: 2.5, color: "text.secondary", maxWidth: "80ch" }}
        >
          {block.content}
        </Typography>
      );

    case "list":
      return (
        <List sx={{ mb: 3, pl: 2, "& .MuiListItem-root": { py: 0.5 } }}>
          {block.items?.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {block.ordered ? (
                  <Chip
                    label={index + 1}
                    size="small"
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      bgcolor: "primary.main",
                      color: "white",
                    }}
                  />
                ) : (
                  <CircleIcon
                    sx={{ fontSize: 8, color: "primary.main", ml: 1 }}
                  />
                )}
              </ListItemIcon>
              <ListItemText
                primary={item}
                primaryTypographyProps={{
                  variant: "body1",
                  color: "text.secondary",
                }}
              />
            </ListItem>
          ))}
        </List>
      );

    case "image":
    case "gif":
      return (
        <Box sx={{ mb: 4, mt: 3 }}>
          <Paper
            elevation={0}
            sx={{
              overflow: "hidden",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              component="img"
              src={block.src}
              alt={block.alt}
              sx={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          </Paper>
          {block.caption && (
            <Typography
              variant="body2"
              sx={{
                mt: 1.5,
                textAlign: "center",
                color: "text.secondary",
                fontStyle: "italic",
              }}
            >
              {block.caption}
            </Typography>
          )}
        </Box>
      );

    case "video":
      return (
        <Box sx={{ mb: 4, mt: 3 }}>
          <Paper
            elevation={0}
            sx={{
              overflow: "hidden",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <Box
              sx={{
                position: "relative",
                paddingTop: "56.25%", // 16:9 aspect ratio
                width: "100%",
              }}
            >
              <iframe
                src={block.videoUrl}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video Tutorial"
              />
            </Box>
          </Paper>
          {block.caption && (
            <Typography
              variant="body2"
              sx={{
                mt: 1.5,
                textAlign: "center",
                color: "text.secondary",
                fontStyle: "italic",
              }}
            >
              {block.caption}
            </Typography>
          )}
        </Box>
      );

    case "callout":
      const calloutIcons = {
        info: <InfoIcon />,
        success: <LightbulbIcon />,
        warning: <WarningIcon />,
        error: <WarningIcon />,
      };
      return (
        <Alert
          severity={block.severity || "info"}
          icon={calloutIcons[block.severity || "info"]}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: "none",
            boxShadow: "none",
            "& .MuiAlert-icon": {
              alignItems: "center",
            },
            ...(block.severity === "info" && {
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              "& .MuiAlert-icon": {
                color: "primary.main",
              },
            }),
            ...(block.severity === "success" && {
              bgcolor: alpha("#10B981", 0.08),
              "& .MuiAlert-icon": {
                color: "#10B981",
              },
            }),
            ...(block.severity === "warning" && {
              bgcolor: alpha("#F59E0B", 0.08),
              "& .MuiAlert-icon": {
                color: "#F59E0B",
              },
            }),
          }}
        >
          {block.title && (
            <AlertTitle sx={{ fontWeight: 600 }}>{block.title}</AlertTitle>
          )}
          {block.content}
        </Alert>
      );

    case "stepper":
      return (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Stepper activeStep={activeStep} orientation="vertical">
            {block.steps?.map((step, index) => (
              <Step key={index}>
                <StepLabel
                  onClick={() => setActiveStep(index)}
                  sx={{
                    cursor: "pointer",
                    "& .MuiStepLabel-label": {
                      fontWeight: 600,
                      fontSize: "1rem",
                    },
                  }}
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {step.description}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {index < (block.steps?.length || 0) - 1 && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setActiveStep(index + 1)}
                        endIcon={<ArrowForwardIcon />}
                      >
                        Próximo
                      </Button>
                    )}
                    {index > 0 && (
                      <Button
                        size="small"
                        onClick={() => setActiveStep(index - 1)}
                      >
                        Voltar
                      </Button>
                    )}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      );

    case "action_button":
      return (
        <Box sx={{ my: 3 }}>
          <Button
            variant={block.variant || "contained"}
            color="primary"
            endIcon={<ArrowForwardIcon />}
            href={block.route}
            sx={{
              px: 3,
              py: 1.5,
              ...(block.variant === "outlined" && {
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                },
              }),
            }}
          >
            {block.buttonText}
          </Button>
        </Box>
      );

    case "divider":
      return <Divider sx={{ my: 4 }} />;

    default:
      return null;
  }
};
