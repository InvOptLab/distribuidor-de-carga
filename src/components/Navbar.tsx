"use client";

import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  alpha,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslations } from "next-intl";

// Tipos
interface ISimplePage {
  name: string;
  link: string;
}

interface IGroupedPage {
  name: string;
  options: ISimplePage[];
}

type IPages = ISimplePage | IGroupedPage;

const isGroupedPage = (page: IPages): page is IGroupedPage => {
  return "options" in page;
};

// Submenu Desktop
interface DesktopSubmenuProps {
  item: IGroupedPage;
  pathname: string;
}

function DesktopSubmenu({ item, pathname }: DesktopSubmenuProps) {
  const t = useTranslations("NavBar");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isActive = item.options.some((option) => pathname === option.link);

  return (
    <>
      <Button
        variant="text"
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
        aria-controls={open ? "submenu-desktop" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        sx={{
          position: "relative",
          padding: "10px 20px",
          fontWeight: "medium",
          color: isActive ? "#FFFFFF" : "#CFE3FC",
          textShadow: isActive
            ? "0px 0px 8px rgba(255, 255, 255, 0.8)"
            : "none",
          "&:hover": {
            color: "#D1E9FF",
            backgroundColor: alpha("#FFFFFF", 0.1),
          },
          // Foco customizado para evitar borda dupla
          "&:focus-visible": {
            outline: "2px solid #FFFFFF",
            outlineOffset: "-2px",
            backgroundColor: alpha("#FFFFFF", 0.1),
          },
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
          />
        )}
        <motion.span
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          style={{ display: "inline-block" }}
        >
          {t(item.name)}
        </motion.span>
      </Button>

      <Menu
        id="submenu-desktop"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{ list: { "aria-labelledby": "basic-button" } }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "primary.main",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            mt: 1,
          },
        }}
      >
        {item.options.map((option) => {
          const isOptionActive = pathname === option.link;
          return (
            <MenuItem
              key={t(option.name)}
              onClick={handleClose}
              disableGutters
              sx={{ p: 0 }}
            >
              <Button
                component={Link}
                href={option.link}
                fullWidth
                aria-current={isOptionActive ? "page" : undefined}
                sx={{
                  justifyContent: "flex-start",
                  px: 3,
                  py: 1.5,
                  minWidth: 180,
                  color: isOptionActive ? "#FFFFFF" : "#CFE3FC",
                  textTransform: "none",
                  fontWeight: isOptionActive ? "bold" : "medium",
                  textShadow: isOptionActive
                    ? "0px 0px 8px rgba(255, 255, 255, 0.8)"
                    : "none",
                  "&:hover": {
                    color: "#D1E9FF",
                    backgroundColor: alpha("#FFFFFF", 0.1),
                  },
                  "&:focus-visible": {
                    outline: "2px solid #FFFFFF",
                    outlineOffset: "-2px",
                    zIndex: 1,
                  },
                }}
              >
                <motion.span
                  whileHover={{ x: 4 }}
                  style={{ display: "inline-block" }}
                >
                  {t(option.name)}
                </motion.span>
              </Button>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

// Submenu Mobile
interface MobileSubmenuProps {
  item: IGroupedPage;
  pathname: string;
  onClose: () => void;
}

function MobileSubmenu({ item, pathname, onClose }: MobileSubmenuProps) {
  const t = useTranslations("NavBar");
  const [expanded, setExpanded] = React.useState(false);
  const isActive = item.options.some((option) => pathname === option.link);

  return (
    <>
      <MenuItem
        onClick={() => setExpanded(!expanded)}
        sx={{
          p: 0,
          backgroundColor: isActive ? alpha("#FFFFFF", 0.05) : "transparent",
        }}
      >
        <Button
          fullWidth
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
            px: 2,
            py: 1.5,
            color: isActive ? "#FFFFFF" : "#CFE3FC",
            textTransform: "none",
            fontWeight: "medium",
            "&:focus-visible": {
              outline: "2px solid #FFFFFF",
              outlineOffset: "-2px",
            },
          }}
        >
          {t(item.name)}
        </Button>
      </MenuItem>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {item.options.map((option) => {
            const isOptionActive = pathname === option.link;
            return (
              <MenuItem
                key={t(option.name)}
                onClick={onClose}
                disableGutters
                sx={{
                  p: 0,
                  backgroundColor: isOptionActive
                    ? alpha("#FFFFFF", 0.1)
                    : "transparent",
                }}
              >
                <Button
                  component={Link}
                  href={option.link}
                  fullWidth
                  aria-current={isOptionActive ? "page" : undefined}
                  sx={{
                    justifyContent: "flex-start",
                    pl: 4,
                    py: 1.5,
                    color: isOptionActive ? "#FFFFFF" : "#CFE3FC",
                    textTransform: "none",
                    fontWeight: isOptionActive ? "bold" : "normal",
                    fontSize: "0.9rem",
                    "&:hover": {
                      color: "#D1E9FF",
                      backgroundColor: alpha("#FFFFFF", 0.05),
                    },
                    "&:focus-visible": {
                      outline: "2px solid #FFFFFF",
                      outlineOffset: "-2px",
                    },
                  }}
                >
                  <motion.span
                    whileHover={{ x: 4 }}
                    style={{ display: "inline-block" }}
                  >
                    • {t(option.name)}
                  </motion.span>
                </Button>
              </MenuItem>
            );
          })}
        </motion.div>
      )}
    </>
  );
}

