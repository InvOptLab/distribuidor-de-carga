"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Link,
  Avatar,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import {
  Email,
  School,
  Business,
  AccountBalance,
  WorkOutline,
  Language,
  LinkedIn,
  Article,
} from "@mui/icons-material";

export interface IAuthProfileProps {
  name: string;
  email: string;
  lattes: string;
  institution: string; // ex: "USP"
  institute: string; // ex: "ICMC"
  department?: string; // ex: "SME" (opcional)
  role: string; // ex: "Aluno de mestrado", "Orientador", "Coorientador"
  researchArea?: string; // ex: "Otimização Combinatória" (opcional)
  linkedin?: string; // Link do LinkedIn (opcional)
  orcid?: string; // ID do ORCID (opcional)
  googleScholar?: string; // Link do Google Scholar (opcional)
  avatarUrl?: string; // URL da foto (opcional)
}

/**
 * Componente para exibir o perfil detalhado de um autor
 * Exibe informações acadêmicas, institucionais e links para perfis profissionais
 */
export default function AuthProfile({
  name,
  email,
  lattes,
  institution,
  institute,
  department,
  role,
  researchArea,
  linkedin,
  orcid,
  googleScholar,
  avatarUrl,
}: IAuthProfileProps) {
  // Gera iniciais do nome para o avatar
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Define a cor do chip baseado no papel
  const getRoleColor = (
    role: string
  ): "primary" | "secondary" | "success" | "info" => {
    if (role.toLowerCase().includes("orientador")) return "primary";
    if (role.toLowerCase().includes("coorientador")) return "secondary";
    if (
      role.toLowerCase().includes("aluno") ||
      role.toLowerCase().includes("mestrando")
    )
      return "info";
    return "success";
  };

  return (
    <Card
      sx={{
        width: 340,
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          {/* Avatar e Nome */}
          <Avatar
            src={avatarUrl}
            sx={{
              width: 100,
              height: 100,
              bgcolor: "primary.main",
              fontSize: "2rem",
              fontWeight: "bold",
              boxShadow: 2,
            }}
          >
            {!avatarUrl && initials}
          </Avatar>

          <Box textAlign="center">
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {name}
            </Typography>
            <Chip
              label={role}
              color={getRoleColor(role)}
              size="small"
              sx={{ fontWeight: 500 }}
            />
          </Box>

          <Divider sx={{ width: "100%", my: 1 }} />

          {/* Informações Institucionais */}
          <Stack spacing={1.5} width="100%">
            <Box display="flex" alignItems="center" gap={1.5}>
              <AccountBalance fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">
                <strong>{institution}</strong>
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1.5}>
              <Business fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">
                {institute}
                {department && ` - ${department}`}
              </Typography>
            </Box>

            {researchArea && (
              <Box display="flex" alignItems="center" gap={1.5}>
                <WorkOutline fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  {researchArea}
                </Typography>
              </Box>
            )}
          </Stack>

          <Divider sx={{ width: "100%", my: 1 }} />

          {/* Links e Contatos */}
          <Stack spacing={1.5} width="100%">
            <Box display="flex" alignItems="center" gap={1.5}>
              <Email fontSize="small" color="action" />
              <Link
                href={`mailto:${email}`}
                underline="hover"
                color="text.secondary"
                sx={{ fontSize: "0.875rem", wordBreak: "break-all" }}
              >
                {email}
              </Link>
            </Box>

            <Box display="flex" alignItems="center" gap={1.5}>
              <School fontSize="small" color="action" />
              <Link
                href={lattes}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                color="text.secondary"
                sx={{ fontSize: "0.875rem" }}
              >
                Currículo Lattes
              </Link>
            </Box>

            {orcid && (
              <Box display="flex" alignItems="center" gap={1.5}>
                <Article fontSize="small" color="action" />
                <Link
                  href={`https://orcid.org/${orcid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  color="text.secondary"
                  sx={{ fontSize: "0.875rem" }}
                >
                  ORCID: {orcid}
                </Link>
              </Box>
            )}

            {googleScholar && (
              <Box display="flex" alignItems="center" gap={1.5}>
                <Language fontSize="small" color="action" />
                <Link
                  href={googleScholar}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  color="text.secondary"
                  sx={{ fontSize: "0.875rem" }}
                >
                  Google Scholar
                </Link>
              </Box>
            )}

            {linkedin && (
              <Box display="flex" alignItems="center" gap={1.5}>
                <LinkedIn fontSize="small" color="action" />
                <Link
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  color="text.secondary"
                  sx={{ fontSize: "0.875rem" }}
                >
                  LinkedIn
                </Link>
              </Box>
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
