// Define a interface para uma única série de dados
export interface ChartSeries {
  data: number[];
  label?: string;
  color?: string;
}

// Define a interface principal para os dados do gráfico
export interface BarChartExportData {
  series: ChartSeries[];
  xAxis: {
    data: string[];
    label?: string;
  };
  yAxis: {
    label?: string;
  };
  showBarValues?: boolean;
}

// Aumentamos o SVG_HEIGHT e MARGINS para dar espaço para a legenda no topo
// e para a quebra de linha no eixo X.
const SVG_WIDTH = 800;
const SVG_HEIGHT = 550;
const MARGINS = {
  top: 80,
  right: 50,
  bottom: 150,
  left: 100,
};
const CHART_WIDTH = SVG_WIDTH - MARGINS.left - MARGINS.right;
const CHART_HEIGHT = SVG_HEIGHT - MARGINS.top - MARGINS.bottom;

// Cores padrão
const DEFAULT_COLORS = ["#0288d1", "#d32f2f", "#ed6c02", "#2e7d32", "#7b1fa2"];

/**
 * Gera uma string SVG de um gráfico de barras (simples ou agrupado).
 * Todos os estilos são "inline" para máxima compatibilidade.
 */
export function generateBarChartSVG(data: BarChartExportData): string {
  const { series, xAxis, yAxis, showBarValues } = data;
  const numCategories = xAxis.data.length;
  const numSeries = series.length;

  if (numCategories === 0 || numSeries === 0) {
    return `<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
      <text x="10" y="50" font-family="Arial" font-size="16">Sem dados</text>
    </svg>`;
  }

  // --- Calcular Escalas ---
  const maxValue = Math.max(...series.flatMap((s) => s.data), 0);
  const groupWidth = CHART_WIDTH / numCategories;
  const groupPadding = 10;
  const groupUsableWidth = groupWidth - groupPadding;
  const barWidth = groupUsableWidth / numSeries;

  let barElements = "";
  let labelElements = "";
  let legendElements = "";

  // --- Preparar Legenda (Cálculo) ---
  const legendItemWidth = 130; // Largura de cada item da legenda
  const totalLegendWidth = numSeries * legendItemWidth;
  const legendStartX = (SVG_WIDTH - totalLegendWidth) / 2; // Ponto X inicial
  const legendY = MARGINS.top / 2; // Posição Y no topo

  // --- Gerar Barras, Rótulos e Legenda ---
  series.forEach((s, seriesIndex) => {
    const color =
      s.color || DEFAULT_COLORS[seriesIndex % DEFAULT_COLORS.length];

    // --- Gerar Barras e Rótulos (Valores) ---
    s.data.forEach((value, dataIndex) => {
      const barHeight = maxValue > 0 ? (value / maxValue) * CHART_HEIGHT : 0;
      const groupX = MARGINS.left + dataIndex * groupWidth + groupPadding / 2;
      const x = groupX + seriesIndex * barWidth;
      const y = MARGINS.top + CHART_HEIGHT - barHeight;

      barElements += `
        <rect 
          x="${x}" 
          y="${y}" 
          width="${barWidth}" 
          height="${barHeight}" 
          fill="${color}" 
        />`;

      if (showBarValues && value > 0 && barHeight > 15) {
        const labelX = x + barWidth / 2;
        const labelY = y + barHeight / 2;
        labelElements += `
          <text 
            x="${labelX}" 
            y="${labelY}"
            font-family="Arial, sans-serif" font-size="10" 
            text-anchor="middle"
            dominant-baseline="middle" 
            fill="#ffffff"
            font-weight="bold"
          >
            ${value.toLocaleString("pt-BR")}
          </text>`;
      }
    });

    // --- Gerar Legenda (Posição no Topo) ---
    if (s.label) {
      const legendX = legendStartX + seriesIndex * legendItemWidth;
      legendElements += `
        <rect x="${legendX}" y="${legendY}" width="15" height="15" fill="${color}" />
        <text x="${legendX + 20}" y="${
        legendY + 12
      }" font-family="Arial, sans-serif" font-size="12">
          ${s.label}
        </text>
      `;
    }
  });

  // --- Gerar Eixos ---
  const xAxisLine = `
    <line 
      x1="${MARGINS.left}" y1="${MARGINS.top + CHART_HEIGHT}" 
      x2="${MARGINS.left + CHART_WIDTH}" y2="${MARGINS.top + CHART_HEIGHT}" 
      stroke="#000" stroke-width="1"
    />`;

  const yAxisLine = `
    <line 
      x1="${MARGINS.left}" y1="${MARGINS.top}" 
      x2="${MARGINS.left}" y2="${MARGINS.top + CHART_HEIGHT}" 
      stroke="#000" stroke-width="1"
    />`;

  // --- Gerar Rótulos do Eixo X (com Quebra de Linha) ---
  const xAxisLabels = xAxis.data
    .map((label, index) => {
      const x = MARGINS.left + index * groupWidth + groupWidth / 2;
      const y = MARGINS.top + CHART_HEIGHT + 25;
      const words = label.split(" "); // Divide o rótulo por espaços
      const lineHeight = 14; // Altura da linha (em pixels)

      // Cria um <tspan> para cada palavra
      const tspans = words
        .map(
          (word, i) =>
            `<tspan x="${x}" dy="${i === 0 ? 0 : lineHeight}px">${word}</tspan>`
        )
        .join("\n  ");

      return `
        <text 
          x="${x}" y="${y}" 
          font-family="Arial, sans-serif" font-size="12" 
          text-anchor="middle"
        >
          ${tspans}
        </text>`;
    })
    .join("\n  ");

  // --- Gerar Grade do Eixo X (Divisores) ---
  let xAxisGridLines = "";
  for (let i = 1; i < numCategories; i++) {
    const x = MARGINS.left + i * groupWidth;
    xAxisGridLines += `
      <line 
        x1="${x}" y1="${MARGINS.top}" 
        x2="${x}" y2="${MARGINS.top + CHART_HEIGHT}" 
        stroke="#eee" stroke-width="1" 
      />`;
  }

  // --- Gerar Rótulos e Grade do Eixo Y ---
  const yAxisTicks = [0, maxValue / 2, maxValue];
  let yAxisLabels = "";
  let yAxisGridLines = "";

  yAxisTicks.forEach((value) => {
    const y = MARGINS.top + CHART_HEIGHT - (value / maxValue) * CHART_HEIGHT;
    const x = MARGINS.left - 10;
    yAxisLabels += `
      <text 
        x="${x}" y="${y}" 
        font-family="Arial, sans-serif" font-size="12" 
        text-anchor="end" dominant-baseline="middle"
      >
        ${value.toFixed(0)}
      </text>`;

    if (value > 0) {
      yAxisGridLines += `
        <line 
          x1="${MARGINS.left}" y1="${y}" 
          x2="${MARGINS.left + CHART_WIDTH}" y2="${y}" 
          stroke="#eee" stroke-width="1" 
        />`;
    }
  });

  // --- Gerar Rótulos dos Eixos (Títulos) ---
  const xAxisTitle = `
    <text 
      x="${MARGINS.left + CHART_WIDTH / 2}" y="${
    SVG_HEIGHT - MARGINS.bottom / 2
  }" 
      font-family="Arial, sans-serif" font-size="16" 
      text-anchor="middle" font-weight="bold"
    >
      ${xAxis.label || ""}
    </text>`;

  const yAxisTitle = `
    <text 
      x="${MARGINS.left / 2.5}" y="${MARGINS.top + CHART_HEIGHT / 2}" 
      font-family="Arial, sans-serif" font-size="16" 
      text-anchor="middle" font-weight="bold" 
      transform="rotate(-90, ${MARGINS.left / 2.5}, ${
    MARGINS.top + CHART_HEIGHT / 2
  })"
    >
      ${yAxis.label || ""}
    </text>`;

  // --- Montar o SVG Final ---
  return `
<svg 
  width="${SVG_WIDTH}" 
  height="${SVG_HEIGHT}" 
  xmlns="http://www.w3.org/2000/svg" 
  xmlns:xlink="http://www.w3.org/1999/xlink"
  style="background-color: #fff; border: 1px solid #ccc;"
>
  <style>
    text { fill: #333; }
  </style>
  
  <g class="grid">
    ${xAxisGridLines}
    ${yAxisGridLines}
  </g>
  <g class="axes">
    ${xAxisLine}
    ${yAxisLine}
  </g>
  <g class="bars">
    ${barElements}
  </g>
  <g class="labels">
    ${xAxisLabels}
    ${yAxisLabels}
    ${xAxisTitle}
    ${yAxisTitle}
  </g>
  <g class="bar-values">
    ${labelElements}
  </g>
  <g class="legend">
    ${legendElements}
  </g>
</svg>
  `;
}
