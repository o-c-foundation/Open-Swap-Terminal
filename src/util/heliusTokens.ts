import { Connection, PublicKey } from "@solana/web3.js";
import { CoinlistItem } from "@/types/CoinList";

// Helius API endpoint
const HELIUS_RPC_URL = "https://mainnet.helius-rpc.com/?api-key=405da4aa-d376-44ce-87eb-8328fb80b562";
const HELIUS_API_KEY = "405da4aa-d376-44ce-87eb-8328fb80b562"; // User's actual API key

// Interface for the DAS API response
interface Asset {
  id: string;
  content: {
    metadata: {
      name: string;
      symbol: string;
      description?: string;
      image?: string;
    }
  };
  mint: {
    address: string;
    decimals: number;
    supply: string;
    freeze_authority?: string;
    mint_authority?: string;
  };
  ownership: {
    owner: string;
    delegated?: boolean;
    delegate?: string;
    tokenAccount?: string;
    amount: number;
  };
  authorities?: Array<{
    address: string;
    scopes: string[];
  }>;
  interface?: string;
  compression?: {
    compressed: boolean;
    data_hash: string;
    creator_hash: string;
    asset_hash: string;
    tree: string;
    seq: number;
    leaf_id: number;
  };
  grouping?: Array<{
    group_key: string;
    group_value: string;
  }>;
  royalty?: {
    royalty_model: string;
    target: string;
    percent: number;
    basis_points: number;
    primary_sale_happened: boolean;
    locked: boolean;
  };
  creators?: Array<{
    address: string;
    share: number;
    verified: boolean;
  }>;
}

interface HeliusResponse {
  items: Asset[];
  total: number;
  limit: number;
  page: number;
}

/**
 * Fetches tokens using Helius DAS API
 */
export async function getHeliusTokens(topTokenCount = 50): Promise<CoinlistItem[]> {
  console.log(`getHeliusTokens: Fetching tokens from Helius DAS API (limit: ${topTokenCount})...`);
  try {
    // Use the searchAssets method to fetch popular tokens
    const payload = {
      jsonrpc: "2.0",
      id: "my-id",
      method: "searchAssets",
      params: {
        interface: "FungibleToken",
        limit: topTokenCount,
        page: 1,
        displayOptions: {
          showFungible: true,
          showNativeBalance: true
        }
      }
    };

    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Helius API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.result || !data.result.items) {
      throw new Error('Invalid response format from Helius API');
    }

    const assets: Asset[] = data.result.items;
    console.log(`getHeliusTokens: Received ${assets.length} tokens from API`);

    // Map the assets to our CoinlistItem format
    const sortedTokens = assets
      .filter(asset => asset.mint && asset.mint.address && asset.mint.decimals)
      .sort((a, b) => {
        // Prioritize SOL
        if (a.mint.address === "So11111111111111111111111111111111111111112") return -1;
        if (b.mint.address === "So11111111111111111111111111111111111111112") return 1;
        
        // Then popular tokens
        const popularTokens = ["USDC", "USDT", "BTC", "ETH", "JUP", "BONK", "WIF", "JTO", "PYTH"];
        const aSymbol = a.content?.metadata?.symbol?.toUpperCase() || '';
        const bSymbol = b.content?.metadata?.symbol?.toUpperCase() || '';
        
        const aIndex = popularTokens.indexOf(aSymbol);
        const bIndex = popularTokens.indexOf(bSymbol);
        
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        return (aSymbol || '').localeCompare(bSymbol || '');
      });

    // Create the token list
    const tokenList: CoinlistItem[] = sortedTokens.map(token => {
      // Determine the logo URL
      const logoUrl = token.content?.metadata?.image || 
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';

      return {
        mint: new PublicKey(token.mint.address),
        name: token.content?.metadata?.name || token.mint.address.slice(0, 8),
        symbol: token.content?.metadata?.symbol || token.mint.address.slice(0, 4),
        decimals: token.mint.decimals,
        logo: logoUrl,
        balance: token.ownership?.amount || 0,
        uiAmount: (token.ownership?.amount || 0) / Math.pow(10, token.mint.decimals)
      };
    });

    console.log(`getHeliusTokens: Successfully created ${tokenList.length} CoinlistItems`);
    return tokenList;
  } catch (error) {
    console.error("Error fetching Helius tokens:", error);
    // Return a minimal token list with just SOL as a fallback
    console.log("getHeliusTokens: Returning fallback token list with SOL only");
    return [{
      mint: new PublicKey("So11111111111111111111111111111111111111112"),
      name: "Solana",
      symbol: "SOL",
      decimals: 9,
      logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      balance: 0,
      uiAmount: 0
    }];
  }
}

/**
 * Fetches the user's token balances using Helius DAS API
 */
export async function getUserTokenBalancesHelius(
  walletAddress: string
): Promise<CoinlistItem[]> {
  console.log(`getUserTokenBalancesHelius: Fetching tokens for wallet ${walletAddress}...`);
  
  try {
    // Use the getAssetsByOwner method to fetch the user's tokens
    const payload = {
      jsonrpc: "2.0",
      id: "my-id",
      method: "getAssetsByOwner",
      params: {
        ownerAddress: walletAddress,
        page: 1, 
        limit: 100,
        displayOptions: {
          showFungible: true,
          showNativeBalance: true
        }
      }
    };

    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Helius API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.result || !data.result.items) {
      throw new Error('Invalid response format from Helius API');
    }

    const assets: Asset[] = data.result.items;
    console.log(`getUserTokenBalancesHelius: Received ${assets.length} tokens for wallet`);

    // Map the assets to our CoinlistItem format
    const tokenList: CoinlistItem[] = assets.map(token => {
      // Determine the logo URL
      const logoUrl = token.content?.metadata?.image || 
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';

      return {
        mint: new PublicKey(token.mint.address),
        name: token.content?.metadata?.name || token.mint.address.slice(0, 8),
        symbol: token.content?.metadata?.symbol || token.mint.address.slice(0, 4),
        decimals: token.mint.decimals,
        logo: logoUrl,
        balance: token.ownership?.amount || 0,
        uiAmount: (token.ownership?.amount || 0) / Math.pow(10, token.mint.decimals)
      };
    });

    console.log(`getUserTokenBalancesHelius: Successfully created ${tokenList.length} CoinlistItems`);
    return tokenList;
  } catch (error) {
    console.error("Error fetching user token balances from Helius:", error);
    // Return an empty array as there was an error
    return [];
  }
} 