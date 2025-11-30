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
      addAlerta(
        "O horário de início deve ser anterior ao horário de fim",
        "error"
      );
      return;
    }

    const horarioExiste = horarios.some(
      (h) => h.dia === novoDia && h.inicio === novoInicio && h.fim === novoFim
    );
    if (horarioExiste) {
      addAlerta("Este horário já foi adicionado", "warning");
      return;
    }

    const novoHorario: Horario = {
      dia: novoDia,
      inicio: novoInicio,
      fim: novoFim,
    };

    setHorarios([...horarios, novoHorario]);
    addAlerta(
      `Horário adicionado: ${novoDia} ${novoInicio}-${novoFim}`,
      "info"
    );
  };

  const handleRemoveHorario = (index: number) => {
    const removed = horarios[index];
    setHorarios(horarios.filter((_, i) => i !== index));
    addAlerta(
      `Horário removido: ${removed.dia} ${removed.inicio}-${removed.fim}`,
      "info"
    );
  };

  const handleSubmit = () => {
    if (!codigo.trim()) {
      addAlerta("O código da disciplina é obrigatório", "error");
      return;
    }

    if (!nome.trim()) {
      addAlerta("O nome da disciplina é obrigatório", "error");
      return;
    }

    if (horarios.length === 0) {
      addAlerta("Adicione pelo menos um horário para a turma", "error");
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
        d.id !== originalId
    );
    if (turmaExiste && !excluirAntigo) {
      addAlerta(
        `Já existe a turma ${turma} para a disciplina ${codigo}`,
        "error"
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
          (a) => a.id_disciplina !== originalId
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
          `Turma atualizada com ${
            conflitosEncontrados.length
          } conflito(s) de horário: ${nomesConflitantes.join(", ")}`,
          "warning"
        );
      } else {
        addAlerta(
          `Turma criada com ${
            conflitosEncontrados.length
          } conflito(s) de horário: ${nomesConflitantes.join(", ")}`,
          "warning"
        );
      }
    } else {
      if (excluirAntigo) {
        addAlerta(
          `Turma "${originalId}" excluída e nova turma "${nome} - Turma ${turma}" criada com sucesso!`,
          "success"
        );
      } else if (turmaParaEditar) {
        addAlerta(
          `Turma "${nome} - Turma ${turma}" atualizada com sucesso!`,
          "success"
        );
      } else {
        addAlerta(
          `Turma "${nome} - Turma ${turma}" criada com sucesso!`,
          "success"
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
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ClassIcon color="primary" />
          <Typography variant="h6">
            {turmaParaEditar ? "Editar Turma" : "Cadastrar Nova Turma"}
          </Typography>
          <Tooltip title="Preencha os dados da turma. Os conflitos de horário serão calculados automaticamente.">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        {onClose && (
          <Tooltip title="Fechar formulário">
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Dados da Disciplina
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
            mt: 2,
          }}
        >
          {turmaParaEditar && (
            <Tooltip
              title="Identificador único da turma. Alterá-lo criará um novo registro."
              placement="top"
              arrow
            >
              <TextField
                label="ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
                sx={{ gridColumn: { md: "span 2" } }}
              />
            </Tooltip>
          )}

          <Tooltip
            title="Código único da disciplina (ex: MAT101)"
            placement="top"
            arrow
          >
            <TextField
              label="Código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
              placeholder="Ex: MAT101"
            />
          </Tooltip>

          <Tooltip
            title="Número da turma para esta disciplina"
            placement="top"
            arrow
          >
            <TextField
              label="Turma"
              type="number"
              value={turma}
              onChange={(e) => setTurma(Number(e.target.value))}
              inputProps={{ min: 1 }}
              required
            />
          </Tooltip>

          <Tooltip title="Nome completo da disciplina" placement="top" arrow>
            <TextField
              label="Nome da Disciplina"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Ex: Cálculo I"
              sx={{ gridColumn: { md: "span 2" } }}
            />
          </Tooltip>

          <Tooltip
            title="Cursos que oferecem esta disciplina"
            placement="top"
            arrow
          >
            <TextField
              label="Cursos"
              value={cursos}
              onChange={(e) => setCursos(e.target.value)}
              placeholder="Ex: Engenharia, Ciência da Computação"
            />
          </Tooltip>

          <Tooltip
            title="Nível da disciplina (Graduação, Pós-graduação, etc.)"
            placement="top"
            arrow
          >
            <TextField
              label="Nível"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              placeholder="Ex: Graduação"
            />
          </Tooltip>

          <Tooltip
            title="Carga horária semanal da disciplina"
            placement="top"
            arrow
          >
            <TextField
              label="Carga Horária"
              type="number"
              value={carga ?? ""}
              onChange={(e) =>
                setCarga(e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="Ex: 4"
            />
          </Tooltip>

          <Tooltip
            title="Grupo para agrupar disciplinas relacionadas"
            placement="top"
            arrow
          >
            <TextField
              label="Grupo"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              placeholder="Ex: Matemática Básica"
            />
          </Tooltip>

          <Tooltip
            title="Ementa ou descrição da disciplina (opcional)"
            placement="top"
            arrow
          >
            <TextField
              label="Ementa"
              value={ementa}
              onChange={(e) => setEmenta(e.target.value)}
              multiline
              rows={2}
              placeholder="Descrição do conteúdo..."
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
              <Tooltip title="Marque se a disciplina é oferecida no período noturno">
                <span>Noturna</span>
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
              <Tooltip title="Marque se a disciplina é ministrada em inglês">
                <span>Em Inglês</span>
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
              <Tooltip title="Disciplinas inativas não serão consideradas nas alocações">
                <span>Ativa</span>
              </Tooltip>
            }
          />
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Horários de Aula
          </Typography>
          <Tooltip title="Adicione os dias e horários em que as aulas serão ministradas. Os conflitos com outras turmas serão calculados automaticamente.">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Defina os dias e horários das aulas
        </Typography>

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
            <InputLabel>Dia</InputLabel>
            <Select
              value={novoDia}
              label="Dia"
              onChange={(e) => setNovoDia(e.target.value as Horario["dia"])}
            >
              {DIAS_SEMANA.map((dia) => (
                <MenuItem key={dia} value={dia}>
                  {dia}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title="Horário de início da aula" placement="top" arrow>
            <TextField
              label="Início"
              type="time"
              size="small"
              value={novoInicio}
              onChange={(e) => setNovoInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Tooltip>

          <Tooltip title="Horário de término da aula" placement="top" arrow>
            <TextField
              label="Fim"
              type="time"
              size="small"
              value={novoFim}
              onChange={(e) => setNovoFim(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Tooltip>

          <Tooltip title="Adicionar horário à lista">
            <Button
              variant="contained"
              onClick={handleAddHorario}
              startIcon={<AddIcon />}
            >
              Adicionar
            </Button>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Horários adicionados ({horarios.length}):
        </Typography>

        {horarios.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic", textAlign: "center", py: 2 }}
          >
            Nenhum horário adicionado ainda
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
                Prévia de Conflitos
              </Typography>
            </Box>
            <Typography variant="body2">
              {(() => {
                const tempDisciplina: Disciplina = {
                  id: "temp",
                  codigo: codigo || "temp",
                  turma,
                  nome: nome || "Nova Turma",
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
                    disciplinasConflitam(tempDisciplina, d)
                );

                if (conflitos.length === 0) {
                  return "Nenhum conflito de horário detectado com as turmas existentes.";
                }

                return `${
                  conflitos.length
                } conflito(s) detectado(s): ${conflitos
                  .map((c) => `${c.nome} (T${c.turma})`)
                  .join(", ")}`;
              })()}
            </Typography>
          </Paper>
        )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => {
            limparFormulario();
            addAlerta("Formulário limpo", "info");
          }}
        >
          Limpar
        </Button>
        <Tooltip
          title={
            turmaParaEditar
              ? "Salvar alterações da turma"
              : "Salvar a turma com todas as informações preenchidas"
          }
        >
          <span>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!codigo.trim() || !nome.trim() || horarios.length === 0}
            >
              {turmaParaEditar ? "Salvar Alterações" : "Salvar Turma"}
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
