"use client";

import type React from "react";

import {
  Paper,
  useTheme,
  Stack,
  Typography,
  Divider,
  Chip,
  Box,
  Grid,
} from "@mui/material";
import {
  Person as PersonIcon,
  School as SchoolIcon,
  AccountBalance as AccountBalanceIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import type {
  Docente,
  Disciplina,
  Formulario,
  Atribuicao,
} from "@/algoritmo/communs/interfaces/interfaces";
import { forwardRef } from "react";
import { useTranslations } from "next-intl";
import { priorityRampColor } from "../theme/priorityRamp";

interface HoveredDocenteProps {
  docente: Docente;
  disciplinas?: Disciplina[]; // Lista de disciplinas para buscar informações
  formularios?: Formulario[]; // Lista de formulários para mostrar turmas interessadas
  atribuicoes?: Atribuicao[];
  children?: React.ReactNode;
  // setHoveredDocente: Dispatch<SetStateAction<Docente | null>>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  /** "panel": sem sombra/limite de altura, para o painel lateral de detalhes. */
  variant?: "card" | "panel";
}

/**
 * Componente desenvolvido para exibir detalhes de um docente ao passar o mouse sobre ele.
 * Exibe informações como nome, saldo, tipo de agrupamento e turmas com formulários.
 */
const HoveredDocente = forwardRef<HTMLDivElement, HoveredDocenteProps>(
  (
    {
      docente,
      disciplinas = [],
      formularios = [],
      atribuicoes = [],
      children,
      variant = "card",
      onMouseEnter,
      onMouseLeave,
    },
    ref, // <-- ref vindo do forwardRef
  ) => {
    // Filtra formulários relacionados a este docente
    const formulariosRelacionados = formularios.filter(
      (f) => f.nome_docente === docente.nome,
    );

    // Função para determinar a cor do saldo
    const getSaldoColor = (saldo?: number): string => {
      if (saldo === undefined) return "inherit";
      if (saldo > 2) return "#4caf50"; // Verde
      if (saldo < -1) return "#f44336"; // Vermelho
      return "inherit"; // Preto (cor padrão)
    };

    // Função para determinar a cor da prioridade
    // Mesma rampa da grade (1 = mais preferida), sobre a maior prioridade dos formulários
    const theme = useTheme();
    const maxPrioridade = formularios.reduce(
      (max, f) => Math.max(max, f.prioridade),
      1,
    );
    const rampMode = theme.palette.mode === "dark" ? "dark" : "light";
    const getPrioridadeColor = (prioridade: number): string =>
      priorityRampColor(prioridade, maxPrioridade, rampMode).bg;
    const priorityPill = (prioridade: number) => {
      const { bg, fg } = priorityRampColor(prioridade, maxPrioridade, rampMode);
      return {
        backgroundColor: bg,
        color: fg,
        px: 0.75,
        borderRadius: 1,
        alignSelf: "flex-start",
        display: "inline-block",
        fontWeight: 600,
      };
    };

    // Função para buscar disciplina por ID
    const getDisciplinaById = (id: string): Disciplina | undefined => {
      return disciplinas.find((d) => d.id === id);
    };

    const calcularCargaDidatica = (atribuicoes: Atribuicao[]): number => {
      let carga = 0;

      for (const atribuicao of atribuicoes) {
        carga += disciplinas.find(
          (disciplina) => disciplina.id === atribuicao.id_disciplina,
        ).carga;
      }

      return carga;
    };

    const t = useTranslations("Pages.Assignment.Hover.Docente");

    return (
      <Paper
        elevation={variant === "panel" ? 0 : 12}
        sx={{
          // position: "fixed",
          // zIndex: 99,
          // bottom: "6vh",
          // right: "2vw",
          maxWidth: variant === "panel" ? "none" : 700,
          borderRadius: variant === "panel" ? 0 : 3,
          // overflow: "hidden",
          border: variant === "panel" ? 0 : "1px solid",
          borderColor: "divider",
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Cabeçalho na cor primária do tema (vale para alto contraste) */}
        <Box
          sx={{
            bgcolor: "primary.main",
            p: 2.5,
            color: "primary.contrastText",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <PersonIcon fontSize="small" />
            <Typography
              variant="caption"
              sx={{
                opacity: 0.9,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {t("professor")}
            </Typography>
          </Stack>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 0.5,
              lineHeight: 1.3,
            }}
          >
            {docente.nome}
          </Typography>
          {docente.comentario && (
            <Typography
              variant="body2"
              sx={{
                opacity: 0.95,
                lineHeight: 1.4,
              }}
            >
              &quot;{docente.comentario}&quot;
            </Typography>
          )}
        </Box>

        {/* Conteúdo principal */}
        <Stack
          ref={ref}
          spacing={2}
          sx={{
            p: 2.5,
            maxHeight: variant === "panel" ? "none" : "55vh", //Define uma altura máxima (ex: 50% da tela)
            overflowY: "auto", // Adiciona o scroll vertical
            // Estilização opcional da barra de scroll
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
          }}
        >
          {/* Saldo */}
          <Stack direction="row" spacing={1} alignItems="center">
            <AccountBalanceIcon fontSize="small" color="action" />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, textTransform: "uppercase" }}
              >
                {t("balance")}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: getSaldoColor(docente.saldo),
                }}
              >
                {docente.saldo !== undefined ? docente.saldo.toFixed(2) : "N/A"}
              </Typography>
            </Box>
          </Stack>

          {atribuicoes && (
            <>
              <Divider />
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeIcon fontSize="small" color="action" />
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, textTransform: "uppercase" }}
                  >
                    {t("assignedTeachingWorkload")}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {calcularCargaDidatica(atribuicoes).toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </>
          )}

          {/* Tipo de Agrupamento */}
          {docente.agrupar && (
            <>
              <Divider />
              <Box display="flex" flexDirection="column">
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}
                >
                  {t("groupingType")}
                </Typography>
                <Chip
                  label={docente.agrupar}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 500, width: "fit-content" }}
                />
              </Box>
            </>
          )}

          {/* Turmas com Formulários */}
          {formulariosRelacionados.length > 0 && (
            <>
              <Divider />
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <SchoolIcon fontSize="small" color="action" />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, textTransform: "uppercase" }}
                  >
                    {t("classesWithForm")}
                  </Typography>
                </Stack>
                <Grid container spacing={2}>
                  {formulariosRelacionados.map((formulario, index) => {
                    const disciplina = getDisciplinaById(
                      formulario.id_disciplina,
                    );

                    return (
                      <Grid
                        size={{ xs: 12, sm: 6 }}
                        key={`${formulario.id_disciplina}-${index}`}
                      >
                        <Box
                          sx={{
                            borderLeft: "3px solid",
                            borderColor: getPrioridadeColor(
                              formulario.prioridade,
                            ),
                            pl: 1.5,
                            py: 0.75,
                            backgroundColor: disciplina.ativo
                              ? "action.hover"
                              : "action.disabledBackground",
                            opacity: disciplina.ativo ? 1 : 0.75, // Deixa visualmente "apagado"
                            borderRadius: 1,
                            height: "100%",
                          }}
                        >
                          <Stack spacing={0.5}>
                            <Box
                              display="flex"
                              flexDirection="row"
                              flexWrap="wrap"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500, lineHeight: 1.3 }}
                              >
                                {disciplina
                                  ? `${disciplina.codigo} - T${disciplina.turma}`
                                  : formulario.id_disciplina}
                              </Typography>
                              <Typography
                                variant="caption"
                                color={
                                  disciplina.ativo
                                    ? "success.main" // Sugestão: Verde se ativa
                                    : "text.disabled" // Cinza desabilitado se inativa
                                }
                                sx={{ lineHeight: 1.2, fontWeight: 600 }}
                                p={1}
                              >
                                {disciplina.ativo ? t("active") : t("inactive")}
                              </Typography>
                            </Box>
                            {disciplina && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ lineHeight: 1.2 }}
                              >
                                {disciplina.nome}
                              </Typography>
                            )}
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              mt={0.5}
                            >
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                              >
                                <AssignmentIcon
                                  sx={{
                                    fontSize: 14,
                                    color: getPrioridadeColor(
                                      formulario.prioridade,
                                    ),
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    ...priorityPill(formulario.prioridade),
                                  }}
                                >
                                  {t("priorityLevel", {
                                    prioridade: formulario.prioridade,
                                  })}
                                </Typography>
                              </Stack>
                              {disciplina?.carga && (
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  alignItems="center"
                                >
                                  <AccessTimeIcon
                                    sx={{
                                      fontSize: 14,
                                      color: "text.secondary",
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    {disciplina.carga.toFixed(2)}
                                  </Typography>
                                </Stack>
                              )}
                            </Stack>
                          </Stack>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </>
          )}

          {/* Conteúdo adicional */}
          {children}
        </Stack>
      </Paper>
    );
  },
);

HoveredDocente.displayName = "HoveredDocente"; // Necessário para o React DevTools
export default HoveredDocente;
