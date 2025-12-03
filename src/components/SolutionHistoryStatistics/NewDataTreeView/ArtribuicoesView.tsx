import { setCellColor } from "@/app/atribuicoes";
import HeaderCell from "@/app/atribuicoes/_components/HeaderCell";
import {
  TreeDisciplina,
  TreeDocente,
} from "@/app/history/_components/SolutionHistoryStatistics";
import { HistoricoSolucao, isDisciplina } from "@/context/Global/utils";
import { Box, Grid, Stack, styled, Typography } from "@mui/material";

export interface ArtribuicoesViewProps {
  tipo: "docente" | "disciplina";
  id: string;
  entidade: TreeDocente | TreeDisciplina;
  solucao: HistoricoSolucao;
  disciplinas: Map<string, TreeDisciplina>;
  setHoveredCourese: React.Dispatch<
    React.SetStateAction<TreeDisciplina | null>
  >;
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

export function ArtribuicoesView({
  tipo,
  id,
  entidade,
  solucao,
  disciplinas,
  setHoveredCourese,
}: ArtribuicoesViewProps) {
  const renderFormularios = () => {
    const render = [];

    if (tipo === "docente") {
      // Mostrar o nome da disciplina e a prioridade

      // Verifica se a entidade é do tipo Disciplina e já retorna um array vazio caso seja
      // Adicionado para evitar erros no lint
      if (isDisciplina(entidade)) {
        return render;
      }
      entidade.atribuicoes.forEach((value, key) => {
        render.push(
          <Grid key={`TreeViewAssignments_child_grid_${key}`}>
            <HeaderCell
              disciplina={disciplinas.get(key)}
              //onHeaderClick={() => null}
              setHeaderCollor={() => "white"}
              key={`TreeViewAssignments_child_grid_${key}_child`}
              setParentHoveredCourse={setHoveredCourese}
            />
            <Box
              sx={{
                backgroundColor: setCellColor(
                  value.formularios.get(id)?.prioridade,
                  { id_disciplina: key, nome_docente: id },
                  false,
                  solucao.contexto.maxPriority
                ),
                //padding: "2px",
                textAlign: "center",
                minHeight: value.formularios.get(key) ? "inherit" : "1.5em",
              }}
            >
              {value.formularios.get(id).prioridade}
            </Box>
          </Grid>
        );
      });
    }

    if (tipo === "disciplina") {
      // Verifica se a entidade é do tipo Disciplina e já retorna um array vazio caso seja
      // Adicionado para evitar erros no lint
      if (isDisciplina(entidade)) {
        entidade.atribuicoes.forEach((value, key) => {
          render.push(
            <Grid key={`TreeViewAssignments_child_grid_${id}_${key}`}>
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
                  {key}
                </Typography>
                <Typography align="left" style={{ fontSize: "14px" }}>
                  Saldo:{" "}
                  {(value.saldo < 0 ? "" : "+") +
                    value.saldo.toFixed(1).toString().replace(".", ",")}
                </Typography>
              </StyledStack>
              <Box
                sx={{
                  backgroundColor: setCellColor(
                    value.formularios.get(entidade.id),
                    { id_disciplina: id, nome_docente: key },
                    false,
                    solucao.contexto.maxPriority
                  ),
                  //padding: "2px",
                  textAlign: "center",
                  minHeight: value.formularios.get(entidade.id)
                    ? "inherit"
                    : "1.5em",
                }}
              >
                {value.formularios.get(entidade.id)}
              </Box>
            </Grid>
          );
        });
      }
    }

    return render;
  };
  return (
    <Grid
      container
      spacing={1}
      size={{ xs: 8 }}
      alignItems="center"
      justifyContent="center"
      sx={{ width: "100%", flexGrow: 1, height: "25em", overflowY: "auto" }}
      key={"TreeViewAssignments_container_grid_1"}
    >
      {renderFormularios()}
    </Grid>
  );
}
