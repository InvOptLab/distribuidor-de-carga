"use client";

import AuthProfile, { IAuthProfileProps } from "@/components/AuthProfile";
import { Container, Grid2, Typography } from "@mui/material";

export default function Home() {
  const autores: IAuthProfileProps[] = [
    {
      name: "José Eduardo Saroba Bieco",
      email: "jose.bieco@usp.br",
      lattes: "http://lattes.cnpq.br/1790961525430099",
    },
    {
      name: "Elias Salomão Helou Neto",
      email: "elias@icmc.usp.br",
      lattes: "http://lattes.cnpq.br/5434724108176150",
    },
  ];

  return (
    <Container maxWidth="sm">
      {/* <h1>Autores</h1>
      <ul>
        <li>
          {" "}
          José Eduardo Saroba Bieco{" "}
          <a href="mailto:jose.bieco@usp.br">jose.bieco@usp.br</a>
        </li>
        <li>
          {" "}
          Elias Salomão Helou Neto{" "}
          <a href="mailto:elias@icmc.usp.br">elias@icmc.usp.br</a>
        </li>
      </ul> */}

      <Grid2 container spacing={2} alignItems="center" justifyContent="center">
        <Typography
          variant="h4"
          component="h1"
          align="center"
          fontWeight="bold"
        >
          Autores
        </Typography>
        <Grid2
          container
          spacing={4}
          alignItems="center"
          justifyContent="center"
        >
          {autores.map((autor) => (
            <AuthProfile
              key={autor.email}
              name={autor.name}
              email={autor.email}
              lattes={autor.lattes}
            />
          ))}
        </Grid2>
      </Grid2>
    </Container>
  );
}
