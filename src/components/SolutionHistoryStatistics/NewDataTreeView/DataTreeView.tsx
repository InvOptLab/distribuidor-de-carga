import {
  TreeDisciplina,
  TreeDocente,
} from "@/app/history/_components/SolutionHistoryStatistics";
import { Divider, Grid2, Paper, Typography } from "@mui/material";
import DocenteTreeView from "./DocentesTreeView";
import DisciplinasTreeView from "./DisciplinasTreeView";
import { useState } from "react";
import { FormulariosView } from "./FormulariosView";
import { HistoricoSolucao } from "@/context/Global/utils";
import { ArtribuicoesView } from "./ArtribuicoesView";

export interface DataTreeViewProps {
  docentes: Map<string, TreeDocente>;
  disciplinas: Map<string, TreeDisciplina>;
  solucao: HistoricoSolucao;
  setHoveredCourese: React.Dispatch<
    React.SetStateAction<TreeDisciplina | null>
  >;
}

export default function NewDataTreeView({
  docentes,
  disciplinas,
  solucao,
  setHoveredCourese,
}: DataTreeViewProps) {
  const [lastClickedItem, setLastClickedItem] = useState<{
    tipo: "docente" | "disciplina" | null;
    id: string;
  } | null>(null);

  /**
   * Exemplo:
   *  - Docente: ['item', 'docente', 'José Bieco']
   *  - Disciplina dentro do Docente: ['child', 'docente', 'José Bieco', 'disciplina', 'SME0284,1']
   *
   *  - Disciplina: ['item', 'disciplina', 'SME0284,1']
   * - Docente dentro da Disciplina: ['child', 'disciplina', 'SME0284,1', 'docente', 'José Bieco']
   */
  const handleLastClickedItem = (itemId: string) => {
    if (itemId !== "0") {
      const tokens = itemId.split("_");
      if (tokens[0] === "item") {
        setLastClickedItem({
          tipo: tokens[1] as "docente" | "disciplina",
          id: tokens[2],
        });
      } else {
        setLastClickedItem({
          tipo: tokens[3] as "docente" | "disciplina",
          id: tokens[4],
        });
      }
    } else {
      setLastClickedItem({ tipo: null, id: null });
    }
  };

  const selecionaEntidade = (
    tipo: "docente" | "disciplina" | null,
    id: string
  ) => {
    return tipo === "docente" ? docentes.get(id) : disciplinas.get(id);
  };

  const textoView = (
    tipo: "docente" | "disciplina" | null,
    view: "formularios" | "atribuicoes"
  ) => {
    if (view === "formularios") {
      if (tipo === "docente") {
        return "Escolhidas pelo docente";
      } else if (tipo === "disciplina") {
        return "Escolhida pelos docentes";
      } else {
        return "Formulários";
      }
    } else {
      if (tipo === "docente") {
        return "Atribuídas ao docente";
      } else if (tipo === "disciplina") {
        return "Atribuída aos docentes";
      } else {
        return "Atribuições";
      }
    }
  };

  return (
    <Grid2 container size={{ xs: 12 }} spacing={2} key="grid_dataTreeView_1">
      <Grid2 size={{ xs: 12, md: 6 }} key="grid_dataTreeView_2">
        <Paper elevation={2} sx={{ padding: 2 }}>
          <DocenteTreeView
            docentes={docentes}
            handleClickedItem={handleLastClickedItem}
          />
        </Paper>
      </Grid2>
      <Grid2 size={{ xs: 12, md: 6 }} key="grid_dataTreeView_3">
        <Paper elevation={2} sx={{ padding: 2 }}>
          <DisciplinasTreeView
            disciplinas={disciplinas}
            handleClickedItem={handleLastClickedItem}
          />
        </Paper>
      </Grid2>
      <Grid2 size={{ xs: 12, md: 6 }} spacing={1} key="grid_dataTreeView_4">
        <Paper elevation={2} sx={{ padding: 2 }}>
          <Typography variant="h6" textAlign="center" alignContent="flex-start">
            {textoView(lastClickedItem?.tipo, "formularios")}
          </Typography>
          <Divider />
          <FormulariosView
            tipo={lastClickedItem?.tipo}
            id={lastClickedItem?.id}
            entidade={selecionaEntidade(
              lastClickedItem?.tipo,
              lastClickedItem?.id
            )}
            solucao={solucao}
            disciplinas={disciplinas}
            docentes={docentes}
            setHoveredCourese={setHoveredCourese}
          />
        </Paper>
      </Grid2>
      <Grid2 size={{ xs: 12, md: 6 }} spacing={1} key="grid_dataTreeView_5">
        <Paper elevation={2} sx={{ padding: 2 }}>
          <Typography variant="h6" textAlign="center">
            {textoView(lastClickedItem?.tipo, "atribuicoes")}
          </Typography>
          <Divider />
          <ArtribuicoesView
            tipo={lastClickedItem?.tipo}
            id={lastClickedItem?.id}
            entidade={selecionaEntidade(
              lastClickedItem?.tipo,
              lastClickedItem?.id
            )}
            solucao={solucao}
            disciplinas={disciplinas}
            setHoveredCourese={setHoveredCourese}
          />
        </Paper>
      </Grid2>
    </Grid2>
  );
}
