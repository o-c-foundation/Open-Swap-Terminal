import React, { useState, useEffect } from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Button, 
  Typography, 
  Chip, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Connection } from '@solana/web3.js';

// Default RPCs 
const DEFAULT_RPCS = [
  { name: "Alchemy", url: "https://solana-mainnet.g.alchemy.com/v2/J4PaMKWa3tX2A7mgEz97F6jJtfnV9R2o" },
  { name: "Mainnet (Public)", url: "https://api.mainnet-beta.solana.com" },
  { name: "GenesysGo", url: "https://ssc-dao.genesysgo.net" },
  { name: "QuickNode", url: "https://solana-mainnet.rpc.extrnode.com" },
  { name: "Jupiter RPC", url: "https://neat-hidden-sanctuary.solana-mainnet.quiknode.pro/2af5315d336f9ae920028bbb90a73b724dc1bbed/" },
];

export interface RPCConfig {
  name: string;
  url: string;
}

interface RPCSelectorProps {
  currentRPC: RPCConfig;
  onRPCChange: (rpc: RPCConfig) => void;
}

export default function RPCSelector({ currentRPC, onRPCChange }: RPCSelectorProps) {
  const [selectedRPC, setSelectedRPC] = useState<string>(currentRPC.url);
  const [customRPC, setCustomRPC] = useState<string>("");
  const [customName, setCustomName] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
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

  // Update parent when selected RPC changes
  useEffect(() => {
    const rpc = DEFAULT_RPCS.find(r => r.url === selectedRPC);
    if (rpc) {
      onRPCChange(rpc);
    }
  }, [selectedRPC, onRPCChange]);

  // Handle save custom RPC
  const handleSaveCustomRPC = async () => {
    if (!customRPC) return;
    
    const isValid = await testRPCConnection(customRPC);
    if (isValid) {
      const newRPC: RPCConfig = {
        name: customName || `Custom RPC ${Math.floor(Math.random() * 1000)}`,
        url: customRPC
      };
      
      onRPCChange(newRPC);
      setSelectedRPC(customRPC);
      setDialogOpen(false);
      setCustomRPC("");
      setCustomName("");
    }
  };

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        flexWrap: 'wrap',
        p: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 2,
        border: '1px solid rgba(255, 193, 7, 0.2)',
      }}>
        <FormControl sx={{ minWidth: 200, flex: 1 }}>
          <InputLabel id="rpc-select-label" sx={{ color: '#AAA' }}>RPC Endpoint</InputLabel>
          <Select
            labelId="rpc-select-label"
            value={selectedRPC}
            label="RPC Endpoint"
            onChange={(e) => setSelectedRPC(e.target.value)}
            sx={{ color: '#FFF' }}
          >
            {DEFAULT_RPCS.map((rpc) => (
              <MenuItem key={rpc.url} value={rpc.url}>
                {rpc.name}
              </MenuItem>
            ))}
            {currentRPC.url !== "" && 
              !DEFAULT_RPCS.some(rpc => rpc.url === currentRPC.url) && (
              <MenuItem value={currentRPC.url}>
                {currentRPC.name}
              </MenuItem>
            )}
          </Select>
        </FormControl>
        
        <Button 
          variant="outlined" 
          color="warning"
          onClick={() => setDialogOpen(true)}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Custom RPC
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
          <Chip 
            label={currentRPC.name}
            color="warning"
            variant="outlined"
            sx={{ mr: 1 }}
          />
          <Typography variant="caption" sx={{ color: '#AAA', display: { xs: 'none', md: 'block' } }}>
            Using: {currentRPC.url.substring(0, 25)}...
          </Typography>
        </Box>
      </Box>
      
      {/* Custom RPC Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'rgba(0, 0, 0, 0.8)', color: '#FFC107' }}>
          Add Custom RPC Endpoint
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'rgba(0, 0, 0, 0.8)', pt: 2 }}>
          <TextField
            autoFocus
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
        <DialogActions sx={{ bgcolor: 'rgba(0, 0, 0, 0.8)' }}>
          <Button onClick={() => setDialogOpen(false)} color="error">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCustomRPC} 
            disabled={!customRPC || isLoading}
            color="warning"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 