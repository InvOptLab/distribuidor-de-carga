import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ContrastIcon from "@mui/icons-material/InvertColors";
import InfoIcon from "@mui/icons-material/Info";
import Link from "next/link";
import { useAccessibility } from "@/context/Accessibility";

const AccessibilityBar: React.FC = () => {
  const { increaseFont, decreaseFont, toggleContrast } = useAccessibility();

  return (
    <AppBar
      position="relative"
      sx={{ top: 0, backgroundColor: "#424242", zIndex: 2000 }}
    >
      <Toolbar variant="dense">
        <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
          <Tooltip title="Aumentar fonte">
            <IconButton color="inherit" onClick={increaseFont}>
              A<AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Diminuir fonte">
            <IconButton color="inherit" onClick={decreaseFont}>
              A<RemoveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Alto contraste">
            <IconButton color="inherit" onClick={toggleContrast}>
              <ContrastIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Link href="/acessibilidade" passHref legacyBehavior>
          <Button
            component="a"
            color="inherit"
            startIcon={<InfoIcon />}
            sx={{ textTransform: "none" }}
          >
            Acessibilidade
          </Button>
        </Link>
      </Toolbar>
    </AppBar>
  );
};

export default AccessibilityBar;
