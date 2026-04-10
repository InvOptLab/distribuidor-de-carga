"use client";

import * as React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useGlobalContext } from "@/context/Global";
import { Disciplina, Docente } from "@/context/Global/utils";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";
import CustomSelector from "./_components/CustomSelector";
import { Button, Grid } from "@mui/material";

function not<T>(a: readonly T[], b: readonly T[]) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection<T>(a: readonly T[], b: readonly T[]) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union<T>(a: readonly T[], b: readonly T[]) {
  return [...a, ...not(b, a)];
}

export default function Seletor() {
  const { docentes, setDocentes, disciplinas, setDisciplinas } =
    useGlobalContext(); // Pega docentes e disciplinas do contexto global
  const [checked, setChecked] = React.useState<
    readonly (Docente | Disciplina)[]
  >([]);
  const [selectedEntity, setSelectedEntity] = React.useState<
    "docente" | "disciplina"
  >("docente"); // Estado para selecionar a entidade atual

  const { cleanSolucaoAtual } = useSolutionHistory();

  const handleToggleEntity = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked([]); // Limpa os itens selecionados ao mudar a entidade
    setSelectedEntity(
      (event.target as HTMLInputElement).value as "docente" | "disciplina"
    );
  };

  // Filtra docentes ou disciplinas com base na seleção do botão de rádio
  const left =
    selectedEntity === "docente"
      ? docentes.filter((docente) => docente.ativo)
      : disciplinas.filter((disciplina) => disciplina.ativo);

  const right =
    selectedEntity === "docente"
      ? docentes.filter((docente) => !docente.ativo)
      : disciplinas.filter((disciplina) => !disciplina.ativo);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value: Docente | Disciplina) => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items: readonly (Docente | Disciplina)[]) =>
    intersection(checked, items).length;

  const handleToggleAll = (items: readonly (Docente | Disciplina)[]) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const updateAtivos = (updatedLeft: (Docente | Disciplina)[]) => {
    if (selectedEntity === "docente") {
      // Atualiza os docentes
      const updatedDocentes = docentes.map((docente) => ({
        ...docente,
        ativo: updatedLeft.includes(docente),
      }));
      setDocentes(updatedDocentes);
    } else {
      // Atualiza as disciplinas
      const updatedDisciplinas = disciplinas.map((disciplina) => ({
        ...disciplina,
        ativo: updatedLeft.includes(disciplina),
      }));
      setDisciplinas(updatedDisciplinas);
    }

    cleanSolucaoAtual(); // Limpa a solução atual
  };

  const handleCheckedRight = () => {
    const updatedLeft = not(left, leftChecked);
    updateAtivos(updatedLeft);
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    const updatedLeft = left.concat(rightChecked);
    updateAtivos(updatedLeft);
    setChecked(not(checked, rightChecked));
  };

  const customList = (
    title: React.ReactNode,
    items: readonly (Disciplina | Docente)[]
  ) => (
    <CustomSelector
      key={`list_${title}`}
      title={title}
      checked={checked}
      handleToggle={handleToggle}
      handleToggleAll={handleToggleAll}
      items={items}
      numberOfChecked={numberOfChecked}
    />
  );

  return (
    <>
      {docentes.length > 0 && disciplinas.length > 0 && (
        <div>
          <RadioGroup
            row
            value={selectedEntity}
            onChange={handleToggleEntity}
            sx={{ mb: 2, display: "flex", justifyContent: "center" }}
          >
            <FormControlLabel
              value="docente"
              control={<Radio />}
              label="Docentes"
            />
            <FormControlLabel
              value="disciplina"
              control={<Radio />}
              label="Disciplinas"
            />
          </RadioGroup>
          <Grid
            container
            spacing={2}
            sx={{ justifyContent: "center", alignItems: "center" }}
          >
            <Grid>{customList("Ativos", left)}</Grid>
            <Grid>
              <Grid container direction="column" sx={{ alignItems: "center" }}>
                <Button
                  sx={{ my: 0.5 }}
                  variant="contained"
                  size="small"
                  onClick={handleCheckedRight}
                  disabled={leftChecked.length === 0}
                  aria-label="move selected right"
                >
                  <ChevronRightIcon />
                </Button>
                <Button
                  sx={{ my: 0.5 }}
                  variant="contained"
                  size="small"
                  onClick={handleCheckedLeft}
                  disabled={rightChecked.length === 0}
                  aria-label="move selected left"
                >
                  <ChevronLeftIcon />
                </Button>
              </Grid>
            </Grid>
            <Grid>{customList("Inativos", right)}</Grid>
          </Grid>
        </div>
      )}
    </>
  );
}
