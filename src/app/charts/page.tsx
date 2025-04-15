"use client";
import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Paper, Skeleton, Select, MenuItem, TextField, Button, FormControl, InputLabel, Grid } from "@mui/material";
import DappBar from "@/components/DappBar";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { CoinlistItem } from "@/types/CoinList";
import { getHeliusTokens } from "@/util/heliusTokens";
import { useRPC } from "@/util/RPCContext";
import NextLink from "next/link";

export default function ChartsPage() {
  const { connected, publicKey } = useWallet();
  const { rpcConfig } = useRPC();
  const [selectedToken, setSelectedToken] = useState<CoinlistItem | null>(null);
  const [tokenList, setTokenList] = useState<CoinlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load token list using Helius DAS API
  useEffect(() => {
    async function loadTokens() {
      try {
        setLoading(true);
        const tokens = await getHeliusTokens(100);
        setTokenList(tokens);
        // Default to SOL
        setSelectedToken(tokens.find(t => t.symbol === 'SOL') || tokens[0]);
      } catch (error) {
        console.error("Error loading tokens for charts:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadTokens();
  }, []);

  return (
    <div>
      <DappBar />
      <Container maxWidth="lg">
        <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#FFC107' }}>
            Token Charts
          </Typography>
          
          {/* Navigation links */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2, 
            mb: 2
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
          
          {/* Chart Section */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              border: '1px solid rgba(255, 193, 7, 0.3)',
            }}
          >
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel id="token-select-label" sx={{ color: '#999' }}>Select Token</InputLabel>
                <Select
                  labelId="token-select-label"
                  value={selectedToken?.mint.toString() || ""}
                  label="Select Token"
                  onChange={(e) => {
                    const selected = tokenList.find(token => token.mint.toString() === e.target.value);
                    if (selected) setSelectedToken(selected);
                  }}
                  sx={{ mb: 2 }}
                  disabled={loading}
                >
                  {tokenList.map((token) => (
                    <MenuItem key={token.mint.toString()} value={token.mint.toString()}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <img 
                          src={token.logo} 
                          alt={token.symbol || token.name} 
                          style={{ width: 24, height: 24, borderRadius: '50%' }} 
                        />
                        <Typography>{token.symbol || token.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {loading ? (
              <Skeleton 
                variant="rectangular" 
                height={400} 
                animation="wave" 
                sx={{ borderRadius: 2 }} 
              />
            ) : (
              <Box
                sx={{
                  height: 500,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color="textSecondary">
                  Chart will be implemented here - Currently showing: {selectedToken?.symbol || "No token selected"}
                </Typography>
              </Box>
            )}
          </Paper>
          
          <Typography variant="h6" gutterBottom sx={{ color: '#FFC107', mt: 3 }}>
            Coming soon: Advanced chart features and technical analysis tools
          </Typography>
        </Box>
      </Container>
    </div>
  );
} 