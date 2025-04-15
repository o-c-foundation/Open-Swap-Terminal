import { AppBar, Toolbar, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from "@mui/material";
import dynamic from "next/dynamic";
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from "react";
import { useRPC } from "@/util/RPCContext";
import { Connection } from "@solana/web3.js";
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
  const { rpcConfig, setRPCConfig } = useRPC();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [customRPC, setCustomRPC] = useState<string>("");
  const [customName, setCustomName] = useState<string>("");
  const [testStatus, setTestStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Test RPC connection
  const testRPCConnection = async (url: string) => {
    setIsLoading(true);
    setTestStatus(null);
    
    try {
      const connection = new Connection(url);
      const version = await connection.getVersion();
      
      setTestStatus({
        success: true,
        message: `Connected successfully! Version: ${version['solana-core']}`
      });
      return true;
    } catch (error) {
      setTestStatus({
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle save custom RPC
  const handleSaveCustomRPC = async () => {
    if (!customRPC) return;
    
    const isValid = await testRPCConnection(customRPC);
    if (isValid) {
      const newRPC = {
        name: customName || `Custom RPC ${Math.floor(Math.random() * 1000)}`,
        url: customRPC
      };
      
      setRPCConfig(newRPC);
      setDialogOpen(false);
      setCustomRPC("");
      setCustomName("");
    }
  };

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
        
        <Button 
          startIcon={<SettingsIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ 
            mr: 2,
            color: '#FFC107',
            borderColor: 'rgba(255, 193, 7, 0.3)',
            '&:hover': {
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              borderColor: 'rgba(255, 193, 7, 0.5)',
            },
            textTransform: 'none'
          }}
          variant="outlined"
          size="small"
        >
          RPC
        </Button>
        
        <WalletMultiButtonDynamic />
        <WalletDisconnectButtonDynamic />
      </Toolbar>

      {/* RPC Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ color: '#FFC107' }}>
          RPC Configuration
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 1 }}>
            <Typography variant="subtitle1" sx={{ color: '#FFC107', mb: 1 }}>
              Current RPC
            </Typography>
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'rgba(255, 193, 7, 0.1)', 
              borderRadius: 1,
              border: '1px solid rgba(255, 193, 7, 0.3)'
            }}>
              <Typography sx={{ color: '#FFF', fontWeight: 'bold' }}>
                OpenSwap RPC (Alchemy)
              </Typography>
              <Typography variant="body2" sx={{ color: '#AAA', fontSize: '0.8rem', mt: 1, wordBreak: 'break-all' }}>
                {rpcConfig.url}
              </Typography>
            </Box>
          </Box>

          <Typography variant="subtitle1" sx={{ color: '#FFC107', mb: 1 }}>
            Custom RPC
          </Typography>
          <TextField
            margin="dense"
            label="RPC Name"
            fullWidth
            variant="outlined"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            sx={{ mb: 2, input: { color: '#FFF' }, label: { color: '#AAA' } }}
          />
          <TextField
            margin="dense"
            label="RPC URL"
            placeholder="https://..."
            fullWidth
            variant="outlined"
            value={customRPC}
            onChange={(e) => setCustomRPC(e.target.value)}
            sx={{ mb: 2, input: { color: '#FFF' }, label: { color: '#AAA' } }}
          />
          
          {testStatus && (
            <Box sx={{ 
              p: 2, 
              borderRadius: 1, 
              bgcolor: testStatus.success ? 'rgba(46, 125, 50, 0.2)' : 'rgba(198, 40, 40, 0.2)',
              border: `1px solid ${testStatus.success ? '#4caf50' : '#f44336'}`,
              mb: 2
            }}>
              <Typography color={testStatus.success ? 'success' : 'error'}>
                {testStatus.message}
              </Typography>
            </Box>
          )}
          
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => testRPCConnection(customRPC)}
            disabled={!customRPC || isLoading}
            sx={{ mb: 2 }}
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </Button>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="error">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCustomRPC}
            disabled={!customRPC || isLoading}
            color="warning"
            variant="contained"
          >
            Save & Use Custom RPC
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}
