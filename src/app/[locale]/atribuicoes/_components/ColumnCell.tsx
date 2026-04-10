import { Atribuicao, Disciplina, Docente, TipoTrava, Celula as Trava } from "@/context/Global/utils";
import { TableCell, TableRow, Typography } from "@mui/material";
import React from "react";
import DataCell from "./DataCell";

interface ColumnCellProps {
  docente: Docente;
  disciplinas: Disciplina[];
  atribuicoes: Atribuicao[];
  travas: Trava[]; 
  maxPriority: number;
  setHover: (hoverData: any) => void;
  onColumnClick: (event: React.MouseEvent, docente: Docente) => void;
  setColumnCollor: (nome: string) => string;
  handleCellClick: (event: React.MouseEvent, celula: any) => void;
}

const ColumnCell: React.FC<ColumnCellProps> = ({
  docente,
  disciplinas,
  atribuicoes,
  travas,
  maxPriority,
  setHover,
  onColumnClick,
  setColumnCollor,
  handleCellClick,
}) => {

    /**
     * Função que cria as células referentes as atribuições do docente para cada disicplina
     */
  const createDataCells = () => {
    const cells = [];

    for (const disciplina of disciplinas) {
      const prioridade = docente.formularios.get(disciplina.id);
      // Se o docente atribuiu uma prioridade a disciplina
      cells.push(
        <DataCell
          key={`${docente.nome}_${disciplina.id}`}
          setHover={setHover}
          prioridade={prioridade}
          handleClick={handleCellClick}
          cell={{ id_disciplina: disciplina.id, nome_docente: docente.nome, tipo_trava: TipoTrava.Cell,
                    trava: travas.filter(trava => trava.id_disciplina === disciplina.id && trava.tipo_trava === TipoTrava.Column 
                        || trava.nome_docente === docente.nome && trava.tipo_trava === TipoTrava.Row 
                        || trava.id_disciplina === disciplina.id && trava.nome_docente).length > 0}}

          atribuido={atribuicoes.filter(atribuicao => atribuicao.id_disciplina === disciplina.id && atribuicao.docentes.includes(docente.nome)).length > 0}
        maxPriority={maxPriority}
        />
      );
    }

    return cells
  };

  return (
    <TableRow key={docente.nome} style={{ maxHeight: "2rem" }}>
      <TableCell
        component="th"
        scope="row"
        sx={{
          maxWidth: "11rem",
          position: "sticky",
          left: 0, // Fixando a célula à esquerda
          backgroundColor: setColumnCollor(docente.nome), // Evitando que o fundo fique transparente ao fixar
          zIndex: 1, // Para manter sobre as demais células,
          textOverflow: "ellipsis",
          padding: "5px",
        }}
        onClick={(e) => onColumnClick(e, docente)}
      >
        <Typography
          align="left"
          variant="body2"
          style={{ fontWeight: "bold" }}
          noWrap
        >
          {docente.nome}
        </Typography>
      </TableCell>
      {createDataCells()}
    </TableRow>
  );
};

export default ColumnCell;
