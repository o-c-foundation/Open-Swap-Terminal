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
import { Metaplex } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getJupiterTokens, getUserTokenBalances } from "@/util/jupiterTokens";
import { privateConnection } from "@/util/privateRpc";

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

  const connection = useMemo(
    () => privateConnection,
    []
  );
  
  const { publicKey, connected } = useWallet();

  // Load Jupiter tokens when dialog opens
  useEffect(() => {
    let isActive = true;
    let timeoutId: NodeJS.Timeout | null = null;

    async function loadJupiterTokens() {
      if (open) {
        console.log("CoinSelectDialog: Starting to load tokens...");
        
        // Set a timeout to prevent the loading state from getting stuck
        timeoutId = setTimeout(() => {
          if (isActive && coinListLoading) {
            console.log("CoinSelectDialog: Loading timeout reached, resetting loading state");
            setCoinListLoading(false);
            setErrorMessage("Token loading timed out. Please try again.");
            setErrorOpen(true);
          }
        }, 10000); // 10 second timeout
        
        try {
        setCoinListLoading(true);
          console.log("CoinSelectDialog: Fetching tokens from Jupiter...");
          // Fetch tokens from Jupiter
          const jupiterTokens = await getJupiterTokens(100);
          if (!isActive) return;
          
          console.log(`CoinSelectDialog: Received ${jupiterTokens.length} tokens from Jupiter`);
          
          if (jupiterTokens.length > 0) {
            // If user is connected, get their balances
            if (connected && publicKey) {
              console.log("CoinSelectDialog: User connected, fetching token balances...");
              try {
                const tokensWithBalances = await getUserTokenBalances(
                  connection,
                  publicKey.toBase58(),
                  jupiterTokens
                );
                if (!isActive) return;
                
                console.log("CoinSelectDialog: Token balances loaded successfully");
                setCoinList(tokensWithBalances);
              } catch (balanceError) {
                console.error("Error loading token balances:", balanceError);
                if (!isActive) return;
                
                setCoinList(jupiterTokens);
              }
            } else {
              console.log("CoinSelectDialog: User not connected, using default token list");
              setCoinList(jupiterTokens);
            }
          } else {
            console.warn("CoinSelectDialog: Received empty token list from Jupiter");
            setErrorMessage("No tokens received from Jupiter API");
            setErrorOpen(true);
          }
        } catch (error) {
          console.error("Error loading Jupiter tokens:", error);
          if (!isActive) return;
          
          setErrorMessage(`Failed to load tokens: ${error instanceof Error ? error.message : "Unknown error"}`);
          setErrorOpen(true);
        } finally {
          if (isActive) {
            console.log("CoinSelectDialog: Finished token loading process");
            setCoinListLoading(false);
          }
          
          if (timeoutId) clearTimeout(timeoutId);
        }
      }
    }
    
    loadJupiterTokens();
    
    // Cleanup function
    return () => {
      isActive = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [open, connected, publicKey, connection, setCoinList, setCoinListLoading]);

  // Filter tokens based on search term
  useEffect(() => {
    if (coinList.length === 0) {
      console.log("CoinSelectDialog: coinList is empty, nothing to filter");
      return;
    }
    
    console.log(`CoinSelectDialog: Filtering ${coinList.length} tokens with search term: "${searchTerm}"`);
    
    if (!searchTerm) {
      setDisplayedTokens(coinList);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = coinList.filter(coin => {
      // Safe checks for all properties
      const symbolMatch = coin.symbol ? coin.symbol.toLowerCase().includes(lowerSearchTerm) : false;
      const nameMatch = coin.name ? coin.name.toLowerCase().includes(lowerSearchTerm) : false;
      const mintMatch = coin.mint ? coin.mint.toString().toLowerCase() === lowerSearchTerm : false;
      
      return symbolMatch || nameMatch || mintMatch;
    });
    
    console.log(`CoinSelectDialog: Filtered to ${filtered.length} tokens`);
    setDisplayedTokens(filtered);
  }, [searchTerm, coinList]);

  async function addNewCoinToListMaybe(mint: string) {
    // Validate mint address first
    try {
      // Check if the mint string is a valid Solana public key
      if (!mint || mint.trim() === "") {
        setErrorMessage("Please enter a valid mint address");
        setErrorOpen(true);
        return;
      }
      
      // Check if token already exists in the list
      const existingToken = coinList.find(
        coin => coin.mint.toString() === mint
      );
      
      if (existingToken) {
        setInputToken(existingToken);
        setModalOpen(false);
        setQuoting(true);
        return;
      }
      
      // Attempt to create a PublicKey instance to validate
      const mintPublicKey = new PublicKey(mint);
      setCoinListLoading(true);
      
      // Fetch token details from Metaplex
    const metaplex = new Metaplex(connection);
    const nft = await metaplex
      .nfts()
        .findByMint({ mintAddress: mintPublicKey });

    if (nft) {
        if (nft.json?.name) {
        const newCoin: CoinlistItem = {
            name: nft.json.name || "Unknown Token",
            logo: nft.json.image || "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
          mint: nft.mint.address,
          decimals: nft.mint.decimals,
          uiAmount: 0,
            symbol: nft.json.symbol || nft.json.name.slice(0, 5),
        };
          
        setCoinList([newCoin, ...coinList]);
          setInputToken(newCoin);
          setModalOpen(false);
        setQuoting(true);
        } else {
          setErrorMessage("Token metadata not found");
          setErrorOpen(true);
        }
      } else {
        setErrorMessage("Token not found");
        setErrorOpen(true);
      }
    } catch (error) {
      console.error("Error adding token:", error);
      setErrorMessage("Invalid mint address");
      setErrorOpen(true);
    } finally {
      setCoinListLoading(false);
    }
  }

  return (
    <>
      <Dialog 
        open={open} 
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            backgroundColor: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 193, 7, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }
        }}
      >
        <DialogActions sx={{ bgcolor: "transparent" }}>
        <IconButton
          onClick={() => {
            setModalOpen(false);
          }}
            sx={{ color: '#FFC107' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogActions>

        <DialogContent sx={{ bgcolor: "transparent" }}>
          <Typography sx={{ color: "#FFC107", fontWeight: 600, mb: 2 }}>
            Select Token
        </Typography>
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              mb: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <TextField
              fullWidth
              variant="standard"
              placeholder="Search token or paste address"
              color="secondary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                disableUnderline: true,
                style: { color: '#FFC107' },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#666' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ backgroundColor: 'transparent' }}
            />
            <Button
              variant="contained"
              color="secondary"
              sx={{ ml: 1, px: 2 }}
              onClick={() => addNewCoinToListMaybe(searchTerm)}
            >
              Add
            </Button>
          </Paper>
          
        {coinListLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <CircularProgress color="secondary" sx={{ mb: 2 }} />
              <Typography sx={{ color: '#FFC107', mb: 2 }}>
                Loading tokens...
              </Typography>
              <Button 
                variant="outlined" 
                color="secondary" 
                sx={{ mt: 2 }}
                onClick={() => {
                  // Force reload tokens
                  setCoinListLoading(false);
                  setTimeout(() => {
                    setCoinListLoading(true);
                  }, 100);
                }}
              >
                Retry
              </Button>
            </Box>
          ) : (
            <List sx={{ width: "100%", bgcolor: "transparent", maxHeight: '60vh', overflow: 'auto' }}>
              {displayedTokens.map((coin) => (
                <ListItem 
                  key={coin.mint.toBase58()}
                  sx={{ 
                    mb: 1, 
                    borderRadius: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                <ListItemAvatar>
                    <Avatar 
                      src={coin.logo} 
                      alt={coin.name}
                      sx={{ border: '1px solid rgba(255, 193, 7, 0.3)' }}
                    />
                </ListItemAvatar>
                <ListItemButton
                  onClick={() => {
                    setInputToken(coin);
                    setModalOpen(false);
                    setQuoting(true);
                  }}
                >
                    <ListItemText 
                      primary={coin.name} 
                      primaryTypographyProps={{ fontWeight: 600, color: '#FFC107' }} 
                      secondary={coin.symbol}
                      secondaryTypographyProps={{ color: '#999' }}
                    />
                </ListItemButton>
                <ListItemText
                    primaryTypographyProps={{ textAlign: "right", color: '#FFFFFF', fontWeight: 500 }}
                    primary={(coin.uiAmount || 0) + " " + (coin.symbol || "")}
                />
              </ListItem>
            ))}
              
              {displayedTokens.length === 0 && !coinListLoading && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    No tokens found. Try a different search term or add a custom token.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => {
                      // Try to load tokens again
                      setCoinListLoading(true);
                    }}
                  >
                    Reload Token List
                  </Button>
                </Box>
              )}
          </List>
        )}
      </DialogContent>
    </Dialog>
      
      <Snackbar 
        open={errorOpen} 
        autoHideDuration={6000} 
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setErrorOpen(false)} 
          severity="error" 
          sx={{ 
            width: '100%', 
            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
            border: '1px solid rgba(255, 0, 0, 0.3)',
            color: '#FFF'
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
