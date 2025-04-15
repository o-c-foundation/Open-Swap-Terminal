"use client";
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import SwapComponentCard from "@/components/SwapComponentCard";

import DappBar from "@/components/DappBar";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "./global.css";

export default function Home() {
  const { connected } = useWallet();
  const [loading, setLoading] = useState(true);
  
  // Simulate initial loading
  useEffect(() => {
    // Simulate loading time for UI consistency
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // If still loading, show a loading indicator
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: 'linear-gradient(to bottom, #000000, #111111)'
      }}>
        <CircularProgress size={60} sx={{ color: '#FFC107', mb: 3 }} />
        <Typography variant="h6" sx={{ color: '#FFC107' }}>
          Loading OpenSwap...
        </Typography>
      </Box>
    );
  }

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
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="md">
        <Grid container spacing={4}>
          <Grid sx={{ gridColumn: 'span 12' }}>
            {/* New SwapComponentCard with Jupiter Terminal integration */}
            <SwapComponentCard />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
