import {
  Grid2,
  IconButton,
  Link,
  Paper,
  Stack,
  Tooltip,
  Typography,
  Divider,
  Box,
  styled,
} from "@mui/material";

import EmailIcon from "@mui/icons-material/Email";
import DescriptionIcon from "@mui/icons-material/Description";

import { motion } from "framer-motion";

export interface IAuthProfileProps {
  name: string;
  email: string;
  lattes: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  transition: theme.transitions.create(["transform"], {
    duration: theme.transitions.duration.standard,
  }),
  "&:hover": {
    transform: "scale3d(1.1, 1.1, 1)",
    transition: theme.transitions.duration.standard,
  },
}));

export default function AuthProfile(props: IAuthProfileProps) {
  return (
    <motion.div
      // initial={{ opacity: 0, scale: 0.5 }}
      // animate={{ opacity: 1, scale: 1 }}
      // transition={{
      //     duration: 0.3,
      //     ease: [0, 0.71, 0.2, 1.01],
      //     scale: {
      //     type: "spring",
      //     damping: 5,
      //     stiffness: 100,
      //     restDelta: 0.001
      //     }
      // }}

      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.8,
        delay: 0.2,
        ease: [0, 0.71, 0.2, 1.01],
      }}
    >
      <StyledPaper elevation={2}>
        <Grid2
          size="grow"
          alignContent="center"
          textAlign="center"
          justifyContent="center"
          padding="5px"
          minWidth="15rem"
        >
          {/* Logo / Imagem */}
          <Box
            component="img"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Webysther_20170627_-_Logo_ICMC-USP.svg/1920px-Webysther_20170627_-_Logo_ICMC-USP.svg.png"
            sx={{ height: "100px", width: "200px" }}
          />
          <Divider />
          {/* Informações básicas */}
          <Typography
            variant="h6"
            color="textSecondary"
            textAlign="center"
            aria-label="Nome de um dos autores."
          >
            {props.name}
          </Typography>
          <Link
            href={`mailto:${props.email}`}
            underline="none"
            textAlign="center"
            alignContent="center"
          >
            {props.email}
          </Link>
          <Divider />
          {/* Botões na parte inferior do profile */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: "center", alignItems: "center" }}
          >
            <Tooltip title="Email">
              <IconButton aria-label="Email" href={`mailto:${props.email}`}>
                <EmailIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Currículo Lattes">
              <IconButton
                aria-label="Lattes"
                href={props.lattes}
                target="_blank"
              >
                <DescriptionIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Grid2>
      </StyledPaper>
    </motion.div>
  );
}
