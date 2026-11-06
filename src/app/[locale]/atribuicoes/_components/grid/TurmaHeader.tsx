import { memo } from "react";
import LockIcon from "@mui/icons-material/Lock";
import { useTranslations } from "next-intl";
import type { Disciplina } from "@/algoritmo/communs/interfaces/interfaces";
import { formatCursos } from "../../model/text";
import type { Density } from "../../state/useDensity";

interface TurmaHeaderProps {
  disciplina: Disciplina;
  c: number;
  locked: boolean;
  assignedCount: number;
  density: Density;
  active: boolean;
}

/**
 * Cabeçalho compacto da turma: código, nome em 2 linhas, dias como mini-chips e
 * contagem de docentes atribuídos. Cursos como texto, sem innerHTML. O detalhe completo
 * vai para o painel lateral.
 */
function TurmaHeader({
  disciplina,
  c,
  locked,
  assignedCount,
  density,
  active,
}: TurmaHeaderProps) {
  const t = useTranslations("Pages.Assignment.Grid");
  const horarios = (disciplina.horarios ?? []).filter(Boolean);
  const cursos =
    density === "comfortable" ? formatCursos(disciplina.cursos) : "";
  const countLabel = t("assignedCount", { count: assignedCount });
  const fullName = `${disciplina.codigo} ${disciplina.nome}`;

  return (
    <th
      className="col"
      role="columnheader"
      scope="col"
      aria-colindex={c + 2}
      data-c={c}
      data-locked={locked || undefined}
      tabIndex={active ? 0 : -1}
      aria-label={[fullName, countLabel, locked ? t("columnLocked") : ""]
        .filter(Boolean)
        .join(", ")}
    >
      <div className="hdr">
        <div className="hdr-top">
          <span className="hdr-code">{disciplina.codigo}</span>
          {locked && <LockIcon className="ico" aria-hidden="true" />}
          <span
            className={`hdr-badge${assignedCount === 0 ? " empty" : ""}`}
            title={countLabel}
            aria-hidden="true"
          >
            {assignedCount}
          </span>
        </div>
        <div className="hdr-name" title={fullName}>
          {disciplina.nome}
        </div>
        {cursos && (
          <div className="hdr-cursos" title={cursos}>
            {cursos}
          </div>
        )}
        <div className="hdr-days" aria-hidden="true">
          {horarios.length > 0 ? (
            horarios.map((horario, index) => (
              <span
                key={`${disciplina.id}-${index}`}
                className="day"
                title={`${horario.dia} ${horario.inicio}–${horario.fim}`}
              >
                {horario.dia.replace(".", "")} {horario.inicio}
              </span>
            ))
          ) : (
            <span className="day tbd">{t("toBeDefined")}</span>
          )}
        </div>
      </div>
    </th>
  );
}

export default memo(TurmaHeader);
