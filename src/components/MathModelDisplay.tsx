import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { BlockMath } from "react-katex";

interface MathModelDisplayProps {
  title: string;
  latexString: string;
  sx?: object; // Para permitir customizações de estilo
}

/**
 * Componente para exibir um modelo matemático (LaTeX) dentro de um
 * container do Material-UI que respeita o tema (light/dark).
 */
export const MathModelDisplay: React.FC<MathModelDisplayProps> = ({
  title,
  latexString,
  sx = {},
}) => {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: 3,
        // Garante que o KaTeX herde a cor de texto correta do tema
        color: "text.primary",
        ...sx,
      }}
    >
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      {/* Usamos 'BlockMath' para renderizar o LaTeX em modo "display" 
        (centralizado e em sua própria linha) 
      */}
      <Box sx={{ overflowX: "auto", paddingY: 2 }}>
        <BlockMath math={latexString} />
      </Box>
    </Paper>
  );
};
