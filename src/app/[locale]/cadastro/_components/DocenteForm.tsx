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
  Autocomplete,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  School as SchoolIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import IdentifierChangeDialog from "./IdentifierChangeDialog";
import { Docente, Formulario } from "@/algoritmo/communs/interfaces/interfaces";
import { useGlobalContext } from "@/context/Global";
import { useAlertsContext } from "@/context/Alerts";
import { useTranslations } from "next-intl";

interface FormularioTemp {
  id_disciplina: string;
  nome_turma: string;
  prioridade: number;
}

interface DocenteFormProps {
  docenteParaEditar?: Docente | null;
  onClose?: () => void;
  onSave?: () => void;
}

export default function DocenteForm({
  docenteParaEditar,
  onClose,
  onSave,
}: DocenteFormProps) {
  const { docentes, setDocentes, disciplinas, formularios, setFormularios } =
    useGlobalContext();
  const { addAlerta } = useAlertsContext();
  const t = useTranslations("Pages.Cadastro.Components.DocenteForm");

  const [nome, setNome] = useState("");
  const [saldo, setSaldo] = useState<number | undefined>(undefined);
  const [ativo, setAtivo] = useState(true);
  const [comentario, setComentario] = useState("");
  const [agrupar, setAgrupar] = useState("");

  const [formulariosTemp, setFormulariosTemp] = useState<FormularioTemp[]>([]);
  const [selectedDisciplina, setSelectedDisciplina] = useState<string | null>(
    null,
  );
  const [prioridade, setPrioridade] = useState<number | "">("");

  const [showIdentifierDialog, setShowIdentifierDialog] = useState(false);
  const [originalNome, setOriginalNome] = useState<string | null>(null);

  useEffect(() => {
    if (docenteParaEditar) {
      setNome(docenteParaEditar.nome);
      setSaldo(docenteParaEditar.saldo);
      setAtivo(docenteParaEditar.ativo);
      setComentario(docenteParaEditar.comentario || "");
      setAgrupar(docenteParaEditar.agrupar || "");
      setOriginalNome(docenteParaEditar.nome);

      // Converte o Map de formulários para o array temporário
      const formulariosArray: FormularioTemp[] = [];
      docenteParaEditar.formularios.forEach((prioridade, idDisciplina) => {
        const disc = disciplinas.find((d) => d.id === idDisciplina);
        formulariosArray.push({
          id_disciplina: idDisciplina,
          nome_turma: disc
            ? `${disc.nome} - Turma ${disc.turma}`
            : idDisciplina,
          prioridade,
        });
      });
      setFormulariosTemp(formulariosArray);
    } else {
      limparFormulario();
    }
  }, [docenteParaEditar, disciplinas]);

  const limparFormulario = () => {
    setNome("");
    setSaldo(undefined);
    setAtivo(true);
    setComentario("");
    setAgrupar("");
    setFormulariosTemp([]);
    setOriginalNome(null);
  };

  const handleAddFormulario = () => {
    if (!selectedDisciplina) {
      addAlerta(t("alerts.selectClass"), "warning");
      return;
    }

    if (prioridade === "" || prioridade <= 0) {
      addAlerta(t("alerts.positiveIntegerPriority"), "warning");
      return;
    }

    if (!Number.isInteger(prioridade)) {
      addAlerta(t("alerts.integerPriority"), "warning");
      return;
    }

    const prioridadeExiste = formulariosTemp.some(
      (f) => f.prioridade === prioridade,
    );
    if (prioridadeExiste) {
      addAlerta(
        t("alerts.uniquePriority", { priority: prioridade }),
        "error",
      );
      return;
    }

    const disciplinaExiste = formulariosTemp.some(
      (f) => f.id_disciplina === selectedDisciplina,
    );
    if (disciplinaExiste) {
      addAlerta(t("alerts.classAlreadyAdded"), "warning");
      return;
    }

    const disc = disciplinas.find((d) => d.id === selectedDisciplina);
    if (!disc) {
      addAlerta(t("alerts.classNotFound"), "error");
      return;
    }

    setFormulariosTemp([
      ...formulariosTemp,
      {
        id_disciplina: selectedDisciplina,
        nome_turma: `${disc.nome} - Turma ${disc.turma}`,
        prioridade: prioridade,
      },
    ]);

    addAlerta(
      t("alerts.formAdded", { name: disc.nome, priority: prioridade }),
      "info",
    );
    setSelectedDisciplina(null);
    setPrioridade("");
  };

  const handleRemoveFormulario = (index: number) => {
    const removed = formulariosTemp[index];
    setFormulariosTemp(formulariosTemp.filter((_, i) => i !== index));
    addAlerta(t("alerts.formRemoved", { name: removed.nome_turma }), "info");
  };

  const handleSubmit = () => {
    if (!nome.trim()) {
      addAlerta(t("alerts.nameRequired"), "error");
      return;
    }

    if (docenteParaEditar && originalNome && originalNome !== nome.trim()) {
      setShowIdentifierDialog(true);
      return;
    }

    salvarDocente(false);
  };

  const salvarDocente = (excluirAntigo: boolean) => {
    // Verifica se já existe um docente com o mesmo nome (exceto o que está sendo editado)
    const docenteExiste = docentes.some(
      (d) =>
        d.nome.toLowerCase() === nome.trim().toLowerCase() &&
        d.nome !== originalNome,
    );
    if (docenteExiste) {
      addAlerta(t("alerts.nameExists"), "error");
      return;
    }

    const formulariosMap = new Map<string, number>();
    formulariosTemp.forEach((f) => {
      formulariosMap.set(f.id_disciplina, f.prioridade);
    });

    const novoDocente: Docente = {
      nome: nome.trim(),
      saldo,
      ativo,
      formularios: formulariosMap,
      trava: docenteParaEditar?.trava || false,
      comentario: comentario.trim() || undefined,
      agrupar: agrupar || undefined,
    };

    let novosDocentes: Docente[];
    let novosFormularios: Formulario[];

    if (
      docenteParaEditar &&
      originalNome &&
      !excluirAntigo &&
      originalNome === nome.trim()
    ) {
      novosDocentes = docentes.map((d) =>
        d.nome === originalNome ? novoDocente : d,
      );
      // Atualiza formulários - remove os antigos e adiciona os novos
      novosFormularios = formularios.filter(
        (f) => f.nome_docente !== originalNome,
      );
      novosFormularios.push(
        ...formulariosTemp.map((f) => ({
          id_disciplina: f.id_disciplina,
          nome_docente: nome.trim(),
          prioridade: f.prioridade,
        })),
      );
      addAlerta(t("alerts.professorUpdated", { name: nome.trim() }), "success");
    } else if (excluirAntigo && originalNome) {
      novosDocentes = docentes.filter((d) => d.nome !== originalNome);
      novosDocentes.push(novoDocente);
      novosFormularios = formularios.filter(
        (f) => f.nome_docente !== originalNome,
      );
      novosFormularios.push(
        ...formulariosTemp.map((f) => ({
          id_disciplina: f.id_disciplina,
          nome_docente: nome.trim(),
          prioridade: f.prioridade,
        })),
      );
      addAlerta(
        t("alerts.professorReplaced", { oldName: originalNome, newName: nome.trim() }),
        "success",
      );
    } else {
      novosDocentes = [...docentes, novoDocente];
      novosFormularios = [
        ...formularios,
        ...formulariosTemp.map((f) => ({
          id_disciplina: f.id_disciplina,
          nome_docente: nome.trim(),
          prioridade: f.prioridade,
        })),
      ];
      addAlerta(t("alerts.professorCreated", { name: nome.trim() }), "success");
    }

    setDocentes(novosDocentes);
    setFormularios(novosFormularios);
    limparFormulario();
    setShowIdentifierDialog(false);
    onSave?.();
  };

  const prioridadesUsadas = formulariosTemp.map((f) => f.prioridade);

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
              backgroundColor: "info.light",
              color: "info.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SchoolIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {docenteParaEditar ? t("header.editProfessor") : t("header.newProfessor")}
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
            {t("personalData.title")}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Tooltip
            title={t("personalData.nameTooltip")}
            placement="right"
            arrow
          >
            <TextField
              label={t("personalData.nameLabel")}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              fullWidth
              required
              placeholder={t("personalData.namePlaceholder")}
            />
          </Tooltip>

          <Tooltip
            title={t("personalData.balanceTooltip")}
            placement="right"
            arrow
          >
            <TextField
              label={t("personalData.balanceLabel")}
              type="number"
              value={saldo ?? ""}
              onChange={(e) =>
                setSaldo(e.target.value ? Number(e.target.value) : undefined)
              }
              fullWidth
              placeholder={t("personalData.balancePlaceholder")}
            />
          </Tooltip>

          <Tooltip
            title={t("personalData.commentTooltip")}
            placement="right"
            arrow
          >
            <TextField
              label={t("personalData.commentLabel")}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder={t("personalData.commentPlaceholder")}
            />
          </Tooltip>

          <Tooltip
            title={t("personalData.groupingTooltip")}
            placement="right"
            arrow
          >
            <Autocomplete
              options={["Indiferente", "Agrupar", "Espalhar"]}
              getOptionLabel={(option) => {
                if (option === "Indiferente") return t("personalData.groupingOptions.indifferent");
                if (option === "Agrupar") return t("personalData.groupingOptions.group");
                if (option === "Espalhar") return t("personalData.groupingOptions.spread");
                return option;
              }}
              value={agrupar || null}
              onChange={(_, newValue) => setAgrupar(newValue || "")}
              renderInput={(params) => (
                <TextField {...params} label={t("personalData.groupingLabel")} />
              )}
            />
          </Tooltip>

          <FormControlLabel
            control={
              <Switch
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
              />
            }
            label={
              <Tooltip title={t("personalData.activeTooltip")}>
                <span>{t("personalData.activeLabel")}</span>
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
                backgroundColor: "info.main",
              }}
            />
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {t("classAllocation.title")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("classAllocation.subtitle")}
              </Typography>
            </Box>
          </Box>
          <Tooltip title={t("classAllocation.infoTooltip")}>
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
          <Tooltip
            title={t("classAllocation.selectClassTooltip")}
            placement="top"
            arrow
          >
            <Autocomplete
              sx={{ flex: 2, minWidth: 200 }}
              options={disciplinas.filter(
                (d) => !formulariosTemp.some((f) => f.id_disciplina === d.id),
              )}
              getOptionLabel={(option) =>
                `${option.nome} - Turma ${option.turma} (${option.codigo})`
              }
              value={
                disciplinas.find((d) => d.id === selectedDisciplina) || null
              }
              onChange={(_, newValue) =>
                setSelectedDisciplina(newValue?.id || null)
              }
              renderInput={(params) => (
                <TextField {...params} label={t("classAllocation.classLabel")} size="small" />
              )}
              disabled={disciplinas.length === 0}
              noOptionsText={t("classAllocation.noClassAvailable")}
            />
          </Tooltip>

          <Tooltip
            title={t("classAllocation.priorityTooltip", {
              used: prioridadesUsadas.length > 0
                ? prioridadesUsadas.join(", ")
                : t("classAllocation.none")
            })}
            placement="top"
            arrow
          >
            <TextField
              sx={{ flex: 1, minWidth: 100 }}
              label={t("classAllocation.priorityLabel")}
              type="number"
              value={prioridade}
              onChange={(e) =>
                setPrioridade(e.target.value ? Number(e.target.value) : "")
              }
              size="small"
              inputProps={{ min: 1, step: 1 }}
              placeholder={t("classAllocation.priorityPlaceholder")}
              error={
                prioridade !== "" &&
                prioridadesUsadas.includes(prioridade as number)
              }
              helperText={
                prioridade !== "" &&
                prioridadesUsadas.includes(prioridade as number)
                  ? t("classAllocation.priorityUsed")
                  : ""
              }
            />
          </Tooltip>

          <Tooltip title={t("classAllocation.addTooltip")}>
            <span>
              <Button
                variant="contained"
                onClick={handleAddFormulario}
                startIcon={<AddIcon />}
                disabled={!selectedDisciplina || prioridade === ""}
              >
                {t("classAllocation.addButton")}
              </Button>
            </span>
          </Tooltip>
        </Box>

        {disciplinas.length === 0 && (
          <Typography
            variant="body2"
            color="warning.main"
            sx={{ mb: 2, fontStyle: "italic" }}
          >
            {t("classAllocation.noClassesWarning")}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t("classAllocation.addedClasses", { count: formulariosTemp.length })}
        </Typography>

        {formulariosTemp.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic", textAlign: "center", py: 2 }}
          >
            {t("classAllocation.noClassesAdded")}
          </Typography>
        ) : (
          <List dense>
            {formulariosTemp
              .sort((a, b) => a.prioridade - b.prioridade)
              .map((f, index) => (
                <ListItem key={f.id_disciplina}>
                  <Chip
                    label={`#${f.prioridade}`}
                    size="small"
                    color="primary"
                    sx={{ mr: 2, minWidth: 40 }}
                  />
                  <ListItemText primary={f.nome_turma} />
                  <ListItemSecondaryAction>
                    <Tooltip title={t("classAllocation.removeTooltip")}>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveFormulario(index)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
          </List>
        )}
      </Paper>

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
            docenteParaEditar
              ? t("actions.updateTooltip")
              : t("actions.createTooltip")
          }
        >
          <span>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!nome.trim()}
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
              {docenteParaEditar ? t("actions.updateButton") : t("actions.createButton")}
            </Button>
          </span>
        </Tooltip>
      </Box>

      <IdentifierChangeDialog
        open={showIdentifierDialog}
        oldIdentifier={originalNome || ""}
        newIdentifier={nome.trim()}
        type="docente"
        onContinue={() => salvarDocente(false)}
        onDeleteOld={() => salvarDocente(true)}
        onCancel={() => setShowIdentifierDialog(false)}
      />
    </Box>
  );
}
