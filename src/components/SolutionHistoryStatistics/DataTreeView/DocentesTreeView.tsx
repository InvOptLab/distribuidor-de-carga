import React from "react";
import { Box, Typography } from "@mui/material";
import { TreeItem } from "@mui/x-tree-view";
import { TreeDocente } from "@/app/history/_components/SolutionHistoryStatistics";

interface DocentesTreeViewProps {
  docentesAtribuicoes: Map<string, TreeDocente>; // Map de docentes e suas disciplinas
}

// Componente para exibir a contagem de disciplinas
const DisciplinaCount: React.FC<{ count: number }> = ({ count }) => (
  <Typography component="span" sx={{ marginLeft: 1 }} textAlign="right">
    ({count})
  </Typography>
);

const DocentesTreeView: React.FC<DocentesTreeViewProps> = ({
  docentesAtribuicoes,
}) => {
  const docenteChild = (docente: string, treeDocente: TreeDocente) => {
    const renderChilds = [];
    for (const atribuicao of treeDocente.atribuicoes.keys()) {
      const disciplina = treeDocente.atribuicoes.get(atribuicao);
      renderChilds.push(
        <TreeItem
          key={`child_docente_${docente}_${disciplina.id}`}
          itemId={`child_docente_${docente}_${disciplina.id}`}
          label={`${disciplina._cursos} - ${disciplina.nome} (${disciplina.atribuicoes.size})`}
        />
      );
    }

    return renderChilds;
  };

  return (
    <>
      {Array.from(docentesAtribuicoes.entries()).map(
        ([docente, treeDocente]) => (
          <TreeItem
            key={`docente_${docente}`}
            itemId={`docente_${docente}`}
            //sx={{maxWidth: "20em"}}
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  component="span"
                  sx={{
                    //   maxWidth: '20em',
                    //whiteSpace: "nowrap",
                    //overflow: "hidden",
                    //textOverflow: "ellipsis",
                    width: "100%", // Para ocupar todo o espaço horizontal disponível
                    flexGrow: 1, // Faz o nome do docente crescer e empurrar o contador para a direita
                  }}
                  title={docente} // Tooltip para mostrar o nome completo ao passar o mouse
                >
                  <div style={{ display: "flex" }}>
                    <div style={{ fontFamily: "monospace" }}>
                      (
                      {(treeDocente.saldo < 0 ? "" : "+") +
                        treeDocente.saldo
                          .toFixed(1)
                          .toString()
                          .replace(".", ",")}
                      )&emsp;
                    </div>
                    {docente}
                  </div>
                </Typography>
                {/* Contador de disciplinas */}
                <DisciplinaCount count={treeDocente.atribuicoes.size} />
              </Box>
            }
          >
            {/* Disciplinas como itens filhos */}
            {docenteChild(docente, treeDocente)}
          </TreeItem>
        )
      )}
    </>
  );
};

export default DocentesTreeView;
