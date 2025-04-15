"use client";
import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { RPCProvider } from "@/util/RPCContext";

export default function RootLayout(props: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Mainnet;

  const wallets = React.useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [network]
  );
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <RPCProvider>
              <ConnectionProvider endpoint="https://solana-mainnet.g.alchemy.com/v2/J4PaMKWa3tX2A7mgEz97F6jJtfnV9R2o">
                <WalletProvider wallets={wallets} autoConnect={true}>
                  <WalletModalProvider>{props.children}</WalletModalProvider>
                </WalletProvider>
              </ConnectionProvider>
            </RPCProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
