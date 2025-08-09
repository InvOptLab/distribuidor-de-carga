import React from 'react';
import { Typography, Box } from '@mui/material';
import { PieChart } from '@mui/x-charts';

interface StatusPieChartProps {
  title: string;
  activeCount: number;
  inactiveCount: number;
  lockedCount: number;
}

const StatusPieChart: React.FC<StatusPieChartProps> = ({ title, activeCount, inactiveCount, lockedCount }) => {
  // Dados para o gráfico de pizza
  const data = [];

  if(activeCount !== 0) {
    data.push({ id: 0, label: "Ativos", value: activeCount, color: "blue" },)
  }
  if(inactiveCount !== 0) {
    data.push({ id: 1, label: "Inativos", value: inactiveCount, color: "red" })
  }

  if(lockedCount !== 0) {
    data.push({ id: 2, label: "Travados", value: lockedCount, color: "gray" })
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      {/* Título do gráfico */}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      {/* Gráfico de Pizza */}
      <PieChart
        height={300}
        series={[
          {
            data: data,
            innerRadius: 50,
            outerRadius: 100,
            paddingAngle: 4,
            cornerRadius: 5,
            startAngle: 0,
            endAngle: 360,
            cx: 248,
            cy: 150,
          }
        ]}
      />
    </Box>
  );
};

export default StatusPieChart;
