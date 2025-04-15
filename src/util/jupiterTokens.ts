import { Connection, PublicKey } from "@solana/web3.js";
import { CoinlistItem } from "@/types/CoinList";

/**
 * Fetches tokens from Jupiter API
 */
export async function getJupiterTokens(topTokenCount = 50): Promise<CoinlistItem[]> {
  console.log(`getJupiterTokens: Fetching tokens from Jupiter API (limit: ${topTokenCount})...`);
  try {
    // Get all tokens from Jupiter API
    console.log("getJupiterTokens: Making API request to https://token.jup.ag/all");
    const tokenInfoResponse = await fetch('https://token.jup.ag/all');
    
    if (!tokenInfoResponse.ok) {
      throw new Error(`Jupiter API returned ${tokenInfoResponse.status}: ${tokenInfoResponse.statusText}`);
    }
    
    const tokenInfos: any[] = await tokenInfoResponse.json();
    console.log(`getJupiterTokens: Received ${tokenInfos.length} tokens from API`);
    
    // Filter and sort tokens
    const sortedTokens = tokenInfos
      .filter(token => token.symbol && token.address && token.decimals)
      .sort((a, b) => {
        // Prioritize SOL
        if (a.address === "So11111111111111111111111111111111111111112") return -1;
        if (b.address === "So11111111111111111111111111111111111111112") return 1;
        
        // Then popular tokens
        const popularTokens = ["USDC", "USDT", "BTC", "ETH", "JUP", "BONK", "WIF", "JTO", "PYTH"];
        const aSymbol = a.symbol.toUpperCase();
        const bSymbol = b.symbol.toUpperCase();
        
        const aIndex = popularTokens.indexOf(aSymbol);
        const bIndex = popularTokens.indexOf(bSymbol);
        
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        return a.symbol.localeCompare(b.symbol);
      });
    
    console.log(`getJupiterTokens: Filtered to ${sortedTokens.length} valid tokens`);
    
    // Limit to top tokens
    const topTokens = sortedTokens.slice(0, topTokenCount);
    console.log(`getJupiterTokens: Limited to top ${topTokens.length} tokens`);
    
    // Create the token list
    try {
      const tokenList: CoinlistItem[] = topTokens.map(token => {
        return {
          mint: new PublicKey(token.address),
          name: token.name || token.symbol,
          symbol: token.symbol,
          decimals: token.decimals,
          logo: token.logoURI || 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
          balance: 0,
          uiAmount: 0
        };
      });
      
      console.log(`getJupiterTokens: Successfully created ${tokenList.length} CoinlistItems`);
      return tokenList;
    } catch (mappingError) {
      console.error("Error mapping tokens:", mappingError);
      throw new Error(`Failed to process token data: ${mappingError instanceof Error ? mappingError.message : "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error fetching Jupiter tokens:", error);
    // Return a minimal token list with just SOL as a fallback
    console.log("getJupiterTokens: Returning fallback token list with SOL only");
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
 * Fetches the user's token balances from the blockchain
 */
export async function getUserTokenBalances(
  connection: Connection,
  walletAddress: string,
  tokenList: CoinlistItem[]
): Promise<CoinlistItem[]> {
  try {
    // First get SOL balance
    const solBalance = await connection.getBalance(new PublicKey(walletAddress));
    
    // Get all token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(walletAddress),
      { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
    );
    
    // Update token balances in our token list
    const updatedTokens = tokenList.map(token => {
      // Handle SOL separately
      if (token.mint.toString() === "So11111111111111111111111111111111111111112") {
        return {
          ...token,
          balance: solBalance,
          uiAmount: solBalance / Math.pow(10, 9)
        };
      }
      
      // Find the token account for this mint
      const tokenAccount = tokenAccounts.value.find(
        account => account.account.data.parsed.info.mint === token.mint.toString()
      );
      
      if (tokenAccount) {
        const balance = Number(tokenAccount.account.data.parsed.info.tokenAmount.amount);
        const uiAmount = Number(tokenAccount.account.data.parsed.info.tokenAmount.uiAmount);
        
        return {
          ...token,
          balance,
          uiAmount
        };
      }
      
      return token;
    });
    
    return updatedTokens;
  } catch (error) {
    console.error("Error fetching user token balances:", error);
    return tokenList;
  }
} 