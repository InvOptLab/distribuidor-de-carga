"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";
import {
  Disciplina,
  Docente,
  Formulario,
} from "@/algoritmo/communs/interfaces/interfaces";
import { useTranslations } from "next-intl";

interface DocenteSelectionDialogProps {
  /**
   * Se o dialog está aberto
   */
  open: boolean;

  /**
   * Callback para fechar o dialog
   */
  onClose: () => void;

  /**
   * Disciplina selecionada
   */
  disciplina: Disciplina;

  /**
   * Docentes atualmente atribuídos
   */
  docentesAtribuidos: string[];

  /**
   * Lista de todos os docentes disponíveis
   */
  todosDocentes: Docente[];

  /**
   * Lista de formulários (prioridades)
   */
  formularios: Formulario[];

  /**
   * Callback quando a seleção é confirmada
   */
  onConfirm: (docentes: string[]) => void;
}

/**
 * Dialog para seleção de docentes com visualização em dois blocos:
 * - Esquerda: Docentes com formulário para a disciplina
 * - Direita: Demais docentes
 */
export function DocenteSelectionDialog({
  open,
  onClose,
  disciplina,
  docentesAtribuidos,
  todosDocentes,
  formularios,
  onConfirm,
}: DocenteSelectionDialogProps) {
  const [selectedDocentes, setSelectedDocentes] = useState<string[]>([]);

  const t = useTranslations("Spreadsheet.DocenteSelectionDialog");
  const tUtils = useTranslations("Utils");

  useEffect(() => {
    if (open) {
      setSelectedDocentes(docentesAtribuidos);
    }
  }, [open, docentesAtribuidos]);

  /**
   * Separa os docentes em dois grupos:
   * - Com formulário para a disciplina
   * - Sem formulário
   */
  const { docentesComFormulario, docentesSemFormulario } = useMemo(() => {
    const comFormulario: Array<Docente & { prioridade?: number }> = [];
    const semFormulario: Docente[] = [];

    todosDocentes
      .filter((d) => d.ativo)
      .forEach((docente) => {
        const formulario = formularios.find(
          (f) =>
            f.id_disciplina === disciplina.id &&
            f.nome_docente === docente.nome,
        );

        if (formulario) {
          comFormulario.push({ ...docente, prioridade: formulario.prioridade });
        } else {
          semFormulario.push(docente);
        }
      });

    return {
      docentesComFormulario: comFormulario,
      docentesSemFormulario: semFormulario,
    };
  }, [todosDocentes, formularios, disciplina.id]);

  /**
   * Retorna a cor do saldo baseado nas regras:
   * - Verde: saldo > 2
   * - Vermelho: saldo < -1
   * - Preto: demais casos
   */
  const getSaldoColor = (saldo?: number): string => {
    if (saldo === undefined) return "main";
    if (saldo > 2) return "success";
    if (saldo < -1) return "error";
    return "main";
  };

  /**
   * Toggle seleção de um docente
   */
  const handleToggle = (nomeDocente: string) => {
    setSelectedDocentes((prev) => {
      if (prev.includes(nomeDocente)) {
        return prev.filter((d) => d !== nomeDocente);
      }
      return [...prev, nomeDocente];
    });
  };

  /**
   * Confirma a seleção
   */
  const handleConfirm = () => {
    onConfirm(selectedDocentes);
    onClose();
  };

  /**
   * Cancela e fecha o dialog
   */
  const handleCancel = () => {
    setSelectedDocentes(docentesAtribuidos);
    onClose();
  };

  /**
   * Renderiza um item de docente na lista
   */
  const renderDocenteItem = (docente: Docente & { prioridade?: number }) => {
    const isSelected = selectedDocentes.includes(docente.nome);

    return (
      <ListItem key={docente.nome} disablePadding>
        <ListItemButton onClick={() => handleToggle(docente.nome)} dense>
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={isSelected}
              tabIndex={-1}
              disableRipple
              slotProps={{
                input: {
                  "aria-labelledby": `checkbox-list-label-${docente.nome}`,
                },
              }}
            />
          </ListItemIcon>
          <ListItemText
            id={`checkbox-list-label-${docente.nome}`}
            primary={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="body2" component="span">
                  {docente.nome}
                </Typography>
                {docente.prioridade !== undefined && (
                  <Chip
                    label={t("priority", { prioridade: docente.prioridade })}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                <Typography
                  variant="body2"
                  component="span"
                  sx={{
                    fontWeight: "medium",
                  }}
                  color={getSaldoColor(docente.saldo)}
                >
                  {t("balance", { saldo: docente.saldo.toFixed(2) ?? 0 })}
                </Typography>
              </Box>
            }
          />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        {t("selectProfessorsTitle", {
          codigo: disciplina.codigo,
          turma: disciplina.turma,
        })}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", gap: 2, minHeight: "400px" }}>
          {/* Bloco Esquerdo: Docentes com Formulário */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", mb: 1, color: "primary.main" }}
            >
              {t("professorsWithFormsCount", {
                count: docentesComFormulario.length,
              })}
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "background.paper",
              }}
            >
              {docentesComFormulario.length === 0 ? (
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    {t("noProfessorsWithForms")}
                  </Typography>
                </Box>
              ) : (
                <List sx={{ py: 0 }}>
                  {docentesComFormulario.map(renderDocenteItem)}
                </List>
              )}
            </Box>
          </Box>

          {/* Bloco Direito: Demais Docentes */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", mb: 1, color: "text.secondary" }}
            >
              {t("otherProfessorsCount", {
                count: docentesSemFormulario.length,
              })}
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "background.paper",
              }}
            >
              {docentesSemFormulario.length === 0 ? (
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    {t("noOtherProfessors")}
                  </Typography>
                </Box>
              ) : (
                <List sx={{ py: 0 }}>
                  {docentesSemFormulario.map(renderDocenteItem)}
                </List>
              )}
            </Box>
          </Box>
        </Box>

        {/* Resumo da seleção */}
        <Box
          sx={{ mt: 2, p: 2, backgroundColor: "action.hover", borderRadius: 1 }}
        >
          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
            {t("selectedCount", { count: selectedDocentes.length })}
          </Typography>
          {selectedDocentes.length > 0 && (
            <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selectedDocentes.map((nome) => (
                <Chip key={nome} label={nome} size="small" color="primary" />
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} variant="outlined" color="error">
          {tUtils("cancel")}
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          {tUtils("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
