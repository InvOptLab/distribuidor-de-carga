"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Alert,
  Snackbar,
  Paper,
} from "@mui/material";
import {
  Save as SaveIcon,
  People as PeopleIcon,
  MenuBook as MenuBookIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { Disciplina, Docente, Formulario } from "@/context/Global/utils";
import { DocenteEditor } from "./_components/DocenteEditor";
import { DisciplinaEditor } from "./_components/DisciplinaEditor";
import { FormularioEditor } from "./_components/FormularioEditor";
import { BulkOperations } from "./_components/BulkOperations";
import { ChangeHistory } from "./_components/ChangeHistory";
import { useGlobalContext } from "@/context/Global";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EdicaoPage() {
  const [tabValue, setTabValue] = useState(0);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [changeHistory, setChangeHistory] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const global = useGlobalContext();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const storedDocentes = global.docentes;
      const storedDisciplinas = global.disciplinas;
      const storedFormularios = global.formularios;

      if (storedDocentes) setDocentes(storedDocentes);
      if (storedDisciplinas) setDisciplinas(storedDisciplinas);
      if (storedFormularios) setFormularios(storedFormularios);
    } catch (error) {
      showSnackbar("Erro ao carregar dados", "error");
      console.log(error);
    }
  };

  const saveChanges = () => {
    try {
      localStorage.setItem("docentes", JSON.stringify(docentes));
      localStorage.setItem("disciplinas", JSON.stringify(disciplinas));
      localStorage.setItem("formularios", JSON.stringify(formularios));

      setHasChanges(false);
      showSnackbar("Alterações salvas com sucesso!", "success");
    } catch (error) {
      showSnackbar("Erro ao salvar alterações", "error");
      console.log(error);
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const addToHistory = (change: any) => {
    const newChange = {
      ...change,
      timestamp: new Date().toISOString(),
      id: Date.now().toString(),
    };
    setChangeHistory((prev) => [newChange, ...prev.slice(0, 49)]);
    setHasChanges(true);
  };

  const updateDocente = (updatedDocente: Docente) => {
    setDocentes((prev) =>
      prev.map((d) => (d.nome === updatedDocente.nome ? updatedDocente : d))
    );
    addToHistory({
      type: "docente",
      action: "update",
      target: updatedDocente.nome,
      description: `Docente ${updatedDocente.nome} atualizado`,
    });
  };

  const updateDisciplina = (updatedDisciplina: Disciplina) => {
    setDisciplinas((prev) =>
      prev.map((d) => (d.id === updatedDisciplina.id ? updatedDisciplina : d))
    );
    addToHistory({
      type: "disciplina",
      action: "update",
      target: `${updatedDisciplina.codigo} - ${updatedDisciplina.nome}`,
      description: `Disciplina ${updatedDisciplina.codigo} atualizada`,
    });
  };

  const updateFormularios = (newFormularios: Formulario[]) => {
    setFormularios(newFormularios);
    addToHistory({
      type: "formulario",
      action: "update",
      target: "Formulários",
      description: "Formulários de prioridade atualizados",
    });
  };

  const stats = {
    docentes: {
      total: docentes.length,
      ativos: docentes.filter((d) => d.ativo).length,
      comFormularios: docentes.filter((d) => d.formularios.size > 0).length,
    },
    disciplinas: {
      total: disciplinas.length,
      ativas: disciplinas.filter((d) => d.ativo).length,
      comHorarios: disciplinas.filter((d) => d.horarios.length > 0).length,
    },
    formularios: {
      total: formularios.length,
      preenchidos: formularios.filter((f) => f.prioridade > 0).length,
    },
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Edição de Dados
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Gerencie docentes, disciplinas e formulários de prioridade
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {hasChanges && (
              <Chip
                icon={<WarningIcon />}
                label="Alterações não salvas"
                color="warning"
                variant="outlined"
              />
            )}
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveChanges}
              disabled={!hasChanges}
              size="large"
            >
              Salvar Alterações
            </Button>
          </Box>
        </Box>

        {/* Estatísticas */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Docentes
                    </Typography>
                    <Typography variant="h4">{stats.docentes.total}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats.docentes.ativos} ativos •{" "}
                      {stats.docentes.comFormularios} com formulários
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 40, color: "primary.main" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Disciplinas
                    </Typography>
                    <Typography variant="h4">
                      {stats.disciplinas.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats.disciplinas.ativas} ativas •{" "}
                      {stats.disciplinas.comHorarios} com horários
                    </Typography>
                  </Box>
                  <MenuBookIcon sx={{ fontSize: 40, color: "primary.main" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Formulários
                    </Typography>
                    <Typography variant="h4">
                      {stats.formularios.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats.formularios.preenchidos} preenchidos
                    </Typography>
                  </Box>
                  <AssignmentIcon
                    sx={{ fontSize: 40, color: "primary.main" }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab icon={<PeopleIcon />} label="Docentes" />
          <Tab icon={<MenuBookIcon />} label="Disciplinas" />
          <Tab icon={<AssignmentIcon />} label="Formulários" />
          <Tab icon={<SettingsIcon />} label="Operações" />
          <Tab icon={<HistoryIcon />} label="Histórico" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <DocenteEditor
            docentes={docentes}
            onUpdate={updateDocente}
            formularios={formularios}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <DisciplinaEditor
            disciplinas={disciplinas}
            onUpdate={updateDisciplina}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <FormularioEditor
            formularios={formularios}
            docentes={docentes}
            disciplinas={disciplinas}
            onUpdate={updateFormularios}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <BulkOperations
            docentes={docentes}
            disciplinas={disciplinas}
            formularios={formularios}
            onUpdateDocentes={setDocentes}
            onUpdateDisciplinas={setDisciplinas}
            onUpdateFormularios={setFormularios}
            onAddToHistory={addToHistory}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <ChangeHistory
            changes={changeHistory}
            onClearHistory={() => setChangeHistory([])}
          />
        </TabPanel>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
