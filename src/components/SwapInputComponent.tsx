import {
  Avatar,
  Box,
  Button,
  Grid,
  IconButton,
  Input,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import SolanaLogo from "./Solana-Logo.png";
import React from "react";
import { CoinlistItem } from "@/types/CoinList";
import { DebouncedState } from "use-debounce";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import theme from "@/theme";

// wrapper + input

interface SwapInputComponentProps {
  direction: "up" | "down";
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  setChangesSide: React.Dispatch<React.SetStateAction<"A" | "B">>;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  inputToken: CoinlistItem;
  setInputToken: React.Dispatch<React.SetStateAction<CoinlistItem>>;
  debounced?: DebouncedState<() => void>;
  setQuoting: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SwapInputComponent(props: SwapInputComponentProps) {
  const {
    direction,
    value,
    setValue,
    setChangesSide,
    setModalOpen,
    inputToken,
    setInputToken,
    debounced,
    setQuoting,
  } = props;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleinputhcange called");
    console.log("direction:", direction);
    if (direction == "up") {
      console.log("called debounced");
      debounced!();
    }
    var reg = /^-?\d*\.?\d*$/;
    if (reg.test(event.target.value)) {
      setValue(event.target.value);
    }
  };

  return (
    <>
      <Box
        sx={{
          mb: 3,
          borderRadius: 3,
          backgroundColor: "rgba(13, 13, 13, 0.6)",
          borderColor: direction === "up" 
            ? "rgba(255, 193, 7, 0.3)" 
            : "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          borderStyle: "solid",
          p: 2,
          backdropFilter: "blur(5px)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: "rgba(255, 193, 7, 0.5)",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.3)",
          },
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        <Box
          sx={{
            backgroundColor: "transparent",
            flexBasis: direction == "up" ? '50%' : '75%',
            maxWidth: direction == "up" ? '50%' : '75%',
          }}
        >
          <TextField
            value={String(value)}
            variant="standard"
            label={direction === "up" ? "From:" : "To:"}
            type="text"
            size="medium"
            onChange={handleInputChange}
            InputProps={{
              disableUnderline: true,
              style: {
                fontSize: 20,
                opacity: 1,
                WebkitTextFillColor: direction === "up" ? "#FFFFFF" : "#AAAAAA",
              },
            }}
            InputLabelProps={{
              style: { 
                color: direction === "up" ? "#FFC107" : "#888888", 
                fontWeight: "bold",
                fontSize: "14px", 
              },
            }}
            fullWidth
            sx={{
              margin: "auto",
              backgroundColor: "transparent",
              borderRadius: 10,
              borderStyle: "hidden",
            }}
          />
          <Typography
            variant="caption"
            sx={{ 
              fontSize: "12px", 
              color: direction === "up" ? "#FFC107" : "#888888",
              opacity: 0.9,
            }}
          >
            Balance: {inputToken.uiAmount}
          </Typography>
        </Box>
        <Box sx={{ flexBasis: direction === "up" ? '33.33%' : '8.33%' }}></Box>
        {true && (
          <Box sx={{ flexBasis: '16.67%', maxWidth: '16.67%' }}>
            {direction === "up" && (
              <Button
                variant="outlined"
                size="small"
                fullWidth
                sx={{
                  borderRadius: 1,
                  paddingTop: 0,
                  paddingBottom: 0,
                  fontSize: 10,
                  borderColor: "#FFC107",
                  color: "#FFC107",
                  fontWeight: 600,
                  borderWidth: 1,
                  mb: 1,
                  "&:hover": {
                    borderColor: "#FFA000",
                    backgroundColor: "rgba(255, 193, 7, 0.1)",
                  },
                }}
                onClick={() => {
                  setValue(inputToken.uiAmount.toString());
                  setQuoting(true);
                }}
              >
                Max
              </Button>
            )}
            <Button
              sx={{
                borderRadius: 2,
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 193, 7, 0.3)",
                color: "#FFC107",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  borderColor: "#FFC107",
                },
              }}
              size="medium"
              startIcon={<Avatar src={inputToken.logo} sx={{ width: 24, height: 24 }} />}
              fullWidth
              onClick={() => {
                if (setChangesSide)
                  setChangesSide(direction === "up" ? "A" : "B");
                setModalOpen(true);
              }}
            >
              {inputToken.symbol}
              <KeyboardArrowDownIcon />
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
}
