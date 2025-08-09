import { BarChart } from "@mui/x-charts";

interface ConstraintsBarChartsProps {
  ocorrencias: Map<
    string,
    {
      label: string;
      qtd: number;
    }[]
  >;
}

export default function ConstraintsBarCharts({
  ocorrencias,
}: ConstraintsBarChartsProps) {
  const xLabels = [];
  const values = [];

  for (const constraint of ocorrencias.values()) {
    for (const item of constraint) {
      xLabels.push(item.label);
      values.push(item.qtd + 0);
    }
  }

  return (
    <BarChart
      xAxis={[
        {
          scaleType: "band",
          data: xLabels /*.map((label) => label.replace(/ /g, "\n"))*/, // Força quebra de linha em espaços
          tickLabelStyle: {
            whiteSpace: "pre-wrap", // Permite quebras de linha
            textAnchor: "middle", // Centraliza os rótulos
            fontSize: 12, // Ajusta tamanho da fonte
            wordWrap: "break-word",
          },
          // colorMap: {
          //   type: "ordinal",
          //   colors: generateColors(xLabels.length),
          // },
          label: "Restrições",
        },
      ]}
      yAxis={[
        {
          label: "Quantidade",
        },
      ]}
      series={[
        {
          data: values,
          label: "Ocorrências",
        },
      ]}
      height={300}
      grid={{ vertical: false, horizontal: true }}
      margin={{ left: 75, right: 75 }}
      barLabel="value"
    />
  );
}
