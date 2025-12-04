"use client";

import type React from "react";

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
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import {
  Disciplina,
  Docente,
  Formulario,
} from "@/algoritmo/communs/interfaces/interfaces";
import { forwardRef } from "react";

interface HoveredCourseProps {
  disciplina: Disciplina;
  formularios?: Formulario[]; // Lista de formulários para mostrar docentes interessados
  docentes?: Docente[]; // Adicionada lista de docentes para acessar o saldo
  children?: React.ReactNode;
  // setHoveredCourese: Dispatch<SetStateAction<Disciplina | null>>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * Componente desenvolvido para exibir detalhes de uma disciplina ao passar o mouse sobre ela.
 * Exibe informações como código, nome, horários, carga horária e docentes interessados.
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
    ref // <-- ref vindo do forwardRef
  ) => {
    // Filtra formulários relacionados a esta disciplina
    const formulariosRelacionados = formularios.filter(
      (f) => f.id_disciplina === disciplina.id
    );

    const getSaldoColor = (saldo?: number): string => {
      if (saldo === undefined) return "inherit";
      if (saldo > 2) return "#4caf50"; // Verde
      if (saldo < -1) return "#f44336"; // Vermelho
      return "inherit"; // Preto (cor padrão)
    };

    // Função para determinar a cor da prioridade
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getPrioridadeColor = (prioridade: number): string => {
      if (prioridade >= 4) return "#4caf50"; // Verde para alta prioridade
      if (prioridade === 3) return "#ff9800"; // Laranja para média prioridade
      return "#f44336";
      // return "#364cf4ff"; // "#f44336" Vermelho para baixa prioridade
    };

    const getDocenteByName = (nome: string): Docente | undefined => {
      return docentes.find((d) => d.nome === nome);
    };

    return (
      <Paper
        elevation={12}
        sx={{
          // position: "fixed",
          // zIndex: 99,
          // bottom: "6vh",
          // right: "2vw",
          maxWidth: 700, // Aumentada a largura máxima de 380 para 700
          borderRadius: 3,
          // overflow: "hidden",
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
            maxHeight: "55vh", // Define uma altura máxima
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
          {/* Curso */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}
            >
              Curso
            </Typography>
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
              <ScheduleIcon fontSize="small" color="action" />
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

          {/* Docentes com Formulários */}
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
                    Docentes Interessados
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

                    return (
                      <Grid
                        size={{ xs: 12, sm: 6 }}
                        key={`${formulario.nome_docente}-${index}`}
                        minWidth={300}
                      >
                        <Box
                          sx={{
                            borderLeft: "3px solid",
                            borderColor: getPrioridadeColor(
                              formulario.prioridade
                            ),
                            pl: 1.5,
                            py: 0.75,
                            backgroundColor: "action.hover",
                            borderRadius: 1,
                            height: "100%",
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
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {formulario.nome_docente}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: getPrioridadeColor(
                                    formulario.prioridade
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
  }
);

HoveredCourse.displayName = "HoveredCourse"; // Necessário para o React DevTools
export default HoveredCourse;
