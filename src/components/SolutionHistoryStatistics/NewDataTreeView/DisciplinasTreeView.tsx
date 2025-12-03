import * as React from "react";
import clsx from "clsx";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { SvgIconProps } from "@mui/material/SvgIcon";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import {
  TreeItemContent,
  TreeItemIconContainer,
  TreeItemRoot,
  TreeItemGroupTransition,
} from "@mui/x-tree-view/TreeItem";
import {
  useTreeItem,
  UseTreeItemParameters,
} from "@mui/x-tree-view/useTreeItem";
import { TreeItemProvider } from "@mui/x-tree-view/TreeItemProvider";
import { TreeItemIcon } from "@mui/x-tree-view/TreeItemIcon";
import { TreeDisciplina } from "@/app/history/_components/SolutionHistoryStatistics";
import { styled, useTheme } from "@mui/material";

declare module "react" {
  interface CSSProperties {
    "--tree-view-color"?: string;
    "--tree-view-bg-color"?: string;
  }
}

interface StyledTreeItemProps
  extends Omit<UseTreeItemParameters, "rootRef">,
    React.HTMLAttributes<HTMLLIElement> {
  bgColor?: string;
  bgColorForDarkMode?: string;
  color?: string;
  colorForDarkMode?: string;
  labelIcon: React.ElementType<SvgIconProps>;
  labelInfo?: string;
}

const CustomTreeItemRoot = styled(TreeItemRoot)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const CustomTreeItemContent = styled(TreeItemContent)(({ theme }) => ({
  marginBottom: theme.spacing(0.3),
  color: theme.palette.text.secondary,
  borderRadius: theme.spacing(2),
  paddingRight: theme.spacing(1),
  fontWeight: theme.typography.fontWeightMedium,
  "&.expanded": {
    fontWeight: theme.typography.fontWeightRegular,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&.focused, &.selected, &.selected.focused": {
    backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
    color: "var(--tree-view-color)",
  },
}));

const CustomTreeItemIconContainer = styled(TreeItemIconContainer)(
  ({ theme }) => ({
    marginRight: theme.spacing(1),
  })
);

const CustomTreeItemGroupTransition = styled(TreeItemGroupTransition)(
  ({ theme }) => ({
    marginLeft: 0,
    [`& .content`]: {
      paddingLeft: theme.spacing(2),
    },
  })
);

const CustomTreeItem = React.forwardRef(function CustomTreeItem(
  props: StyledTreeItemProps,
  ref: React.Ref<HTMLLIElement>
) {
  const theme = useTheme();
  const {
    id,
    itemId,
    label,
    disabled,
    children,
    bgColor,
    color,
    labelIcon: LabelIcon,
    labelInfo,
    colorForDarkMode,
    bgColorForDarkMode,
    ...other
  } = props;

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getLabelProps,
    getGroupTransitionProps,
    status,
  } = useTreeItem({ id, itemId, children, label, disabled, rootRef: ref });

  const style = {
    "--tree-view-color":
      theme.palette.mode !== "dark" ? color : colorForDarkMode,
    "--tree-view-bg-color":
      theme.palette.mode !== "dark" ? bgColor : bgColorForDarkMode,
  };

  return (
    <TreeItemProvider id={itemId} itemId={itemId}>
      <CustomTreeItemRoot {...getRootProps({ ...other, style })}>
        <CustomTreeItemContent
          {...getContentProps({
            className: clsx("content", {
              expanded: status.expanded,
              selected: status.selected,
              focused: status.focused,
            }),
          })}
        >
          <CustomTreeItemIconContainer {...getIconContainerProps()}>
            <TreeItemIcon status={status} />
          </CustomTreeItemIconContainer>
          <Box
            sx={{
              display: "flex",
              flexGrow: 1,
              alignItems: "center",
              p: 0.5,
              pr: 0,
            }}
          >
            <Box component={LabelIcon} color="inherit" sx={{ mr: 1 }} />
            <Typography
              component="div"
              {...getLabelProps({
                variant: "body2",
                sx: { display: "flex", fontWeight: "inherit", flexGrow: 1 },
              })}
            />
            <Typography variant="body1" color="inherit" fontFamily="monospace">
              {labelInfo}
            </Typography>
          </Box>
        </CustomTreeItemContent>
        {children && (
          <CustomTreeItemGroupTransition {...getGroupTransitionProps()} />
        )}
      </CustomTreeItemRoot>
    </TreeItemProvider>
  );
});

function EndIcon() {
  return <div style={{ width: 24 }} />;
}

export interface DisciplinasTreeViewProps {
  disciplinas: Map<string, TreeDisciplina>;
  handleClickedItem: (itemId: string) => void;
}

