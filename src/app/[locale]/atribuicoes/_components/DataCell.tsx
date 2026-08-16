import React from 'react';
import { Box } from '@mui/material';
import { Celula, TipoTrava } from '@/context/Global/utils';
import { setCellColor } from '..';
import { useAccessibility } from '@/context/Accessibility';

interface DataCellProps {
  prioridade: number;
  cell: Celula;
  handleClick: (event: React.MouseEvent, celula: any) => void;
  setHover: (hoverData: any) => void;
  atribuido: boolean;
  maxPriority: number;
}

const DataCell: React.FC<DataCellProps> = ({ prioridade, cell, handleClick, setHover, atribuido, maxPriority }) => {
  const { isHighContrast } = useAccessibility();
  
  return (
  <Box
    //align="center"
    sx={{
      padding: "2px",
      textAlign: 'center',
      ...setCellColor(prioridade, cell, atribuido, maxPriority, isHighContrast) as any
    }}
    onClick={(event) => handleClick(event, { nome_docente: cell.nome_docente, id_disciplina: cell.id_disciplina, tipo_trava: TipoTrava.Cell })}
    onMouseEnter={() => setHover({ docente: cell.nome_docente, id_disciplina: cell.id_disciplina })}
    onMouseLeave={() => setHover({ docente: "", id_disciplina: "" })}
  >
    {prioridade ? prioridade : ''}
  </Box>
  );
};

export default DataCell;
