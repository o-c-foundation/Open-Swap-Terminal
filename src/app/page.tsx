"use client";
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import ProTip from "@/components/ProTip";
import Copyright from "@/components/Copyright";
import { Card, Button, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid";

import SwapInputComponent from "@/components/SwapInputComponent";
import CoinSelectDialog from "@/components/CoinSelectDialog";
import { CoinlistItem, defaultList } from "@/types/CoinList";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import DappBar from "@/components/DappBar";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PublicKey, clusterApiUrl } from "@solana/web3.js";
import SwapComponentCard from "@/components/SwapComponentCard";
import "./global.css";
import useJupiterSwap from "@/hooks/useJupiterSwap";
import { privateConnection } from "@/util/privateRpc";
import { getHeliusTokens } from "@/util/heliusTokens";
import { useEffect, useState } from "react";

export default function Home() {
  const {
    publicKey,
    connected,
    wallet,
  } = useWallet();

  // Initialize tokens state
  const [tokenList, setTokenList] = useState<CoinlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load tokens using Helius DAS API
  useEffect(() => {
    const loadTokens = async () => {
      try {
        setLoading(true);
        const tokens = await getHeliusTokens(100);
        setTokenList(tokens);
      } catch (error) {
        console.error("Error loading tokens:", error);
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
      const signTransaction = (tx: any) => {
        if (adapter && 'signTransaction' in adapter) {
          return (adapter as any).signTransaction(tx);
        }
        throw new Error("Wallet doesn't support signTransaction");
      };
      
      const success = await jupiterSwap.executeSwap(
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

  // Update quote when inputs change
  useEffect(() => {
    if (inputToken && outputToken && Number(inputAmount) > 0) {
      setQuoting(true);
      jupiterSwap.setQuoting(true);
    } else {
      setQuote("0");
      setQuoting(false);
    }
  }, [inputToken, outputToken, inputAmount, jupiterSwap]);

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
    if (!token) {
      // Return a default token if null - should never happen in practice
      // because of the null checks in the JSX
      return tokenList[0] || {
        mint: new PublicKey("So11111111111111111111111111111111111111112"),
        name: "Solana",
        symbol: "SOL",
        logo: "",
        decimals: 9,
        uiAmount: 0
      };
    }
    return token;
  };

  return (
    <div>
      <DappBar />
      <Container maxWidth="sm">
        <Box sx={{ width: '100%', padding: 2 }}>
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
              variant="contained"
              sx={{ 
                bgcolor: 'rgba(255, 193, 7, 1)', 
                color: '#000',
                '&:hover': {
                  bgcolor: 'rgba(255, 193, 7, 0.8)',
                }
              }}
            >
              Swap
            </Button>
            <Button 
              component={NextLink} 
              href="/charts"
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
              Charts
            </Button>
          </Box>
          
          {inputToken && outputToken ? (
            <SwapComponentCard
              direction="up"
              setChangesSide={setChangesSide}
              setModalOpen={setModalOpen}
              inputToken={safeToken(inputToken)}
              setInputToken={setInputToken as any}
              outputToken={safeToken(outputToken)}
              setOutputToken={setOutputToken as any}
              inputAmount={inputAmount}
              setInputAmount={setInputAmount}
              outputAmount={outputAmount}
              setOutputAmount={setOutputAmount}
              swapping={swapping}
              setSwapping={executeSwap}
              quotebag={{
                quoting: quoting,
                setQuoting: setQuoting,
                quote: quote,
              }}
            />
          ) : (
            <Box sx={{ textAlign: 'center', my: 5 }}>
              <CircularProgress size={40} sx={{ color: '#FFC107', mb: 2 }} />
              <Typography>Loading tokens...</Typography>
            </Box>
          )}
          
          <Box sx={{ textAlign: 'center', mt: 2, opacity: 0.7 }}>
            <Typography variant="caption" sx={{ color: '#AAA' }}>
              Powered by{' '}
              <Link href="https://jup.ag" target="_blank" sx={{ color: '#FFC107' }}>
                Jupiter
              </Link>
            </Typography>
          </Box>
        </Box>
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
        addNewInput={""}
        setAddNewInput={() => {}}
        setQuoting={setQuoting}
      />
    </div>
  );
}
