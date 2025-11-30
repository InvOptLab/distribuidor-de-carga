"use client";

import type React from "react";
import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Tooltip,
  IconButton,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import {
  School as SchoolIcon,
  Class as ClassIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useGlobalContext } from "@/context/Global";
import { useAlertsContext } from "@/context/Alerts";
import { Disciplina, Docente } from "@/algoritmo/communs/interfaces/interfaces";
import DocenteForm from "./_components/DocenteForm";
import TurmaForm from "./_components/TurmaForm";
import DocenteCard from "./_components/DocenteCard";
import TurmaCard from "./_components/TurmaCard";
import AddCard from "./_components/AddCard";

type TipoCadastro = "docente" | "turma";

export default function CadastroPage() {
  const [tipoCadastro, setTipoCadastro] = useState<TipoCadastro>("docente");
  const {
    docentes,
    setDocentes,
    disciplinas,
    setDisciplinas,
    formularios,
    setFormularios,
    atribuicoes,
    setAtribuicoes,
  } = useGlobalContext();
  const { addAlerta } = useAlertsContext();

  const [showForm, setShowForm] = useState(false);
  const [docenteParaEditar, setDocenteParaEditar] = useState<Docente | null>(
    null
  );
  const [turmaParaEditar, setTurmaParaEditar] = useState<Disciplina | null>(
    null
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState<{
    type: "docente" | "turma";
    item: Docente | Disciplina;
  } | null>(null);

  const handleTipoChange = (
    _: React.MouseEvent<HTMLElement>,
    novoTipo: TipoCadastro | null
  ) => {
    if (novoTipo !== null) {
      setTipoCadastro(novoTipo);
      setShowForm(false);
      setDocenteParaEditar(null);
      setTurmaParaEditar(null);
    }
  };

  const handleAddClick = () => {
    setDocenteParaEditar(null);
    setTurmaParaEditar(null);
    setShowForm(true);
  };

  const handleEditDocente = (docente: Docente) => {
    setDocenteParaEditar(docente);
    setShowForm(true);
    addAlerta(`Editando docente: ${docente.nome}`, "info");
  };

  const handleEditTurma = (turma: Disciplina) => {
    setTurmaParaEditar(turma);
    setShowForm(true);
    addAlerta(`Editando turma: ${turma.nome}`, "info");
  };

  const handleDeleteDocente = (docente: Docente) => {
    setItemParaExcluir({ type: "docente", item: docente });
    setDeleteDialogOpen(true);
  };

  const handleDeleteTurma = (turma: Disciplina) => {
    setItemParaExcluir({ type: "turma", item: turma });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemParaExcluir) return;

    if (itemParaExcluir.type === "docente") {
      const docente = itemParaExcluir.item as Docente;
      setDocentes(docentes.filter((d) => d.nome !== docente.nome));
      setFormularios(
        formularios.filter((f) => f.nome_docente !== docente.nome)
      );
      addAlerta(`Docente "${docente.nome}" excluído com sucesso!`, "success");
    } else {
      const turma = itemParaExcluir.item as Disciplina;
      const novasDisciplinas = disciplinas
        .filter((d) => d.id !== turma.id)
        .map((d) => {
          const novosConflitos = new Set(d.conflitos);
          novosConflitos.delete(turma.id);
          return { ...d, conflitos: novosConflitos };
        });
      setDisciplinas(novasDisciplinas);
      // Remove formulários e atribuições relacionadas
      setFormularios(formularios.filter((f) => f.id_disciplina !== turma.id));
      setAtribuicoes(atribuicoes.filter((a) => a.id_disciplina !== turma.id));
      addAlerta(`Turma "${turma.nome}" excluída com sucesso!`, "success");
    }

    setDeleteDialogOpen(false);
    setItemParaExcluir(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setDocenteParaEditar(null);
    setTurmaParaEditar(null);
  };

  const handleSaveForm = () => {
    setShowForm(false);
    setDocenteParaEditar(null);
    setTurmaParaEditar(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Cadastro de Dados
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie docentes e turmas/disciplinas do sistema
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium">
              Selecione o tipo de cadastro:
            </Typography>
            <Tooltip title="Escolha entre visualizar e gerenciar docentes ou turmas/disciplinas">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              icon={<SchoolIcon />}
              label={`${docentes.length} docente(s)`}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<ClassIcon />}
              label={`${disciplinas.length} turma(s)`}
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <ToggleButtonGroup
            value={tipoCadastro}
            exclusive
            onChange={handleTipoChange}
            aria-label="tipo de cadastro"
            color="primary"
          >
            <Tooltip title="Visualizar e gerenciar docentes" placement="bottom">
              <ToggleButton
                value="docente"
                aria-label="docente"
                sx={{ px: 4, py: 1.5 }}
              >
                <SchoolIcon sx={{ mr: 1 }} />
                <Typography>Docentes</Typography>
              </ToggleButton>
            </Tooltip>

            <Tooltip
              title="Visualizar e gerenciar turmas/disciplinas"
              placement="bottom"
            >
              <ToggleButton
                value="turma"
                aria-label="turma"
                sx={{ px: 4, py: 1.5 }}
              >
                <ClassIcon sx={{ mr: 1 }} />
                <Typography>Turmas</Typography>
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      <Divider sx={{ my: 3 }} />

      {showForm ? (
        <Paper elevation={3} sx={{ p: 3 }}>
          {tipoCadastro === "docente" ? (
            <DocenteForm
              docenteParaEditar={docenteParaEditar}
              onClose={handleCloseForm}
              onSave={handleSaveForm}
            />
          ) : (
            <TurmaForm
              turmaParaEditar={turmaParaEditar}
              onClose={handleCloseForm}
              onSave={handleSaveForm}
            />
          )}
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {tipoCadastro === "docente" ? (
            <>
              {docentes.map((docente) => (
                <DocenteCard
                  key={docente.nome}
                  docente={docente}
                  onEdit={handleEditDocente}
                  onDelete={handleDeleteDocente}
                />
              ))}
              <AddCard tooltip="Criar novo docente" onClick={handleAddClick} />
            </>
          ) : (
            <>
              {disciplinas.map((turma) => (
                <TurmaCard
                  key={turma.id}
                  turma={turma}
                  onEdit={handleEditTurma}
                  onDelete={handleDeleteTurma}
                />
              ))}
              <AddCard tooltip="Criar nova turma" onClick={handleAddClick} />
            </>
          )}
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DeleteIcon color="error" />
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {itemParaExcluir?.type === "docente"
              ? `Tem certeza que deseja excluir o docente "${
                  (itemParaExcluir.item as Docente).nome
                }"? Esta ação não pode ser desfeita e todos os formulários associados serão removidos.`
              : `Tem certeza que deseja excluir a turma "${
                  (itemParaExcluir?.item as Disciplina)?.nome
                }"? Esta ação não pode ser desfeita e todas as atribuições e referências de conflito serão removidas.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
