"use client";

import { useGlobalContext } from "@/context/Global";
import {
  Container,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid2,
  Box,
} from "@mui/material";
import SolutionHistoryRow from "./_components/SolutionHistoryRow";
import HoveredCourse from "../atribuicoes/_components/HoveredCourse";
import { useState } from "react";
import { TreeDisciplina } from "./_components/SolutionHistoryStatistics";

const tableColumns = [
  "Identificador",
  "Avaliação",
  "Inserção",
  /*'Algoritmo',*/ "Ações",
];

export default function History() {
  const { historicoSolucoes } = useGlobalContext();

  /**
   * State para controlar o hover nos filhos do table header a fim de exibir o componenete HoveredCourese
   */
  const [hoveredCourese, setHoveredCourese] = useState<TreeDisciplina | null>(
    null
  );

  const createHistoryColumns = () => {
    const historyColumns = [];

    for (const column of tableColumns) {
      historyColumns.push(
        <TableCell align="center" key={`cell_row_${column}`}>
          <Typography
            key={`typigraphy_${column}`}
            variant="h6"
            color="textPrimary"
            align="center"
          >
            {column}
          </Typography>
        </TableCell>
      );
    }

    return historyColumns;
  };

  const createHistoryComponents = () => {
    const historyComponents = [];

    historicoSolucoes.forEach((value, key) => {
      historyComponents.push(
        <SolutionHistoryRow
          key={`component_${key}`}
          id={key}
          solucao={value}
          setHoveredCourese={setHoveredCourese}
        />
      );
    });

    return historyComponents;
  };

  const renderHoverCourseChildren = (disciplina: TreeDisciplina) => {
    const render = [];
    //Divider
    // Saldo Docente: Prioridade
    disciplina.formularios.forEach((value, key) => {
      render.push(
        <Grid2 size={6}>
          <Box
            key={`box_hover_${key}_${value.nome}`}
            display="flex"
            alignItems="center"
          >
            <Typography
              key={`typography_hover_saldo_${key}_${value.nome}`}
              variant="body2"
              sx={{
                fontFamily: "monospace",
                whiteSpace: "nowrap",
              }}
              color={value?.saldo < 0 ? "error" : "success"}
            >
              (
              {(value?.saldo < 0 ? "" : "+") +
                value?.saldo.toFixed(1).replace(".", ",")}
              )&emsp;
            </Typography>
            <Typography
              key={`typography_hover_${key}_${value.nome}`}
              variant="body2"
            >
              {value.nome} : {value.prioridade}
            </Typography>
          </Box>
        </Grid2>
      );
    });
    return render;
  };

  return (
    <Container maxWidth="lg" key="container">
      <TableContainer key="tabbleContainer">
        <Table key="table">
          <TableHead key="tableHead">
            <TableRow key="tableHeadRow">
              <TableCell key="emptyCellRow" />
              {createHistoryColumns()}
            </TableRow>
          </TableHead>
          <TableBody key="tableBody">{createHistoryComponents()}</TableBody>
        </Table>
      </TableContainer>
      {hoveredCourese && (
        <HoveredCourse
          disciplina={hoveredCourese}
          setHoveredCourese={setHoveredCourese}
        >
          <Grid2
            container
            size={{ xs: 12 }}
            spacing={1}
            //sx={{ maxHeight: "10em", overflowY: "auto" }}
            maxWidth="40em"
            key="grid_history_main"
          >
            {renderHoverCourseChildren(hoveredCourese)}
          </Grid2>
        </HoveredCourse>
      )}
    </Container>
  );
}
