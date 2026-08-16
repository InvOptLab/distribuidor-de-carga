"use client";

import React, { useState } from "react";
import {
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import ConstraintCard from "@/components/Constraints/ConstraintCard";
import { useAlgorithmContext } from "@/context/Algorithm";
import AddIcon from "@mui/icons-material/Add";
import { motion } from "framer-motion";
import { useAlertsContext } from "@/context/Alerts";
import Constraint from "@/algoritmo/abstractions/Constraint";
import { useTranslations } from "next-intl";

export interface ConstraintInterface {
  name: string;
  tipo: "Hard" | "Soft";
  penalidade: string;
  descricao: string;
  constraint: new (...args: any[]) => Constraint<any>;
}

export default function Restricoes() {
  const {
    hardConstraints,
    softConstraints,
    setHardConstraints,
    setSoftConstraints,
    allConstraints,
  } = useAlgorithmContext();

  const { addAlerta } = useAlertsContext();
  const t = useTranslations("ConstraintsPage");

  const [constraints, setConstraints] = useState<ConstraintInterface[]>(() => {
    const stateConstraints: ConstraintInterface[] = [];
    hardConstraints.forEach((value) => stateConstraints.push(value.toObject()));
    softConstraints.forEach((value) => stateConstraints.push(value.toObject()));
    return stateConstraints;
  });

  const [availableConstraints, setAvailableConstraints] = useState<
    Map<string, Constraint<any>>
  >(() => {
    const available = new Map(allConstraints);
    hardConstraints.forEach((_, key) => available.delete(key));
    softConstraints.forEach((_, key) => available.delete(key));
    return available;
  });

  const handleConstraintChange = (
    name: string,
    newTipo: "Hard" | "Soft",
    newPenalidade: string,
  ) => {
    setConstraints((prevConstraints) =>
      prevConstraints.map((constraint) =>
        constraint.name === name
          ? { ...constraint, tipo: newTipo, penalidade: newPenalidade }
          : constraint,
      ),
    );
  };

  const removeConstraint = (name: string) => {
    setConstraints((prevConstraints) =>
      prevConstraints.filter((constraint) => constraint.name !== name),
    );

    const constraintToRemove = constraints.find((c) => c.name === name);
    if (constraintToRemove) {
      setAvailableConstraints((prevAvailable) => {
        const newAvailable = new Map(prevAvailable);
        const instance = allConstraints.get(name);
        if (instance) {
          instance.isHard = constraintToRemove.tipo === "Hard";
          instance.penalty = Number(constraintToRemove.penalidade);
          newAvailable.set(name, instance);
        }
        return newAvailable;
      });

      if (constraintToRemove.tipo === "Hard") {
        const newHardConstraints = new Map(hardConstraints);
        newHardConstraints.delete(constraintToRemove.name);
        setHardConstraints(newHardConstraints);
      } else {
        const newSoftConstraints = new Map(softConstraints);
        newSoftConstraints.delete(constraintToRemove.name);
        setSoftConstraints(newSoftConstraints);
      }
    }
  };

  const addConstraint = (name: string) => {
    const constraintToAdd = availableConstraints.get(name);
    if (constraintToAdd) {
      setAvailableConstraints((prevAvailable) => {
        const newAvailable = new Map(prevAvailable);
        newAvailable.delete(name);
        return newAvailable;
      });

      setConstraints((prevConstraints) => [
        ...prevConstraints,
        constraintToAdd.toObject(),
      ]);
    }
  };

  const saveConstraints = () => {
    const newSoftConstraints = new Map<string, Constraint<any>>();
    const newHardConstraints = new Map<string, Constraint<any>>();

    for (const constraint of constraints) {
      const instance = allConstraints.get(constraint.name);
      if (instance) {
        instance.isHard = constraint.tipo === "Hard";
        instance.penalty = Number(constraint.penalidade);

        if (constraint.tipo === "Hard") {
          newHardConstraints.set(constraint.name, instance);
        } else {
          newSoftConstraints.set(constraint.name, instance);
        }
      }
    }

    setSoftConstraints(newSoftConstraints);
    setHardConstraints(newHardConstraints);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3} alignItems="center" justifyContent="center">
        {/* <Grid size={12}>
          <Typography variant="h4" align="center" color="text.secondary">
            Ajuste as configurações para definir as restrições
          </Typography>
        </Grid> */}
        <Grid size={12} sx={{ mt: 4, textAlign: "center" }}>
          {/* Condicional para exibir título somente se houver restrições */}
          {Array.from(availableConstraints.keys()).length > 0 && (
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {t("availableConstraints")}
            </Typography>
          )}

          {/* Exibir as restrições disponíveis com animação */}
          <Grid container spacing={2} justifyContent="center">
            {Array.from(availableConstraints.keys()).length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Paper com mensagem de lista vazia */}
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "grey.100",
                    display: "inline-block",
                    mt: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: "italic" }}
                  >
                    {t("noConstraintsAvailable")}
                  </Typography>
                </Paper>
              </motion.div>
            ) : (
              Array.from(availableConstraints.keys()).map((name) => (
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
                        px: 0,
                        py: 0,
                        fontWeight: "medium",
                        transition: "background-color 0.2s ease",
                        "&:hover": {
                          boxShadow: "0 0 6px rgba(0, 123, 255, 0.4)",
                          borderColor: "primary.dark",
                          fontWeight: "bold",
                          "& .MuiChip-deleteIcon": {
                            color: "primary.main", // Ícone verde no hover
                          },
                        },
                      }}
                    />
                  </motion.div>
                </Grid>
              ))
            )}
          </Grid>
        </Grid>
        {constraints.map((constraint) => (
          <ConstraintCard
            key={constraint.name}
            name={constraint.name}
            tipoInicial={constraint.tipo}
            penalidadeInicial={constraint.penalidade}
            descricao={constraint.descricao}
            onChange={handleConstraintChange}
            onDelete={removeConstraint}
            showInformations={addAlerta}
            constraint={constraint.constraint}
          />
        ))}
        <Grid
          size={12}
          alignItems="right"
          justifyContent="right"
          justifyItems="right"
          alignContent="right"
          textAlign="right"
        >
          <Button variant="contained" onClick={() => saveConstraints()}>
            {t("save")}
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