// Navbar Principal
export default function Navbar() {
  const t = useTranslations("NavBar");

  const navItems: IPages[] = [
    { name: "home", link: "/" },
    {
      name: "data",
      options: [
        { name: "register", link: "/cadastro" },
        { name: "loadData", link: "/inputfile" },
        { name: "selection", link: "/select" },
      ],
    },
    { name: "settings", link: "/config" },
    {
      name: "assignments",
      options: [
        { name: "table", link: "/atribuicoes" },
        { name: "blocks", link: "/atribuicaoBlocos" },
        { name: "spreadsheet", link: "/planilha" },
      ],
    },
    {
      name: "solutions",
      options: [
        { name: "history", link: "/history" },
        { name: "statistics", link: "/statistics" },
        { name: "compareSolutions", link: "/comparar" },
      ],
    },
    { name: "calendar", link: "/horarios" },
    { name: "rooms", link: "/salas" },
  ];

  const pathname = usePathname();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null,
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar
      id="main-nav"
      component="nav"
      position="sticky"
      sx={{
        backgroundColor: "primary.main",
        color: "primary.contrastText",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile View */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label={t("navigationMenu")}
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{
                "&:focus-visible": {
                  outline: "2px solid #FFFFFF",
                  outlineOffset: "2px",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
                "& .MuiPaper-root": {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  width: "280px",
                  maxHeight: "80vh",
                },
              }}
            >
              {navItems.map((item) => {
                if (isGroupedPage(item)) {
                  return (
                    <MobileSubmenu
                      key={t(item.name)}
                      item={item}
                      pathname={pathname}
                      onClose={handleCloseNavMenu}
                    />
                  );
                }
                const isItemActive = pathname === item.link;
                return (
                  <MenuItem
                    key={t(item.name)}
                    onClick={handleCloseNavMenu}
                    disableGutters
                    sx={{ p: 0 }}
                  >
                    <Button
                      component={Link}
                      href={item.link}
                      fullWidth
                      aria-current={isItemActive ? "page" : undefined}
                      sx={{
                        justifyContent: isItemActive ? "center" : "flex-start",
                        px: 2,
                        py: 1.5,
                        color: isItemActive ? "#FFFFFF" : "#CFE3FC",
                        textTransform: "none",
                        fontWeight: "medium",
                        backgroundColor: isItemActive
                          ? alpha("#FFFFFF", 0.1)
                          : "transparent",
                        textShadow: isItemActive
                          ? "0px 0px 8px rgba(255, 255, 255, 0.8)"
                          : "none",
                        "&:hover": {
                          color: "#D1E9FF",
                          backgroundColor: alpha("#FFFFFF", 0.05),
                        },
                        "&:focus-visible": {
                          outline: "2px solid #FFFFFF",
                          outlineOffset: "-2px",
                        },
                      }}
                    >
                      {isItemActive && (
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
                        />
                      )}
                      <motion.span
                        whileHover={{ y: -2 }}
                        style={{ display: "inline-block" }}
                      >
                        {t(item.name)}
                      </motion.span>
                    </Button>
                  </MenuItem>
                );
              })}
            </Menu>
          </Box>

          {/* Desktop View */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
              gap: 1,
            }}
          >
            {navItems.map((item) => {
              if (isGroupedPage(item)) {
                return (
                  <DesktopSubmenu
                    key={t(item.name)}
                    item={item}
                    pathname={pathname}
                  />
                );
              }
              const isItemActive = pathname === item.link;
              return (
                <Button
                  key={t(item.name)}
                  component={Link}
                  href={item.link}
                  variant="text"
                  aria-current={isItemActive ? "page" : undefined}
                  disableRipple
                  sx={{
                    position: "relative",
                    padding: "10px 20px",
                    fontWeight: "medium",
                    textTransform: "none",
                    color: isItemActive ? "#FFFFFF" : "#CFE3FC",
                    textShadow: isItemActive
                      ? "0px 0px 8px rgba(255, 255, 255, 0.8)"
                      : "none",
                    "&:hover": {
                      color: "#D1E9FF",
                      backgroundColor: alpha("#FFFFFF", 0.1),
                    },
                    "&:focus-visible": {
                      outline: "2px solid #FFFFFF",
                      outlineOffset: "-2px",
                      backgroundColor: alpha("#FFFFFF", 0.1),
                    },
                  }}
                >
                  {isItemActive && (
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
                  <motion.span
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ display: "inline-block" }}
                  >
                    {t(item.name)}
                  </motion.span>
                </Button>
              );
            })}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
