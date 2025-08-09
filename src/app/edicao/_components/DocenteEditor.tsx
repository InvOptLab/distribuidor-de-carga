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
  Chip,
  IconButton,
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
} from "@mui/icons-material";
import { Docente, Formulario } from "@/context/Global/utils";

interface DocenteEditorProps {
  docentes: Docente[];
  onUpdate: (docente: Docente) => void;
  formularios: Formulario[];
}

export function DocenteEditor({
  docentes,
  onUpdate,
  formularios,
}: DocenteEditorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialog, setEditDialog] = useState({
    open: false,
    docente: null as Docente | null,
  });
  const [formData, setFormData] = useState({
    nome: "",
    saldo: 0,
    ativo: true,
    trava: false,
    agrupar: "Indiferente" as "Indiferente" | "Agrupar" | "Espalhar",
    comentario: "",
  });

  const filteredDocentes = useMemo(() => {
    return docentes.filter((docente) =>
      docente.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [docentes, searchTerm]);

  const openEditDialog = (docente: Docente) => {
    setFormData({
      nome: docente.nome,
      saldo: docente.saldo,
      ativo: docente.ativo,
      trava: docente.trava,
      agrupar: docente.agrupar as "Indiferente" | "Agrupar" | "Espalhar",
      comentario: docente.comentario || "",
    });
    setEditDialog({ open: true, docente });
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, docente: null });
  };

  const handleSave = () => {
    if (editDialog.docente) {
      const updatedDocente: Docente = {
        ...editDialog.docente,
        nome: formData.nome,
        saldo: formData.saldo,
        ativo: formData.ativo,
        trava: formData.trava,
        agrupar: formData.agrupar,
        comentario: formData.comentario,
      };
      onUpdate(updatedDocente);
      closeEditDialog();
    }
  };

  const getFormulariosCount = (docente: Docente) => {
    return formularios.filter((f) => f.nome_docente === docente.nome).length;
  };

  const columns: GridColDef[] = [
    {
      field: "nome",
      headerName: "Nome",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "saldo",
      headerName: "Saldo",
      width: 100,
      type: "number",
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value > 0
              ? "success"
              : params.value < 0
              ? "error"
              : "default"
          }
          size="small"
        />
      ),
    },
    {
      field: "ativo",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Ativo" : "Inativo"}
          color={params.value ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "agrupamento",
      headerName: "Agrupamento",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value || "Indiferente"}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: "formularios",
      headerName: "Formulários",
      width: 120,
      renderCell: (params) => {
        const count = getFormulariosCount(params.row);
        return (
          <Chip
            label={count}
            color={count > 0 ? "primary" : "default"}
            size="small"
          />
        );
      },
    },
    {
      field: "travas",
      headerName: "Travas",
      width: 100,
      renderCell: (params) => {
        const travasCount = params.row.travas?.size || 0;
        return travasCount > 0 ? (
          <Chip label={travasCount} color="warning" size="small" />
        ) : (
          <Chip label="0" color="default" size="small" />
        );
      },
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

  return (
    <Box>
      {/* Barra de Busca */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          placeholder="Buscar docente..."
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
            const newDocente: Docente = {
              nome: "Novo Docente",
              saldo: 0,
              ativo: true,
              trava: false,
              formularios: new Map<string, number>(),
              agrupar: "Indiferente",
              comentario: "",
            };
            openEditDialog(newDocente);
          }}
        >
          Adicionar Docente
        </Button>
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={filteredDocentes}
          columns={columns}
          getRowId={(row) => row.nome}
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
          {editDialog.docente?.nome === "Novo Docente"
            ? "Adicionar Docente"
            : "Editar Docente"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Saldo"
                type="number"
                value={formData.saldo}
                onChange={(e) =>
                  setFormData({ ...formData, saldo: Number(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Agrupamento</InputLabel>
                <Select
                  value={formData.agrupar}
                  label="Agrupamento"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      agrupar: e.target.value as any,
                    })
                  }
                >
                  <MenuItem value="Indiferente">Indiferente</MenuItem>
                  <MenuItem value="Agrupar">Agrupar</MenuItem>
                  <MenuItem value="Espalhar">Espalhar</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.ativo}
                    onChange={(e) =>
                      setFormData({ ...formData, ativo: e.target.checked })
                    }
                  />
                }
                label="Docente Ativo"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comentários"
                multiline
                rows={3}
                value={formData.comentario}
                onChange={(e) =>
                  setFormData({ ...formData, comentario: e.target.value })
                }
                placeholder="Observações sobre o docente..."
              />
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
    </Box>
  );
}
