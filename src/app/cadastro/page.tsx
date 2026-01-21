"use client";

import type React from "react";
import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  ToggleButton,
  Paper,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Divider,
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
    null,
  );
  const [turmaParaEditar, setTurmaParaEditar] = useState<Disciplina | null>(
    null,
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState<{
    type: "docente" | "turma";
    item: Docente | Disciplina;
  } | null>(null);

  const handleTipoChange = (
    _: React.MouseEvent<HTMLElement>,
    novoTipo: TipoCadastro | null,
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
        formularios.filter((f) => f.nome_docente !== docente.nome),
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
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          fontWeight={700}
          sx={{
            mb: 1,
          }}
          color="black"
        >
          Gestão de Cadastros
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ fontWeight: 400 }}
        >
          Administre docentes e turmas/disciplinas de forma intuitiva
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          background:
            "linear-gradient(135deg, rgba(25, 103, 210, 0.05) 0%, rgba(25, 103, 210, 0.02) 100%)",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Selecione o Tipo de Gestão
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Escolha entre gerenciar docentes ou turmas/disciplinas
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Chip
              icon={<SchoolIcon />}
              label={`${docentes.length} docente${docentes.length !== 1 ? "s" : ""}`}
              variant="outlined"
              size="medium"
              sx={{ fontWeight: 500, minWidth: 140 }}
            />
            <Chip
              icon={<ClassIcon />}
              label={`${disciplinas.length} turma${disciplinas.length !== 1 ? "s" : ""}`}
              variant="outlined"
              size="medium"
              sx={{ fontWeight: 500, minWidth: 140 }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Tooltip title="Visualizar e gerenciar docentes" placement="bottom">
            <ToggleButton
              value="docente"
              selected={tipoCadastro === "docente"}
              onChange={handleTipoChange}
              aria-label="docente"
              sx={{
                px: 4,
                py: 2,
                borderRadius: 1.5,
                border: "2px solid",
                borderColor:
                  tipoCadastro === "docente" ? "primary.main" : "divider",
                backgroundColor:
                  tipoCadastro === "docente"
                    ? "primary.light"
                    : "background.paper",
                color:
                  tipoCadastro === "docente" ? "primary.main" : "text.primary",
                transition: "all 0.3s",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "primary.light",
                },
              }}
            >
              <SchoolIcon sx={{ mr: 1.5, fontSize: 24 }} />
              <Typography fontWeight={600}>Docentes</Typography>
            </ToggleButton>
          </Tooltip>

          <Tooltip
            title="Visualizar e gerenciar turmas/disciplinas"
            placement="bottom"
          >
            <ToggleButton
              value="turma"
              selected={tipoCadastro === "turma"}
              onChange={handleTipoChange}
              aria-label="turma"
              sx={{
                px: 4,
                py: 2,
                borderRadius: 1.5,
                border: "2px solid",
                borderColor:
                  tipoCadastro === "turma" ? "primary.main" : "divider",
                backgroundColor:
                  tipoCadastro === "turma"
                    ? "primary.light"
                    : "background.paper",
                color:
                  tipoCadastro === "turma" ? "primary.main" : "text.primary",
                transition: "all 0.3s",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "primary.light",
                },
              }}
            >
              <ClassIcon sx={{ mr: 1.5, fontSize: 24 }} />
              <Typography fontWeight={600}>Turmas</Typography>
            </ToggleButton>
          </Tooltip>
        </Box>
      </Paper>

      {showForm ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            background:
              "linear-gradient(135deg, rgba(25, 103, 210, 0.02) 0%, transparent 100%)",
          }}
        >
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
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {tipoCadastro === "docente"
                ? `Docentes (${docentes.length})`
                : `Turmas/Disciplinas (${disciplinas.length})`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tipoCadastro === "docente"
                ? "Clique em uma turma para editar ou adicione um novo docente"
                : "Clique em uma turma para editar ou adicione uma nova turma"}
            </Typography>
          </Box>

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
              alignItems: "start",
            }}
          >
            {tipoCadastro === "docente" ? (
              <>
                {docentes.length > 0 &&
                  docentes.map((docente) => (
                    <DocenteCard
                      key={docente.nome}
                      docente={docente}
                      onEdit={handleEditDocente}
                      onDelete={handleDeleteDocente}
                    />
                  ))}
                <AddCard
                  tooltip="Criar novo docente"
                  onClick={handleAddClick}
                />
                {docentes.length === 0 && (
                  <Box
                    sx={{
                      gridColumn: { xs: 1, md: "span 2" },
                      py: 4,
                      textAlign: "center",
                      opacity: 0.6,
                    }}
                  >
                    <Typography color="text.secondary" gutterBottom>
                      Nenhum docente cadastrado
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Clique no botão abaixo para criar um novo
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <>
                {disciplinas.length > 0 &&
                  disciplinas.map((turma) => (
                    <TurmaCard
                      key={turma.id}
                      turma={turma}
                      onEdit={handleEditTurma}
                      onDelete={handleDeleteTurma}
                    />
                  ))}
                <AddCard tooltip="Criar nova turma" onClick={handleAddClick} />
                {disciplinas.length === 0 && (
                  <Box
                    sx={{
                      gridColumn: { xs: 1, md: "span 2" },
                      py: 4,
                      textAlign: "center",
                      opacity: 0.6,
                    }}
                  >
                    <Typography color="text.secondary" gutterBottom>
                      Nenhuma turma cadastrada
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Clique no botão abaixo para criar uma nova
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                p: 0.75,
                borderRadius: 1,
                backgroundColor: "error.light",
                color: "error.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DeleteIcon fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              Confirmar Exclusão
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="body2" fontWeight={500}>
              {itemParaExcluir?.type === "docente"
                ? `Você está prestes a excluir o docente:`
                : `Você está prestes a excluir a turma:`}
            </Typography>

            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                backgroundColor: "error.light",
                border: "1px solid",
                borderColor: "error.light",
              }}
            >
              <Typography variant="body2" fontWeight={600} color="error.main">
                {itemParaExcluir?.type === "docente"
                  ? (itemParaExcluir.item as Docente).nome
                  : (itemParaExcluir?.item as Disciplina)?.nome}
              </Typography>
            </Box>

            <Typography variant="caption" color="text.secondary">
              {itemParaExcluir?.type === "docente"
                ? "Esta ação é irreversível. Todos os formulários associados serão removidos."
                : "Esta ação é irreversível. Todas as atribuições e referências serão removidas."}
            </Typography>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            color="inherit"
            sx={{
              transition: "all 0.2s",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            sx={{
              transition: "all 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
              },
            }}
          >
            Excluir Permanentemente
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
