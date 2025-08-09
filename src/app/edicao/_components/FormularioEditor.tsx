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
  Grid,
  Typography,
  Chip,
  IconButton,
  Card,
  CardContent,
  Slider,
  Alert,
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
  Person as PersonIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import { Disciplina, Docente, Formulario } from "@/context/Global/utils";

interface FormularioEditorProps {
  formularios: Formulario[];
  docentes: Docente[];
  disciplinas: Disciplina[];
  onUpdate: (formularios: Formulario[]) => void;
}

export function FormularioEditor({
  formularios,
  docentes,
  disciplinas,
  onUpdate,
}: FormularioEditorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDocente, setFilterDocente] = useState("");
  const [filterDisciplina, setFilterDisciplina] = useState("");
  const [editDialog, setEditDialog] = useState({
    open: false,
    formulario: null as Formulario | null,
  });
  const [formData, setFormData] = useState({
    nome_docente: "",
    id_disciplina: "",
    prioridade: 5,
  });

  const filteredFormularios = useMemo(() => {
    return formularios.filter((formulario) => {
      const matchesSearch =
        formulario.nome_docente
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        formulario.id_disciplina
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesDocente =
        !filterDocente || formulario.nome_docente === filterDocente;
      const matchesDisciplina =
        !filterDisciplina || formulario.id_disciplina === filterDisciplina;
      return matchesSearch && matchesDocente && matchesDisciplina;
    });
  }, [formularios, searchTerm, filterDocente, filterDisciplina]);

  const openEditDialog = (formulario?: Formulario) => {
    if (formulario) {
      setFormData({
        nome_docente: formulario.nome_docente,
        id_disciplina: formulario.id_disciplina,
        prioridade: formulario.prioridade,
      });
    } else {
      setFormData({
        nome_docente: "",
        id_disciplina: "",
        prioridade: 5,
      });
    }
    setEditDialog({ open: true, formulario: formulario || null });
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, formulario: null });
  };

  const handleSave = () => {
    if (formData.nome_docente && formData.id_disciplina) {
      let updatedFormularios = [...formularios];

      if (editDialog.formulario) {
        // Editar formulário existente
        updatedFormularios = formularios.map((f) =>
          f === editDialog.formulario
            ? {
                ...f,
                docente: formData.nome_docente,
                disciplina: formData.id_disciplina,
                prioridade: formData.prioridade,
              }
            : f
        );
      } else {
        // Adicionar novo formulário
        const newFormulario: Formulario = {
          nome_docente: formData.nome_docente,
          id_disciplina: formData.id_disciplina,
          prioridade: formData.prioridade,
        };
        updatedFormularios.push(newFormulario);
      }

      onUpdate(updatedFormularios);
      closeEditDialog();
    }
  };

  const getPriorityColor = (prioridade: number) => {
    if (prioridade >= 8) return "error";
    if (prioridade >= 6) return "warning";
    if (prioridade >= 4) return "info";
    return "success";
  };

  const getPriorityLabel = (prioridade: number) => {
    if (prioridade >= 8) return "Muito Alta";
    if (prioridade >= 6) return "Alta";
    if (prioridade >= 4) return "Média";
    return "Baixa";
  };

  const columns: GridColDef[] = [
    {
      field: "docente",
      headerName: "Docente",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          {params.value}
        </Box>
      ),
    },
    {
      field: "disciplina",
      headerName: "Disciplina",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SchoolIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          {params.value}
        </Box>
      ),
    },
    {
      field: "prioridade",
      headerName: "Prioridade",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={`${params.value} - ${getPriorityLabel(params.value)}`}
          color={getPriorityColor(params.value)}
          size="small"
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

  const docentesComFormularios = useMemo(() => {
    const docentesMap = new Map<
      string,
      { docente: string; formularios: Formulario[] }
    >();

    formularios.forEach((formulario) => {
      if (!docentesMap.has(formulario.nome_docente)) {
        docentesMap.set(formulario.nome_docente, {
          docente: formulario.nome_docente,
          formularios: [],
        });
      }
      docentesMap.get(formulario.nome_docente)!.formularios.push(formulario);
    });

    return Array.from(docentesMap.values());
  }, [formularios]);

  return (
    <Box>
      {/* Filtros */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <TextField
          placeholder="Buscar formulário..."
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
          sx={{ minWidth: 250 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filtrar por Docente</InputLabel>
          <Select
            value={filterDocente}
            label="Filtrar por Docente"
            onChange={(e) => setFilterDocente(e.target.value)}
          >
            <MenuItem value="">Todos os Docentes</MenuItem>
            {docentes.map((docente) => (
              <MenuItem key={docente.nome} value={docente.nome}>
                {docente.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filtrar por Disciplina</InputLabel>
          <Select
            value={filterDisciplina}
            label="Filtrar por Disciplina"
            onChange={(e) => setFilterDisciplina(e.target.value)}
          >
            <MenuItem value="">Todas as Disciplinas</MenuItem>
            {disciplinas.map((disciplina) => (
              <MenuItem key={disciplina.id} value={disciplina.nome}>
                {disciplina.codigo} - {disciplina.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openEditDialog()}
        >
          Nova Prioridade
        </Button>
      </Box>

      {/* Resumo por Docente */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resumo por Docente
        </Typography>
        <Grid container spacing={2}>
          {docentesComFormularios.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item.docente}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {item.docente}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {item.formularios.length} disciplina(s) com prioridade
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}
                  >
                    {item.formularios.slice(0, 3).map((formulario, index) => (
                      <Chip
                        key={index}
                        label={`${formulario.id_disciplina}: ${formulario.prioridade}`}
                        size="small"
                        color={getPriorityColor(formulario.prioridade)}
                      />
                    ))}
                    {item.formularios.length > 3 && (
                      <Chip
                        label={`+${item.formularios.length - 3} mais`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={filteredFormularios}
          columns={columns}
          getRowId={(row) => `${row.docente}-${row.disciplina}`}
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editDialog.formulario ? "Editar Prioridade" : "Nova Prioridade"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Docente</InputLabel>
                <Select
                  value={formData.nome_docente}
                  label="Docente"
                  onChange={(e) =>
                    setFormData({ ...formData, nome_docente: e.target.value })
                  }
                >
                  {docentes.map((docente) => (
                    <MenuItem key={docente.nome} value={docente.nome}>
                      {docente.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Disciplina</InputLabel>
                <Select
                  value={formData.id_disciplina}
                  label="Disciplina"
                  onChange={(e) =>
                    setFormData({ ...formData, id_disciplina: e.target.value })
                  }
                >
                  {disciplinas.map((disciplina) => (
                    <MenuItem key={disciplina.id} value={disciplina.nome}>
                      {disciplina.codigo} - {disciplina.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>
                Prioridade: {formData.prioridade} -{" "}
                {getPriorityLabel(formData.prioridade)}
              </Typography>
              <Slider
                value={formData.prioridade}
                onChange={(_, value) =>
                  setFormData({ ...formData, prioridade: value as number })
                }
                min={0}
                max={10}
                step={1}
                marks={[
                  { value: 0, label: "0" },
                  { value: 2, label: "2" },
                  { value: 4, label: "4" },
                  { value: 6, label: "6" },
                  { value: 8, label: "8" },
                  { value: 10, label: "10" },
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Escala de Prioridades:</strong>
                  <br />
                  0-3: Baixa prioridade (verde)
                  <br />
                  4-5: Média prioridade (azul)
                  <br />
                  6-7: Alta prioridade (laranja)
                  <br />
                  8-10: Muito alta prioridade (vermelho)
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancelar</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.nome_docente || !formData.id_disciplina}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
