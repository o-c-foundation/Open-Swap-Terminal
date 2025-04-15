"use client";
import { Roboto } from "next/font/google";
import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";
import "@fontsource/inter";
import "@fontsource/quantico";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#000000",
      paper: "rgba(0, 0, 0, 0.6)",
    },
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#FFC107", // Yellow accent color
    },
    error: {
      main: red.A400,
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#FFC107",
    },
  },
  typography: {
    fontFamily: "Inter",
    h4: {
      fontFamily: "Quantico",
      fontWeight: 700,
      color: "#FFC107",
    },
    button: {
      fontFamily: "Quantico",
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        scrollbarColor: "#FFC107 #000000",
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.severity === "info" && {
            backgroundColor: "#60a5fa",
          }),
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        containedSecondary: {
          backgroundColor: "#FFC107",
          color: "#000000",
          fontWeight: 600,
          "&:hover": {
            backgroundColor: "#FFA000",
          },
        },
      },
    },
  },
});

export default theme;
