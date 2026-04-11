"use client";
import {
  Box,
  Typography,
  Stack,
  LinearProgress,
  Avatar,
  Collapse,
  Divider,
  Grid,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import TurmaCard from "./TurmaCard";
import { Disciplina } from "@/context/Global/utils";
import { useMemo } from "react";
import { Celula, TipoTrava } from "@/algoritmo/communs/interfaces/interfaces";

type Props = {
  nome: string;
  turmas: Disciplina[];
  selecionado: boolean;
  cargaDidatica: number;
  saldo: number;
  maxCarga?: number;
  onClick: () => void;
  onDeleteAtribuicao: (nome_docente: string, id_disciplina: string) => void;
  turmasNaoAtribuidas: Disciplina[];
  onAddAtribuicao: (nome_docente: string, id_disciplina: string) => void;
  onHoveredDocente: (nome: string | null) => void;
  onTurmaClick?: (idTurma: string) => void;
  onTravar?: (nome_docente: string, id_disciplina: string) => void;
  celulas?: Celula[];
  canNavigate?: boolean;
};

export default function DocenteRow({
  nome,
  turmas,
  selecionado,
  cargaDidatica,
  saldo,
  maxCarga = 0,
  onClick,
  onDeleteAtribuicao,
  turmasNaoAtribuidas,
  onAddAtribuicao,
  onHoveredDocente,
  onTurmaClick,
  onTravar,
  celulas = [],
  canNavigate = true,
}: Props) {
  const cargaFormatada = Number(cargaDidatica).toFixed(2);
  const metaFormatada = maxCarga > 0 ? Number(maxCarga).toFixed(2) : "--";

  const progress =
    maxCarga > 0 ? Math.min((cargaDidatica / maxCarga) * 100, 100) : 0;
  const isOverload = maxCarga > 0 && cargaDidatica > maxCarga;

  const saldoColor =
    saldo > 0 ? "success.main" : saldo < 0 ? "error.main" : "text.primary";

  const saldoTexto = saldo > 0 ? `+${saldo.toFixed(2)}` : saldo.toFixed(2);

  const idsComConflito = useMemo(() => {
    const conflitos = new Set<string>();
    turmas.forEach((t) => {
      if (t.conflitos) {
        t.conflitos.forEach((idConflito) => conflitos.add(idConflito));
      }
    });
    return conflitos;
  }, [turmas]);

  // Função para verificar se uma célula está travada
  const isTurmaTravada = (idDisciplina: string): boolean => {
    const celula = celulas.find(
      (c) => c.id_disciplina === idDisciplina && c.nome_docente === nome,
    );
    return celula?.trava === true && celula?.tipo_trava !== TipoTrava.NotTrava;
  };

  const handleTravar = (idDisciplina: string) => {
    onTravar?.(nome, idDisciplina);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ marginBottom: "16px" }}
    >
      <Box
        onClick={onClick}
        onMouseEnter={() => onHoveredDocente(nome)}
        onMouseLeave={() => onHoveredDocente(null)}
        sx={{
          p: 2,
          cursor: "pointer",
          bgcolor: selecionado ? "#fff" : "#f9fafb",
          border: selecionado ? "1px solid #1976d2" : "1px solid #e0e0e0",
          borderRadius: 3,
          boxShadow: selecionado
            ? "0 4px 12px rgba(25, 118, 210, 0.15)"
            : "none",
          transition: "all 0.3s ease",
          "&:hover": {
            bgcolor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          },
        }}
      >
        <Grid container alignItems="center" spacing={2}>
          <Grid>
            <Avatar
              sx={{
                bgcolor: selecionado ? "primary.main" : "grey.400",
                width: 48,
                height: 48,
              }}
            >
              {nome.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>

          <Grid>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography
                variant="h6"
                color={selecionado ? "text.primary" : "text.secondary"}
              >
                {nome}
              </Typography>
              <Chip
                label={`Saldo: ${saldoTexto}`}
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: "bold",
                  color: saldoColor,
                  borderColor: saldoColor,
                  opacity: 0.8,
                }}
              />
            </Box>

            <Box display="flex" alignItems="center" mt={0.5} maxWidth={350}>
              <Box width="100%" mr={2}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  color={
                    isOverload
                      ? "error"
                      : progress >= 100
                        ? "success"
                        : "primary"
                  }
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
              <Box minWidth={85}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  {cargaFormatada}h{" "}
                  <Typography component="span" variant="caption">
                    / {metaFormatada}h
                  </Typography>
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Collapse in={selecionado} timeout="auto" unmountOnExit>
          <Box mt={3}>
            <Divider sx={{ mb: 2 }} />

            <Typography
              variant="subtitle2"
              color="primary"
              gutterBottom
              sx={{
                textTransform: "uppercase",
                letterSpacing: 1,
                fontSize: "0.75rem",
              }}
            >
              Turmas Atribuídas
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              overflow="auto"
              pb={2}
              sx={{ minHeight: 180 }}
            >
              {turmas.length > 0 ? (
                turmas.map((turma) => (
                  <TurmaCard
                    key={turma.id}
                    {...turma}
                    carga={turma.carga || 0}
                    nivel={turma.nivel}
                    noturna={turma.noturna}
                    ingles={turma.ingles}
                    docentesAtribuidos={turma.docentes || []}
                    isAtribuida={true}
                    isTravada={isTurmaTravada(turma.id)}
                    hasConflict={idsComConflito.has(turma.id)}
                    curso={turma.cursos}
                    onAction={() => {
                      if (!isTurmaTravada(turma.id)) {
                        onDeleteAtribuicao(nome, turma.id);
                      }
                    }}
                    onTravar={() => handleTravar(turma.id)}
                    onClick={() => onTurmaClick?.(turma.id)}
                    canNavigate={canNavigate}
                  />
                ))
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  width="100%"
                  bgcolor="grey.50"
                  borderRadius={2}
                  border="1px dashed #ccc"
                  py={4}
                >
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma turma atribuída
                  </Typography>
                </Box>
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{
                textTransform: "uppercase",
                letterSpacing: 1,
                fontSize: "0.75rem",
              }}
            >
              Disponíveis para atribuição
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              overflow="auto"
              pb={1}
              sx={{ minHeight: 180 }}
            >
              {turmasNaoAtribuidas.length > 0 ? (
                turmasNaoAtribuidas.map((turma) => (
                  <TurmaCard
                    key={turma.id}
                    {...turma}
                    carga={turma.carga || 0}
                    nivel={turma.nivel}
                    noturna={turma.noturna}
                    ingles={turma.ingles}
                    docentesAtribuidos={turma.docentes || []}
                    isAtribuida={false}
                    isTravada={isTurmaTravada(turma.id)}
                    curso={turma.cursos}
                    hasConflict={idsComConflito.has(turma.id)}
                    onAction={() => onAddAtribuicao(nome, turma.id)}
                    onTravar={() => {
                      // Adicionar e travar
                      onAddAtribuicao(nome, turma.id);
                      handleTravar(turma.id);
                    }}
                    onClick={() => onTurmaClick?.(turma.id)}
                    canNavigate={canNavigate}
                  />
                ))
              ) : (
                <Box p={2}>
                  <Typography variant="body2" color="text.secondary">
                    Sem sugestões no momento
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Collapse>
      </Box>
    </motion.div>
  );
}
