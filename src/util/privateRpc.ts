import { Connection } from "@solana/web3.js";

// Use Alchemy RPC endpoint as specified by the user
export const privateConnection = new Connection(
  "https://solana-mainnet.g.alchemy.com/v2/J4PaMKWa3tX2A7mgEz97F6jJtfnV9R2o"
);
