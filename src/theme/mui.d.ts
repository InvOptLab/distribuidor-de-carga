// src/theme/mui.d.ts
declare module "@mui/material/styles" {
  // Adiciona as paletas extras (se não existirem por padrão)
  interface Palette {
    info: Palette["primary"];
    warning: Palette["primary"];
    success: Palette["primary"];
    error: Palette["primary"];
  }
  interface PaletteOptions {
    info?: PaletteOptions["primary"];
    warning?: PaletteOptions["primary"];
    success?: PaletteOptions["primary"];
    error?: PaletteOptions["primary"];
  }
}

// Adiciona as cores às props 'color' dos componentes
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    info: true;
    warning: true;
    success: true;
    error: true;
  }
}

declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides {
    info: true;
    warning: true;
    success: true;
    error: true;
  }
}

// (Adicione para outros componentes se necessário: Alert, SvgIcon, etc.)
