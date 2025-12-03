"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Typography,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import { motion, AnimatePresence } from "framer-motion";
import { useAlgorithmContext } from "@/context/Algorithm";
import { useAlertsContext } from "@/context/Alerts";
import type Constraint from "@/algoritmo/abstractions/Constraint";
import ConfigConstraintCard from "@/components/Constraints/ConfigConstraintCard";

export default function ConstraintsConfig() {
  const {
    hardConstraints,
    softConstraints,
    setHardConstraints,
    setSoftConstraints,
    allConstraints,
  } = useAlgorithmContext();

  const { addAlerta } = useAlertsContext();

  // Estado contendo as instâncias ativas das constraints
  const [activeConstraints, setActiveConstraints] = useState<Constraint<any>[]>(
    []
  );

  // Estado contendo as instâncias disponíveis para adicionar
  const [availableConstraints, setAvailableConstraints] = useState<
    Map<string, Constraint<any>>
  >(new Map());

  // Inicializar constraints ativas e disponíveis
  useEffect(() => {
    const active: Constraint<any>[] = [];
    const available = new Map(allConstraints);

    // Adicionar constraints hard ativas
    hardConstraints.forEach((constraint, key) => {
      active.push(constraint);
      available.delete(key);
    });

    // Adicionar constraints soft ativas
    softConstraints.forEach((constraint, key) => {
      active.push(constraint);
      available.delete(key);
    });

    setActiveConstraints(active);
    setAvailableConstraints(available);
  }, [hardConstraints, softConstraints, allConstraints]);

  const handleConstraintChange = (constraintInstance: Constraint<any>) => {
    // Atualizar a instância no array
    setActiveConstraints((prev) => {
      return prev.map((c) =>
        c.name === constraintInstance.name ? constraintInstance : c
      );
    });
  };

  const removeConstraint = (name: string) => {
    const constraintToRemove = activeConstraints.find((c) => c.name === name);
    if (!constraintToRemove) {
      // console.error("Constraint não encontrada:", name);
      return;
    }

    // Remover do estado ativo usando filter para garantir imutabilidade
    setActiveConstraints((prev) => {
      const updated = prev.filter((c) => c.name !== name);

      return updated;
    });

    // Adicionar de volta às disponíveis
    setAvailableConstraints((prev) => {
      const updated = new Map(prev);
      updated.set(name, constraintToRemove);

      return updated;
    });

    // Remover dos contextos
    if (constraintToRemove.isHard) {
      const newHardConstraints = new Map(hardConstraints);
      newHardConstraints.delete(name);
      setHardConstraints(newHardConstraints);
    } else {
      const newSoftConstraints = new Map(softConstraints);
      newSoftConstraints.delete(name);
      setSoftConstraints(newSoftConstraints);
    }

    addAlerta(`Restrição "${name}" removida com sucesso!`, "info");
  };

  const addConstraint = (name: string) => {
    const constraintToAdd = availableConstraints.get(name);
    if (!constraintToAdd) {
      return;
    }

    // Remover das disponíveis
    setAvailableConstraints((prev) => {
      const updated = new Map(prev);
      updated.delete(name);
      return updated;
    });

    // Adicionar às ativas
    setActiveConstraints((prev) => {
      const updated = [...prev, constraintToAdd];
      return updated;
    });

    addAlerta(`Restrição "${name}" adicionada com sucesso!`, "success");
  };

  const saveConstraints = () => {
    const newSoftConstraints = new Map<string, Constraint<any>>();
    const newHardConstraints = new Map<string, Constraint<any>>();

    // Separar constraints por tipo
    activeConstraints.forEach((constraint) => {
      if (constraint.isHard) {
        newHardConstraints.set(constraint.name, constraint);
      } else {
        newSoftConstraints.set(constraint.name, constraint);
      }
    });

    setSoftConstraints(newSoftConstraints);
    setHardConstraints(newHardConstraints);

    addAlerta("Configurações de restrições salvas com sucesso!", "success");
  };

  const activeCount = activeConstraints.length;
  const totalCount = activeCount + availableConstraints.size;
  const hardCount = activeConstraints.filter((c) => c.isHard).length;
  const softCount = activeCount - hardCount;

  return (
    <Box>
      {/* Estatísticas */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: "primary.50",
          border: "1px solid",
          borderColor: "primary.main",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              📊 Estatísticas:
            </Typography>
            <Chip
              label={`${activeCount}/${totalCount} ativas`}
              color="primary"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label={`${hardCount} rígidas`}
              color="error"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label={`${softCount} flexíveis`}
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Alert informativo */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          💡 Configuração de Restrições
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
          <strong>Rígidas:</strong> Devem ser sempre satisfeitas (violações são
          críticas)
          <br />
          <strong>Flexíveis:</strong> Preferíveis mas não obrigatórias
          (violações têm penalidade configurável)
        </Typography>
      </Alert>

      {/* Restrições Disponíveis */}
      {availableConstraints.size > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}
          >
            📋 Restrições Disponíveis para Adicionar
          </Typography>

          <Paper
            elevation={2}
            sx={{
              p: 2.5,
              backgroundColor: "grey.50",
              borderRadius: 2,
              border: "2px dashed",
              borderColor: "primary.main",
            }}
          >
            <Grid container spacing={1.5}>
              <AnimatePresence>
                {Array.from(availableConstraints.keys()).map((name) => (
                  <Grid key={name}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Chip
                        label={name}
                        deleteIcon={<AddIcon fontSize="small" />}
                        onDelete={() => addConstraint(name)}
                        color="primary"
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          height: 36,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            boxShadow: "0 0 12px rgba(25, 118, 210, 0.4)",
                            borderColor: "primary.dark",
                            transform: "scale(1.05)",
                            backgroundColor: "primary.main",
                            color: "white",
                            "& .MuiChip-deleteIcon": {
                              color: "white",
                            },
                          },
                        }}
                      />
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          </Paper>
        </Box>
      )}

      <Divider sx={{ my: 4 }} />

      {/* Restrições Ativas */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 700, color: "success.main" }}
        >
          ✅ Restrições Ativas
        </Typography>

        {activeConstraints.length === 0 ? (
          <Paper
            elevation={2}
            sx={{
              p: 4,
              textAlign: "center",
              backgroundColor: "grey.50",
              borderRadius: 2,
              border: "2px dashed",
              borderColor: "grey.400",
            }}
          >
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontStyle: "italic", mb: 1 }}
            >
              🚫 Nenhuma restrição ativa
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adicione restrições acima para configurar o algoritmo
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence mode="popLayout">
              {activeConstraints.map((constraint) => (
                <Grid
                  size={12}
                  key={`${constraint.name}-${
                    constraint.isHard ? "hard" : "soft"
                  }`}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.4 }}
                    layout
                  >
                    <ConfigConstraintCard
                      constraint={constraint}
                      onChange={handleConstraintChange}
                      onDelete={removeConstraint}
                      showInformations={addAlerta}
                    />
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </Box>

      {/* Botão Salvar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 4,
          pt: 3,
          borderTop: "2px solid",
          borderColor: "grey.300",
        }}
      >
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={saveConstraints}
          size="large"
          disabled={activeConstraints.length === 0}
          sx={{
            py: 1.5,
            px: 4,
            fontWeight: 700,
            fontSize: "1rem",
          }}
        >
          Salvar Todas as Configurações
        </Button>
      </Box>
    </Box>
  );
}
