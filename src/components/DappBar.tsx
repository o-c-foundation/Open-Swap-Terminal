import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import dynamic from "next/dynamic";
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useRPC } from "@/util/RPCContext";
require("@solana/wallet-adapter-react-ui/styles.css");

const WalletDisconnectButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletDisconnectButton,
  { ssr: false }
);
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function DappBar() {
  const { rpcConfig } = useRPC();

  return (
    <AppBar 
      position="static" 
      sx={{ 
        flexGrow: 1, 
        background: 'transparent',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(255, 193, 7, 0.2)',
        backdropFilter: 'blur(5px)',
        padding: '8px 0'
      }} 
      elevation={0}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <SwapHorizIcon sx={{ color: '#FFC107', mr: 1, fontSize: 32 }} />
          <Typography
            variant="h5"
            noWrap
            sx={{ 
              fontFamily: "Quantico", 
              fontWeight: 700,
              color: '#FFC107',
              letterSpacing: '1px',
              textShadow: '0px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            OpenSwap
          </Typography>
        </Box>
        
        <WalletMultiButtonDynamic />
        <WalletDisconnectButtonDynamic />
      </Toolbar>
    </AppBar>
  );
}
