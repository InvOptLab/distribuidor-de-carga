"use client";

import { Box, Button, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function NoDataFound() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "pt-BR";

  const t = useTranslations("Components.NoDataFound");

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="70vh"
      gap={3}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          {/* Animação do Ícone Flutuando */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2.5,
              ease: "easeInOut",
            }}
          >
            <Box
              sx={{
                bgcolor: "rgba(25, 118, 210, 0.1)",
                borderRadius: "50%",
                p: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 80, color: "primary.main" }} />
            </Box>
          </motion.div>

          <Typography variant="h5" color="text.secondary" fontWeight="bold">
            {t("noDataFound")}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            maxWidth={450}
          >
            {t("description")}
          </Typography>

          <Button
            variant="contained"
            size="large"
            color="primary"
            component="span"
            startIcon={<CloudUploadIcon />}
            onClick={() => router.push(`/${locale}/inputfile`)}
            sx={{ mt: 2, mb: 2 }}
          >
            {t("loadData")}
          </Button>
        </Box>
      </motion.div>
    </Box>
  );
}
