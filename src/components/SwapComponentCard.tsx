//parent component for swaps, to be used with wallet context and useWallet()

import { Card, Button, Typography, Box } from "@mui/material";
import SwapInputComponent from "./SwapInputComponent";
import { CoinlistItem } from "@/types/CoinList";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { privateConnection } from "@/util/privateRpc";
import { useDebouncedCallback } from "use-debounce";
import SwapVertIcon from '@mui/icons-material/SwapVert';
import SlippageSelector from "./SlippageSelector";
import PercentageButtons from "./PercentageButtons";

interface SwapComponentCardProps {
  direction: "up" | "down";
  setChangesSide: React.Dispatch<React.SetStateAction<"A" | "B">>;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  inputToken: CoinlistItem;
  setInputToken: React.Dispatch<React.SetStateAction<CoinlistItem>>;
  outputToken: CoinlistItem;
  setOutputToken: React.Dispatch<React.SetStateAction<CoinlistItem>>;
  inputAmount: string;
  setInputAmount: React.Dispatch<React.SetStateAction<string>>;
  outputAmount: string;
  setOutputAmount: React.Dispatch<React.SetStateAction<string>>;
  swapping: boolean;
  setSwapping: (() => Promise<void>) | React.Dispatch<React.SetStateAction<boolean>>;
  quotebag: any;
}

export default function SwapComponentCard(props: SwapComponentCardProps) {
  const {
    direction,
    setChangesSide,
    setModalOpen,
    inputToken,
    setInputToken,
    outputToken,
    setOutputToken,
    inputAmount,
    setInputAmount,
    outputAmount,
    setOutputAmount,
    quotebag,
    swapping,
    setSwapping,
  } = props;

  const {
    connect,
    select,
    wallet,
    publicKey,
    connected,
  } = useWallet();

  const [slippage, setSlippage] = useState<number>(0.5); // Default 0.5%

  const debounced = useDebouncedCallback(() => {
    console.log("debounced called");
    quotebag.setQuoting(true);
  }, 800);

  // Swap token positions handler
  const handleSwapPositions = useCallback(() => {
    const tempToken = inputToken;
    setInputToken(outputToken);
    setOutputToken(tempToken);
    quotebag.setQuoting(true);
  }, [inputToken, outputToken, setInputToken, setOutputToken, quotebag]);

  // Execute swap handler
  const handleSwap = useCallback(() => {
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }
    
    if (typeof setSwapping === 'function') {
      (setSwapping as () => Promise<void>)();
    } else {
      (setSwapping as React.Dispatch<React.SetStateAction<boolean>>)(true);
    }
  }, [connected, setSwapping]);

  // Calculate max amount that can be swapped
  const maxInputAmount = useMemo(() => {
    if (!inputToken || !inputToken.uiAmount) return 0;
    return inputToken.uiAmount;
  }, [inputToken]);

  // Handle percentage button click
  const handlePercentageClick = useCallback((percentage: number) => {
    if (maxInputAmount > 0) {
      const amount = (maxInputAmount * percentage / 100).toFixed(
        // Use 6 decimal places for larger amounts, more for smaller amounts
        maxInputAmount > 1 ? 6 : 9
      );
      setInputAmount(amount);
      quotebag.setQuoting(true);
    }
  }, [maxInputAmount, setInputAmount, quotebag]);

  return (
    <Card
      sx={{
        my: 5,
        borderRadius: 16,
        p: 5,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        borderWidth: 1,
        borderColor: "rgba(255, 193, 7, 0.3)",
        borderStyle: "solid",
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflow: 'visible',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          background: 'linear-gradient(45deg, rgba(255, 193, 7, 0.1), transparent, rgba(255, 193, 7, 0.3), transparent)',
          borderRadius: 18,
          zIndex: -1,
          animation: 'rotate 6s linear infinite',
        },
        '@keyframes rotate': {
          '0%': {
            filter: 'hue-rotate(0deg)',
          },
          '100%': {
            filter: 'hue-rotate(360deg)',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SwapVertIcon sx={{ color: '#FFC107', mr: 2, fontSize: 30 }} />
          <Typography variant="h4" style={{ fontWeight: 700 }}>
        Swap
      </Typography>
        </Box>
        <SlippageSelector 
          slippage={slippage} 
          onSlippageChange={setSlippage} 
        />
      </Box>
      
      <SwapInputComponent
        setQuoting={quotebag.setQuoting}
        direction="up"
        debounced={debounced}
        value={inputAmount}
        setValue={setInputAmount}
        setChangesSide={setChangesSide}
        setModalOpen={setModalOpen}
        inputToken={inputToken}
        setInputToken={setInputToken}
      />
      
      {/* Percentage buttons for input token */}
      <Box sx={{ mt: 1, mb: 2 }}>
        <PercentageButtons 
          onPercentageClick={handlePercentageClick}
          maxValue={maxInputAmount}
          label={`of ${inputToken.symbol || 'token'} balance`}
        />
      </Box>
      
      {/* Swap direction button */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          my: -1, 
          position: 'relative', 
          zIndex: 2 
        }}
      >
        <Box 
          sx={{ 
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
            }
          }}
          onClick={handleSwapPositions}
        >
          <SwapVertIcon sx={{ color: '#FFC107' }} />
        </Box>
      </Box>
      
      <SwapInputComponent
        setQuoting={quotebag.setQuoting}
        direction="down"
        value={quotebag.quoting ? "..." : quotebag.quote}
        setValue={setOutputAmount}
        setChangesSide={setChangesSide}
        setModalOpen={setModalOpen}
        inputToken={outputToken}
        setInputToken={setOutputToken}
      />
      
      {/* Swap Rate Display */}
      {!quotebag.quoting && quotebag.quote && quotebag.quote !== "0" && (
        <Box sx={{ mb: 2, mt: 1, textAlign: 'right' }}>
          <Typography variant="caption" sx={{ color: '#999' }}>
            1 {inputToken.symbol} ≈ {(Number(quotebag.quote) / Number(inputAmount)).toFixed(6)} {outputToken.symbol}
          </Typography>
        </Box>
      )}
      
      {/* Slippage info */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ color: '#999' }}>
          Slippage Tolerance: {slippage}%
        </Typography>
        <Typography variant="caption" sx={{ color: '#999' }}>
          Est. Fee: 0.25%
        </Typography>
      </Box>
      
      <Card 
        sx={{ 
          p: 0, 
          m: 0, 
          borderRadius: 2, 
          background: 'linear-gradient(45deg, #FFC107, #FFA000)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 12px rgba(255, 193, 7, 0.3)',
          }
        }}
      >
        <Button
          color="inherit"
          variant="contained"
          fullWidth
          size="large"
          disabled={swapping || quotebag.quoting || !connected || Number(quotebag.quote) <= 0}
          onClick={handleSwap}
          sx={{ 
            py: 1.5, 
            color: '#000000', 
            fontWeight: 700,
            fontSize: '1.1rem',
            textTransform: 'none',
            '&:disabled': {
              backgroundColor: 'rgba(255, 193, 7, 0.5)',
              color: 'rgba(0, 0, 0, 0.6)',
            }
          }}
        >
          {!connected 
            ? "Connect Wallet" 
            : swapping 
              ? "Swapping..." 
              : quotebag.quoting 
                ? "Fetching Price..." 
                : "Swap"}
        </Button>
      </Card>
    </Card>
  );
}
