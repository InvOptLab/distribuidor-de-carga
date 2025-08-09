import React from "react";
import { TreeItem } from "@mui/x-tree-view";
import { TreeDisciplina } from "@/app/history/_components/SolutionHistoryStatistics";
import { Box, Typography } from "@mui/material";

interface DisciplinasTreeViewProps {
  disciplinas: Map<string, TreeDisciplina>;
  // atribuicoes: {
  //   id_disciplina: string;
  //   docentes: string[];
  // }[]; // Array de atribuições (disciplinas e seus docentes)
}

// Componente para exibir a contagem de disciplinas
const DocenteCount: React.FC<{ count: number }> = ({ count }) => (
  <Typography component="span" sx={{ marginLeft: 1 }} textAlign="right">
    ({count})
  </Typography>
);

function MyDocItem(props) {
  return (
    <div style={{ display: "flex" }}>
      <div style={{ fontFamily: "monospace" }}>
        (
        {(props.saldo < 0 ? "" : "+") +
          props.saldo.toFixed(1).toString().replace(".", ",")}
        )&emsp;
      </div>
      {props.nome}
      <div style={{ flexGrow: 1 }}></div>({props.discs})
    </div>
  );
}

const DisciplinasTreeView: React.FC<DisciplinasTreeViewProps> = ({
  disciplinas,
}) => {
  const disciplinaChild = (
    disciplina: string,
    treeDisciplina: TreeDisciplina
  ) => {
    const renderChilds = [];
    for (const atribuicao of treeDisciplina.atribuicoes.keys()) {
      const docente = treeDisciplina.atribuicoes.get(atribuicao);
      renderChilds.push(
        <TreeItem
          key={`child_docente_${disciplina}_${docente.nome}`}
          itemId={`child_docente_${disciplina}_${docente.nome}`}
          title={docente.nome}
          label=<MyDocItem
            nome={docente.nome}
            saldo={docente.saldo}
            discs={docente.atribuicoes.size}
          />
          // label={`(${(docente.saldo < 0 ? '' : '+') + docente.saldo.toFixed( 1 ).toString().replace( '.', ',' )}) ${docente.nome} (${docente.atribuicoes.size})`}
        />
      );
    }

    return renderChilds;
  };
  return (
    <>
      {Array.from(disciplinas.entries()).map(([disciplina, treeDisciplina]) => (
        <TreeItem
          key={`disciplina_${disciplina}`}
          itemId={`disciplina_${disciplina}`}
          //label={`${treeDisciplina._cursos} - ${treeDisciplina.nome} (${treeDisciplina.docentes.length})`}
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
                title={`${treeDisciplina.id} - ${treeDisciplina.nome}`} // Tooltip para mostrar o nome completo ao passar o mouse
              >
                {`${treeDisciplina._cursos} - ${treeDisciplina.nome}`}
              </Typography>
              {/* Contador de disciplinas */}
              <DocenteCount count={treeDisciplina.atribuicoes.size} />
            </Box>
          }
        >
          {disciplinaChild(disciplina, treeDisciplina)}
        </TreeItem>
      ))}
    </>
  );
};

export default DisciplinasTreeView;
