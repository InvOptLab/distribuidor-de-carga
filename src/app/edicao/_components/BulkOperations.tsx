"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  LinearScale as NormalizeIcon,
} from "@mui/icons-material";
import { Disciplina, Docente, Formulario } from "@/context/Global/utils";

interface BulkOperationsProps {
  docentes: Docente[];
  disciplinas: Disciplina[];
  formularios: Formulario[];
  onUpdateDocentes: (docentes: Docente[]) => void;
  onUpdateDisciplinas: (disciplinas: Disciplina[]) => void;
  onUpdateFormularios: (formularios: Formulario[]) => void;
  onAddToHistory: (change: any) => void;
}

export function BulkOperations({
  docentes,
  disciplinas,
  formularios,
  onUpdateDocentes,
  onUpdateDisciplinas,
  onUpdateFormularios,
  onAddToHistory,
}: BulkOperationsProps) {
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    action: null as (() => void) | null,
  });
  const [resetSaldoValue, setResetSaldoValue] = useState(0);

  const openConfirmDialog = (
    title: string,
    description: string,
    action: () => void
  ) => {
    setConfirmDialog({
      open: true,
      title,
      description,
      action,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      title: "",
      description: "",
      action: null,
    });
  };

  const executeAction = () => {
    if (confirmDialog.action) {
      confirmDialog.action();
      closeConfirmDialog();
    }
  };

  const ativarTodosDocentes = () => {
    const updatedDocentes = docentes.map((d) => ({ ...d, ativo: true }));
    onUpdateDocentes(updatedDocentes);
    onAddToHistory({
      type: "bulk",
      action: "activate_all_docentes",
      target: "Todos os Docentes",
      description: "Todos os docentes foram ativados",
    });
  };

  const desativarTodosDocentes = () => {
    const updatedDocentes = docentes.map((d) => ({ ...d, ativo: false }));
    onUpdateDocentes(updatedDocentes);
    onAddToHistory({
      type: "bulk",
      action: "deactivate_all_docentes",
      target: "Todos os Docentes",
      description: "Todos os docentes foram desativados",
    });
  };

  const resetarSaldos = () => {
    const updatedDocentes = docentes.map((d) => ({
      ...d,
      saldo: resetSaldoValue,
    }));
    onUpdateDocentes(updatedDocentes);
    onAddToHistory({
      type: "bulk",
      action: "reset_saldos",
      target: "Saldos dos Docentes",
      description: `Todos os saldos foram definidos para ${resetSaldoValue}`,
    });
  };

  const removerTravas = () => {
    const updatedDocentes = docentes.map((d) => ({ ...d, travas: new Set() }));
    const updatedDisciplinas = disciplinas.map((d) => ({
      ...d,
      travas: new Set(),
    }));
    onUpdateDocentes(updatedDocentes);
    onUpdateDisciplinas(updatedDisciplinas);
    onAddToHistory({
      type: "bulk",
      action: "remove_travas",
      target: "Travas",
      description: "Todas as travas foram removidas",
    });
  };

  const ativarTodasDisciplinas = () => {
    const updatedDisciplinas = disciplinas.map((d) => ({ ...d, ativo: true }));
    onUpdateDisciplinas(updatedDisciplinas);
    onAddToHistory({
      type: "bulk",
      action: "activate_all_disciplinas",
      target: "Todas as Disciplinas",
      description: "Todas as disciplinas foram ativadas",
    });
  };

  const desativarTodasDisciplinas = () => {
    const updatedDisciplinas = disciplinas.map((d) => ({ ...d, ativo: false }));
    onUpdateDisciplinas(updatedDisciplinas);
    onAddToHistory({
      type: "bulk",
      action: "deactivate_all_disciplinas",
      target: "Todas as Disciplinas",
      description: "Todas as disciplinas foram desativadas",
    });
  };

  const normalizarPrioridades = () => {
    // Normalizar prioridades para escala 1-10
    const maxPrioridade = Math.max(...formularios.map((f) => f.prioridade));
    const minPrioridade = Math.min(...formularios.map((f) => f.prioridade));

    if (maxPrioridade === minPrioridade) return;

    const updatedFormularios = formularios.map((f) => ({
      ...f,
      prioridade: Math.round(
        1 +
          ((f.prioridade - minPrioridade) / (maxPrioridade - minPrioridade)) * 9
      ),
    }));

    onUpdateFormularios(updatedFormularios);
    onAddToHistory({
      type: "bulk",
      action: "normalize_priorities",
      target: "Prioridades",
      description: "Prioridades normalizadas para escala 1-10",
    });
  };

  const limparDadosInativos = () => {
    const docentesAtivos = docentes.filter((d) => d.ativo);
    const disciplinasAtivas = disciplinas.filter((d) => d.ativo);
    const formulariosAtivos = formularios.filter(
      (f) =>
        docentesAtivos.some((d) => d.nome === f.nome_docente) &&
        disciplinasAtivas.some((d) => d.nome === f.id_disciplina)
    );

    onUpdateDocentes(docentesAtivos);
    onUpdateDisciplinas(disciplinasAtivas);
    onUpdateFormularios(formulariosAtivos);
    onAddToHistory({
      type: "bulk",
      action: "clean_inactive",
      target: "Dados Inativos",
      description: "Dados inativos foram removidos",
    });
  };

  const exportarDados = () => {
    const data = {
      docentes,
      disciplinas,
      formularios,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dados-sistema-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onAddToHistory({
      type: "bulk",
      action: "export_data",
      target: "Dados do Sistema",
      description: "Dados exportados com sucesso",
    });
  };

  const operations = [
    {
      category: "Docentes",
      items: [
        {
          title: "Ativar Todos os Docentes",
          description: "Marca todos os docentes como ativos",
          icon: <CheckIcon color="success" />,
          action: () =>
            openConfirmDialog(
              "Ativar Todos os Docentes",
              "Esta ação irá ativar todos os docentes do sistema. Deseja continuar?",
              ativarTodosDocentes
            ),
        },
        {
          title: "Desativar Todos os Docentes",
          description: "Marca todos os docentes como inativos",
          icon: <CancelIcon color="error" />,
          action: () =>
            openConfirmDialog(
              "Desativar Todos os Docentes",
              "Esta ação irá desativar todos os docentes do sistema. Deseja continuar?",
              desativarTodosDocentes
            ),
        },
        {
          title: "Resetar Saldos",
          description: "Define um valor padrão para todos os saldos",
          icon: <RefreshIcon color="warning" />,
          action: () =>
            openConfirmDialog(
              "Resetar Saldos",
              `Esta ação irá definir o saldo de todos os docentes para ${resetSaldoValue}. Deseja continuar?`,
              resetarSaldos
            ),
        },
      ],
    },
    {
      category: "Disciplinas",
      items: [
        {
          title: "Ativar Todas as Disciplinas",
          description: "Marca todas as disciplinas como ativas",
          icon: <CheckIcon color="success" />,
          action: () =>
            openConfirmDialog(
              "Ativar Todas as Disciplinas",
              "Esta ação irá ativar todas as disciplinas do sistema. Deseja continuar?",
              ativarTodasDisciplinas
            ),
        },
        {
          title: "Desativar Todas as Disciplinas",
          description: "Marca todas as disciplinas como inativas",
          icon: <CancelIcon color="error" />,
          action: () =>
            openConfirmDialog(
              "Desativar Todas as Disciplinas",
              "Esta ação irá desativar todas as disciplinas do sistema. Deseja continuar?",
              desativarTodasDisciplinas
            ),
        },
      ],
    },
    {
      category: "Sistema",
      items: [
        {
          title: "Remover Todas as Travas",
          description: "Remove todas as travas de docentes e disciplinas",
          icon: <DeleteIcon color="warning" />,
          action: () =>
            openConfirmDialog(
              "Remover Todas as Travas",
              "Esta ação irá remover todas as travas do sistema. Deseja continuar?",
              removerTravas
            ),
        },
        {
          title: "Normalizar Prioridades",
          description: "Ajusta todas as prioridades para escala 1-10",
          icon: <NormalizeIcon color="info" />,
          action: () =>
            openConfirmDialog(
              "Normalizar Prioridades",
              "Esta ação irá normalizar todas as prioridades para a escala 1-10. Deseja continuar?",
              normalizarPrioridades
            ),
        },
        {
          title: "Limpar Dados Inativos",
          description: "Remove todos os dados marcados como inativos",
          icon: <DeleteIcon color="error" />,
          action: () =>
            openConfirmDialog(
              "Limpar Dados Inativos",
              "Esta ação irá remover permanentemente todos os dados inativos. Esta operação não pode ser desfeita. Deseja continuar?",
              limparDadosInativos
            ),
        },
        {
          title: "Exportar Dados",
          description: "Baixa um arquivo JSON com todos os dados",
          icon: <DownloadIcon color="primary" />,
          action: exportarDados,
        },
      ],
    },
  ];

  return (
    <Box>
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Atenção:</strong> As operações em lote afetam grandes
          quantidades de dados. Certifique-se de fazer backup antes de executar
          operações críticas.
        </Typography>
      </Alert>

      {/* Campo para valor do reset de saldo */}
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Valor para Reset de Saldos"
          type="number"
          value={resetSaldoValue}
          onChange={(e) => setResetSaldoValue(Number(e.target.value))}
          sx={{ width: 200 }}
        />
      </Box>

      {/* Operações por Categoria */}
      {operations.map((category) => (
        <Card key={category.category} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {category.category}
            </Typography>
            <List>
              {category.items.map((item, index) => (
                <div key={index}>
                  <ListItem>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      secondary={item.description}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<PlayIcon />}
                      onClick={item.action}
                      size="small"
                    >
                      Executar
                    </Button>
                  </ListItem>
                  {index < category.items.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          </CardContent>
        </Card>
      ))}

      {/* Dialog de Confirmação */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon color="warning" />
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.description}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Cancelar</Button>
          <Button onClick={executeAction} variant="contained" color="warning">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
