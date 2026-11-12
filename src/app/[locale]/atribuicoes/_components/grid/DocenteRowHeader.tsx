import { memo } from "react";
import LockIcon from "@mui/icons-material/Lock";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslations } from "next-intl";

interface DocenteRowHeaderProps {
  nome: string;
  r: number;
  locked: boolean;
  conflict: boolean;
  carga: number;
  saldo?: number;
  active: boolean;
}

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

/**
 * Nome do docente (coluna fixa): ellipsis + tooltip, carga atribuída, ⚠ em conflito
 * (não só cor) e 🔒 com a linha travada.
 */
function DocenteRowHeader({
  nome,
  r,
  locked,
  conflict,
  carga,
  saldo,
  active,
}: DocenteRowHeaderProps) {
  const t = useTranslations("Pages.Assignment.Grid");
  const details = [
    t("workload", { carga: formatNumber(carga) }),
    saldo !== undefined && saldo !== null
      ? t("balance", { saldo: formatNumber(saldo) })
      : "",
    conflict ? t("conflict") : "",
    locked ? t("rowLocked") : "",
  ].filter(Boolean);

  return (
    <th
      className="row"
      role="rowheader"
      scope="row"
      aria-colindex={1}
      data-r={r}
      data-locked={locked || undefined}
      data-conflict={conflict || undefined}
      tabIndex={active ? 0 : -1}
      title={[nome, ...details].join("\n")}
      aria-label={[nome, ...details].join(", ")}
    >
      <div className="nm">
        {conflict && (
          <WarningAmberIcon className="ico warn" aria-hidden="true" />
        )}
        {locked && <LockIcon className="ico" aria-hidden="true" />}
        <span className="nm-txt">{nome}</span>
        <span className="nm-carga" aria-hidden="true">
          {formatNumber(carga)}
        </span>
      </div>
    </th>
  );
}

export default memo(DocenteRowHeader);
