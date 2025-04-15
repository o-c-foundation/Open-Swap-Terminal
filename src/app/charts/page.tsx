"use client";
import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Paper, Skeleton, Select, MenuItem, TextField, Button, FormControl, InputLabel, Grid, CircularProgress } from "@mui/material";
import DappBar from "@/components/DappBar";
import { CoinlistItem } from "@/types/CoinList";
import NextLink from "next/link";
import dynamic from 'next/dynamic';

const TradingViewChart = dynamic(() => import('../../components/TradingViewChart'), {
  ssr: false,
  loading: () => <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></div>,
});

// Static list of popular tokens with simplified data structure
const POPULAR_TOKENS = [
  {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    uiAmount: 0,
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    uiAmount: 0,
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png",
    uiAmount: 0,
  },
  {
    mint: "7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx",
    symbol: "GMT",
    name: "STEPN",
    decimals: 9,
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx/logo.png",
    uiAmount: 0,
  },
  {
    mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    symbol: "mSOL",
    name: "Marinade staked SOL",
    decimals: 9,
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png",
    uiAmount: 0,
  },
  {
    mint: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    symbol: "JUP",
    name: "Jupiter",
    decimals: 8,
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs/logo.png",
    uiAmount: 0,
  }
];

export default function ChartsPage() {
  const [selectedToken, setSelectedToken] = useState<(typeof POPULAR_TOKENS)[0] | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize with popular tokens
  useEffect(() => {
    try {
      setLoading(true);
      // Set default token to SOL
      const sol = POPULAR_TOKENS.find(t => t.symbol === "SOL") || POPULAR_TOKENS[0];
      setSelectedToken(sol);
    } catch (error) {
      console.error("Error setting up tokens:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTokenChange = (event: any) => {
    const selectedMint = event.target.value;
    const token = POPULAR_TOKENS.find(t => t.mint === selectedMint);
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
                value={selectedToken?.mint || ''}
                onChange={handleTokenChange}
                label="Token"
                disabled={loading}
              >
                {POPULAR_TOKENS.map((token) => (
                  <MenuItem key={token.mint} value={token.mint}>
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
              mint={selectedToken.mint}
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