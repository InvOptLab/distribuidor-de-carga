import { BarChart } from "@mui/x-charts";
import ChartContainer from "./ChartContainer";
import { BarChartExportData } from "@/lib/chart-exporter";

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
  const xLabels: string[] = [];
  const values: number[] = [];

  for (const constraint of ocorrencias.values()) {
    for (const item of constraint) {
      xLabels.push(item.label);
      values.push(item.qtd + 0);
    }
  }

  const exportData: BarChartExportData = {
    xAxis: {
      data: xLabels,
      label: "Restrições",
    },
    yAxis: {
      label: "Quantidade",
    },
    series: [
      {
        data: values,
        label: "Ocorrências",
        color: "#D63230",
      },
    ],
    showBarValues: true,
  };

  return (
    <ChartContainer chartData={exportData}>
      <BarChart
        xAxis={[
          {
            scaleType: "band",
            data: xLabels,
            tickLabelStyle: {
              whiteSpace: "pre-wrap",
              textAnchor: "middle",
              fontSize: 12,
              wordWrap: "break-word",
            },
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
            color: "#D63230",
          },
        ]}
        height={300}
        grid={{ vertical: false, horizontal: true }}
        margin={{ left: 75, right: 75 }}
        barLabel="value"
      />
    </ChartContainer>
  );
}
