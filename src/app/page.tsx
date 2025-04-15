"use client";
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import ProTip from "@/components/ProTip";
import Copyright from "@/components/Copyright";
import { Card, Button, CircularProgress, Alert } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import SolLogo from "./solana-logo.webp";
import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { CoinlistItem, defaultList } from "@/types/CoinList";
import useJupiterSwap from "@/hooks/useJupiterSwap";
import SwapComponentCard from "@/components/SwapComponentCard";
import { QuoteResponse } from "@jup-ag/api";
import { getSolflareTokens } from "@/util/solflareTokens";
import { privateConnection } from "@/util/privateRpc";

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
import CoinSelectDialog from "@/components/CoinSelectDialog";

export default function Home() {
  const {
    publicKey,
    connected,
    wallet,
  } = useWallet();

  // Initialize tokens state
  const [tokenList, setTokenList] = useState<CoinlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load tokens using Solflare Token API
  useEffect(() => {
    const loadTokens = async () => {
      try {
        setLoading(true);
        console.log("Home page: Loading tokens from Solflare API...");
        const tokens = await getSolflareTokens(100);
        console.log(`Home page: Received ${tokens.length} tokens from Solflare API`);
        setTokenList(tokens);
      } catch (error) {
        console.error("Error loading tokens:", error);
        setTokenList(defaultList);
      } finally {
        setLoading(false);
      }
    };
    
    loadTokens();
  }, []);

  // Find default tokens (SOL and USDC)
  const findTokenBySymbol = (symbol: string) => {
    return tokenList.find(token => token.symbol === symbol) || tokenList[0];
  };

  // Define token state
  const [changesSide, setChangesSide] = React.useState<"A" | "B">("A");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [inputToken, setInputToken] = React.useState<CoinlistItem | null>(null);
  const [outputToken, setOutputToken] = React.useState<CoinlistItem | null>(null);
  const [inputAmount, setInputAmount] = React.useState("0.1");
  const [outputAmount, setOutputAmount] = React.useState("0");
  const [quoting, setQuoting] = React.useState(false);
  const [quote, setQuote] = React.useState("0");
  const [swapping, setSwapping] = React.useState(false);
  const [addNewInput, setAddNewInput] = React.useState("");
  
  // Set default tokens once token list is loaded
  useEffect(() => {
    if (tokenList.length > 0 && !inputToken && !outputToken) {
      const sol = findTokenBySymbol("SOL");
      const usdc = findTokenBySymbol("USDC");
      
      if (sol) setInputToken(sol);
      if (usdc) setOutputToken(usdc);
    }
  }, [tokenList, inputToken, outputToken]);
  
  // Use Jupiter swap hook
  const jupiterSwap = useJupiterSwap(
    privateConnection,
    publicKey || undefined,
    inputToken,
    outputToken,
    inputAmount,
    0.5 // Default slippage of 0.5%
  );

  // Execute swap
  const executeSwap = async () => {
    if (!connected || !wallet) {
      alert("Please connect your wallet first");
      return;
    }
    
    setSwapping(true);
    try {
      const adapter = wallet.adapter;
      // Use optional chaining for signTransaction which might not be available
      const signTransaction = async (tx: any) => {
        if (adapter && typeof (adapter as any).signTransaction === 'function') {
          return (adapter as any).signTransaction(tx);
        } else {
          throw new Error("Wallet does not support signTransaction");
        }
      };
      
      const { success, txid } = await jupiterSwap.executeSwap(
        signTransaction,
        adapter.sendTransaction
      );
      
      if (success) {
        setInputAmount("0");
        setOutputAmount("0");
        // Could refresh balances here
      }
    } catch (error) {
      console.error("Swap failed:", error);
      alert(`Swap failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSwapping(false);
    }
  };

  // Ensure quoting state is updated properly
  useEffect(() => {
    if (inputToken && outputToken && parseFloat(inputAmount) > 0) {
      jupiterSwap.setQuoting(true);
    } else {
      setQuote("0");
      setQuoting(false);
    }
  }, [inputToken, outputToken, inputAmount]);

  // Update quote state when jupiterSwap.quote changes
  useEffect(() => {
    setQuote(jupiterSwap.quote);
    setQuoting(jupiterSwap.quoting);
  }, [jupiterSwap.quote, jupiterSwap.quoting]);

  // If tokens haven't loaded, show a loading indicator
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

  // Helper function for type casting
  const safeToken = (token: CoinlistItem | null): CoinlistItem => {
    return token || defaultList[0];
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
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="md">
        <Grid container spacing={4}>
          <Grid item xs={12} md={12}>
            <SwapComponentCard
              inputToken={safeToken(inputToken)}
              setInputToken={setInputToken as any}
              outputToken={safeToken(outputToken)}
              setOutputToken={setOutputToken as any}
              inputAmount={inputAmount}
              setInputAmount={setInputAmount}
              outputAmount={quote}
              setOutputAmount={setQuote}
              quoting={quoting}
              setQuoting={setQuoting}
              quote={quote}
              executeSwap={executeSwap}
              swapping={swapping}
              jupiterSwap={jupiterSwap}
            />
          </Grid>
        </Grid>
      </Container>
      <CoinSelectDialog
        open={modalOpen}
        setModalOpen={setModalOpen}
        changesSide={changesSide}
        setInputToken={setInputToken as any}
        coinList={tokenList}
        setCoinList={setTokenList}
        coinListLoading={loading}
        setCoinListLoading={setLoading}
        addNewInput={addNewInput}
        setAddNewInput={setAddNewInput}
        setQuoting={setQuoting}
      />
    </Box>
  );
}
