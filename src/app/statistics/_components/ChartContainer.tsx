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

export default function ChartContainer({ children }) {
  const ref = useRef<SVGSVGElement>(null);

  const download = () => {
    const svgElems = ref.current.querySelectorAll(
      'svg[class$="MuiChartsSurface-root"]'
    );

    if (svgElems.length === 0) {
      console.log("No svg chart found in container");
      return;
    }

    //const svgElem = svgElems[0];

    const svgElem = svgElems[0].cloneNode(true) as SVGElement;
    // adding styles
    const defs = getDefs();
    svgElem.insertAdjacentHTML("afterbegin", defs);

    let svgString = new XMLSerializer().serializeToString(svgElem);

    // Adiciona namespaces se necessário
    if (
      !svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)
    ) {
      svgString = svgString.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    if (!svgString.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      svgString = svgString.replace(
        /^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
    }

    // Adiciona cabeçalho XML
    svgString = '<?xml version="1.0" standalone="no"?>\r\n' + svgString;

    // Converte para URI
    const url =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);

    // Força download
    const a = document.createElement("a");
    a.setAttribute("download", "chart.svg");
    a.setAttribute("href", url);
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    // // const uriData = `data:image/svg+xml;base64,${btoa(svgElem.outerHTML)}` // it may fail.
    // const uriData = `data:image/svg+xml;base64,${btoa(
    //   new XMLSerializer().serializeToString(svgElem)
    // )}`;
    // const img = new Image();
    // img.src = uriData;
    // img.onload = () => {
    //   const canvas = document.createElement("canvas");
    //   [canvas.width, canvas.height] = [output.width, output.height];
    //   const ctx = canvas.getContext("2d");
    //   ctx.drawImage(img, 0, 0, output.width, output.height);

    //   // download
    //   const a = document.createElement("a");
    //   const quality = 1.0; // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingQuality
    //   a.href = canvas.toDataURL("image/png", quality);
    //   a.download = output.name;
    //   a.append(canvas);
    //   a.click();
    //   a.remove();
    // };
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
