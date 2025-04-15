"use client";
import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Paper, Skeleton, Select, MenuItem, TextField, Button, FormControl, InputLabel, Grid, CircularProgress } from "@mui/material";
import DappBar from "@/components/DappBar";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { CoinlistItem } from "@/types/CoinList";
import { getSolflareTokens } from "@/util/solflareTokens";
import { useRPC } from "@/util/RPCContext";
import NextLink from "next/link";
import dynamic from 'next/dynamic';

const TradingViewChart = dynamic(() => import('../../components/TradingViewChart'), {
  ssr: false,
  loading: () => <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></div>,
});

export default function ChartsPage() {
  const { connected, publicKey } = useWallet();
  const { rpcConfig } = useRPC();
  const [selectedToken, setSelectedToken] = useState<CoinlistItem | null>(null);
  const [tokenList, setTokenList] = useState<CoinlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tokens using Solflare API
  useEffect(() => {
    async function loadTokens() {
      try {
        setLoading(true);
        // Load tokens list using Solflare API
        const tokens = await getSolflareTokens(100);
        setTokenList(tokens);
        
        // Set default token to SOL
        if (tokens.length > 0) {
          const sol = tokens.find(t => t.symbol === "SOL") || tokens[0];
          setSelectedToken(sol);
        }
      } catch (error) {
        console.error("Error loading tokens:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTokens();
  }, []);

  const handleTokenChange = (event: any) => {
    const selectedMint = event.target.value;
    const token = tokenList.find(t => t.mint.toString() === selectedMint);
    if (token) {
      setSelectedToken(token);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        alignItems: "center",
        background: "linear-gradient(to bottom, #000000, #111111)",
      }}
    >
      <DappBar />
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="lg">
        {/* Navigation links */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2, 
          mb: 4
        }}>
          <Button 
            component={NextLink} 
            href="/"
            variant="outlined"
            sx={{ 
              borderColor: 'rgba(255, 193, 7, 0.5)', 
              color: '#FFC107',
              '&:hover': {
                borderColor: 'rgba(255, 193, 7, 1)',
                bgcolor: 'rgba(255, 193, 7, 0.1)',
              }
            }}
          >
            Swap
          </Button>
          <Button 
            component={NextLink} 
            href="/charts"
            variant="contained"
            sx={{ 
              bgcolor: 'rgba(255, 193, 7, 1)', 
              color: '#000',
              '&:hover': {
                bgcolor: 'rgba(255, 193, 7, 0.8)',
              }
            }}
          >
            Charts
          </Button>
        </Box>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            borderRadius: 2, 
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h1" sx={{ color: '#FFC107' }}>
              Price Charts
            </Typography>
            
            <FormControl 
              variant="outlined" 
              sx={{ 
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 193, 7, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 193, 7, 0.8)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FFC107',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiSvgIcon-root': {
                  color: '#FFC107',
                },
              }}
            >
              <InputLabel id="token-select-label">Token</InputLabel>
              <Select
                labelId="token-select-label"
                id="token-select"
                value={selectedToken?.mint.toString() || ''}
                onChange={handleTokenChange}
                label="Token"
                disabled={loading}
              >
                {tokenList.map((token) => (
                  <MenuItem key={token.mint.toString()} value={token.mint.toString()}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {token.logo && (
                        <img 
                          src={token.logo} 
                          alt={token.symbol || 'token'} 
                          style={{ width: 24, height: 24, borderRadius: '50%' }}
                          onError={(e) => {
                            // Replace broken image with generic icon
                            (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
                          }}
                        />
                      )}
                      <span>{token.symbol} - {token.name}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {selectedToken ? (
            <TradingViewChart 
              symbol={selectedToken.symbol || selectedToken.name} 
              mint={selectedToken.mint.toString()}
            />
          ) : (
            <Box sx={{ 
              height: 500, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2
            }}>
              {loading ? (
                <>
                  <CircularProgress sx={{ color: '#FFC107' }} />
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Loading tokens...
                  </Typography>
                </>
              ) : (
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  No token selected
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
} 