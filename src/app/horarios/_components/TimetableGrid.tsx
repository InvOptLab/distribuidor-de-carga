"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid2 as Grid,
  Chip,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import TimeSlot from "./TimeSlot";
import ClassDetailsDialog from "./ClassDetailsDialog";
import type { TimetableEntry } from "../page";
import { Docente } from "@/context/Global/utils";

interface TimetableGridProps {
  timetableData: TimetableEntry[];
  viewMode: "compact" | "detailed";
  docentes: Docente[];
}

export default function TimetableGrid({
  timetableData,
  viewMode,
  docentes,
}: TimetableGridProps) {
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(
    null
  );
  const [expandedDays, setExpandedDays] = useState<Set<string>>(
    new Set(["Seg.", "Ter.", "Qua.", "Qui.", "Sex."])
  );

  // Organizar dados por dia da semana
  const dataByDay = useMemo(() => {
    const organized: Record<string, TimetableEntry[]> = {};

    timetableData.forEach((entry) => {
      if (!organized[entry.dia]) {
        organized[entry.dia] = [];
      }
      organized[entry.dia].push(entry);
    });

    // Ordenar por horário dentro de cada dia
    Object.keys(organized).forEach((dia) => {
      organized[dia].sort((a, b) => a.inicio.localeCompare(b.inicio));
    });

    return organized;
  }, [timetableData]);

  // Obter todos os horários únicos para criar a grade
  const uniqueTimeSlots = useMemo(() => {
    const slots = new Set<string>();
    timetableData.forEach((entry) => {
      slots.add(`${entry.inicio}-${entry.fim}`);
    });
    return Array.from(slots).sort();
  }, [timetableData]);

  const diasSemana = ["Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."];

  const toggleDayExpansion = (dia: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dia)) {
      newExpanded.delete(dia);
    } else {
      newExpanded.add(dia);
    }
    setExpandedDays(newExpanded);
  };

  if (timetableData.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <ScheduleIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhum horário encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A solução selecionada não possui disciplinas com horários definidos.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === "compact") {
    // Visualização em grade compacta
    return (
      <>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Grade de Horários - Visualização Compacta
            </Typography>

            <Box sx={{ overflowX: "auto" }}>
              <Box
                sx={{
                  minWidth: 800,
                  display: "grid",
                  gridTemplateColumns: "120px repeat(6, 1fr)",
                  gap: 1,
                }}
              >
                {/* Cabeçalho */}
                <Box
                  sx={{
                    p: 1,
                    fontWeight: "bold",
                    textAlign: "center",
                    bgcolor: "grey.100",
                  }}
                >
                  Horário
                </Box>
                {diasSemana.map((dia) => (
                  <Box
                    key={dia}
                    sx={{
                      p: 1,
                      fontWeight: "bold",
                      textAlign: "center",
                      bgcolor: "primary.50",
                    }}
                  >
                    {dia}
                  </Box>
                ))}

                {/* Linhas de horários */}
                {uniqueTimeSlots.map((timeSlot) => (
                  <>
                    <Box
                      key={`time-${timeSlot}`}
                      sx={{
                        p: 1,
                        textAlign: "center",
                        bgcolor: "grey.50",
                        fontSize: "0.875rem",
                      }}
                    >
                      {timeSlot}
                    </Box>
                    {diasSemana.map((dia) => {
                      const entriesForSlot =
                        dataByDay[dia]?.filter(
                          (entry) => `${entry.inicio}-${entry.fim}` === timeSlot
                        ) || [];

                      return (
                        <Box
                          key={`${dia}-${timeSlot}`}
                          sx={{
                            p: 0.5,
                            minHeight: 60,
                            border: "1px solid",
                            borderColor: "grey.200",
                          }}
                        >
                          {entriesForSlot.map((entry, index) => (
                            <TimeSlot
                              key={`${entry.disciplina.id}-${index}`}
                              entry={entry}
                              viewMode="compact"
                              onClick={() => setSelectedEntry(entry)}
                            />
                          ))}
                        </Box>
                      );
                    })}
                  </>
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>

        <ClassDetailsDialog
          entry={selectedEntry}
          open={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
          docentes={docentes}
        />
      </>
    );
  }

  // Visualização detalhada por dia
  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {diasSemana.map((dia) => {
          const dayEntries = dataByDay[dia] || [];
          const isExpanded = expandedDays.has(dia);

          if (dayEntries.length === 0) return null;

          // Contar disciplinas únicas para este dia
          const disciplinasUnicas = new Set(
            dayEntries.map((entry) => entry.disciplina.id)
          );
          const disciplinasAtribuidas = new Set(
            dayEntries
              .filter((entry) => entry.docentes.length > 0)
              .map((entry) => entry.disciplina.id)
          );

          return (
            <Card key={dia} variant="outlined">
              <CardContent sx={{ pb: isExpanded ? 2 : 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: isExpanded ? 2 : 0,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="h6" color="primary">
                      {dia}
                    </Typography>
                    <Chip
                      label={`${disciplinasUnicas.size} disciplinas`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`${disciplinasAtribuidas.size} atribuídas`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Box>

                  <IconButton
                    onClick={() => toggleDayExpansion(dia)}
                    size="small"
                  >
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                <Collapse in={isExpanded}>
                  <Grid container spacing={2}>
                    {dayEntries.map((entry, index) => (
                      <Grid
                        size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                        key={`${entry.disciplina.id}-${index}`}
                      >
                        <TimeSlot
                          entry={entry}
                          viewMode="detailed"
                          onClick={() => setSelectedEntry(entry)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Collapse>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <ClassDetailsDialog
        entry={selectedEntry}
        open={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        docentes={docentes}
      />
    </>
  );
}
