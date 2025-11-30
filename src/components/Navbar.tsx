"use client";

import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button, Container, IconButton, Menu, MenuItem } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface ISimplePage {
  name: string;
  link: string;
}

interface IGroupedPage {
  name: string;
  options: ISimplePage[];
}

type IPages = ISimplePage | IGroupedPage;

// Type guards para verificar o tipo de página
const isGroupedPage = (page: IPages): page is IGroupedPage => {
  return "options" in page;
};

const navItems: IPages[] = [
  { name: "Home", link: "/" },
  {
    name: "Dados",
    options: [
      { name: "Cadastrar", link: "/cadastro" },
      { name: "Carregar dados", link: "/inputfile" },
    ],
  },
  { name: "Seleção", link: "/select" },
  { name: "Configurações", link: "/config" },
  {
    name: "Atribuições",
    options: [
      { name: "Tabela", link: "/atribuicoes" },
      { name: "Atribuição em Blocos", link: "/atribuicaoBlocos" },
      { name: "Planilha", link: "/planilha" },
    ],
  },
  { name: "Histórico", link: "/history" },
  { name: "Estatísticas", link: "/statistics" },
  { name: "Comparar Soluções", link: "/comparar" },
  { name: "Calendário", link: "/horarios" },
];

// Componente para itens de submenu no desktop
interface DesktopSubmenuProps {
  item: IGroupedPage;
  pathname: string;
}

