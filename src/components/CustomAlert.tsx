// "use client";

// import * as React from "react";
// import Box from "@mui/material/Box";
// import Alert from "@mui/material/Alert";
// import IconButton from "@mui/material/IconButton";
// import { Grow, Snackbar } from "@mui/material";
// import CloseIcon from '@mui/icons-material/Close';

// export interface IAlertProps {
//   id: number;
//   type: "success" | "info" | "warning" | "error";
//   message: string;
//   handleClose?: () => void;
//   closeTime: number;
// }

// export default function CustomAlert(props: IAlertProps) {
//   const [open, setOpen] = React.useState(true);

//   console.log('alerta: ', props.id)
//   /**
//    * Função que executa a função passada pelo componente 'pai' com o principal intúito de fechar o alerta.
//    */
//   const handleExited = () => {
//     // Executa quando a animação de colapso termina
//     if (props.handleClose) {
//       setOpen(false) // Fecha alerta
//       props.handleClose(); // Chama a função no elemento pai que remove o alerta da fila // Adiciona um delay para remover o arleta da fila do estado visando deixa-lo executar a animação de "fechar"
//     }
//   };

//     /**
//    * Função para definir a transição do alerta.
//    */
//   const GrowTransition = (props: any) => {
//     return <Grow {...props} />;
//   };

//   return (
//     <Box sx={{ width: "100%" }}>
//       <Snackbar
//         open={open}
//         onClose={handleExited}
//         autoHideDuration={props.closeTime * 1000}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//         TransitionComponent={GrowTransition}
//       >
//         <Alert
//           key={props.id}
//           severity={props.type}
//           variant="filled"
//           action={
//             <IconButton
//               aria-label="close"
//               color="inherit"
//               size="small"
//               onClick={handleExited}
//             >
//               <CloseIcon fontSize="inherit" />
//             </IconButton>
//           }
//         >
//           {props.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CloseIcon from "@mui/icons-material/Close";

export interface IAlertProps {
  id: number;
  type: "success" | "info" | "warning" | "error";
  message: string;
  handleClose?: () => void;
  closeTime: number;
}

export default function CustomAlert(props: IAlertProps) {
  const [open, setOpen] = React.useState(true);

  /**
   * Função que executa a função passada pelo componente 'pai' com o principal intúito de fechar o alerta.
   */
  const handleExited = () => {
    // Executa quando a animação de colapso termina
    if (props.handleClose) {
      setOpen(false); // Fecha alerta
      props.handleClose();
      // setTimeout(() => {
      //   props.handleClose(); // Chama a função no elemento pai que remove o alerta da fila
      // }, 1000); // Adiciona um delay para remover o arleta da fila do estado visando deixa-lo executar a animação de "fechar"
    }
  };

  /**
   * ``useEffect`` utilizado para adicionar o comportamento de fechar o alerta em X segundos.
   */
  React.useEffect(() => {
    setTimeout(() => {
      handleExited();
    }, props.closeTime * 1000);
  });

  return (
    <Box sx={{ width: "30em" }}>
      <Collapse in={open} onExited={handleExited}>
        <Alert
          key={props.id}
          severity={props.type}
          variant="filled"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setOpen(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {props.message}
        </Alert>
      </Collapse>
    </Box>
  );
}
