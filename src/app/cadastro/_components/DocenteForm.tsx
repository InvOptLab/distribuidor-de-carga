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

  const [nome, setNome] = useState("");
  const [saldo, setSaldo] = useState<number | undefined>(undefined);
  const [ativo, setAtivo] = useState(true);
  const [comentario, setComentario] = useState("");
  const [agrupar, setAgrupar] = useState("");

  const [formulariosTemp, setFormulariosTemp] = useState<FormularioTemp[]>([]);
  const [selectedDisciplina, setSelectedDisciplina] = useState<string | null>(
    null
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
      addAlerta("Selecione uma turma", "warning");
      return;
    }

    if (prioridade === "" || prioridade <= 0) {
      addAlerta("A prioridade deve ser um número inteiro positivo", "warning");
      return;
    }

    if (!Number.isInteger(prioridade)) {
      addAlerta("A prioridade deve ser um número inteiro", "warning");
      return;
    }

    const prioridadeExiste = formulariosTemp.some(
      (f) => f.prioridade === prioridade
    );
    if (prioridadeExiste) {
      addAlerta(
        `A prioridade ${prioridade} já foi atribuída a outra turma. Cada prioridade deve ser única.`,
        "error"
      );
      return;
    }

    const disciplinaExiste = formulariosTemp.some(
      (f) => f.id_disciplina === selectedDisciplina
    );
    if (disciplinaExiste) {
      addAlerta("Esta turma já foi adicionada aos formulários", "warning");
      return;
    }

    const disc = disciplinas.find((d) => d.id === selectedDisciplina);
    if (!disc) {
      addAlerta("Disciplina não encontrada", "error");
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
      `Formulário adicionado: ${disc.nome} com prioridade ${prioridade}`,
      "info"
    );
    setSelectedDisciplina(null);
    setPrioridade("");
  };

  const handleRemoveFormulario = (index: number) => {
    const removed = formulariosTemp[index];
    setFormulariosTemp(formulariosTemp.filter((_, i) => i !== index));
    addAlerta(`Formulário removido: ${removed.nome_turma}`, "info");
  };

  const handleSubmit = () => {
    if (!nome.trim()) {
      addAlerta("O nome do docente é obrigatório", "error");
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
        d.nome !== originalNome
    );
    if (docenteExiste) {
      addAlerta("Já existe um docente com este nome", "error");
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
        d.nome === originalNome ? novoDocente : d
      );
      // Atualiza formulários - remove os antigos e adiciona os novos
      novosFormularios = formularios.filter(
        (f) => f.nome_docente !== originalNome
      );
      novosFormularios.push(
        ...formulariosTemp.map((f) => ({
          id_disciplina: f.id_disciplina,
          nome_docente: nome.trim(),
          prioridade: f.prioridade,
        }))
      );
      addAlerta(`Docente "${nome}" atualizado com sucesso!`, "success");
    } else if (excluirAntigo && originalNome) {
      novosDocentes = docentes.filter((d) => d.nome !== originalNome);
      novosDocentes.push(novoDocente);
      novosFormularios = formularios.filter(
        (f) => f.nome_docente !== originalNome
      );
      novosFormularios.push(
        ...formulariosTemp.map((f) => ({
          id_disciplina: f.id_disciplina,
          nome_docente: nome.trim(),
          prioridade: f.prioridade,
        }))
      );
      addAlerta(
        `Docente "${originalNome}" excluído e "${nome}" criado com sucesso!`,
        "success"
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
      addAlerta(`Docente "${nome}" criado com sucesso!`, "success");
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
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SchoolIcon color="primary" />
          <Typography variant="h6">
            {docenteParaEditar ? "Editar Docente" : "Cadastrar Novo Docente"}
          </Typography>
          <Tooltip title="Preencha os dados do docente e adicione as turmas de interesse com suas respectivas prioridades">
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
          Dados do Docente
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <Tooltip
            title="Nome completo do docente (identificador único)"
            placement="right"
            arrow
          >
            <TextField
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              fullWidth
              required
              placeholder="Ex: João da Silva"
            />
          </Tooltip>

          <Tooltip
            title="Saldo de horas/créditos disponíveis (opcional)"
            placement="right"
            arrow
          >
            <TextField
              label="Saldo"
              type="number"
              value={saldo ?? ""}
              onChange={(e) =>
                setSaldo(e.target.value ? Number(e.target.value) : undefined)
              }
              fullWidth
              placeholder="Ex: 40"
            />
          </Tooltip>

          <Tooltip
            title="Comentários ou observações sobre o docente (opcional)"
            placement="right"
            arrow
          >
            <TextField
              label="Comentário"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Ex: Preferência por aulas matutinas"
            />
          </Tooltip>

          <Tooltip
            title="Preferência de agrupamento de aulas (opcional)"
            placement="right"
            arrow
          >
            <Autocomplete
              options={["Indiferente", "Agrupar", "Espalhar"]}
              value={agrupar || null}
              onChange={(_, newValue) => setAgrupar(newValue || "")}
              renderInput={(params) => (
                <TextField {...params} label="Agrupamento" />
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
              <Tooltip title="Docentes inativos não serão considerados nas alocações">
                <span>Docente Ativo</span>
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
            Formulários (Prioridades)
          </Typography>
          <Tooltip title="Adicione as turmas que o docente tem interesse em lecionar, atribuindo uma prioridade única para cada uma. Quanto menor o número, maior a prioridade.">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Selecione as turmas e defina a ordem de preferência do docente
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
          <Tooltip
            title="Selecione a turma/disciplina de interesse"
            placement="top"
            arrow
          >
            <Autocomplete
              sx={{ flex: 2, minWidth: 200 }}
              options={disciplinas.filter(
                (d) => !formulariosTemp.some((f) => f.id_disciplina === d.id)
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
                <TextField {...params} label="Turma/Disciplina" size="small" />
              )}
              disabled={disciplinas.length === 0}
              noOptionsText="Nenhuma turma disponível"
            />
          </Tooltip>

          <Tooltip
            title={`Prioridade do docente (número inteiro positivo, único). Já utilizadas: ${
              prioridadesUsadas.length > 0
                ? prioridadesUsadas.join(", ")
                : "nenhuma"
            }`}
            placement="top"
            arrow
          >
            <TextField
              sx={{ flex: 1, minWidth: 100 }}
              label="Prioridade"
              type="number"
              value={prioridade}
              onChange={(e) =>
                setPrioridade(e.target.value ? Number(e.target.value) : "")
              }
              size="small"
              inputProps={{ min: 1, step: 1 }}
              placeholder="Ex: 1"
              error={
                prioridade !== "" &&
                prioridadesUsadas.includes(prioridade as number)
              }
              helperText={
                prioridade !== "" &&
                prioridadesUsadas.includes(prioridade as number)
                  ? "Prioridade já utilizada"
                  : ""
              }
            />
          </Tooltip>

          <Tooltip title="Adicionar turma à lista de prioridades">
            <span>
              <Button
                variant="contained"
                onClick={handleAddFormulario}
                startIcon={<AddIcon />}
                disabled={!selectedDisciplina || prioridade === ""}
              >
                Adicionar
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
            Nenhuma turma cadastrada. Cadastre turmas primeiro para poder
            adicionar formulários.
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Turmas adicionadas ({formulariosTemp.length}):
        </Typography>

        {formulariosTemp.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic", textAlign: "center", py: 2 }}
          >
            Nenhuma turma adicionada ainda
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
                    <Tooltip title="Remover esta turma">
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
            addAlerta("Formulário limpo", "info");
          }}
        >
          Limpar
        </Button>
        <Tooltip
          title={
            docenteParaEditar
              ? "Salvar alterações do docente"
              : "Salvar o docente com todas as informações preenchidas"
          }
        >
          <span>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!nome.trim()}
            >
              {docenteParaEditar ? "Salvar Alterações" : "Salvar Docente"}
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
