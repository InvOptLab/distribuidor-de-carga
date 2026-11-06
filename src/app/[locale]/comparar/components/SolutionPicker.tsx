"use client";

import { memo } from "react";
import {
  Autocomplete,
  Box,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { useTranslations } from "next-intl";
import { formatEvaluation } from "@/app/[locale]/history/model/format";
import { CurrentBadge } from "@/app/[locale]/history/components/cells";
import type { HistoryLabels } from "@/app/[locale]/history/components/useHistoryLabels";
import type { Side } from "../model/comparison";
import type { SolutionOption } from "../state/useSolutionOptions";
import type { CompareTokens } from "../theme/compareTokens";
import { SideBadge } from "./shared";

interface SolutionPickerProps {
  side: Side;
  options: SolutionOption[];
  value: string | null;
  /** Solução escolhida no outro lado: excluída da lista. */
  excludeId: string | null;
  onChange: (id: string | null) => void;
  labels: HistoryLabels;
  tokens: CompareTokens;
}

function OptionBody({
  option,
  labels,
}: {
  option: SolutionOption;
  labels: HistoryLabels;
}) {
  const t = useTranslations("Pages.Compare.picker");
  const tHistory = useTranslations("Pages.History");
  const algorithm = labels.algorithmLabel(option);
  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
        <Typography variant="body2" fontWeight={600} noWrap>
          {labels.dateLabel(option)}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          · {algorithm ?? labels.originLabel(option.origin)}
        </Typography>
        {option.isCurrent && <CurrentBadge />}
        {option.isBest && (
          <Chip
            size="small"
            icon={<StarIcon />}
            label={tHistory("best")}
            color="warning"
            variant="outlined"
            sx={{ height: 20 }}
          />
        )}
      </Stack>
      <Typography
        variant="caption"
        color="text.secondary"
        component="div"
        noWrap
      >
        {t("evaluation", {
          value: formatEvaluation(option.avaliacao, labels.locale),
        })}
        {" · "}
        {t("coverage", {
          done: option.turmasAtendidas,
          total: option.turmasAtivas,
        })}
        {" · "}
        {t("assignments", { count: option.pares })}
      </Typography>
    </Box>
  );
}

/** Seletor rico com busca, substitui o `Select` simples. */
function SolutionPicker({
  side,
  options,
  value,
  excludeId,
  onChange,
  labels,
  tokens,
}: SolutionPickerProps) {
  const t = useTranslations("Pages.Compare.picker");
  const available = options.filter((o) => o.id !== excludeId);
  const selected = options.find((o) => o.id === value) ?? null;
  const searchText = (o: SolutionOption) =>
    [
      o.id,
      labels.dateLabel(o),
      labels.fullDateLabel(o),
      labels.originLabel(o.origin),
      labels.algorithmLabel(o) ?? "",
    ]
      .join(" ")
      .toLocaleLowerCase();

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        borderLeft: 4,
        borderColor: tokens.side[side].main,
        pl: 1.5,
      }}
    >
      <Autocomplete
        options={available}
        value={selected}
        onChange={(_, option) => onChange(option?.id ?? null)}
        isOptionEqualToValue={(o, v) => o.id === v.id}
        getOptionLabel={(o) =>
          `${labels.dateLabel(o)} · ${labels.algorithmLabel(o) ?? labels.originLabel(o.origin)}`
        }
        filterOptions={(opts, state) => {
          const needle = state.inputValue.trim().toLocaleLowerCase();
          if (
            !needle ||
            (selected && state.inputValue === state.getOptionLabel(selected))
          )
            return opts;
          return opts.filter((o) => searchText(o).includes(needle));
        }}
        renderOption={(props, option) => {
          const { key, ...rest } = props as typeof props & { key: string };
          return (
            <li key={key} {...rest}>
              <OptionBody option={option} labels={labels} />
            </li>
          );
        }}
        noOptionsText={t("noOptions")}
        renderInput={(params) => (
          <TextField
            {...params}
            label={
              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                component="span"
              >
                <SideBadge side={side} tokens={tokens} size={16} />
                <span>{t("label", { side: side.toUpperCase() })}</span>
              </Stack>
            }
            placeholder={t("placeholder")}
            size="small"
          />
        )}
        slotProps={{ listbox: { sx: { maxHeight: 420 } } }}
      />
      {selected && (
        <Box sx={{ mt: 0.5, px: 0.5 }}>
          <OptionBody option={selected} labels={labels} />
        </Box>
      )}
    </Box>
  );
}

export default memo(SolutionPicker);
