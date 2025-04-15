"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection } from '@solana/web3.js';
import { RPCConfig } from '@/components/RPCSelector';

// The default RPC endpoint
const DEFAULT_RPC: RPCConfig = {
  name: "Alchemy",
  url: "https://solana-mainnet.g.alchemy.com/v2/J4PaMKWa3tX2A7mgEz97F6jJtfnV9R2o"
};

// Context interface
interface RPCContextProps {
  rpcConfig: RPCConfig;
  connection: Connection;
  setRPCConfig: (config: RPCConfig) => void;
}

// Create the context
const RPCContext = createContext<RPCContextProps>({
  rpcConfig: DEFAULT_RPC,
  connection: new Connection(DEFAULT_RPC.url),
  setRPCConfig: () => {}
});

// Hook to use the RPC context
export function useRPC() {
  return useContext(RPCContext);
}

// Provider component
export function RPCProvider({ children }: { children: ReactNode }) {
  // Try to load the saved RPC from localStorage
  const getSavedRPC = (): RPCConfig => {
    if (typeof window === 'undefined') return DEFAULT_RPC;
    
    try {
      const saved = localStorage.getItem('rpcConfig');
      return saved ? JSON.parse(saved) : DEFAULT_RPC;
    } catch (error) {
      console.error('Failed to load saved RPC config:', error);
      return DEFAULT_RPC;
    }
  };

  const [rpcConfig, setRPCConfigState] = useState<RPCConfig>(DEFAULT_RPC);
  const [connection, setConnection] = useState<Connection>(new Connection(DEFAULT_RPC.url));

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedRPC = getSavedRPC();
    setRPCConfigState(savedRPC);
    setConnection(new Connection(savedRPC.url));
  }, []);
  
  // Update connection when RPC changes
  const setRPCConfig = (config: RPCConfig) => {
    setRPCConfigState(config);
    setConnection(new Connection(config.url));
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('rpcConfig', JSON.stringify(config));
    }
  };

  return (
    <RPCContext.Provider value={{ rpcConfig, connection, setRPCConfig }}>
      {children}
    </RPCContext.Provider>
  );
} 