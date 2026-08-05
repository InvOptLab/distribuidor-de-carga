"use client";

import { useGlobalContext } from "@/context/Global";
import {
  Container,
  Stack,
} from "@mui/material";
import SolutionHistoryCard from "./_components/SolutionHistoryCard";
import HoveredCourse from "../atribuicoes/_components/HoveredCourse";
import { useState } from "react";
import { TreeDisciplina } from "./_components/SolutionHistoryStatistics";
import { Formulario } from "@/algoritmo/communs/interfaces/interfaces";
import NoDataFound from "@/components/NoDataFound";

export default function History() {
  const { historicoSolucoes, docentes, disciplinas } = useGlobalContext();

  const hasData = docentes.length > 0 && disciplinas.length > 0;

  const [hoveredCourse, setHoveredCourse] = useState<TreeDisciplina | null>(null);

  const createHistoryComponents = () => {
    const historyComponents = [];

    historicoSolucoes.forEach((value, key) => {
      historyComponents.push(
        <SolutionHistoryCard
          key={`component_${key}`}
          id={key}
          solucao={value}
          setHoveredCourese={setHoveredCourse}
        />
      );
    });

    return historyComponents.reverse();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} key="container">
      {!hasData ? (
        <NoDataFound />
      ) : (
        <Stack spacing={2} key="stackContainer">
          {createHistoryComponents()}
        </Stack>
      )}

      {/* Modal de Detalhes da Disciplina */}
      {hoveredCourse && (
        <HoveredCourse
          open={!!hoveredCourse}
          onClose={() => setHoveredCourse(null)}
          disciplina={hoveredCourse}
          docentes={Array.from(new Set(hoveredCourse.formularios.values()))}
          formularios={Array.from(
            hoveredCourse.formularios.values().map((item) => {
              const formulario: Formulario = {
                id_disciplina: hoveredCourse.id,
                nome_docente: item.nome,
                prioridade: item.prioridade,
              };
              return formulario;
            }),
          )}
        />
      )}
    </Container>
  );
}
