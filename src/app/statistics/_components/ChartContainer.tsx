"use client";

import type React from "react";
import { Box, IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import {
  generateBarChartSVG,
  type BarChartExportData,
} from "@/lib/chart-exporter";

export default function ChartContainer({
  children,

  chartData,
}: {
  children: React.ReactNode;
  chartData: BarChartExportData;
}) {
  const download = () => {
    const svgString = generateBarChartSVG(chartData);

    const url =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);

    const a = document.createElement("a");
    a.setAttribute("download", "chart.svg");
    a.setAttribute("href", url);
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Box position="relative">
      <IconButton
        sx={{ position: "absolute", right: "20px", zIndex: 10 }}
        aria-label="download"
        onClick={download}
      >
        <DownloadIcon fontSize="inherit" />
      </IconButton>
      {children}
    </Box>
  );
}
