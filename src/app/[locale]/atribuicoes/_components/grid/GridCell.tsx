import { memo, type CSSProperties } from "react";
import CheckIcon from "@mui/icons-material/Check";
import LockIcon from "@mui/icons-material/Lock";
import type { BaseCellState } from "../../theme/gridTokens";

interface GridCellProps {
  r: number;
  c: number;
  base: BaseCellState;
  locked: boolean;
  priority?: number;
  /** Cor e texto da rampa de preferência (só no estado `pref`). */
  bg?: string;
  fg?: string;
  /** Roving tabindex: só a célula ativa entra na ordem de tabulação. */
  active: boolean;
  label: string;
}

/**
 * Célula da grade. Só recebe primitivos para que o `memo` evite re-render quando nada mudou.
 * Estados por cor + forma (A2): ✓ para atribuído, 🔒 + hachura para travado, `·` sem formulário.
 * Eventos são tratados por delegação no container (`AssignmentGrid`).
 */
function GridCell({
  r,
  c,
  base,
  locked,
  priority,
  bg,
  fg,
  active,
  label,
}: GridCellProps) {
  return (
    <td
      className="c"
      role="gridcell"
      aria-colindex={c + 2}
      data-r={r}
      data-c={c}
      data-s={base}
      data-locked={locked || undefined}
      aria-selected={base === "assigned"}
      aria-label={label}
      tabIndex={active ? 0 : -1}
      style={bg ? ({ "--cell-bg": bg, "--cell-fg": fg } as CSSProperties) : undefined}
    >
      {priority ?? <span aria-hidden="true">·</span>}
      {base === "assigned" && <CheckIcon className="ck" aria-hidden="true" />}
      {locked && <LockIcon className="lk" aria-hidden="true" />}
    </td>
  );
}

export default memo(GridCell);
