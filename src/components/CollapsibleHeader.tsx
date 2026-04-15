"use client";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Stack,
  alpha,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { usePageHeader } from "@/context/PageHeaderContext";

export default function CollapsibleHeader() {
  const { title, actions, isCollapsed, setIsCollapsed } = usePageHeader();

  return (
    <Paper
      elevation={3}
      sx={{
        position: "sticky",
        top: 64, // Altura da sua Navbar principal
        zIndex: 1000,
        borderRadius: 0,
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 3, py: 1.5 }}
            >
              <Typography variant="h6" fontWeight="bold">
                {title}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>{actions}</Box>
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aba de controle para expandir/recolher */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          height: "20px",
          position: "relative",
        }}
      >
        <IconButton
          onClick={() => setIsCollapsed(!isCollapsed)}
          size="small"
          sx={{
            position: "absolute",
            top: -10,
            backgroundColor: "background.paper",
            boxShadow: 2,
            "&:hover": { backgroundColor: "grey.100" },
          }}
        >
          {isCollapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
}
