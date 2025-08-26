"use client";

import type React from "react";

import {
  Button,
  Box,
  Typography,
  CircularProgress,
  Container,
  Grid2 as Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import BackupIcon from "@mui/icons-material/Backup";
import DatasetIcon from "@mui/icons-material/Dataset";
import { useState, useCallback } from "react";
import {
  processAndUpdateState,
  processAtribuicoes,
  processDisciplinas,
  processDocentes,
  processFormularios,
  processSolucao,
  processTravas,
} from "../inputfile/UpdateState";
import { useGlobalContext } from "@/context/Global";
import { useAlertsContext } from "@/context/Alerts";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";
import FilePreview from "./_components/FilePreview";
import DataComparison from "./_components/DataComparison";
import UploadProgress from "./_components/UploadProgress";
import {
  type Atribuicao,
  type Celula,
  type Disciplina,
  type Docente,
  type Formulario,
  horariosSobrepoem,
} from "@/context/Global/utils";
import { exportJson } from "../atribuicoes";
import { useAlgorithmContext } from "@/context/Algorithm";

interface FileAnalysis {
  docentes: { total: number; ativos: number; inativos: number };
  disciplinas: { total: number; ativas: number; inativas: number };
  atribuicoes: { total: number; comDocentes: number; semDocentes: number };
  formularios: { total: number; docentesComFormulario: number };
  travas: number;
  solucao: boolean;
  versao?: string;
  qualidade: {
    docentesSemFormulario: number;
    disciplinasSemInteressados: number;
    conflitosHorario: number;
  };
}

interface TempData {
  docentes: Docente[];
  disciplinas: Disciplina[];
  atribuicoes: Atribuicao[];
  formularios: Formulario[];
  travas: Celula[];
  jsonData: any;
}

export default function InputFileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingTestData, setLoadingTestData] = useState(false);
  const [fileAnalysis, setFileAnalysis] = useState<FileAnalysis | null>(null);
  const [tempData, setTempData] = useState<TempData | null>(null);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const { addAlerta } = useAlertsContext();
  const {
    setAtribuicoes,
    setDisciplinas,
    setDocentes,
    setFormularios,
    setTravas,
    setSolucaoAtual,
    setHistoricoSolucoes,
    historicoSolucoes,
    docentes: currentDocentes,
    disciplinas: currentDisciplinas,
    atribuicoes: currentAtribuicoes,
    travas: currentTravas,
  } = useGlobalContext();

  const { cleanSolucaoAtual } = useSolutionHistory();

  const { setMaiorPrioridade } = useAlgorithmContext();

  // Função para processar e analisar o arquivo usando suas funções existentes
  const processAndAnalyzeFile = useCallback(
    (jsonData: any): { analysis: FileAnalysis; tempData: TempData } => {
      // Processar dados usando suas funções existentes
      const docentes: Docente[] = processAndUpdateState(
        jsonData,
        ["docentes", "saldos"],
        processDocentes,
        () => null
      );
      const disciplinas: Disciplina[] = processAndUpdateState(
        jsonData,
        "disciplinas",
        processDisciplinas,
        () => null
      );
      const atribuicoes: Atribuicao[] = processAndUpdateState(
        jsonData,
        "atribuicao",
        processAtribuicoes,
        () => null
      );
      const formularios: Formulario[] = processAndUpdateState(
        jsonData,
        "formularios",
        processFormularios,
        () => null
      );

      const travas: Celula[] = processAndUpdateState(
        jsonData,
        "travas",
        processTravas,
        () => null
      );

      // Criar todas as disciplinas no state de atribuições
      if (atribuicoes.length != disciplinas.length) {
        for (const disciplina of disciplinas) {
          if (
            !atribuicoes.find(
              (atribuicao) => atribuicao.id_disciplina == disciplina.id
            )
          ) {
            atribuicoes.push({ id_disciplina: disciplina.id, docentes: [] });
          }
        }
      }

      // Preenche a lista de conflitos por disciplina
      for (let i = 0; i < disciplinas.length; i++) {
        for (let j = i + 1; j < disciplinas.length; j++) {
          for (const horarioPivo of disciplinas[i].horarios) {
            for (const horarioAtual of disciplinas[j].horarios) {
              if (horariosSobrepoem(horarioPivo, horarioAtual)) {
                disciplinas[i].conflitos.add(disciplinas[j].id);
                disciplinas[j].conflitos.add(disciplinas[i].id);
              }
            }
          }
        }
      }

      // Preenche a lista(Map) de formularios por docente
      for (const docente of docentes) {
        const docenteFormularios = formularios.filter(
          (formulario) => formulario.nome_docente === docente.nome
        );
        for (const docenteFormulario of docenteFormularios) {
          docente.formularios.set(
            docenteFormulario.id_disciplina,
            docenteFormulario.prioridade
          );
        }
      }

      // Análise de docentes
      const docentesAtivos = docentes.filter((d) => d.ativo).length;
      const docentesInativos = docentes.length - docentesAtivos;

      // Análise de disciplinas
      const disciplinasAtivas = disciplinas.filter((d) => d.ativo).length;
      const disciplinasInativas = disciplinas.length - disciplinasAtivas;

      // Análise de atribuições
      const atribuicoesComDocentes = atribuicoes.filter(
        (a) => a.docentes && a.docentes.length > 0
      ).length;
      const atribuicoesSemDocentes =
        atribuicoes.length - atribuicoesComDocentes;

      // Análise de formulários
      const docentesComFormulario = new Set(
        formularios.map((f) => f.nome_docente)
      ).size;

      // Análise de qualidade
      const docentesNomes = new Set(docentes.map((d) => d.nome));
      const docentesSemFormulario = docentesNomes.size - docentesComFormulario;

      const disciplinasComInteressados = new Set(
        formularios.map((f) => f.id_disciplina)
      ).size;
      const disciplinasSemInteressados =
        disciplinas.length - disciplinasComInteressados;

      // Análise de conflitos de horário
      let conflitosHorario = 0;
      for (let i = 0; i < disciplinas.length; i++) {
        for (let j = i + 1; j < disciplinas.length; j++) {
          const horarios1 = disciplinas[i].horarios || [];
          const horarios2 = disciplinas[j].horarios || [];
          for (const h1 of horarios1) {
            for (const h2 of horarios2) {
              if (horariosSobrepoem(h1, h2)) {
                conflitosHorario++;
                break;
              }
            }
          }
        }
      }

      const analysis: FileAnalysis = {
        docentes: {
          total: docentes.length,
          ativos: docentesAtivos,
          inativos: docentesInativos,
        },
        disciplinas: {
          total: disciplinas.length,
          ativas: disciplinasAtivas,
          inativas: disciplinasInativas,
        },
        atribuicoes: {
          total: atribuicoes.length,
          comDocentes: atribuicoesComDocentes,
          semDocentes: atribuicoesSemDocentes,
        },
        formularios: {
          total: formularios.length,
          docentesComFormulario,
        },
        travas: travas.length,
        solucao: !!jsonData["solucao"],
        versao: jsonData["versao"],
        qualidade: {
          docentesSemFormulario,
          disciplinasSemInteressados,
          conflitosHorario,
        },
      };

      const tempDataResult: TempData = {
        docentes,
        disciplinas,
        atribuicoes,
        formularios,
        travas,
        jsonData,
      };

      /**
       * Calcular o valor `maiorPrioridade`
       */

      let _maiorPrioridade = 0;
      for (const formulario of formularios) {
        if (formulario.prioridade > _maiorPrioridade || !_maiorPrioridade) {
          _maiorPrioridade = formulario.prioridade;
        }
      }
      setMaiorPrioridade(_maiorPrioridade);

      return { analysis, tempData: tempDataResult };
    },
    []
  );

  // Função para carregar dados de teste
  const loadTestData = useCallback(async () => {
    setLoadingTestData(true);
    try {
      const response = await fetch("/data/teste.json");
      if (!response.ok) {
        throw new Error(`Erro ao carregar dados de teste: ${response.status}`);
      }

      const jsonData = await response.json();
      const { analysis, tempData: temp } = processAndAnalyzeFile(jsonData);

      setFileAnalysis(analysis);
      setTempData(temp);
      setSelectedFile(null); // Limpar arquivo selecionado

      addAlerta("Dados de teste carregados com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao carregar dados de teste:", error);
      addAlerta(
        "Erro ao carregar dados de teste. Verifique se o arquivo existe.",
        "error"
      );
    } finally {
      setLoadingTestData(false);
    }
  }, [processAndAnalyzeFile, addAlerta]);

  // Função para validar se um arquivo foi selecionado e analisá-lo
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type === "application/json") {
          setSelectedFile(file);

          // Ler e analisar o arquivo
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const json = JSON.parse(event.target?.result as string);
              const { analysis, tempData: temp } = processAndAnalyzeFile(json);
              setFileAnalysis(analysis);
              setTempData(temp);
            } catch (error) {
              addAlerta("Erro ao analisar o arquivo JSON.", "error");
              console.log(error);
              setFileAnalysis(null);
              setTempData(null);
            }
          };
          reader.readAsText(file);
        } else {
          addAlerta("Por favor, selecione um arquivo JSON.", "warning");
        }
      }
    },
    [processAndAnalyzeFile, addAlerta]
  );

  const [safeCOntinue, setSafeContinue] = useState(false);

  // Função para fazer backup dos dados atuais usando sua função
  const createBackup = useCallback(() => {
    const timestamp = new Date().toISOString().split("T")[0];
    exportJson(
      `backup_${timestamp}`,
      currentDocentes,
      currentDisciplinas,
      currentAtribuicoes,
      currentTravas
    );
    setSafeContinue(true);
    addAlerta("Backup criado com sucesso!", "success");
  }, [
    currentDocentes,
    currentDisciplinas,
    currentAtribuicoes,
    currentTravas,
    addAlerta,
  ]);

  // Função para aplicar os dados temporários aos dados reais
  const applyTempData = useCallback(() => {
    if (!tempData) return;

    const steps = [
      "Aplicando docentes...",
      "Aplicando disciplinas...",
      "Aplicando atribuições...",
      "Aplicando formulários...",
      "Aplicando travas...",
      "Processando solução...",
      "Finalizando...",
    ];

    const updateProgress = (step: string) => {
      setUploadProgress((prev) => [...prev, step]);
    };

    updateProgress(steps[0]);
    setDocentes(tempData.docentes);

    updateProgress(steps[1]);
    setDisciplinas(tempData.disciplinas);

    updateProgress(steps[2]);
    setAtribuicoes(tempData.atribuicoes);

    updateProgress(steps[3]);
    setFormularios(tempData.formularios);

    updateProgress(steps[4]);
    setTravas(tempData.travas);

    updateProgress(steps[5]);
    // Processa solução e insere no histórico
    if (tempData.jsonData["solucao"]) {
      processSolucao(
        tempData.jsonData["versao"],
        tempData.jsonData["solucao"],
        tempData.atribuicoes,
        tempData.disciplinas,
        tempData.docentes,
        tempData.travas,
        historicoSolucoes,
        setHistoricoSolucoes,
        setSolucaoAtual,
        tempData.formularios
      );
    }

    updateProgress(steps[6]);
  }, [
    tempData,
    setDocentes,
    setDisciplinas,
    setAtribuicoes,
    setFormularios,
    setTravas,
    historicoSolucoes,
    setHistoricoSolucoes,
    setSolucaoAtual,
  ]);

  // Função que executa o carregamento
  const handleFileUpload = useCallback(() => {
    if (selectedFile && tempData) {
      // Verificar se há dados atuais e oferecer backup
      const hasCurrentData =
        currentDocentes.length > 0 || currentDisciplinas.length > 0;
      if (hasCurrentData) {
        setShowBackupDialog(true);
        return;
      }

      performUpload();
    }
  }, [
    selectedFile,
    tempData,
    currentDocentes.length,
    currentDisciplinas.length,
  ]);

  // Função que executa o carregamento dos dados de teste
  const handleTestDataUpload = useCallback(() => {
    if (tempData) {
      // Verificar se há dados atuais e oferecer backup
      const hasCurrentData =
        currentDocentes.length > 0 || currentDisciplinas.length > 0;
      if (hasCurrentData) {
        setShowBackupDialog(true);
        return;
      }

      performUpload();
    }
  }, [tempData, currentDocentes.length, currentDisciplinas.length]);

  const performUpload = useCallback(() => {
    if (!tempData) {
      setShowBackupDialog(false);
      return;
    }

    setUploading(true);
    setUploadProgress([]);

    try {
      applyTempData();
      setSelectedFile(null);
      setFileAnalysis(null);
      setTempData(null);
      const fileName = selectedFile ? selectedFile.name : "dados de teste";
      addAlerta(
        `${fileName} carregado${
          fileName === "dados de teste" ? "s" : ""
        } com sucesso.`,
        "success"
      );
    } catch (error) {
      addAlerta("Erro ao processar os dados.\n" + error, "error");
    }

    setUploading(false);
    setUploadProgress([]);
    cleanSolucaoAtual();
    setShowBackupDialog(false);
  }, [selectedFile, tempData, applyTempData, addAlerta, cleanSolucaoAtual]);

  // Função para drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      handleFileSelect(files);
    },
    [handleFileSelect]
  );

  const hasCurrentData =
    currentDocentes.length > 0 || currentDisciplinas.length > 0;

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* Upload Area */}
        <Grid size={{ xs: 12, md: hasCurrentData ? 6 : 12 }}>
          <Paper
            elevation={3}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            sx={{
              p: 4,
              textAlign: "center",
              border: "2px dashed #ccc",
              borderRadius: 2,
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            <Typography variant="h5" gutterBottom>
              Upload de Arquivo
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Arraste e solte um arquivo JSON aqui ou clique para selecionar
            </Typography>

            <input
              accept=".json,application/json"
              style={{ display: "none" }}
              id="file-input"
              type="file"
              onChange={(event) => handleFileSelect(event.target.files)}
              multiple={false}
            />
            <label htmlFor="file-input">
              <Button
                variant={!selectedFile ? "contained" : "outlined"}
                color="primary"
                component="span"
                startIcon={<UploadFileIcon />}
                size="large"
                sx={{ mt: 2, mb: 2 }}
              >
                Escolher Arquivo
              </Button>
            </label>

            {selectedFile && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  icon={<InfoIcon />}
                  label={`${selectedFile.name} (${(
                    selectedFile.size / 1024
                  ).toFixed(1)} KB)`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            )}

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                ou
              </Typography>
            </Divider>

            {/* Botão para carregar dados de teste */}
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Use dados de teste para experimentar a plataforma
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={
                loadingTestData ? (
                  <CircularProgress size={20} />
                ) : (
                  <DatasetIcon />
                )
              }
              onClick={loadTestData}
              disabled={loadingTestData || uploading}
              size="large"
              sx={{ mt: 2, mb: 2 }}
            >
              {loadingTestData ? "Carregando..." : "Carregar Dados Padrões"}
            </Button>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={
                  uploading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <CloudUploadIcon />
                  )
                }
                onClick={selectedFile ? handleFileUpload : handleTestDataUpload}
                disabled={(!selectedFile && !tempData) || uploading}
                size="large"
              >
                {uploading ? "Carregando..." : "Carregar Dados"}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Current Data Summary */}
        {hasCurrentData && (
          <Grid size={{ xs: 12, md: 6 }}>
            <DataComparison
              currentData={{
                docentes: currentDocentes.length,
                disciplinas: currentDisciplinas.length,
                atribuicoes: currentAtribuicoes.filter(
                  (a) => a.docentes.length > 0
                ).length,
              }}
              onCreateBackup={createBackup}
            />
          </Grid>
        )}

        {/* File Preview */}
        {fileAnalysis && (
          <Grid size={{ xs: 12 }}>
            <FilePreview analysis={fileAnalysis} />
          </Grid>
        )}

        {/* Upload Progress */}
        {uploading && uploadProgress.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <UploadProgress steps={uploadProgress} />
          </Grid>
        )}
      </Grid>

      {/* Backup Dialog */}
      <Dialog
        open={showBackupDialog}
        onClose={() => setShowBackupDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon color="warning" />
          Dados Existentes Detectados
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Você já possui dados carregados. Carregar novos dados irá substituir
            todos os dados atuais.
          </Alert>
          <Typography variant="body1" gutterBottom>
            Recomendamos criar um backup dos dados atuais antes de continuar.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Dados atuais:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary={`${currentDocentes.length} docentes`} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText
                  primary={`${currentDisciplinas.length} disciplinas`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText
                  primary={`${
                    currentAtribuicoes.filter((a) => a.docentes.length > 0)
                      .length
                  } atribuições`}
                />
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowBackupDialog(false)}
            variant="contained"
            color="error"
          >
            Cancelar
          </Button>
          <Button
            onClick={createBackup}
            startIcon={<BackupIcon />}
            color="info"
            variant="outlined"
          >
            Criar Backup
          </Button>
          {!safeCOntinue && (
            <Button onClick={performUpload} variant="contained" color="warning">
              Continuar sem Backup
            </Button>
          )}
          {safeCOntinue && (
            <Button onClick={performUpload} variant="contained" color="info">
              Continuar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
