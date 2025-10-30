//import LineChartsSelector from "@/components/SolutionHistoryStatistics/LineChartsSelector";
import {
  Disciplina,
  HistoricoSolucao,
  Docente,
  getActiveFormularios,
} from "@/context/Global/utils";
import { Grid2 } from "@mui/material";
import {
  getDisciplinasAtribuicoes,
  getDocentesAtribuicoes,
  processAtribuicoesToTree,
} from "../utils";
//import StatusPieChart from "@/components/SolutionHistoryStatistics/StatusPieChart";
import NewDataTreeView from "@/components/SolutionHistoryStatistics/NewDataTreeView/DataTreeView";

/**
 * Interfaces para a exibição dos Docentes e Disciplinas
 */
export interface TreeDocente extends Docente {
  atribuicoes: Map<string, TreeDisciplina & { prioridade: number | null }>; // Id disciplina, TreeDisciplina
  conflitos: Map<string, string>;
}

export interface TreeDisciplina extends Disciplina {
  formularios: Map<string, TreeDocente & { prioridade: number }>; // Nome docente, TreeDocente
  _cursos: string[]; // Será responsável por armazenar os nomes dos cursos sem os caracteres especiais
  atribuicoes: Map<string, TreeDocente & { prioridade: number | null }>; // Nome docente, TreeDocente
}

interface SolutionHistoryStatisticsProps {
  id: string;
  solucao: HistoricoSolucao;
  setHoveredCourese: React.Dispatch<
    React.SetStateAction<TreeDisciplina | null>
  >;
}

const SolutionHistoryStatistics: React.FC<SolutionHistoryStatisticsProps> = ({
  id,
  solucao,
  setHoveredCourese,
}) => {
  // Filtrando docentes ativos e obtendo suas atribuições
  const docentesAtribuicoes: Map<string, string[]> = getDocentesAtribuicoes(
    solucao.contexto.docentes.filter((docente) => docente.ativo),
    solucao.solucao.atribuicoes
  );

  /**
   * Disciplinas ainda não processadas
   */
  const disciplinasAtribuicoes: Map<string, string[]> =
    getDisciplinasAtribuicoes(
      solucao.contexto.disciplinas.filter((disciplina) => disciplina.ativo),
      solucao.solucao.atribuicoes
    );

  /**
   * Processa as informações
   */

  const atribuicoesProcessadas = processAtribuicoesToTree(
    disciplinasAtribuicoes,
    docentesAtribuicoes,
    solucao.contexto.docentes,
    solucao.contexto.disciplinas,
    getActiveFormularios(
      solucao.contexto.formularios,
      solucao.contexto.disciplinas,
      solucao.contexto.docentes
    )
  );

  return (
    <Grid2 container spacing={2} key={`grid2_container_${id}`}>
      {/* Componente DataTreeView com as informações dos docentes e atribuições */}

      <Grid2 size={{ xs: 12, md: 12 }}>
        <NewDataTreeView
          key="new_data_tree_view"
          disciplinas={atribuicoesProcessadas.treeDisciplinas}
          docentes={atribuicoesProcessadas.treeDocentes}
          solucao={solucao}
          setHoveredCourese={setHoveredCourese}
        />
      </Grid2>
      {/* Gráficos lado a lado dentro do Paper */}
      {/* <Grid2 container size={{ xs: 12 }} spacing={2}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ padding: 2 }}>
            <StatusPieChart
              key="docentes_ativos_inativos"
              title="Relação Docentes"
              activeCount={docentesAtribuicoes.size}
              inactiveCount={
                solucao.contexto.docentes.length - docentesAtribuicoes.size
              }
              lockedCount={qtdDocentesTravados}
            />
          </Paper>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ padding: 2 }}>
            <StatusPieChart
              key="disciplinas_ativos_inativos"
              title="Relação Disciplinas"
              activeCount={disciplinasAtribuicoes.size}
              inactiveCount={
                solucao.contexto.disciplinas.length -
                disciplinasAtribuicoes.size
              }
              lockedCount={qtdDisciplinasTravadas}
            />
          </Paper>
        </Grid2>
      </Grid2> */}

      {/* Renderizar o LineChartsSelector se as estatísticas estiverem disponíveis */}
      {/* {solucao.solucao.estatisticas !== undefined && (
        <Grid2 size={{ xs: 12 }}>
          <LineChartsSelector solucao={solucao} />
        </Grid2>
      )} */}
    </Grid2>
  );
};

export default SolutionHistoryStatistics;
