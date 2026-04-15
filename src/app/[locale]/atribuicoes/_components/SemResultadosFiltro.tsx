import { Box, Typography, Button, alpha } from "@mui/material";
import { motion } from "framer-motion";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import { useTranslations } from "next-intl";

interface Props {
  onClearFilters?: () => void; // Prop opcional para já colocar um botão funcional
}

export default function SemResultadosFiltro({ onClearFilters }: Props) {
  const t = useTranslations("Pages.Assignment.NoDatNoDataFiltersaFilters");
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="50vh"
      gap={2}
      p={4}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          {/* Ícone flutuante animado */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <Box
              sx={{
                bgcolor: alpha("#ff9800", 0.1), // Fundo laranja bem transparente
                borderRadius: "50%",
                p: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <FilterAltOffIcon sx={{ fontSize: 70, color: "warning.main" }} />
            </Box>
          </motion.div>

          <Typography
            variant="h5"
            color="text.secondary"
            fontWeight="bold"
            align="center"
          >
            {t("noResultsFound")}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            maxWidth={420}
          >
            {t("description")}
          </Typography>

          {/* Botão para limpar os filtros, caso você passe a função via prop */}
          {onClearFilters && (
            <Button
              variant="outlined"
              color="warning"
              onClick={onClearFilters}
              sx={{
                mt: 2,
                borderRadius: 8,
                px: 4,
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              {t("clearFilters")}
            </Button>
          )}
        </Box>
      </motion.div>
    </Box>
  );
}
