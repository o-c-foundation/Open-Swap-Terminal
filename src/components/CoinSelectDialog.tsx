import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Icon,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Paper,
  CircularProgress,
  Box,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import React, { useMemo, useState, useEffect } from "react";
import SolanaLogo from "./Solana-Logo.png";
import { CoinlistItem, defaultList } from "@/types/CoinList";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRPC } from "@/util/RPCContext";

// Static list of popular tokens - same as in charts page
const POPULAR_TOKENS: CoinlistItem[] = [
  {
    mint: new PublicKey("So11111111111111111111111111111111111111112"),
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    uiAmount: 0,
  },
  {
    mint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    uiAmount: 0,
  },
  {
    mint: new PublicKey("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"),
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png",
    uiAmount: 0,
  },
  {
    mint: new PublicKey("7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx"),
    symbol: "GMT",
    name: "STEPN",
    decimals: 9,
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx/logo.png",
    uiAmount: 0,
  },
  {
    mint: new PublicKey("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"),
    symbol: "mSOL",
    name: "Marinade staked SOL",
    decimals: 9,
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png",
    uiAmount: 0,
  },
  {
    mint: new PublicKey("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"),
    symbol: "JUP",
    name: "Jupiter",
    decimals: 8,
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs/logo.png",
    uiAmount: 0,
  }
];

interface CoinSelectDialogProps {
  open: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  changesSide: "A" | "B"; // whether it changes the buying or selling sides
  setInputToken: React.Dispatch<React.SetStateAction<CoinlistItem>>;
  setCoinList: React.Dispatch<React.SetStateAction<CoinlistItem[]>>;
  coinList: CoinlistItem[];
  coinListLoading: boolean;
  setCoinListLoading: React.Dispatch<React.SetStateAction<boolean>>;
  addNewInput: string;
  setAddNewInput: React.Dispatch<React.SetStateAction<string>>;
  setQuoting: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CoinSelectDialog(props: CoinSelectDialogProps) {
  const {
    open,
    setModalOpen,
    setInputToken,
    coinList,
    setCoinList,
    coinListLoading,
    setCoinListLoading,
    addNewInput,
    setAddNewInput,
    setQuoting,
  } = props;

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedTokens, setDisplayedTokens] = useState<CoinlistItem[]>([]);
  
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  // Initialize tokens when dialog opens
  useEffect(() => {
    if (open) {
      try {
        setCoinListLoading(true);
        
        // Use static token list
        setCoinList(POPULAR_TOKENS);
        setDisplayedTokens(POPULAR_TOKENS);
        console.log("CoinSelectDialog: Set static token list");
      } catch (error) {
        console.error("Error initializing tokens:", error);
        setErrorMessage(`Failed to load tokens: ${error instanceof Error ? error.message : "Unknown error"}`);
        setErrorOpen(true);
      } finally {
        setCoinListLoading(false);
      }
    }
  }, [open, setCoinList, setCoinListLoading]);

