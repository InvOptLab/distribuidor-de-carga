import { setCellColor } from "@/app/atribuicoes";
import HeaderCell from "@/app/atribuicoes/_components/HeaderCell";
import { TreeDisciplina } from "@/app/history/_components/SolutionHistoryStatistics";
import { Disciplina, HistoricoSolucao } from "@/context/Global/utils";
import { Box, Grid, Paper, Stack, styled, Typography } from "@mui/material";
import React from "react";

// Props do DataTreeView
interface TreeViewAssignmentsProps {
  item: { tipo: string; id: string } | null; // Informação tratada {docente, nome_docente} ou {disciplina, id_disciplina}
  solucao: HistoricoSolucao;
  setHoveredCourese: React.Dispatch<React.SetStateAction<Disciplina>>;
  disciplinas: Map<string, TreeDisciplina>;
}

// StyledStack com hover opcional
const StyledStack = styled(Stack)(() => ({
  position: "relative",
  zIndex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: "12rem",
  maxWidth: "12rem",
  height: "4rem",
  padding: 0,
  margin: 0,
}));

const TreeViewAssignments: React.FC<TreeViewAssignmentsProps> = ({
  item,
  solucao,
  setHoveredCourese,
  disciplinas,
}) => {
  const renderAssignments = () => {
    const render = [];

    if (item.tipo === "docente") {
      const docenteAtribuicoes = solucao.solucao.atribuicoes.filter(
        (atribuicao) => atribuicao.docentes.includes(item.id)
      );
      const docenteAtribuicoesDisciplinas: Disciplina[] = [];

      for (const atribuicao of docenteAtribuicoes) {
        const disciplina = solucao.contexto.disciplinas.find(
          (disc) => disc.id === atribuicao.id_disciplina
        );
        docenteAtribuicoesDisciplinas.push(disciplina);
      }

      for (const disciplina of docenteAtribuicoesDisciplinas) {
        const docente = solucao.contexto.docentes.find(
          (docente) =>
            // formulario.id_disciplina === disciplina.id &&
            // formulario.nome_docente === item.id
            docente.formularios.has(disciplina.id) && item.id === docente.nome
        );
        render.push(
          <Grid key={`TreeViewAssignments_child_grid_${disciplina.id}`}>
            <HeaderCell
              disciplina={disciplina}
              //onHeaderClick={() => null}
              setHeaderCollor={() => "white"}
              key={`TreeViewAssignments_child_grid_${disciplina.id}_child`}
              setParentHoveredCourse={setHoveredCourese}
            />
            <Box
              sx={{
                backgroundColor: setCellColor(
                  docente ? docente.formularios.get(disciplina.id) : null,
                  { id_disciplina: disciplina.id, nome_docente: item.id },
                  false,
                  solucao.contexto.maxPriority
                ),
                //padding: "2px",
                textAlign: "center",
              }}
            >
              {docente ? docente.formularios.get(disciplina.id) : ""}
            </Box>
          </Grid>
        );
      }
    }
    if (item.tipo === "disciplina") {
      // disciplina
      const disciplina = disciplinas.get(item.id);

      for (const formulario of disciplina.formularios.keys()) {
        const docente = disciplina.formularios.get(formulario);
        render.push(
          <Grid
            key={`TreeViewAssignments_child_grid_${disciplina.id}_${docente.nome}`}
          >
            <StyledStack spacing={1}>
              <Typography
                align="left"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {docente.nome}
              </Typography>
              <Typography align="left" style={{ fontSize: "14px" }}>
                Saldo:{" "}
                {(docente.saldo < 0 ? "" : "+") +
                  docente.saldo.toFixed(1).toString().replace(".", ",")}
              </Typography>
            </StyledStack>
            <Box
              sx={{
                backgroundColor: setCellColor(
                  docente ? docente.formularios.get(disciplina.id) : null,
                  { id_disciplina: disciplina.id, nome_docente: item.id },
                  false,
                  solucao.contexto.maxPriority
                ),
                //padding: "2px",
                textAlign: "center",
              }}
            >
              {docente ? docente.formularios.get(disciplina.id) : ""}
            </Box>
          </Grid>
        );
      }
    }

    return render;
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: "20em",
        overflowY: "auto", // Habilita o scroll vertical
        display: "flex",
      }}
    >
      <Grid
        container
        spacing={2}
        size={{ xs: 8 }}
        alignItems="center"
        justifyContent="center"
        sx={{ width: "100%" }}
        key={"TreeViewAssignments_container_grid"}
      >
        {!item && (
          <Grid
            alignItems="center"
            justifyContent="center"
            key={"TreeViewAssignments_no_info_grid"}
          >
            <Typography variant="h6" color="error" align="center">
              Nenhuma informação selecionada!
            </Typography>
          </Grid>
        )}
        {item && renderAssignments()}
      </Grid>
    </Paper>
  );
};

export default TreeViewAssignments;
