"use client";

import type React from "react";

import {
  Paper,
  Stack,
  Typography,
  Divider,
  Chip,
  Box,
  Grid2,
} from "@mui/material";
import {
  Person as PersonIcon,
  School as SchoolIcon,
  AccountBalance as AccountBalanceIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import type { Dispatch, SetStateAction } from "react";
import type {
  Docente,
  Disciplina,
  Formulario,
  Atribuicao,
} from "@/algoritmo/communs/interfaces/interfaces";

interface HoveredDocenteProps {
  docente: Docente;
  disciplinas?: Disciplina[]; // Lista de disciplinas para buscar informações
  formularios?: Formulario[]; // Lista de formulários para mostrar turmas interessadas
  atribuicoes?: Atribuicao[];
  children?: React.ReactNode;
  setHoveredDocente: Dispatch<SetStateAction<Docente | null>>;
}

/**
 * Componente desenvolvido para exibir detalhes de um docente ao passar o mouse sobre ele.
 * Exibe informações como nome, saldo, tipo de agrupamento e turmas com formulários.
 */
export default function HoveredDocente({
  docente,
  disciplinas = [],
  formularios = [],
  atribuicoes = [],
  children,
  setHoveredDocente,
}: HoveredDocenteProps) {
  // Filtra formulários relacionados a este docente
  const formulariosRelacionados = formularios.filter(
    (f) => f.nome_docente === docente.nome
  );

  // Função para determinar a cor do saldo
  const getSaldoColor = (saldo?: number): string => {
    if (saldo === undefined) return "inherit";
    if (saldo > 2) return "#4caf50"; // Verde
    if (saldo < -1) return "#f44336"; // Vermelho
    return "inherit"; // Preto (cor padrão)
  };

  // Função para determinar a cor da prioridade
  const getPrioridadeColor = (prioridade: number): string => {
    if (prioridade >= 4) return "#4caf50"; // Verde para alta prioridade
    if (prioridade === 3) return "#ff9800"; // Laranja para média prioridade
    return "#f44336"; // Vermelho para baixa prioridade
  };

  // Função para buscar disciplina por ID
  const getDisciplinaById = (id: string): Disciplina | undefined => {
    return disciplinas.find((d) => d.id === id);
  };

  const calcularCargaDidatica = (atribuicoes: Atribuicao[]): number => {
    let carga = 0;

    for (const atribuicao of atribuicoes) {
      carga += disciplinas.find(
        (disciplina) => disciplina.id === atribuicao.id_disciplina
      ).carga;
    }

    return carga;
  };

  return (
    <Paper
      elevation={12}
      sx={{
        position: "fixed",
        zIndex: 99,
        bottom: "6vh",
        right: "2vw",
        maxWidth: 700,
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
      onMouseLeave={() => setHoveredDocente(null)}
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
          <PersonIcon fontSize="small" />
          <Typography
            variant="caption"
            sx={{ opacity: 0.9, textTransform: "uppercase", letterSpacing: 1 }}
          >
            Docente
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
      <Stack spacing={2} sx={{ p: 2.5 }}>
        {/* Saldo */}
        <Stack direction="row" spacing={1} alignItems="center">
          <AccountBalanceIcon fontSize="small" color="action" />
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, textTransform: "uppercase" }}
            >
              Saldo
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
                  Carga Didática Atribuída
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
                Tipo de Agrupamento
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
                  Turmas com Formulário
                </Typography>
              </Stack>
              <Grid2 container spacing={2}>
                {formulariosRelacionados.map((formulario, index) => {
                  const disciplina = getDisciplinaById(
                    formulario.id_disciplina
                  );

                  return (
                    <Grid2
                      size={{ xs: 12, sm: 6 }}
                      key={`${formulario.id_disciplina}-${index}`}
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
                        <Stack spacing={0.5}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, lineHeight: 1.3 }}
                          >
                            {disciplina
                              ? `${disciplina.codigo} - T${disciplina.turma}`
                              : formulario.id_disciplina}
                          </Typography>
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
                                    formulario.prioridade
                                  ),
                                }}
                              />
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
                            </Stack>
                            {disciplina?.carga && (
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                              >
                                <AccessTimeIcon
                                  sx={{ fontSize: 14, color: "text.secondary" }}
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
                    </Grid2>
                  );
                })}
              </Grid2>
            </Box>
          </>
        )}

        {/* Conteúdo adicional */}
        {children}
      </Stack>
    </Paper>
  );
}
