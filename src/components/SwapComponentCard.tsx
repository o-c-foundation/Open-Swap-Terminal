//parent component for swaps, to be used with wallet context and useWallet()

import { Card, Typography, Box } from "@mui/material";
import SwapVertIcon from '@mui/icons-material/SwapVert';
import React, { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";

// This new component will use Jupiter Terminal in integrated mode
export default function SwapComponentCard() {
  const { connection } = useConnection();
  const wallet = useWallet();

  useEffect(() => {
    // Add the Jupiter Terminal script to the document
    const script = document.createElement('script');
    script.src = 'https://terminal.jup.ag/main-v2.js';
    script.setAttribute('data-preload', '');
    document.head.appendChild(script);

    // Initialize Jupiter Terminal after the script is loaded
    script.onload = () => {
      // Check if Jupiter object exists
      if (window.Jupiter) {
        initJupiterTerminal();
      }
    };

    // Cleanup function
    return () => {
      document.head.removeChild(script);
      // Close Jupiter Terminal if it's open
      if (window.Jupiter && typeof window.Jupiter.close === 'function') {
        window.Jupiter.close();
      }
    };
  }, []);

  // Function to sync wallet state with Jupiter Terminal
  useEffect(() => {
    if (window.Jupiter && window.Jupiter.syncProps && wallet) {
      window.Jupiter.syncProps({ 
        passthroughWalletContextState: wallet 
      });
    }
  }, [wallet, wallet.connected]);

  // Initialize Jupiter Terminal
  const initJupiterTerminal = () => {
    window.Jupiter.init({
      displayMode: "integrated",
      integratedTargetId: "jupiter-swap-container",
      endpoint: connection.rpcEndpoint,
      enableWalletPassthrough: true, // Use wallet adapter from your app
      containerStyles: {
        width: '100%',
        height: '100%',
        borderRadius: '16px',
        color: 'white',
      },
      containerClassName: 'jupiter-terminal-container'
    });
  };

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
      </Box>
      
      {/* Container for Jupiter Terminal */}
      <Box 
        id="jupiter-swap-container" 
        sx={{ 
          width: '100%', 
          minHeight: '500px',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      ></Box>

      {/* Add Jupiter Terminal's CSS */}
      <style jsx global>{`
        .jupiter-terminal-container {
          border-radius: 16px;
          font-family: Inter, sans-serif;
        }
      `}</style>
    </Card>
  );
}

// Add the types for the Jupiter Terminal window object
declare global {
  interface Window {
    Jupiter: {
      init: (config: {
        displayMode?: 'integrated' | 'modal' | 'widget';
        integratedTargetId?: string;
        endpoint: string;
        enableWalletPassthrough?: boolean;
        containerStyles?: React.CSSProperties;
        containerClassName?: string;
        strictTokenList?: boolean;
        formProps?: {
          fixedInputMint?: boolean;
          fixedOutputMint?: boolean;
          swapMode?: 'ExactIn' | 'ExactOut';
          fixedAmount?: boolean;
          initialAmount?: string;
          initialInputMint?: string;
          initialOutputMint?: string;
        };
        defaultExplorer?: 'Solana Explorer' | 'Solscan' | 'Solana Beach' | 'SolanaFM';
      }) => void;
      close: () => void;
      syncProps: (props: { passthroughWalletContextState: any }) => void;
    };
  }
}
