"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import { useGlobalContext } from "@/context/Global";
import DocenteDetailsDialog from "./DocenteDetailsDialog";
import DisciplinaDetailsDialog from "./DisciplinaDetailsDialog";
import DetailedAssignmentAnalysis from "./DetailedAssignmentAnalysis";
import { HistoricoSolucao } from "@/context/Global/utils";

interface AssignmentComparisonProps {
  solutionA: HistoricoSolucao;
  solutionB: HistoricoSolucao;
  differences: {
    added: { disciplina: string; docentes: string[] }[];
    removed: { disciplina: string; docentes: string[] }[];
    modified: {
      disciplina: string;
      docentesA: string[];
      docentesB: string[];
      added: string[];
      removed: string[];
    }[];
    unchanged: { disciplina: string; docentes: string[] }[];
  } | null;
}

export default function AssignmentComparison({
  solutionA,
  solutionB,
  differences,
}: AssignmentComparisonProps) {
  const { docentes, disciplinas } = useGlobalContext();
  const [currentTab, setCurrentTab] = useState(0);
  const [docenteDetailsOpen, setDocenteDetailsOpen] = useState(false);
  const [disciplinaDetailsOpen, setDisciplinaDetailsOpen] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState<any>(null);
  const [selectedDisciplina, setSelectedDisciplina] = useState<any>(null);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  if (!differences) return null;

  const getDisciplinaInfo = (id: string) => {
    return disciplinas.find((d) => d.id === id);
  };

  const getDocenteInfo = (nome: string) => {
    return docentes.find((d) => d.nome === nome);
  };

  const openDocenteDetails = (docenteNome: string) => {
    const docente = getDocenteInfo(docenteNome);
    if (docente) {
      setSelectedDocente(docente);
      setDocenteDetailsOpen(true);
    }
  };

  const openDisciplinaDetails = (disciplinaId: string) => {
    const disciplina = getDisciplinaInfo(disciplinaId);
    if (disciplina) {
      setSelectedDisciplina(disciplina);
      setDisciplinaDetailsOpen(true);
    }
  };

  const renderDisciplinaChip = (disciplinaId: string) => {
    const disciplina = getDisciplinaInfo(disciplinaId);
    return (
      <Chip
        label={
          disciplina
            ? `${disciplina.codigo} - ${disciplina.nome}`
            : disciplinaId
        }
        size="small"
        icon={<SchoolIcon />}
        onClick={() => openDisciplinaDetails(disciplinaId)}
        sx={{ cursor: "pointer", m: 0.5 }}
      />
    );
  };

  const renderDocenteChip = (
    docenteNome: string,
    color: "default" | "success" | "error" = "default"
  ) => {
    return (
      <Chip
        label={docenteNome}
        size="small"
        icon={<PersonIcon />}
        color={color}
        onClick={() => openDocenteDetails(docenteNome)}
        sx={{ cursor: "pointer", m: 0.5 }}
      />
    );
  };

  const tabData = [
    {
      label: `Modificadas (${differences.modified.length})`,
      data: differences.modified,
      type: "modified",
    },
    {
      label: `Adicionadas (${differences.added.length})`,
      data: differences.added,
      type: "added",
    },
    {
      label: `Removidas (${differences.removed.length})`,
      data: differences.removed,
      type: "removed",
    },
    {
      label: `Inalteradas (${differences.unchanged.length})`,
      data: differences.unchanged,
      type: "unchanged",
    },
  ];

  // Mostrar análise detalhada se solicitado
  if (showDetailedAnalysis) {
    return (
      <>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setShowDetailedAnalysis(false)}
            startIcon={<ExpandMoreIcon sx={{ transform: "rotate(90deg)" }} />}
          >
            Voltar à Visão Simples
          </Button>
        </Box>
        <DetailedAssignmentAnalysis
          solutionA={solutionA}
          solutionB={solutionB}
          differences={differences}
        />
      </>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Comparação das Atribuições</Typography>
            {differences.modified.length > 0 && (
              <Button
                variant="contained"
                startIcon={<AnalyticsIcon />}
                onClick={() => setShowDetailedAnalysis(true)}
                color="primary"
              >
                Análise Detalhada
              </Button>
            )}
          </Box>

          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{ mb: 2 }}
          >
            {tabData.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>

          <Box>
            {currentTab === 0 && ( // Modificadas
              <Box>
                {differences.modified.length === 0 ? (
                  <Typography
                    color="text.secondary"
                    align="center"
                    sx={{ py: 4 }}
                  >
                    Nenhuma atribuição foi modificada
                  </Typography>
                ) : (
                  differences.modified.map((item, index) => (
                    <Accordion key={index}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            width: "100%",
                          }}
                        >
                          {renderDisciplinaChip(item.disciplina)}
                          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                            <Chip
                              label={`+${item.added.length}`}
                              color="success"
                              size="small"
                            />
                            <Chip
                              label={`-${item.removed.length}`}
                              color="error"
                              size="small"
                            />
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Solução A:
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            {item.docentesA.map((docente) =>
                              renderDocenteChip(docente)
                            )}
                          </Box>

                          <Typography variant="subtitle2" gutterBottom>
                            Solução B:
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            {item.docentesB.map((docente) =>
                              renderDocenteChip(docente)
                            )}
                          </Box>

                          {item.added.length > 0 && (
                            <>
                              <Typography
                                variant="subtitle2"
                                color="success.main"
                                gutterBottom
                              >
                                Docentes Adicionados:
                              </Typography>
                              <Box sx={{ mb: 1 }}>
                                {item.added.map((docente) =>
                                  renderDocenteChip(docente, "success")
                                )}
                              </Box>
                            </>
                          )}

                          {item.removed.length > 0 && (
                            <>
                              <Typography
                                variant="subtitle2"
                                color="error.main"
                                gutterBottom
                              >
                                Docentes Removidos:
                              </Typography>
                              <Box>
                                {item.removed.map((docente) =>
                                  renderDocenteChip(docente, "error")
                                )}
                              </Box>
                            </>
                          )}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))
                )}
              </Box>
            )}

            {currentTab === 1 && ( // Adicionadas
              <Box>
                {differences.added.length === 0 ? (
                  <Typography
                    color="text.secondary"
                    align="center"
                    sx={{ py: 4 }}
                  >
                    Nenhuma atribuição foi adicionada
                  </Typography>
                ) : (
                  differences.added.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 2,
                        p: 2,
                        border: 1,
                        borderColor: "success.main",
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        {renderDisciplinaChip(item.disciplina)}
                        <Chip label="Nova" color="success" size="small" />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Docentes atribuídos:
                      </Typography>
                      <Box>
                        {item.docentes.map((docente) =>
                          renderDocenteChip(docente, "success")
                        )}
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            )}

            {currentTab === 2 && ( // Removidas
              <Box>
                {differences.removed.length === 0 ? (
                  <Typography
                    color="text.secondary"
                    align="center"
                    sx={{ py: 4 }}
                  >
                    Nenhuma atribuição foi removida
                  </Typography>
                ) : (
                  differences.removed.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 2,
                        p: 2,
                        border: 1,
                        borderColor: "error.main",
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        {renderDisciplinaChip(item.disciplina)}
                        <Chip label="Removida" color="error" size="small" />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Docentes que estavam atribuídos:
                      </Typography>
                      <Box>
                        {item.docentes.map((docente) =>
                          renderDocenteChip(docente, "error")
                        )}
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            )}

            {currentTab === 3 && ( // Inalteradas
              <Box>
                {differences.unchanged.length === 0 ? (
                  <Typography
                    color="text.secondary"
                    align="center"
                    sx={{ py: 4 }}
                  >
                    Nenhuma atribuição permaneceu inalterada
                  </Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Disciplina</TableCell>
                          <TableCell>Docentes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {differences.unchanged.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {renderDisciplinaChip(item.disciplina)}
                            </TableCell>
                            <TableCell>
                              <Box>
                                {item.docentes.map((docente) =>
                                  renderDocenteChip(docente)
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Dialogs de Detalhes */}
      {selectedDocente && (
        <DocenteDetailsDialog
          open={docenteDetailsOpen}
          onClose={() => setDocenteDetailsOpen(false)}
          docente={selectedDocente}
        />
      )}

      {selectedDisciplina && (
        <DisciplinaDetailsDialog
          open={disciplinaDetailsOpen}
          onClose={() => setDisciplinaDetailsOpen(false)}
          disciplina={selectedDisciplina}
        />
      )}
    </>
  );
}
