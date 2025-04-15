"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection } from '@solana/web3.js';
import { RPCConfig } from '@/components/RPCSelector';

// The Alchemy RPC endpoint
const ALCHEMY_RPC: RPCConfig = {
  name: "Alchemy",
  url: "https://solana-mainnet.g.alchemy.com/v2/J4PaMKWa3tX2A7mgEz97F6jJtfnV9R2o"
};

// Context interface
interface RPCContextProps {
  rpcConfig: RPCConfig;
  connection: Connection;
}

// Create the context
const RPCContext = createContext<RPCContextProps>({
  rpcConfig: ALCHEMY_RPC,
  connection: new Connection(ALCHEMY_RPC.url),
});

// Hook to use the RPC context
export function useRPC() {
  return useContext(RPCContext);
}

// Provider component
export function RPCProvider({ children }: { children: ReactNode }) {
  // Create connection with Alchemy endpoint
  const [connection] = useState<Connection>(new Connection(ALCHEMY_RPC.url));

  return (
    <RPCContext.Provider value={{ rpcConfig: ALCHEMY_RPC, connection }}>
      {children}
    </RPCContext.Provider>
  );
} 