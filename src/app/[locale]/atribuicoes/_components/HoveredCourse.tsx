"use client";

import type React from "react";
import { forwardRef } from "react";
import {
  Paper,
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
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import {
  Disciplina,
  Docente,
  Formulario,
} from "@/algoritmo/communs/interfaces/interfaces";
import { useGlobalContext } from "@/context/Global";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";

interface HoveredCourseProps {
  disciplina: Disciplina;
  formularios?: Formulario[];
  docentes?: Docente[];
  children?: React.ReactNode;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * Componente desenvolvido para exibir detalhes de uma disciplina ao passar o mouse sobre ela.
 * Exibe informações como código, nome, horários, carga horária, docentes atribuídos e interessados.
 */
const HoveredCourse = forwardRef<HTMLDivElement, HoveredCourseProps>(
  (
    {
      disciplina,
      formularios = [],
      docentes = [],
      children,
      onMouseEnter,
      onMouseLeave,
    },
    ref,
  ) => {
    // Acessa o contexto global para buscar as atribuições atualizadas
    const { atribuicoes } = useGlobalContext();

    // Busca a atribuição específica desta disciplina
    const atribuicao = atribuicoes.find(
      (a) => a.id_disciplina === disciplina.id,
    );
    const listaDocentesAtribuidos = atribuicao ? atribuicao.docentes : [];

    // Filtra formulários relacionados a esta disciplina
    const formulariosRelacionados = formularios.filter(
      (f) => f.id_disciplina === disciplina.id,
    );

    const getSaldoColor = (saldo?: number): string => {
      if (saldo === undefined) return "inherit";
      if (saldo > 2) return "#4caf50"; // Verde
      if (saldo < -1) return "#f44336"; // Vermelho
      return "inherit"; // Preto (cor padrão)
    };

    const getPrioridadeColor = (prioridade: number): string => {
      if (prioridade >= 4) return "#4caf50"; // Verde para alta prioridade
      if (prioridade === 3) return "#ff9800"; // Laranja para média prioridade
      return "#f44336"; // Vermelho para baixa
    };

    const getDocenteByName = (nome: string): Docente | undefined => {
      return docentes.find((d) => d.nome === nome);
    };

    return (
      <Paper
        elevation={12}
        sx={{
          maxWidth: 700,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Cabeçalho com gradiente */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            p: 2.5,
            color: "white",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <SchoolIcon fontSize="small" />
            <Typography
              variant="caption"
              sx={{
                opacity: 0.9,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Disciplina
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
            {disciplina.codigo} - T{disciplina.turma}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.95,
              lineHeight: 1.4,
            }}
          >
            {disciplina.nome}
          </Typography>
        </Box>

        {/* Conteúdo principal */}
        <Stack
          ref={ref}
          spacing={2}
          sx={{
            p: 2.5,
            maxHeight: "55vh",
            overflowY: "auto",
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
          {/* SEÇÃO 1: Docentes Atribuídos (NOVO) */}
          {listaDocentesAtribuidos.length > 0 && (
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <CheckCircleIcon fontSize="small" color="success" />
                <Typography
                  variant="caption"
                  color="success.main"
                  sx={{ fontWeight: 700, textTransform: "uppercase" }}
                >
                  Docente Atribuído
                </Typography>
              </Stack>
              <Grid container spacing={1}>
                {listaDocentesAtribuidos.map((nomeDocente, index) => {
                  const docente = getDocenteByName(nomeDocente);
                  // Tenta achar o formulário para saber a prioridade, se houver
                  const formulario = formulariosRelacionados.find(
                    (f) => f.nome_docente === nomeDocente,
                  );
                  const saldoColor = getSaldoColor(docente?.saldo);

                  return (
                    <Grid size={{ xs: 12 }} key={`assigned-${index}`}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: "rgba(76, 175, 80, 0.08)", // Fundo verde bem claro
                          border: "1px solid",
                          borderColor: "success.main",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          {/* Saldo */}
                          <Box sx={{ textAlign: "center", minWidth: 40 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", lineHeight: 1 }}
                            >
                              Saldo
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, color: saldoColor }}
                            >
                              {docente?.saldo !== undefined
                                ? docente.saldo.toFixed(1)
                                : "-"}
                            </Typography>
                          </Box>

                          {/* Nome e Prioridade */}
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "success.dark" }}
                            >
                              {nomeDocente}
                            </Typography>
                            {formulario ? (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: getPrioridadeColor(
                                    formulario.prioridade,
                                  ),
                                  fontWeight: 600,
                                }}
                              >
                                Prioridade: {formulario.prioridade}
                              </Typography>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontStyle: "italic" }}
                              >
                                Sem formulário
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
              <Divider sx={{ mt: 2 }} />
            </Box>
          )}

          {/* Curso */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <AutoStoriesIcon fontSize="small" color="action" />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}
              >
                Curso
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              dangerouslySetInnerHTML={{
                __html: disciplina.cursos
                  .replace(/^[^;]*;/, "")
                  .replace(/<br\s*\/?>/gi, "")
                  .replace(/&emsp;/gi, " "),
              }}
            />
          </Box>

          <Divider />

          {/* Carga Didática */}
          {disciplina.carga && (
            <>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeIcon fontSize="small" color="action" />
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, textTransform: "uppercase" }}
                  >
                    Carga Didática
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {disciplina.carga.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
              <Divider />
            </>
          )}

          {/* Horários */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <CalendarMonthIcon fontSize="small" color="action" />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, textTransform: "uppercase" }}
              >
                Horários
              </Typography>
            </Stack>
            {disciplina.horarios && disciplina.horarios.length > 0 ? (
              <Stack spacing={0.5}>
                {disciplina.horarios.map((horario, index) => (
                  <Chip
                    key={`${disciplina.id}-horario-${index}`}
                    label={`${horario.dia} ${horario.inicio} - ${horario.fim}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      justifyContent: "flex-start",
                      fontFamily: "monospace",
                      width: "fit-content",
                    }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                fontStyle="italic"
              >
                A definir
              </Typography>
            )}
          </Box>

          {/* Docentes com Formulários (Interessados) */}
          {formulariosRelacionados.length > 0 && (
            <>
              <Divider />
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, textTransform: "uppercase" }}
                  >
                    Docentes Interessados ({formulariosRelacionados.length})
                  </Typography>
                </Stack>
                <Grid
                  container
                  spacing={2}
                  // sx={{ maxHeight: 200, overflow: "auto" }}
                >
                  {formulariosRelacionados.map((formulario, index) => {
                    const docente = getDocenteByName(formulario.nome_docente);
                    const saldoColor = getSaldoColor(docente?.saldo);
                    const isAssigned = listaDocentesAtribuidos.includes(
                      formulario.nome_docente,
                    );

                    return (
                      <Grid
                        size={{ xs: 12, sm: 6 }}
                        key={`${formulario.nome_docente}-${index}`}
                        minWidth={300}
                      >
                        <Box
                          sx={{
                            borderLeft: "3px solid",
                            borderColor: isAssigned
                              ? "success.main"
                              : getPrioridadeColor(formulario.prioridade),

                            // Se estiver atribuído, destaca o fundo e adiciona borda extra
                            backgroundColor: isAssigned
                              ? "rgba(76, 175, 80, 0.12)"
                              : "action.hover",
                            border: isAssigned ? "1px solid" : undefined,
                            borderLeftWidth: isAssigned ? "3px" : undefined, // Mantém a borderLeft colorida

                            borderLeftColor: getPrioridadeColor(
                              formulario.prioridade,
                            ), // Garante que a borda esquerda continue sendo a prioridade
                            pl: 1.5,
                            py: 0.75,
                            pr: 1,
                            borderRadius: 1,
                            height: "100%",
                            position: "relative", // Para posicionar ícone se quiser
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: saldoColor,
                                minWidth: "35px",
                              }}
                            >
                              {docente?.saldo !== undefined
                                ? docente.saldo.toFixed(2)
                                : "N/A"}
                            </Typography>
                            <Box flex={1}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: isAssigned ? 700 : 500,
                                    color: isAssigned
                                      ? "success.dark"
                                      : "text.primary",
                                  }}
                                >
                                  {formulario.nome_docente}
                                </Typography>
                                {isAssigned && (
                                  <CheckCircleIcon
                                    sx={{ fontSize: 14, color: "success.main" }}
                                  />
                                )}
                              </Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: getPrioridadeColor(
                                    formulario.prioridade,
                                  ),
                                  fontWeight: 600,
                                }}
                              >
                                Prioridade: {formulario.prioridade}
                              </Typography>
                            </Box>
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

HoveredCourse.displayName = "HoveredCourse"; // Necessário para o React DevTools
export default HoveredCourse;