function DesktopSubmenu({ item, pathname }: DesktopSubmenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Verifica se alguma das opções está ativa
  const isActive = item.options.some((option) => pathname === option.link);

  return (
    <>
      <Button
        component="div"
        variant="text"
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
        sx={{
          position: "relative",
          padding: "10px 20px",
          fontWeight: "medium",
          color: isActive ? "#FFFFFF" : "#CFE3FC",
          textShadow: isActive
            ? "0px 0px 8px rgba(255, 255, 255, 0.8), 0px 0px 12px rgba(255, 255, 255, 0.6)"
            : "none",
          "&:hover": {
            color: "#D1E9FF",
            backgroundColor: "transparent",
          },
          cursor: "pointer",
        }}
        disableRipple
      >
        {isActive && (
          <motion.div
            layoutId="activeUnderline"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              backgroundColor: "#FFFFFF",
              borderRadius: "2px",
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        )}
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {item.name}
        </motion.div>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "primary.main",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        {item.options.map((option) => (
          <MenuItem
            key={option.name}
            onClick={handleClose}
            sx={{
              paddingX: 2,
              paddingY: 1,
              minWidth: 180,
            }}
          >
            <Link href={option.link} passHref legacyBehavior>
              <Button
                component="a"
                fullWidth
                disableRipple
                disabled={pathname === option.link}
                sx={{
                  justifyContent: "flex-start",
                  color: pathname === option.link ? "#FFFFFF" : "#CFE3FC",
                  textTransform: "none",
                  fontWeight: pathname === option.link ? "bold" : "medium",
                  textShadow:
                    pathname === option.link
                      ? "0px 0px 8px rgba(255, 255, 255, 0.8)"
                      : "none",
                  "&:hover": {
                    color: "#D1E9FF",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                  "&.Mui-disabled": {
                    color: "#FFFFFF",
                    textShadow: "0px 0px 8px rgba(255, 255, 255, 0.8)",
                  },
                }}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {option.name}
                </motion.div>
              </Button>
            </Link>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

// Componente para itens de submenu no mobile
interface MobileSubmenuProps {
  item: IGroupedPage;
  pathname: string;
  onClose: () => void;
}

function MobileSubmenu({ item, pathname, onClose }: MobileSubmenuProps) {
  const [expanded, setExpanded] = React.useState(false);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  // Verifica se alguma das opções está ativa
  const isActive = item.options.some((option) => pathname === option.link);

  return (
    <>
      <MenuItem
        onClick={handleToggle}
        sx={{
          paddingX: 2,
          paddingY: 1,
          backgroundColor: isActive
            ? "rgba(255, 255, 255, 0.1)"
            : "transparent",
        }}
      >
        <Button
          component="div"
          fullWidth
          disableRipple
          endIcon={
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ExpandMoreIcon />
            </motion.div>
          }
          sx={{
            justifyContent: "space-between",
            color: isActive ? "#FFFFFF" : "#CFE3FC",
            textTransform: "none",
            fontWeight: "medium",
            textShadow: isActive
              ? "0px 0px 8px rgba(255, 255, 255, 0.8)"
              : "none",
            "&:hover": {
              color: "#D1E9FF",
              backgroundColor: "transparent",
            },
          }}
        >
          {item.name}
        </Button>
      </MenuItem>
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {item.options.map((option) => (
            <MenuItem
              key={option.name}
              onClick={onClose}
              sx={{
                paddingX: 4, // Indentação para mostrar hierarquia
                paddingY: 0.5,
                backgroundColor:
                  pathname === option.link
                    ? "rgba(255, 255, 255, 0.1)"
                    : "transparent",
              }}
            >
              <Link href={option.link} passHref legacyBehavior>
                <Button
                  component="a"
                  fullWidth
                  disableRipple
                  disabled={pathname === option.link}
                  sx={{
                    justifyContent: "flex-start",
                    color: pathname === option.link ? "#FFFFFF" : "#CFE3FC",
                    textTransform: "none",
                    fontWeight: pathname === option.link ? "bold" : "normal",
                    fontSize: "0.9rem",
                    textShadow:
                      pathname === option.link
                        ? "0px 0px 8px rgba(255, 255, 255, 0.8)"
                        : "none",
                    "&:hover": {
                      color: "#D1E9FF",
                      backgroundColor: "transparent",
                    },
                    "&.Mui-disabled": {
                      color: "#FFFFFF",
                      textShadow: "0px 0px 8px rgba(255, 255, 255, 0.8)",
                    },
                  }}
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    • {option.name}
                  </motion.div>
                </Button>
              </Link>
            </MenuItem>
          ))}
        </motion.div>
      )}
    </>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar
      component="nav"
      position="sticky"
      sx={{
        backgroundColor: "primary.main",
        color: "primary.contrastText",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Menu hamburger para telas pequenas */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="menu"
              onClick={handleOpenNavMenu}
              sx={{ color: "#fff" }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              sx={{
                display: { xs: "block", md: "none" },
                "& .MuiPaper-root": {
                  backgroundColor: "primary.main", //"#1976D2",
                  color: "primary.contrastText",
                  maxHeight: "70vh",
                  overflowY: "auto",
                },
              }}
            >
              {navItems.map((item) => {
                if (isGroupedPage(item)) {
                  return (
                    <MobileSubmenu
                      key={item.name}
                      item={item}
                      pathname={pathname}
                      onClose={handleCloseNavMenu}
                    />
                  );
                } else {
                  return (
                    <MenuItem
                      key={item.name}
                      onClick={handleCloseNavMenu}
                      sx={{
                        paddingX: 2,
                      }}
                    >
                      <Link href={item.link} passHref legacyBehavior>
                        <Button
                          component="a"
                          fullWidth
                          disableRipple
                          disabled={pathname === item.link}
                          sx={{
                            justifyContent:
                              pathname === item.link ? "center" : "flex-start",
                            color:
                              pathname === item.link ? "#FFFFFF" : "#CFE3FC",
                            textTransform: "none",
                            fontWeight: "medium",
                            textShadow:
                              pathname === item.link
                                ? "0px 0px 8px rgba(255, 255, 255, 0.8), 0px 0px 12px rgba(255, 255, 255, 0.6)"
                                : "none",
                            "&:hover": {
                              color: "#D1E9FF",
                              backgroundColor: "transparent",
                            },
                            "&.Mui-disabled": {
                              color: "#FFFFFF",
                              textShadow:
                                "0px 0px 8px rgba(255, 255, 255, 0.8), 0px 0px 12px rgba(255, 255, 255, 0.6)",
                            },
                          }}
                        >
                          {pathname === item.link && (
                            <motion.div
                              layoutId="activeUnderlineMobile"
                              style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                backgroundColor: "#FFFFFF",
                                borderRadius: "2px",
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                            />
                          )}
                          <motion.div
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            {item.name}
                          </motion.div>
                        </Button>
                      </Link>
                    </MenuItem>
                  );
                }
              })}
            </Menu>
          </Box>

          {/* Itens da navbar para telas grandes */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
            }}
          >
            {navItems.map((item) => {
              if (isGroupedPage(item)) {
                return (
                  <DesktopSubmenu
                    key={item.name}
                    item={item}
                    pathname={pathname}
                  />
                );
              } else {
                return (
                  <Link
                    href={item.link}
                    key={item.name}
                    passHref
                    legacyBehavior
                  >
                    <Button
                      component="a"
                      variant="text"
                      sx={{
                        position: "relative",
                        padding: "10px 20px",
                        fontWeight: "medium",
                        color: pathname === item.link ? "#FFFFFF" : "#CFE3FC",
                        textShadow:
                          pathname === item.link
                            ? "0px 0px 8px rgba(255, 255, 255, 0.8), 0px 0px 12px rgba(255, 255, 255, 0.6)"
                            : "none",
                        "&:hover": {
                          color: "#D1E9FF",
                          backgroundColor: "transparent",
                        },
                        "&.Mui-disabled": {
                          color: "#FFFFFF",
                          textShadow:
                            "0px 0px 8px rgba(255, 255, 255, 0.8), 0px 0px 12px rgba(255, 255, 255, 0.6)",
                        },
                      }}
                      disableRipple
                      disabled={pathname === item.link}
                    >
                      {pathname === item.link && (
                        <motion.div
                          layoutId="activeUnderline"
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            backgroundColor: "#FFFFFF",
                            borderRadius: "2px",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                      <motion.div
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {item.name}
                      </motion.div>
                    </Button>
                  </Link>
                );
              }
            })}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
