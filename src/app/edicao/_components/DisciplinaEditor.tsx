"use client";

import { useState, useMemo } from "react";
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import {
  Edit as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { Disciplina, Horario } from "@/algoritmo/communs/interfaces/interfaces";

interface DisciplinaEditorProps {
  disciplinas: Disciplina[];
  onUpdate: (disciplina: Disciplina) => void;
}

export function DisciplinaEditor({
  disciplinas,
  onUpdate,
}: DisciplinaEditorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialog, setEditDialog] = useState({
    open: false,
    disciplina: null as Disciplina | null,
  });
  const [horarioDialog, setHorarioDialog] = useState({
    open: false,
    horario: null as Horario | null,
  });
  const [formData, setFormData] = useState({
    codigo: "",
    nome: "",
    turma: 1,
    prioridade: 1,
    nivel: "",
    carga: 0,
    ativo: true,
    noturna: false,
    ingles: false,
    trava: false,
    horarios: [] as Horario[],
  });
  const [horarioData, setHorarioData] = useState<Horario>({
    dia: "",
    inicio: "",
    fim: "",
  });

  const filteredDisciplinas = useMemo(() => {
    return disciplinas.filter(
      (disciplina) =>
        disciplina.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        disciplina.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [disciplinas, searchTerm]);

  const openEditDialog = (disciplina: Disciplina) => {
    setFormData({
      codigo: disciplina.codigo,
      nome: disciplina.nome,
      turma: disciplina.turma,
      prioridade: disciplina.prioridade,
      nivel: disciplina.nivel,
      carga: disciplina.carga,
      ativo: disciplina.ativo,
      noturna: disciplina.noturna || false,
      ingles: disciplina.ingles || false,
      trava: disciplina.trava,
      horarios: [...disciplina.horarios],
    });
    setEditDialog({ open: true, disciplina });
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, disciplina: null });
  };

  const openHorarioDialog = (horario?: Horario) => {
    if (horario) {
      setHorarioData({
        dia: horario.dia,
        inicio: horario.inicio,
        fim: horario.fim,
      });
    } else {
      setHorarioData({ dia: "", inicio: "", fim: "" });
    }
    setHorarioDialog({ open: true, horario: horario || null });
  };

  const closeHorarioDialog = () => {
    setHorarioDialog({ open: false, horario: null });
  };

  const handleSave = () => {
    if (editDialog.disciplina) {
      const updatedDisciplina: Disciplina = {
        ...editDialog.disciplina,
        codigo: formData.codigo,
        nome: formData.nome,
        turma: formData.turma,
        prioridade: formData.prioridade,
        nivel: formData.nivel,
        carga: formData.carga,
        ativo: formData.ativo,
        noturna: formData.noturna,
        ingles: formData.ingles,
        trava: formData.trava,
        horarios: formData.horarios,
      };
      onUpdate(updatedDisciplina);
      closeEditDialog();
    }
  };

  const handleSaveHorario = () => {
    if (horarioData.dia && horarioData.inicio && horarioData.fim) {
      const newHorario: Horario = {
        dia: horarioData.dia,
        inicio: horarioData.inicio,
        fim: horarioData.fim,
      };

      if (horarioDialog.horario) {
        // Editar horário existente
        const updatedHorarios = formData.horarios.map((h) =>
          h === horarioDialog.horario ? newHorario : h
        );
        setFormData({ ...formData, horarios: updatedHorarios });
      } else {
        // Adicionar novo horário
        setFormData({
          ...formData,
          horarios: [...formData.horarios, newHorario],
        });
      }
      closeHorarioDialog();
    }
  };

  const removeHorario = (horario: Horario) => {
    const updatedHorarios = formData.horarios.filter((h) => h !== horario);
    setFormData({ ...formData, horarios: updatedHorarios });
  };

  const columns: GridColDef[] = [
    {
      field: "codigo",
      headerName: "Código",
      width: 120,
    },
    {
      field: "nome",
      headerName: "Nome",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "turma",
      headerName: "Turma",
      width: 100,
    },
    {
      field: "prioridade",
      headerName: "Prioridade",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value >= 8
              ? "error"
              : params.value >= 5
              ? "warning"
              : "success"
          }
          size="small"
        />
      ),
    },
    {
      field: "carga",
      headerName: "Carga",
      width: 100,
      renderCell: (params) => `${params.value}h`,
    },
    {
      field: "ativo",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Ativa" : "Inativa"}
          color={params.value ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "horarios",
      headerName: "Horários",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value.length}
          color={params.value.length > 0 ? "primary" : "default"}
          size="small"
          icon={<TimeIcon />}
        />
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Ações",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Editar"
          onClick={() => openEditDialog(params.row)}
        />,
      ],
    },
  ];

  const diasSemana = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  return (
    <Box>
      {/* Barra de Busca */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          placeholder="Buscar disciplina..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
            ),
            endAdornment: searchTerm && (
              <IconButton size="small" onClick={() => setSearchTerm("")}>
                <ClearIcon />
              </IconButton>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            const newDisciplina: Disciplina = {
              id: Date.now().toString(),
              codigo: "NOVA",
              nome: "Nova Disciplina",
              turma: 1,
              prioridade: 1,
              nivel: "g",
              carga: 0,
              ativo: true,
              horarios: [] as Horario[],
              trava: false,
              conflitos: new Set(),
              cursos: "",
              ementa: "",
              grupo: "",
              horario: "",
              ingles: false,
              noturna: false,
              docentes: [],
            };
            openEditDialog(newDisciplina);
          }}
        >
          Adicionar Disciplina
        </Button>
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={filteredDisciplinas}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Dialog de Edição */}
      <Dialog
        open={editDialog.open}
        onClose={closeEditDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {editDialog.disciplina?.nome === "Nova Disciplina"
            ? "Adicionar Disciplina"
            : "Editar Disciplina"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código"
                value={formData.codigo}
                onChange={(e) =>
                  setFormData({ ...formData, codigo: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Turma"
                value={formData.turma}
                onChange={(e) =>
                  setFormData({ ...formData, turma: Number(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Prioridade"
                type="number"
                inputProps={{ min: 1, max: 10 }}
                value={formData.prioridade}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    prioridade: Number(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Nível"
                type="string"
                inputProps={{ min: 1 }}
                value={formData.nivel}
                onChange={(e) =>
                  setFormData({ ...formData, nivel: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Carga Horária"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.carga}
                onChange={(e) =>
                  setFormData({ ...formData, carga: Number(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.ativo}
                    onChange={(e) =>
                      setFormData({ ...formData, ativo: e.target.checked })
                    }
                  />
                }
                label="Disciplina Ativa"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.noturna}
                    onChange={(e) =>
                      setFormData({ ...formData, noturna: e.target.checked })
                    }
                  />
                }
                label="Disciplina Noturna"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.ingles}
                    onChange={(e) =>
                      setFormData({ ...formData, ingles: e.target.checked })
                    }
                  />
                }
                label="Disciplina em Inglês"
              />
            </Grid>

            {/* Horários */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Horários</Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => openHorarioDialog()}
                >
                  Adicionar Horário
                </Button>
              </Box>
              <List>
                {formData.horarios.map((horario, index) => (
                  <div key={index}>
                    <ListItem>
                      <ListItemText
                        primary={`${horario.dia} - ${horario.inicio} às ${horario.fim}`}
                        secondary={`Duração: ${
                          Number.parseInt(horario.fim.split(":")[0]) * 60 +
                          Number.parseInt(horario.fim.split(":")[1]) -
                          (Number.parseInt(horario.inicio.split(":")[0]) * 60 +
                            Number.parseInt(horario.inicio.split(":")[1]))
                        } minutos`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => openHorarioDialog(horario)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => removeHorario(horario)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < formData.horarios.length - 1 && <Divider />}
                  </div>
                ))}
                {formData.horarios.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="Nenhum horário definido"
                      secondary="Clique em 'Adicionar Horário' para definir os horários da disciplina"
                    />
                  </ListItem>
                )}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Horário */}
      <Dialog
        open={horarioDialog.open}
        onClose={closeHorarioDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {horarioDialog.horario ? "Editar Horário" : "Adicionar Horário"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Dia da Semana</InputLabel>
                <Select
                  value={horarioData.dia}
                  label="Dia da Semana"
                  onChange={(e) =>
                    setHorarioData({
                      ...horarioData,
                      dia: e.target.value as
                        | ""
                        | "Seg."
                        | "Ter."
                        | "Qua."
                        | "Qui."
                        | "Sex."
                        | "Sáb.",
                    })
                  }
                >
                  {diasSemana.map((dia) => (
                    <MenuItem key={dia} value={dia}>
                      {dia}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Horário de Início"
                type="time"
                value={horarioData.inicio}
                onChange={(e) =>
                  setHorarioData({ ...horarioData, inicio: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Horário de Fim"
                type="time"
                value={horarioData.fim}
                onChange={(e) =>
                  setHorarioData({ ...horarioData, fim: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeHorarioDialog}>Cancelar</Button>
          <Button
            onClick={handleSaveHorario}
            variant="contained"
            disabled={
              !horarioData.dia || !horarioData.inicio || !horarioData.fim
            }
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
