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
import { getHeliusTokens, getUserTokenBalancesHelius } from "@/util/heliusTokens";
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

  // Load Helius DAS tokens when dialog opens
  useEffect(() => {
    let isActive = true;
    let timeoutId: NodeJS.Timeout | null = null;

    async function loadHeliusTokens() {
      if (open) {
        console.log("CoinSelectDialog: Starting to load tokens from Helius DAS API...");
        
        // Set a timeout to prevent the loading state from getting stuck
        timeoutId = setTimeout(() => {
          if (isActive && coinListLoading) {
            console.log("CoinSelectDialog: Loading timeout reached, resetting loading state");
            setCoinListLoading(false);
            setErrorMessage("Token loading timed out. Please try again.");
            setErrorOpen(true);
          }
        }, 15000); // 15 second timeout (slightly longer for DAS API)
        
        try {
          setCoinListLoading(true);
          console.log("CoinSelectDialog: Fetching tokens from Helius DAS API...");
          
          // Fetch tokens from Helius DAS API
          if (connected && publicKey) {
            console.log("CoinSelectDialog: User connected, fetching owned tokens...");
            try {
              const walletTokens = await getUserTokenBalancesHelius(publicKey.toBase58());
              if (!isActive) return;
              
              if (walletTokens.length > 0) {
                console.log("CoinSelectDialog: User has tokens, using owned tokens list");
                setCoinList(walletTokens);
              } else {
                console.log("CoinSelectDialog: User has no tokens, fetching popular tokens");
                const popularTokens = await getHeliusTokens(100);
                if (!isActive) return;
                setCoinList(popularTokens);
              }
            } catch (balanceError) {
              console.error("Error loading owned tokens:", balanceError);
              if (!isActive) return;
              
              // Fallback to popular tokens
              console.log("CoinSelectDialog: Error fetching owned tokens, falling back to popular tokens");
              const popularTokens = await getHeliusTokens(100);
              if (!isActive) return;
              setCoinList(popularTokens);
            }
          } else {
            console.log("CoinSelectDialog: User not connected, fetching popular tokens");
            const popularTokens = await getHeliusTokens(100);
            if (!isActive) return;
            setCoinList(popularTokens);
          }
        } catch (error) {
          console.error("Error loading Helius DAS tokens:", error);
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
    
    loadHeliusTokens();
    
    // Cleanup function
    return () => {
      isActive = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [open, connected, publicKey, setCoinList, setCoinListLoading]);

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
      
      setCoinListLoading(true);
      
      // Fetch token using Helius DAS API
      const payload = {
        jsonrpc: "2.0",
        id: "custom-token",
        method: "getAsset",
        params: {
          id: mint
        }
      };

      const response = await fetch("https://mainnet.helius-rpc.com", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Helius API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.result) {
        throw new Error('Token not found');
      }

      const token = data.result;
      
      // Create new coin list item
      const newToken: CoinlistItem = {
        mint: new PublicKey(token.mint.address),
        name: token.content?.metadata?.name || token.mint.address.slice(0, 8),
        symbol: token.content?.metadata?.symbol || token.mint.address.slice(0, 4),
        decimals: token.mint.decimals,
        logo: token.content?.metadata?.image || 
          'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        balance: token.ownership?.amount || 0,
        uiAmount: (token.ownership?.amount || 0) / Math.pow(10, token.mint.decimals),
      };
      
      // Add to token list
      setCoinList([newToken, ...coinList]);
      setInputToken(newToken);
      setModalOpen(false);
      setQuoting(true);
    } catch (error) {
      console.error("Error adding custom token:", error);
      setErrorMessage(`Failed to add token: ${error instanceof Error ? error.message : "Unknown error"}`);
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
