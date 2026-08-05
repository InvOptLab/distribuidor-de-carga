"use client";

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Paper,
  Chip,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Info as InfoIcon,
  Class as ClassIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Disciplina, Horario } from "@/algoritmo/communs/interfaces/interfaces";
import { useGlobalContext } from "@/context/Global";
import { useAlertsContext } from "@/context/Alerts";
import { disciplinasConflitam } from "@/context/Global/utils";
import IdentifierChangeDialog from "./IdentifierChangeDialog";
import { useTranslations } from "next-intl";

const DIAS_SEMANA: Horario["dia"][] = [
  "Seg.",
  "Ter.",
  "Qua.",
  "Qui.",
  "Sex.",
  "Sáb.",
];

interface TurmaFormProps {
  turmaParaEditar?: Disciplina | null;
  onClose?: () => void;
  onSave?: () => void;
}

export default function TurmaForm({
  turmaParaEditar,
  onClose,
  onSave,
}: TurmaFormProps) {
  const { disciplinas, setDisciplinas, atribuicoes, setAtribuicoes } =
    useGlobalContext();
  const { addAlerta } = useAlertsContext();
  const t = useTranslations("Pages.Cadastro.Components.TurmaForm");

  const [id, setId] = useState("");
  const [codigo, setCodigo] = useState("");
  const [turma, setTurma] = useState<number>(1);
  const [nome, setNome] = useState("");
  const [cursos, setCursos] = useState("");
  const [ementa, setEmenta] = useState("");
  const [nivel, setNivel] = useState("");
  const [prioridade, setPrioridade] = useState<number>(1);
  const [noturna, setNoturna] = useState(false);
  const [ingles, setIngles] = useState(false);
  const [ativo, setAtivo] = useState(true);
  const [grupo, setGrupo] = useState("");
  const [carga, setCarga] = useState<number | undefined>(undefined);

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [novoDia, setNovoDia] = useState<Horario["dia"]>("Seg.");
  const [novoInicio, setNovoInicio] = useState("08:00");
  const [novoFim, setNovoFim] = useState("10:00");

  const [showIdentifierDialog, setShowIdentifierDialog] = useState(false);
  const [originalId, setOriginalId] = useState<string | null>(null);

  useEffect(() => {
    if (turmaParaEditar) {
      setId(turmaParaEditar.id);
      setCodigo(turmaParaEditar.codigo);
      setTurma(turmaParaEditar.turma);
      setNome(turmaParaEditar.nome);
      setCursos(turmaParaEditar.cursos);
      setEmenta(turmaParaEditar.ementa);
      setNivel(turmaParaEditar.nivel);
      setPrioridade(turmaParaEditar.prioridade);
      setNoturna(turmaParaEditar.noturna);
      setIngles(turmaParaEditar.ingles);
      setAtivo(turmaParaEditar.ativo);
      setGrupo(turmaParaEditar.grupo);
      setCarga(turmaParaEditar.carga);
      setHorarios([...turmaParaEditar.horarios]);
      setOriginalId(turmaParaEditar.id);
    } else {
      limparFormulario();
    }
  }, [turmaParaEditar]);

  const limparFormulario = () => {
    setId("");
    setCodigo("");
    setTurma(1);
    setNome("");
    setCursos("");
    setEmenta("");
    setNivel("");
    setPrioridade(1);
    setNoturna(false);
    setIngles(false);
    setAtivo(true);
    setGrupo("");
    setCarga(undefined);
    setHorarios([]);
    setOriginalId(null);
  };

  const handleAddHorario = () => {
    if (novoInicio >= novoFim) {
      addAlerta(t("alerts.invalidTime"), "error");
      return;
    }

    const horarioExiste = horarios.some(
      (h) => h.dia === novoDia && h.inicio === novoInicio && h.fim === novoFim,
    );
    if (horarioExiste) {
      addAlerta(t("alerts.scheduleExists"), "warning");
      return;
    }

    const novoHorario: Horario = {
      dia: novoDia,
      inicio: novoInicio,
      fim: novoFim,
    };

    setHorarios([...horarios, novoHorario]);
    addAlerta(
      t("alerts.scheduleAdded", { day: novoDia, start: novoInicio, end: novoFim }),
      "info",
    );
  };

  const handleRemoveHorario = (index: number) => {
    const removed = horarios[index];
    setHorarios(horarios.filter((_, i) => i !== index));
    addAlerta(
      t("alerts.scheduleRemoved", { day: removed.dia, start: removed.inicio, end: removed.fim }),
      "info",
    );
  };

  const handleSubmit = () => {
    if (!codigo.trim()) {
      addAlerta(t("alerts.codeRequired"), "error");
      return;
    }

    if (!nome.trim()) {
      addAlerta(t("alerts.nameRequired"), "error");
      return;
    }

    if (horarios.length === 0) {
      addAlerta(t("alerts.scheduleRequired"), "error");
      return;
    }

    const novoId = turmaParaEditar
      ? id
      : `${codigo.trim()}-${turma}-${Date.now()}`;

    if (turmaParaEditar && originalId && originalId !== novoId) {
      setShowIdentifierDialog(true);
      return;
    }

    salvarTurma(false, novoId);
  };

  const salvarTurma = (excluirAntigo: boolean, novoId?: string) => {
    const idFinal =
      novoId || (turmaParaEditar ? id : `${codigo.trim()},${turma}`);

    // Verifica se já existe uma turma com o mesmo código e número (exceto a que está sendo editada)
    const turmaExiste = disciplinas.some(
      (d) =>
        d.codigo.toLowerCase() === codigo.trim().toLowerCase() &&
        d.turma === turma &&
        d.id !== originalId,
    );
    if (turmaExiste && !excluirAntigo) {
      addAlerta(
        t("alerts.classExists", { number: turma, code: codigo }),
        "error",
      );
      return;
    }

    const novaDisciplina: Disciplina = {
      id: idFinal,
      codigo: codigo.trim(),
      turma,
      nome: nome.trim(),
      horario: horarios.map((h) => `${h.dia} ${h.inicio}/${h.fim}`).join(", "),
      horarios: [...horarios],
      cursos: cursos.trim(),
      ementa: ementa.trim(),
      nivel: nivel.trim(),
      prioridade,
      noturna,
      ingles,
      ativo,
      conflitos: new Set<string>(),
      trava: turmaParaEditar?.trava || false,
      grupo: grupo.trim(),
      carga,
    };

    let disciplinasAtualizadas: Disciplina[];

    if (
      turmaParaEditar &&
      originalId &&
      !excluirAntigo &&
      originalId === idFinal
    ) {
      // Primeiro, remove esta disciplina da lista para recalcular conflitos
      disciplinasAtualizadas = disciplinas.filter((d) => d.id !== originalId);
    } else if (excluirAntigo && originalId) {
      disciplinasAtualizadas = disciplinas.filter((d) => d.id !== originalId);
      // Remove a referência da antiga nos conflitos de outras disciplinas
      disciplinasAtualizadas = disciplinasAtualizadas.map((d) => {
        const novosConflitos = new Set(d.conflitos);
        novosConflitos.delete(originalId);
        return { ...d, conflitos: novosConflitos };
      });
    } else {
      disciplinasAtualizadas = [...disciplinas];
    }

    const conflitosEncontrados: string[] = [];
    disciplinasAtualizadas = disciplinasAtualizadas.map((disc) => {
      if (disciplinasConflitam(novaDisciplina, disc)) {
        conflitosEncontrados.push(disc.id);
        const novosConflitos = new Set(disc.conflitos);
        novosConflitos.add(idFinal);
        return { ...disc, conflitos: novosConflitos };
      }
      return disc;
    });

    novaDisciplina.conflitos = new Set(conflitosEncontrados);
    disciplinasAtualizadas.push(novaDisciplina);

    setDisciplinas(disciplinasAtualizadas);

    if (!turmaParaEditar || excluirAntigo) {
      if (excluirAntigo && originalId) {
        // Remove atribuição antiga
        const novasAtribuicoes = atribuicoes.filter(
          (a) => a.id_disciplina !== originalId,
        );
        novasAtribuicoes.push({ id_disciplina: idFinal, docentes: [] });
        setAtribuicoes(novasAtribuicoes);
      } else if (!turmaParaEditar) {
        setAtribuicoes([
          ...atribuicoes,
          { id_disciplina: idFinal, docentes: [] },
        ]);
      }
    }

    // Feedback
    if (conflitosEncontrados.length > 0) {
      const nomesConflitantes = conflitosEncontrados.map((confId) => {
        const disc = disciplinasAtualizadas.find((d) => d.id === confId);
        return disc ? `${disc.nome} (T${disc.turma})` : confId;
      });
      if (turmaParaEditar) {
        addAlerta(
          t("alerts.updatedWithConflicts", { count: conflitosEncontrados.length, conflicts: nomesConflitantes.join(", ") }),
          "warning",
        );
      } else {
        addAlerta(
          t("alerts.createdWithConflicts", { count: conflitosEncontrados.length, conflicts: nomesConflitantes.join(", ") }),
          "warning",
        );
      }
    } else {
      if (excluirAntigo) {
        addAlerta(
          t("alerts.classReplaced", { id: originalId, name: nome, number: turma }),
          "success",
        );
      } else if (turmaParaEditar) {
        addAlerta(
          t("alerts.classUpdated", { name: nome, number: turma }),
          "success",
        );
      } else {
        addAlerta(
          t("alerts.classCreated", { name: nome, number: turma }),
          "success",
        );
      }
    }

    limparFormulario();
    setShowIdentifierDialog(false);
    onSave?.();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
          borderBottom: "2px solid",
          borderColor: "primary.light",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              backgroundColor: "primary.light",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ClassIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {turmaParaEditar ? t("header.editClass") : t("header.newClass")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("header.subtitle")}
            </Typography>
          </Box>
        </Box>
        {onClose && (
          <Tooltip title={t("header.closeForm")}>
            <IconButton onClick={onClose} sx={{ color: "text.secondary" }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          background:
            "linear-gradient(135deg, rgba(25, 103, 210, 0.02) 0%, transparent 100%)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 4,
              height: 24,
              borderRadius: 1,
              backgroundColor: "primary.main",
            }}
          />
          <Typography variant="subtitle1" fontWeight={600}>
            {t("classInfo.title")}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          {turmaParaEditar && (
            <Tooltip
              title={t("classInfo.idTooltip")}
              placement="top"
              arrow
            >
              <TextField
                label={t("classInfo.idLabel")}
                value={id}
                onChange={(e) => setId(e.target.value)}
                sx={{ gridColumn: { md: "span 2" } }}
              />
            </Tooltip>
          )}

          <Tooltip
            title={t("classInfo.codeTooltip")}
            placement="top"
            arrow
          >
            <TextField
              label={t("classInfo.codeLabel")}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
              placeholder={t("classInfo.codePlaceholder")}
            />
          </Tooltip>

          <Tooltip
            title={t("classInfo.numberTooltip")}
            placement="top"
            arrow
          >
            <TextField
              label={t("classInfo.numberLabel")}
              type="number"
              value={turma}
              onChange={(e) => setTurma(Number(e.target.value))}
              inputProps={{ min: 1 }}
              required
            />
          </Tooltip>

          <Tooltip title={t("classInfo.nameTooltip")} placement="top" arrow>
            <TextField
              label={t("classInfo.nameLabel")}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder={t("classInfo.namePlaceholder")}
              sx={{ gridColumn: { md: "span 2" } }}
            />
          </Tooltip>

          <Tooltip
            title={t("classInfo.coursesTooltip")}
            placement="top"
            arrow
          >
            <TextField
              label={t("classInfo.coursesLabel")}
              value={cursos}
              onChange={(e) => setCursos(e.target.value)}
              placeholder={t("classInfo.coursesPlaceholder")}
            />
          </Tooltip>

          <Tooltip
            title={t("classInfo.levelTooltip")}
            placement="top"
            arrow
          >
            <TextField
              label={t("classInfo.levelLabel")}
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              placeholder={t("classInfo.levelPlaceholder")}
            />
          </Tooltip>

          <Tooltip
            title={t("classInfo.workloadTooltip")}
            placement="top"
            arrow
          >
            <TextField
              label={t("classInfo.workloadLabel")}
              type="number"
              value={carga ?? ""}
              onChange={(e) =>
                setCarga(e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder={t("classInfo.workloadPlaceholder")}
            />
          </Tooltip>

          <Tooltip
            title={t("classInfo.groupTooltip")}
            placement="top"
            arrow
          >
            <TextField
              label={t("classInfo.groupLabel")}
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              placeholder={t("classInfo.groupPlaceholder")}
            />
          </Tooltip>

          <Tooltip
            title={t("classInfo.syllabusTooltip")}
            placement="top"
            arrow
          >
            <TextField
              label={t("classInfo.syllabusLabel")}
              value={ementa}
              onChange={(e) => setEmenta(e.target.value)}
              multiline
              rows={2}
              placeholder={t("classInfo.syllabusPlaceholder")}
              sx={{ gridColumn: { md: "span 2" } }}
            />
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
          <FormControlLabel
            control={
              <Switch
                checked={noturna}
                onChange={(e) => setNoturna(e.target.checked)}
              />
            }
            label={
              <Tooltip title={t("classInfo.nightTooltip")}>
                <span>{t("classInfo.nightLabel")}</span>
              </Tooltip>
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={ingles}
                onChange={(e) => setIngles(e.target.checked)}
              />
            }
            label={
              <Tooltip title={t("classInfo.englishTooltip")}>
                <span>{t("classInfo.englishLabel")}</span>
              </Tooltip>
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
              />
            }
            label={
              <Tooltip title={t("classInfo.activeTooltip")}>
                <span>{t("classInfo.activeLabel")}</span>
              </Tooltip>
            }
          />
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          background:
            "linear-gradient(135deg, rgba(25, 103, 210, 0.02) 0%, transparent 100%)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 4,
                height: 24,
                borderRadius: 1,
                backgroundColor: "success.main",
              }}
            />
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {t("schedules.title")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("schedules.subtitle")}
              </Typography>
            </Box>
          </Box>
          <Tooltip title={t("schedules.infoTooltip")}>
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>{t("schedules.dayLabel")}</InputLabel>
            <Select
              value={novoDia}
              label={t("schedules.dayLabel")}
              onChange={(e) => setNovoDia(e.target.value as Horario["dia"])}
            >
              {DIAS_SEMANA.map((dia) => (
                <MenuItem key={dia} value={dia}>
                  {dia}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title={t("schedules.startTooltip")} placement="top" arrow>
            <TextField
              label={t("schedules.startLabel")}
              type="time"
              size="small"
              value={novoInicio}
              onChange={(e) => setNovoInicio(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Tooltip>

          <Tooltip title={t("schedules.endTooltip")} placement="top" arrow>
            <TextField
              label={t("schedules.endLabel")}
              type="time"
              size="small"
              value={novoFim}
              onChange={(e) => setNovoFim(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Tooltip>

          <Tooltip title={t("schedules.addTooltip")}>
            <Button
              variant="contained"
              onClick={handleAddHorario}
              startIcon={<AddIcon />}
            >
              {t("schedules.addButton")}
            </Button>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t("schedules.addedCount", { count: horarios.length })}
        </Typography>

        {horarios.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic", textAlign: "center", py: 2 }}
          >
            {t("schedules.noSchedules")}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {horarios.map((h, index) => (
              <Chip
                key={index}
                label={`${h.dia} ${h.inicio} - ${h.fim}`}
                onDelete={() => handleRemoveHorario(index)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        )}
      </Paper>

      {disciplinas.filter((d) => d.id !== originalId).length > 0 &&
        horarios.length > 0 && (
          <Paper elevation={2} sx={{ p: 3, bgcolor: "warning.light" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <WarningIcon color="warning" />
              <Typography variant="subtitle1" fontWeight="bold">
                {t("conflicts.title")}
              </Typography>
            </Box>
            <Typography variant="body2">
              {(() => {
                const tempDisciplina: Disciplina = {
                  id: "temp",
                  codigo: codigo || "temp",
                  turma,
                  nome: nome || t("conflicts.tempName"),
                  horario: "",
                  horarios,
                  cursos: "",
                  ementa: "",
                  nivel: "",
                  prioridade: 1,
                  noturna: false,
                  ingles: false,
                  ativo: true,
                  conflitos: new Set(),
                  trava: false,
                  grupo: "",
                };

                const conflitos = disciplinas.filter(
                  (d) =>
                    d.id !== originalId &&
                    disciplinasConflitam(tempDisciplina, d),
                );

                if (conflitos.length === 0) {
                  return t("conflicts.noConflicts");
                }

                return t("conflicts.detected", {
                  count: conflitos.length,
                  conflicts: conflitos.map((c) => `${c.nome} (T${c.turma})`).join(", ")
                });
              })()}
            </Typography>
          </Paper>
        )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => {
            limparFormulario();
            addAlerta(t("alerts.formCleared"), "info");
          }}
          sx={{
            px: 3,
            py: 1.25,
            transition: "all 0.2s",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          {t("actions.clear")}
        </Button>
        <Tooltip
          title={
            turmaParaEditar
              ? t("actions.updateTooltip")
              : t("actions.createTooltip")
          }
        >
          <span>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!codigo.trim() || !nome.trim() || horarios.length === 0}
              sx={{
                px: 3,
                py: 1.25,
                fontWeight: 600,
                transition: "all 0.2s",
                "&:hover:not(:disabled)": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 16px rgba(25, 103, 210, 0.3)",
                },
              }}
            >
              {turmaParaEditar ? t("actions.updateButton") : t("actions.createButton")}
            </Button>
          </span>
        </Tooltip>
      </Box>

      <IdentifierChangeDialog
        open={showIdentifierDialog}
        oldIdentifier={originalId || ""}
        newIdentifier={id}
        type="turma"
        onContinue={() => salvarTurma(false, id)}
        onDeleteOld={() => salvarTurma(true, id)}
        onCancel={() => setShowIdentifierDialog(false)}
      />
    </Box>
  );
}
