"use client";

import React, { useState } from "react";
import {
  Button,
  Chip,
  Container,
  Grid2,
  Paper,
  Typography,
} from "@mui/material";
import ConstraintCard from "@/components/Constraints/ConstraintCard";
import Constraint from "@/TabuSearch/Classes/Constraint";
import { useAlgorithmContext } from "@/context/Algorithm";
import AddIcon from "@mui/icons-material/Add";
import { motion } from "framer-motion";
import { useAlertsContext } from "@/context/Alerts";

export interface ConstraintInterface {
  name: string;
  tipo: "Hard" | "Soft";
  penalidade: string;
  descricao: string;
  constraint: new (...args: any[]) => Constraint;
}

// const initialConstraints: ConstraintInterface[] = [
//   {
//     name: "Disciplina sem docente",
//     tipo: "Hard",
//     penalidade: "10",
//     descricao: "",
//     constraint: DisciplinaSemDocente,
//   },
//   {
//     name: "Choque de horários",
//     tipo: "Soft",
//     penalidade: "100",
//     descricao:
//       "Essa restrição verifica se os docentes foram atribuídos a disciplinas que ocorrem ao mesmo tempo ou apresentam conflitos de início e fim de aula.",
//     constraint: ChoqueDeHorarios,
//   },
//   {
//     name: "Atribuição sem formulário",
//     tipo: "Hard",
//     penalidade: "0",
//     descricao:
//       "Essa restrição verifica se o docente preencheu o formulário para as disciplinas que foi atribuído",
//     constraint: AtribuicaoSemFormulario,
//   },
//   // {
//   //   name:,
//   //   tipo:,
//   //   penalidade:,
//   //   descricao:,
//   //   constraint:
//   // }
//   //{ name: "Disciplina com sobreposição", tipo: "Soft", penalidade: "5" },
//   // Adicione outras restrições conforme necessário
// ];

export default function Restricoes() {
  const {
    hardConstraints,
    softConstraints,
    setHardConstraints,
    setSoftConstraints,
    allConstraints,
  } = useAlgorithmContext();

  const { addAlerta } = useAlertsContext();

  const [constraints, setConstraints] = useState<ConstraintInterface[]>(() => {
    const stateConstraints: ConstraintInterface[] = [];
    hardConstraints.forEach((value) => stateConstraints.push(value.toObject()));
    softConstraints.forEach((value) => stateConstraints.push(value.toObject()));
    return stateConstraints;
  });

  const [availableConstraints, setAvailableConstraints] = useState<
    Map<string, Constraint>
  >(() => {
    const available = new Map(allConstraints);
    hardConstraints.forEach((_, key) => available.delete(key));
    softConstraints.forEach((_, key) => available.delete(key));
    return available;
  });

  const handleConstraintChange = (
    name: string,
    newTipo: "Hard" | "Soft",
    newPenalidade: string
  ) => {
    setConstraints((prevConstraints) =>
      prevConstraints.map((constraint) =>
        constraint.name === name
          ? { ...constraint, tipo: newTipo, penalidade: newPenalidade }
          : constraint
      )
    );
  };

  const removeConstraint = (name: string) => {
    setConstraints((prevConstraints) =>
      prevConstraints.filter((constraint) => constraint.name !== name)
    );

    const constraintToRemove = constraints.find((c) => c.name === name);
    if (constraintToRemove) {
      setAvailableConstraints((prevAvailable) => {
        const newAvailable = new Map(prevAvailable);
        newAvailable.set(
          name,
          new constraintToRemove.constraint(
            constraintToRemove.name,
            constraintToRemove.descricao,
            constraintToRemove.tipo === "Hard",
            Number(constraintToRemove.penalidade)
          )
        );
        return newAvailable;
      });

      if (constraintToRemove.tipo === "Hard") {
        const newHardConstraints = hardConstraints;
        newHardConstraints.delete(constraintToRemove.name);
        setHardConstraints(newHardConstraints);
      } else {
        const newSoftConstraints = softConstraints;
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
    const newSoftConstraints = new Map<string, Constraint>();
    const newHardConstraints = new Map<string, Constraint>();

    for (const constraint of constraints) {
      const ConstraintClass = constraint.constraint;
      const newConstraintInstance = new ConstraintClass(
        constraint.name,
        constraint.descricao,
        constraint.tipo === "Hard",
        constraint.penalidade
      );

      if (constraint.tipo === "Hard") {
        newHardConstraints.set(constraint.name, newConstraintInstance);
      } else {
        newSoftConstraints.set(constraint.name, newConstraintInstance);
      }
    }

    setSoftConstraints(newSoftConstraints);
    setHardConstraints(newHardConstraints);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid2 container spacing={3} alignItems="center" justifyContent="center">
        {/* <Grid2 size={12}>
          <Typography variant="h4" align="center" color="text.secondary">
            Ajuste as configurações para definir as restrições
          </Typography>
        </Grid2> */}
        <Grid2 size={12} sx={{ mt: 4, textAlign: "center" }}>
          {/* Condicional para exibir título somente se houver restrições */}
          {Array.from(availableConstraints.keys()).length > 0 && (
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Restrições Disponíveis
            </Typography>
          )}

          {/* Exibir as restrições disponíveis com animação */}
          <Grid2 container spacing={2} justifyContent="center">
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
                    Não há restrições disponíveis para adicionar
                  </Typography>
                </Paper>
              </motion.div>
            ) : (
              Array.from(availableConstraints.keys()).map((name) => (
                <Grid2 key={name}>
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
                </Grid2>
              ))
            )}
          </Grid2>
        </Grid2>
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
        <Grid2
          size={12}
          alignItems="right"
          justifyContent="right"
          justifyItems="right"
          alignContent="right"
          textAlign="right"
        >
          <Button variant="contained" onClick={() => saveConstraints()}>
            Salvar
          </Button>
        </Grid2>
      </Grid2>
    </Container>
  );
}