  // Filter tokens based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setDisplayedTokens(POPULAR_TOKENS);
      return;
    }

    // Simple local filtering
    const filtered = POPULAR_TOKENS.filter(
      (item) =>
        item.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mint.toString().toLowerCase() === searchTerm.toLowerCase()
    );
    setDisplayedTokens(filtered);
  }, [searchTerm]);

  async function addNewCoinToListMaybe(mint: string) {
    // Validate mint address first
    try {
      // Check if the mint string is a valid Solana public key
      if (!mint || mint.trim() === "") {
        setErrorMessage("Please enter a valid token mint address");
        setErrorOpen(true);
        return;
      }

      setCoinListLoading(true);
      
      // Convert the input string to a PublicKey
      let mintPubkey: PublicKey;
      try {
        mintPubkey = new PublicKey(mint.trim());
      } catch (e) {
        setErrorMessage("Invalid token mint address format");
        setErrorOpen(true);
        setCoinListLoading(false);
        return;
      }

      // Check if token is already in the list
      const existingToken = POPULAR_TOKENS.find(
        (t) => t.mint.toString() === mintPubkey.toString()
      );

      if (existingToken) {
        // Token already exists, just select it
        setInputToken(existingToken);
        setModalOpen(false);
        setQuoting(true);
        return;
      }

      // For custom tokens, we can only use basic information
      const customToken: CoinlistItem = {
        mint: mintPubkey,
        symbol: "Unknown",
        name: "Custom Token",
        decimals: 9, // Assume 9 decimals by default
        logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png", // Default SOL logo
        uiAmount: 0,
      };

      // Add to list and select it
      const newList = [...POPULAR_TOKENS, customToken];
      setCoinList(newList);
      setInputToken(customToken);
      setModalOpen(false);
      setQuoting(true);
    } catch (error) {
      console.error("Error adding custom token:", error);
      setErrorMessage(`Error adding token: ${error instanceof Error ? error.message : "Unknown error"}`);
      setErrorOpen(true);
    } finally {
      setCoinListLoading(false);
    }
  }

  const handleSelectCoin = (coin: CoinlistItem) => {
    setInputToken(coin);
    setModalOpen(false);
    setQuoting(true);
  };

  const handleAddNewCoin = () => {
    addNewCoinToListMaybe(addNewInput);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleErrorClose = () => {
    setErrorOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "rgba(10, 10, 10, 0.9)",
            color: "white",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography variant="h6">Select Token</Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            bgcolor: "rgba(10, 10, 10, 0.9)",
            color: "white",
            pb: 1,
          }}
        >
          <Box sx={{ mt: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search by name, symbol, or mint address"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
                  </InputAdornment>
                ),
                sx: {
                  color: "white",
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#FFC107",
                  },
                },
              }}
            />
          </Box>

          <Paper
            sx={{
              maxHeight: 350,
              overflow: "auto",
              bgcolor: "transparent",
              boxShadow: "none",
              borderRadius: 2,
              "& .MuiListItemButton-root:hover": {
                bgcolor: "rgba(255, 255, 255, 0.05)",
              },
            }}
          >
            {coinListLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress sx={{ color: "#FFC107" }} />
              </Box>
            ) : displayedTokens.length > 0 ? (
              <List sx={{ py: 0 }}>
                {displayedTokens.map((coin) => (
                  <ListItemButton
                    key={coin.mint.toString()}
                    onClick={() => handleSelectCoin(coin)}
                    sx={{
                      borderRadius: 1,
                      my: 0.5,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        alt={coin.symbol || "Token"}
                        src={coin.logo}
                        sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
                        onError={(e: any) => {
                          // Fall back to placeholder for broken images
                          e.target.src = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {coin.symbol || "Unknown"}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                        >
                          {coin.name} 
                          {coin.uiAmount !== undefined && (
                            <span style={{ marginLeft: 8 }}>
                              {coin.uiAmount > 0 ? `(${coin.uiAmount})` : ""}
                            </span>
                          )}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography color="text.secondary">
                  No tokens found. Add a custom token below.
                </Typography>
              </Box>
            )}
          </Paper>

          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: "rgba(255, 255, 255, 0.7)" }}>
              Add Custom Token
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter mint address"
                value={addNewInput}
                onChange={(e) => setAddNewInput(e.target.value)}
                InputProps={{
                  sx: {
                    color: "white",
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#FFC107",
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddNewCoin}
                disabled={coinListLoading || !addNewInput.trim()}
                sx={{
                  bgcolor: "#FFC107",
                  color: "black",
                  "&:hover": {
                    bgcolor: "#e6af00",
                  },
                  "&:disabled": {
                    bgcolor: "rgba(255, 193, 7, 0.3)",
                    color: "rgba(0, 0, 0, 0.5)",
                  },
                }}
              >
                Add
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={errorOpen}
        autoHideDuration={6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleErrorClose}
          severity="error"
          sx={{
            width: "100%",
            bgcolor: "rgba(211, 47, 47, 0.9)",
            color: "white",
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
