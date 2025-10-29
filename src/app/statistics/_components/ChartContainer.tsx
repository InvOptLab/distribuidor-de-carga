"use client";

import type React from "react";

import { Box, IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useRef } from "react";

const getDefs = () => {
  const styles = getStyles();
  return `<defs><style type=\"text/css\"><![CDATA[${styles}}]]></style></defs>`;
};

const stringifyStylesheet = (stylesheet: CSSStyleSheet) =>
  stylesheet.cssRules
    ? Array.from(stylesheet.cssRules)
        .map((rule) => rule.cssText || "")
        .join("\n")
    : "";

const getStyles = () =>
  Array.from(document.styleSheets)
    .map((s) => stringifyStylesheet(s))
    .join("\n");

export default function ChartContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const download = () => {
    if (!ref.current) return;

    const svgElems = ref.current.querySelectorAll(
      'svg[class$="MuiChartsSurface-root"]'
    );

    if (svgElems.length === 0) {
      console.log("No svg chart found in container");
      return;
    }

    const svgElem = svgElems[0].cloneNode(true) as SVGElement;
    const defs = getDefs();
    svgElem.insertAdjacentHTML("afterbegin", defs);

    let svgString = new XMLSerializer().serializeToString(svgElem);

    if (
      !svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
    ) {
      svgString = svgString.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    if (!svgString.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
      svgString = svgString.replace(
        /^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
    }

    svgString = '<?xml version="1.0" standalone="no"?>\r\n' + svgString;

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
    <Box ref={ref} position="relative">
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