export default function DisciplinasTreeView({
  disciplinas,
  handleClickedItem,
}: DisciplinasTreeViewProps) {
  const renderItens = (itens: Map<string, TreeDisciplina>) => {
    const itensToRender = [];

    /**
     * Passa por todos as disciplinas
     */
    for (const _disciplina of itens.keys()) {
      const childrenToRender = [];
      const disciplina = itens.get(_disciplina);
      /**
       * Passa por todos os docentes atribuídos as disciplinas
       */
      let temConflito: boolean = false;

      for (const _docente of disciplina.atribuicoes.keys()) {
        const docente = disciplina.atribuicoes.get(_docente);
        temConflito =
          docente && docente.conflitos && docente.conflitos.size > 0;

        childrenToRender.push(
          <CustomTreeItem
            key={`child_disciplina_${disciplina.id}_docente_${docente.nome}`}
            itemId={`child_disciplina_${disciplina.id}_docente_${docente.nome}`}
            //label={`${disciplina._cursos} - ${disciplina.nome}`}
            label={
              // <Box sx={{ display: "flex", alignItems: "center" }}>
              //   <Typography
              //     component="div"
              //     sx={{
              //       width: "100%", // Para ocupar todo o espaço horizontal disponível
              //       flexGrow: 1, // Faz o nome do docente crescer e empurrar o contador para a direita
              //     }}
              //     title={docente.nome} // Tooltip para mostrar o nome completo ao passar o mouse
              //     color={docente.conflitos.size > 0 ? '#e53935' : 'inherit'}
              //   >
              //     <div style={{ display: "flex" }}>
              //       <div style={{ fontFamily: "monospace" }}>
              //         (
              //         {(docente.saldo < 0 ? "" : "+") +
              //           docente.saldo.toFixed(1).toString().replace(".", ",")}
              //         )&emsp;
              //       </div>
              //       {docente.nome}
              //     </div>
              //   </Typography>
              // </Box>
              <Box
                key={`box_hover_${docente.nome}`}
                display="flex"
                alignItems="center"
              >
                <Typography
                  key={`typography_hover_saldo_${docente.nome}`}
                  component="div"
                  sx={{
                    fontFamily: "monospace",
                    whiteSpace: "nowrap",
                  }}
                  color={docente?.saldo < 0 ? "error" : "success"}
                >
                  (
                  {(docente?.saldo < 0 ? "" : "+") +
                    docente?.saldo.toFixed(1).replace(".", ",")}
                  )&emsp;
                </Typography>
                <Typography
                  key={`typography_hover_${docente.nome}`}
                  component="div"
                  color={docente.conflitos.size > 0 ? "#e53935" : "inherit"}
                >
                  {docente.nome}
                </Typography>
              </Box>
            }
            labelIcon={null}
            labelInfo={`(${docente.atribuicoes.size})`}
          />
        );
      }

      itensToRender.push(
        <CustomTreeItem
          key={`item_disciplina_${disciplina.id}`}
          itemId={`item_disciplina_${disciplina.id}`}
          label={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                sx={{
                  width: "100%", // Para ocupar todo o espaço horizontal disponível
                  flexGrow: 1, // Faz o nome da disciplina crescer e empurrar o contador para a direita
                }}
                title={`${disciplina.id} - ${disciplina.nome}`} // Tooltip para mostrar o nome completo ao passar o mouse
                color={temConflito ? "#e53935" : "inherit"}
              >
                {`${disciplina._cursos} - ${disciplina.nome}`}
              </Typography>
            </Box>
          }
          labelIcon={null}
          labelInfo={`(${disciplina.atribuicoes.size})`}
        >
          {childrenToRender}
        </CustomTreeItem>
      );
    }

    return itensToRender;
  };

  return (
    <SimpleTreeView
      key="disciplinas_tree_view"
      aria-label="x-tree-view-disciplina"
      slots={{
        expandIcon: ArrowRightIcon,
        collapseIcon: ArrowDropDownIcon,
        endIcon: EndIcon,
      }}
      sx={{ flexGrow: 1, height: "20em", overflowY: "auto" }}
      expansionTrigger="iconContainer"
      defaultExpandedItems={["0"]}
      onItemClick={(event, itemId) => handleClickedItem(itemId)}
    >
      <CustomTreeItem
        key="disciplinas"
        itemId="0"
        label="Disciplinas"
        labelIcon={null}
        bgColor="#e8f0fe"
      >
        {renderItens(disciplinas)}
      </CustomTreeItem>
    </SimpleTreeView>
  );
}
